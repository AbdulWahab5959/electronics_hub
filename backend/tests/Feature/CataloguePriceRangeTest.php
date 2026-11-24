<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CataloguePriceRangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_price_range_covers_all_products_and_does_not_shrink_when_filtering(): void
    {
        $base = ['brand' => 'Test', 'category' => 'Laptops', 'image' => '/laptop.png', 'stock' => 10];
        Product::create($base + ['name' => 'Budget laptop', 'price' => 499.99]);
        Product::create($base + ['name' => 'Premium laptop', 'price' => 2499.99]);
        $this->getJson('/api/categories')->assertOk()->assertJsonPath('price_range.min', 0)->assertJsonPath('price_range.max', 2500);
        $this->getJson('/api/products?price_min=1200&price_max=2000')->assertOk()->assertJsonPath('data.total', 0);
        $this->getJson('/api/products?price_max=2000')->assertOk()->assertJsonPath('data.total', 1)->assertJsonPath('data.data.0.name', 'Budget laptop');
        $this->getJson('/api/products')->assertOk()->assertJsonPath('data.total', 2);
        $this->getJson('/api/categories')->assertOk()->assertJsonPath('price_range.max', 2500);
    }
}
