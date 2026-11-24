<?php

namespace Tests\Feature;

use App\Models\{Cart, Order, Product, User, Wishlist};
use App\Services\ProductDeduplicator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ProductDeduplicatorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Exercise historical duplicate data before the database guard was installed.
        (require database_path('migrations/2026_11_20_120000_enforce_unique_product_models.php'))->down();
    }

    public function test_merge_preserves_cart_quantities_order_snapshots_wishlists_and_stock(): void
    {
        $user = User::create(['name' => 'Buyer', 'email' => 'buyer@example.test', 'password' => 'password']);
        $details = ['name' => 'ASUS ROG G14', 'brand' => 'ASUS', 'category' => 'Laptops', 'price' => 1500, 'image' => '/laptop.png', 'stock' => 20];
        $keep = Product::create($details);
        $duplicate = Product::create(array_replace($details, ['category' => 'Computers']));
        foreach ([$keep->id => 2, $duplicate->id => 3] as $id => $quantity) {
            $row = ['user_id' => $user->id, 'product_id' => $id, 'name' => 'Saved laptop', 'price' => 1500, 'image' => '/laptop.png'];
            Cart::create($row + ['quantity' => $quantity]);
            Wishlist::create($row);
        }
        $other = User::create(['name' => 'Other', 'email' => 'other@example.test', 'password' => 'password']);
        Cart::create(['user_id' => $other->id, 'product_id' => $duplicate->id, 'name' => 'Saved laptop', 'price' => 1500, 'image' => '/laptop.png', 'quantity' => 1]);
        $order = Order::create(['user_id' => $user->id, 'order_number' => 'TEST-MERGE', 'total' => 1400, 'shipping_address' => [], 'payment_method' => 'cod', 'status' => 'delivered']);
        $line = $order->items()->create(['product_id' => $duplicate->id, 'name' => 'Historical laptop name', 'price' => 1400, 'quantity' => 1]);
        $ordersBefore = DB::table('orders')->get()->toJson();
        $backup = storage_path('framework/testing/product-merge.json');
        try {
            $result = app(ProductDeduplicator::class)->merge($backup);
            $this->assertSame(1, $result['removed']);
            $this->assertDatabaseCount('products', 1);
            $this->assertDatabaseCount('carts', 2);
            $this->assertDatabaseHas('carts', ['user_id' => $user->id, 'product_id' => $keep->id, 'quantity' => 5]);
            $this->assertDatabaseHas('carts', ['user_id' => $other->id, 'product_id' => $keep->id, 'quantity' => 1]);
            $this->assertDatabaseCount('wishlists', 1);
            $this->assertDatabaseHas('wishlists', ['user_id' => $user->id, 'product_id' => $keep->id]);
            $this->assertDatabaseHas('order_items', ['id' => $line->id, 'product_id' => $keep->id, 'name' => 'Historical laptop name', 'price' => 1400, 'quantity' => 1]);
            $this->assertSame($ordersBefore, DB::table('orders')->get()->toJson());
            $this->assertEquals(20, $keep->fresh()->stock);
            $this->assertCount(2, json_decode(File::get($backup), true)['tables']['products']);
            $this->assertSame(0, app(ProductDeduplicator::class)->merge($backup)['removed']);
        } finally { File::delete($backup); }
    }

    public function test_unsafe_cart_merge_rolls_back_all_changes(): void
    {
        $user = User::create(['name' => 'Buyer', 'email' => 'buyer@example.test', 'password' => 'password']);
        $details = ['name' => 'Lenovo X1', 'brand' => 'Lenovo', 'category' => 'Laptops', 'price' => 1500, 'image' => '/laptop.png', 'stock' => 3];
        foreach ([Product::create($details), Product::create($details)] as $product) {
            Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'name' => $product->name, 'price' => 1500, 'image' => '/laptop.png', 'quantity' => 2]);
        }
        $before = DB::table('carts')->get()->toJson();
        $backup = storage_path('framework/testing/product-merge-rollback.json');
        try {
            app(ProductDeduplicator::class)->merge($backup);
            $this->fail('Unsafe merge must be rejected.');
        } catch (\RuntimeException $error) {
            $this->assertStringContainsString('exceed available stock', $error->getMessage());
            $this->assertDatabaseCount('products', 2);
            $this->assertSame($before, DB::table('carts')->get()->toJson());
        } finally { File::delete($backup); }
    }
}
