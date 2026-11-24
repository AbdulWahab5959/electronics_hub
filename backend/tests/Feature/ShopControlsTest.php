<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ShopControlsTest extends TestCase
{
    use RefreshDatabase;

    private array $ids;

    protected function setUp(): void
    {
        parent::setUp();
        $rows = [
            ['name' => 'G14', 'brand' => 'ASUS', 'category' => 'Laptops', 'price' => 1500, 'rating' => 4.7, 'stock' => 5, 'discount' => 10],
            ['name' => 'X1', 'brand' => 'Lenovo', 'category' => 'Laptops', 'price' => 1600, 'rating' => 3.2, 'stock' => 0, 'discount' => 0],
            ['name' => 'Headphones', 'brand' => 'Sony', 'category' => 'Audio', 'price' => 300, 'rating' => 4.8, 'stock' => 12, 'discount' => 0],
            ['name' => 'Earbuds', 'brand' => 'Sony', 'category' => 'Audio', 'price' => 100, 'rating' => 2.5, 'stock' => 3, 'discount' => 20],
            ['name' => 'Keyboard', 'brand' => 'ASUS', 'category' => 'Keyboards', 'price' => 300, 'rating' => 4.1, 'stock' => 4, 'discount' => 10],
        ];
        foreach ($rows as $index => $row) {
            $product = Product::create($row + ['image' => '/product.png']);
            $this->ids[] = $product->id;
            DB::table('products')->where('id', $product->id)->update(['created_at' => '2026-11-'.(10 + $index).' 12:00:00']);
        }
    }

    public function test_each_filter_and_multi_select_return_the_correct_products(): void
    {
        $cases = [
            'category=Laptops' => [0, 1],
            'category=Laptops,Audio' => [0, 1, 2, 3],
            'brand=ASUS,Sony' => [0, 2, 3, 4],
            'price_min=300&price_max=1500' => [0, 2, 4],
            'price_max=0' => [],
            'rating=1' => [0, 1, 2, 3, 4],
            'rating=2' => [0, 1, 2, 3, 4],
            'rating=3' => [0, 1, 2, 4],
            'rating=4' => [0, 2, 4],
            'in_stock=1' => [0, 2, 3, 4],
            'on_sale=1' => [0, 3, 4],
            'category=Laptops,Audio&brand=ASUS,Sony&price_min=100&price_max=1500&rating=4&in_stock=1&on_sale=1' => [0],
            'category=Laptops&brand=Sony' => [],
        ];
        foreach ($cases as $query => $expected) {
            $response = $this->getJson('/api/products?sort=name_asc&'.$query)->assertOk()->assertJsonPath('data.total', count($expected));
            $this->assertEqualsCanonicalizing(array_map(fn ($i) => $this->ids[$i], $expected), array_column($response->json('data.data'), 'id'), $query);
        }
    }

    public function test_every_shop_sort_has_stable_ordering_including_ties(): void
    {
        foreach (['newest' => [4, 3, 2, 1, 0], 'price_low' => [3, 2, 4, 0, 1], 'price_high' => [1, 0, 2, 4, 3], 'rating' => [2, 0, 4, 1, 3]] as $sort => $expected) {
            $response = $this->getJson('/api/products?sort='.$sort)->assertOk();
            $this->assertSame(array_map(fn ($i) => $this->ids[$i], $expected), array_column($response->json('data.data'), 'id'));
        }
    }

    public function test_pagination_has_no_missing_or_repeated_products_and_filters_keep_totals_correct(): void
    {
        $seen = [];
        for ($page = 1; $page <= 3; $page++) {
            $response = $this->getJson('/api/products?sort=price_low&per_page=2&page='.$page)->assertOk()
                ->assertJsonPath('data.total', 5)->assertJsonPath('data.last_page', 3)->assertJsonPath('data.current_page', $page);
            $seen = array_merge($seen, array_column($response->json('data.data'), 'id'));
        }
        $this->assertSame(array_map(fn ($i) => $this->ids[$i], [3, 2, 4, 0, 1]), $seen);
        $this->getJson('/api/products?category=Laptops&per_page=1&page=2')->assertOk()
            ->assertJsonPath('data.total', 2)->assertJsonPath('data.data.0.id', $this->ids[0]);
        $this->getJson('/api/products?per_page=48')->assertOk()->assertJsonCount(5, 'data.data')->assertJsonPath('data.last_page', 1);
    }
}
