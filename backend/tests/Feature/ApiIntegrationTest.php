<?php

namespace Tests\Feature;

use App\Models\{Address, Order, Product, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function customer(string $email): User
    {
        $user = User::create(['name' => 'Customer', 'email' => $email, 'password' => 'secure-password']);
        $user->markEmailAsVerified();
        return $user;
    }

    private function signIn(User $user): void
    {
        $this->app['auth']->forgetGuards();
        $this->actingAs($user, 'web');
    }

    public function test_arrivals_bestsellers_and_catalog_pagination_are_available(): void
    {
        $buyer = $this->customer('buyer@example.test');
        $products = collect(range(1, 10))->map(fn ($i) => Product::create([
            'name' => 'Product '.$i, 'price' => '100.00', 'image' => '/product.png', 'stock' => 10, 'category' => 'Accessories',
        ]));
        $this->getJson('/api/products/new-arrivals')->assertOk()->assertJsonCount(8, 'data')->assertJsonPath('data.0.id', $products->last()->id);
        foreach (['pending' => 100, 'cancelled' => 100, 'delivered' => 2] as $status => $quantity) {
            $order = Order::create(['user_id' => $buyer->id, 'order_number' => 'TEST-'.$status, 'total' => 100,
                'shipping_address' => [], 'payment_method' => 'cod', 'status' => $status]);
            $order->items()->create(['product_id' => $products->first()->id, 'name' => 'Snapshot', 'price' => 100, 'quantity' => $quantity]);
        }
        $this->getJson('/api/products/best-selling')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $products->first()->id);
        $this->getJson('/api/products?per_page=10000')->assertOk()->assertJsonPath('data.per_page', 100);
        $this->getJson('/api/products?per_page=-5')->assertOk()->assertJsonPath('data.per_page', 1);
    }

    public function test_address_lookup_default_and_ownership_match_frontend_contracts(): void
    {
        $first = $this->customer('first@example.test');
        $second = $this->customer('second@example.test');
        $this->signIn($first);
        $payload = ['title' => 'Home', 'address' => 'Street 1', 'city' => 'Lahore', 'state' => 'Punjab', 'zip_code' => '54000', 'country' => 'PK'];
        $id = $this->postJson('/api/addresses', $payload)->assertCreated()->json('data.id');
        $otherId = $this->postJson('/api/addresses', $payload + ['is_default' => false])->assertCreated()->json('data.id');
        $this->getJson('/api/addresses/'.$id)->assertOk()->assertJsonPath('data.id', $id);
        $this->postJson('/api/addresses/'.$otherId.'/set-default')->assertOk();
        $this->assertDatabaseHas('addresses', ['id' => $id, 'is_default' => false]);
        $this->assertDatabaseHas('addresses', ['id' => $otherId, 'is_default' => true]);
        $this->signIn($second);
        $this->getJson('/api/addresses/'.$id)->assertNotFound();
        $this->postJson('/api/addresses/'.$id.'/set-default')->assertNotFound();
        $this->putJson('/api/addresses/'.$id, ['city' => 'Karachi'])->assertNotFound();
        $this->deleteJson('/api/addresses/'.$id)->assertNotFound();
    }

    public function test_wishlist_product_relation_and_check_are_account_scoped(): void
    {
        $first = $this->customer('first@example.test');
        $second = $this->customer('second@example.test');
        $product = Product::create(['name' => 'Mouse', 'price' => 100, 'image' => '/mouse.png', 'stock' => 10, 'category' => 'Accessories']);
        $this->signIn($first);
        $id = $this->postJson('/api/wishlist', ['product_id' => $product->id])->assertCreated()->json('data.id');
        $this->getJson('/api/wishlist')->assertOk()->assertJsonPath('data.0.product.id', $product->id);
        $this->getJson('/api/wishlist/check/'.$product->id)->assertOk()->assertJsonPath('in_wishlist', true);
        $this->signIn($second);
        $this->getJson('/api/wishlist/check/'.$product->id)->assertOk()->assertJsonPath('in_wishlist', false);
        $this->deleteJson('/api/wishlist/'.$id)->assertNotFound();
    }

    public function test_cart_rows_cannot_be_read_or_changed_by_another_customer(): void
    {
        $first = $this->customer('first@example.test');
        $second = $this->customer('second@example.test');
        $product = Product::create(['name' => 'Mouse', 'price' => 100, 'image' => '/mouse.png', 'stock' => 10, 'category' => 'Accessories']);
        $this->signIn($first);
        $id = $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 1])->assertCreated()->json('data.id');
        $this->signIn($second);
        $this->getJson('/api/cart')->assertOk()->assertJsonCount(0, 'data.items');
        $this->putJson('/api/cart/'.$id, ['quantity' => 2])->assertNotFound();
        $this->deleteJson('/api/cart/'.$id)->assertNotFound();
        $this->assertDatabaseHas('carts', ['id' => $id, 'quantity' => 1, 'user_id' => $first->id]);
    }
}
