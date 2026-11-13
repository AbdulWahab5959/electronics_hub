<?php

namespace Tests\Feature;

use App\Models\{Cart, Order, OrderItem, Product, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private User $buyer;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buyer = User::create(['name' => 'Buyer', 'email' => 'buyer@example.test', 'password' => 'secure-password']);
        $this->buyer->markEmailAsVerified();
        $this->product = Product::create(['name' => 'Laptop', 'price' => '1250.55', 'image' => '/laptop.png', 'stock' => 3, 'category' => 'Laptops']);
        $this->signIn($this->buyer);
        config(['checkout.enabled' => true, 'checkout.shipping_minor' => 250, 'checkout.tax_basis_points' => 500]);
    }

    private function signIn(User $user): self
    {
        $this->app['auth']->forgetGuards();
        parent::actingAs($user, 'web');
        return $this;
    }

    private function cart(int $quantity = 1): void
    {
        $this->postJson('/api/cart', ['product_id' => $this->product->id, 'quantity' => $quantity])->assertCreated();
    }

    private function payload(): array
    {
        $quote = $this->postJson('/api/checkout/quote')->assertOk()->json('data');
        return ['quote_token' => $quote['quote_token'], 'idempotency_key' => (string) Str::uuid(), 'payment_method' => 'cod',
            'shipping_address' => ['fullName' => 'Buyer', 'email' => 'buyer@example.test', 'phone' => '03001234567',
                'address' => 'Street 1', 'city' => 'Lahore', 'state' => 'Punjab', 'country' => 'PK']];
    }

    public function test_quote_and_order_use_current_server_prices_and_exact_amounts(): void
    {
        $this->cart(2);
        Cart::where('user_id', $this->buyer->id)->update(['price' => '0.01', 'name' => 'Fake snapshot']);
        $quote = $this->postJson('/api/checkout/quote')->assertOk()
            ->assertJsonPath('data.subtotal', '2501.10')->assertJsonPath('data.tax', '125.06')
            ->assertJsonPath('data.shipping_cost', '2.50')->assertJsonPath('data.total', '2628.66')
            ->assertJsonPath('data.items.0.price', '1250.55')->assertJsonPath('data.items.0.name', 'Laptop');
        $payload = $this->payload();
        $this->postJson('/api/orders', $payload)->assertCreated()->assertJsonPath('data.total', '2628.66')
            ->assertJsonPath('data.subtotal', '2501.10')
            ->assertJsonPath('data.currency', 'PKR')->assertJsonPath('data.payment_status', 'awaiting_collection')
            ->assertJsonMissingPath('data.request_hash')->assertJsonMissingPath('data.idempotency_key');
        $this->assertSame(1, $this->product->fresh()->stock);
        $this->assertDatabaseCount('carts', 0);
        $this->assertDatabaseHas('order_items', ['product_id' => $this->product->id, 'quantity' => 2, 'price' => '1250.55']);
    }

    public function test_client_price_shipping_tax_and_unsupported_payment_are_rejected(): void
    {
        $this->cart();
        $payload = $this->payload();
        foreach (['items' => [['product_id' => $this->product->id, 'price' => 0]], 'tax' => 1, 'shipping_cost' => 1, 'total' => 1, 'payment_method' => 'card'] as $key => $value) {
            $this->postJson('/api/orders', array_replace($payload, [$key => $value]))->assertUnprocessable();
        }
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(3, $this->product->fresh()->stock);
    }

    public function test_duplicate_submission_is_one_order_even_after_quote_expiry(): void
    {
        $this->cart();
        $payload = $this->payload();
        $id = $this->postJson('/api/orders', $payload)->assertCreated()->json('data.id');
        $this->travel(20)->minutes();
        $this->postJson('/api/orders', $payload)->assertOk()->assertJsonPath('data.id', $id);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
        $this->assertSame(2, $this->product->fresh()->stock);
        $payload['shipping_address']['city'] = 'Karachi';
        $this->postJson('/api/orders', $payload)->assertConflict();
    }

    public function test_a_used_quote_cannot_create_another_order_with_a_new_request_key(): void
    {
        $this->cart();
        $payload = $this->payload();
        $this->postJson('/api/orders', $payload)->assertCreated();
        $this->cart();
        $payload['idempotency_key'] = (string) Str::uuid();
        $this->postJson('/api/orders', $payload)->assertConflict();
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_changed_price_cart_and_stock_require_a_new_review(): void
    {
        $this->cart();
        $payload = $this->payload();
        $this->product->update(['price' => '1300.00']);
        $this->postJson('/api/orders', $payload)->assertConflict();
        $payload = $this->payload();
        $this->product->update(['stock' => 0]);
        $this->postJson('/api/orders', $payload)->assertConflict();
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('carts', 1);
    }

    public function test_expired_tampered_and_foreign_quotes_are_rejected(): void
    {
        $this->cart();
        $payload = $this->payload();
        $tampered = array_replace($payload, ['quote_token' => 'altered-'.$payload['quote_token']]);
        $this->postJson('/api/orders', $tampered)->assertUnprocessable();
        $other = User::create(['name' => 'Other', 'email' => 'other@example.test', 'password' => 'secure-password']);
        $other->markEmailAsVerified();
        $this->signIn($other)->postJson('/api/orders', $payload)->assertForbidden();
        $this->signIn($this->buyer);
        $this->travel(11)->minutes();
        $this->postJson('/api/orders', $payload)->assertConflict();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_second_buyer_cannot_buy_stock_already_taken_by_first(): void
    {
        $this->product->update(['stock' => 1]);
        $this->cart();
        $first = $this->payload();
        $other = User::create(['name' => 'Other', 'email' => 'other@example.test', 'password' => 'secure-password']);
        $other->markEmailAsVerified();
        $this->signIn($other);
        $this->cart();
        $second = $this->payload();
        $this->signIn($this->buyer)->postJson('/api/orders', $first)->assertCreated();
        $this->signIn($other)->postJson('/api/orders', $second)->assertConflict();
        $this->assertSame(0, $this->product->fresh()->stock);
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_mid_order_failure_rolls_back_order_stock_and_cart_changes(): void
    {
        $this->cart();
        $second = Product::create(['name' => 'Mouse', 'price' => '100.00', 'image' => '/mouse.png', 'stock' => 2, 'category' => 'Accessories']);
        $this->postJson('/api/cart', ['product_id' => $second->id, 'quantity' => 1])->assertCreated();
        $payload = $this->payload();
        $eventName = 'eloquent.creating: '.OrderItem::class;
        Event::listen($eventName, function (OrderItem $item) use ($second) {
            if ($item->product_id === $second->id) throw new \RuntimeException('Simulated write failure');
        });
        try { $this->postJson('/api/orders', $payload)->assertStatus(500); }
        finally { Event::forget($eventName); }
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('carts', 2);
        $this->assertSame(3, $this->product->fresh()->stock);
        $this->assertSame(2, $second->fresh()->stock);
    }

    public function test_cancellation_restocks_once_and_tracking_is_owned_and_minimal(): void
    {
        $this->cart();
        $order = $this->postJson('/api/orders', $this->payload())->assertCreated()->json('data');
        $this->getJson('/api/orders/track/'.$order['order_number'])->assertOk()
            ->assertJsonMissingPath('data.user')->assertJsonMissingPath('data.shipping_address')->assertJsonMissingPath('data.items');
        $this->postJson('/api/orders/'.$order['id'].'/cancel')->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->postJson('/api/orders/'.$order['id'].'/cancel')->assertOk();
        $this->assertSame(3, $this->product->fresh()->stock);
        $other = User::create(['name' => 'Other', 'email' => 'other@example.test', 'password' => 'secure-password']);
        $other->markEmailAsVerified();
        $this->signIn($other);
        $this->getJson('/api/orders/'.$order['id'])->assertNotFound();
        $this->getJson('/api/orders/number/'.$order['order_number'])->assertNotFound();
        $this->getJson('/api/orders/track/'.$order['order_number'])->assertNotFound();
        $this->postJson('/api/orders/'.$order['id'].'/cancel')->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/orders/track/'.$order['order_number'])->assertUnauthorized();
    }

    public function test_cart_limits_ownership_and_empty_cart_are_enforced(): void
    {
        $this->postJson('/api/checkout/quote')->assertUnprocessable();
        $this->postJson('/api/cart', ['product_id' => $this->product->id, 'quantity' => 4])->assertConflict();
        $this->cart();
        $item = Cart::firstOrFail();
        $this->postJson('/api/cart', ['product_id' => $this->product->id, 'quantity' => 3])->assertConflict();
        $this->putJson('/api/cart/'.$item->id, ['quantity' => 0])->assertUnprocessable();
        $this->putJson('/api/cart/'.$item->id, ['quantity' => 4])->assertConflict();
        $this->assertSame(1, $item->fresh()->quantity);
        config(['checkout.enabled' => false]);
        $this->postJson('/api/checkout/quote')->assertStatus(503);
    }

    public function test_changed_cart_invalid_address_and_nonpending_cancellation_are_rejected(): void
    {
        $this->cart();
        $payload = $this->payload();
        $cart = Cart::firstOrFail();
        $this->putJson('/api/cart/'.$cart->id, ['quantity' => 2])->assertOk();
        $this->postJson('/api/orders', $payload)->assertConflict();
        $payload = $this->payload();
        $invalid = $payload;
        $invalid['shipping_address']['country'] = 'US';
        $this->postJson('/api/orders', $invalid)->assertUnprocessable();
        unset($invalid['shipping_address']['fullName']);
        $this->postJson('/api/orders', $invalid)->assertUnprocessable();
        $order = $this->postJson('/api/orders', $payload)->assertCreated()->json('data');
        Order::findOrFail($order['id'])->update(['status' => 'processing']);
        $this->postJson('/api/orders/'.$order['id'].'/cancel')->assertConflict();
        $this->assertSame(1, $this->product->fresh()->stock);
    }
}
