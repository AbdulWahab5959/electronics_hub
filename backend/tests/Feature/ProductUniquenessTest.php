<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProductUniquenessTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $changes = []): array
    {
        return array_replace(['name' => 'ROG Zephyrus G14', 'brand' => 'ASUS', 'category' => 'Laptops', 'price' => 1500, 'image' => '/laptop.png', 'stock' => 10], $changes);
    }

    public function test_raw_inserts_cannot_duplicate_a_model_in_another_category(): void
    {
        DB::table('products')->insert($this->product());
        $this->expectException(UniqueConstraintViolationException::class);
        DB::table('products')->insert($this->product(['category' => 'Gaming']));
    }

    public function test_case_and_outer_whitespace_cannot_bypass_uniqueness(): void
    {
        Product::create($this->product());
        $this->expectException(UniqueConstraintViolationException::class);
        Product::create($this->product(['brand' => ' asus ', 'name' => ' rog zephyrus g14 ', 'category' => 'Computers']));
    }

    public function test_updates_cannot_turn_another_model_into_a_duplicate(): void
    {
        Product::create($this->product());
        $other = Product::create($this->product(['name' => 'Zenbook 14']));
        $this->expectException(UniqueConstraintViolationException::class);
        DB::table('products')->where('id', $other->id)->update(['name' => 'ROG Zephyrus G14', 'category' => 'Gaming']);
    }

    public function test_missing_and_empty_brands_cannot_bypass_uniqueness(): void
    {
        Product::create($this->product(['brand' => null]));
        $this->expectException(UniqueConstraintViolationException::class);
        Product::create($this->product(['brand' => ' ', 'category' => 'Gaming']));
    }

    public function test_distinct_models_and_brands_remain_allowed_and_reseeding_is_safe(): void
    {
        Product::create($this->product());
        Product::create($this->product(['name' => 'Zenbook 14']));
        Product::create($this->product(['brand' => 'Other']));
        $this->assertDatabaseCount('products', 3);
        $this->seed(\Database\Seeders\ProductSeeder::class);
        $count = Product::count();
        $this->seed(\Database\Seeders\ProductSeeder::class);
        $this->assertSame($count, Product::count());
        $this->assertArrayNotHasKey('identity_model', Product::first()->toArray());
    }
}
