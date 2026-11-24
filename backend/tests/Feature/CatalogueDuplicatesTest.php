<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogueDuplicatesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Exercise historical duplicate data before the database guard was installed.
        (require database_path('migrations/2026_11_20_120000_enforce_unique_product_models.php'))->down();
    }

    public function test_shop_deduplicates_before_pagination_and_counts_without_deleting_records(): void
    {
        $base = ['price' => 1500, 'image' => '/laptop.png', 'stock' => 10, 'category' => 'Laptops'];
        $asus = Product::create($base + ['name' => 'ASUS ROG Zephyrus G14', 'brand' => 'ASUS']);
        Product::create($base + ['name' => 'ASUS ROG Zephyrus G14', 'brand' => 'ASUS']);
        $lenovo = Product::create($base + ['name' => 'Lenovo ThinkPad X1 Carbon', 'brand' => 'Lenovo']);
        Product::create($base + ['name' => 'Lenovo ThinkPad X1 Carbon', 'brand' => 'Lenovo']);
        $other = Product::create($base + ['name' => 'ASUS Zenbook 14', 'brand' => 'ASUS']);

        $ids = [];
        for ($page = 1; $page <= 3; $page++) {
            $result = $this->getJson('/api/products?category=Laptops&sort=name_asc&per_page=1&page='.$page)
                ->assertOk()->assertJsonPath('data.total', 3)->assertJsonPath('data.last_page', 3)
                ->assertJsonCount(1, 'data.data');
            $ids[] = $result->json('data.data.0.id');
        }
        $this->assertEqualsCanonicalizing([$asus->id, $lenovo->id, $other->id], $ids);
        $this->getJson('/api/products?category=Laptops&brand=ASUS')->assertOk()
            ->assertJsonPath('data.total', 2);
        $this->getJson('/api/products?category=Laptops&search=ThinkPad')->assertOk()
            ->assertJsonPath('data.total', 1)->assertJsonPath('data.data.0.id', $lenovo->id);
        $this->getJson('/api/categories')->assertOk()->assertJsonPath('data.0.count', 3);
        $brands = collect($this->getJson('/api/brands')->assertOk()->json('data'))->pluck('count', 'brand');
        $this->assertEquals(2, $brands['ASUS']);
        $this->assertEquals(1, $brands['Lenovo']);
        $this->assertDatabaseCount('products', 5);
    }
}
