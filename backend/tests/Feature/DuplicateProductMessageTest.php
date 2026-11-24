<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class DuplicateProductMessageTest extends TestCase
{
    use RefreshDatabase;

    private array $product = ['name' => 'ROG Zephyrus G14', 'brand' => 'ASUS', 'category' => 'Laptops', 'price' => 1500, 'image' => '/laptop.png', 'stock' => 10];

    protected function setUp(): void
    {
        parent::setUp();
        // Test-only write routes exercise the real HTTP exception handler. No public
        // product-writing endpoint is added to the storefront.
        Route::middleware('web')->post('/test-product-write', function (Request $request) {
            return response()->json(Product::create($request->all()), 201);
        });
        Route::put('/test-product-write/{id}', function (Request $request, $id) {
            DB::table('products')->where('id', $id)->update($request->all());
            return response()->noContent();
        });
    }

    public function test_duplicate_in_another_category_returns_only_a_clear_validation_message(): void
    {
        Product::create($this->product);
        config(['app.debug' => true]);
        $this->postJson('/test-product-write', array_replace($this->product, ['category' => 'Gaming']))
            ->assertUnprocessable()->assertExactJson([
                'message' => 'This product already exists.',
                'errors' => ['name' => ['This product already exists.']],
            ]);
        $this->assertDatabaseCount('products', 1);
    }

    public function test_duplicate_update_returns_the_same_message_and_preserves_the_original(): void
    {
        Product::create($this->product);
        $other = Product::create(array_replace($this->product, ['name' => 'Zenbook 14']));
        $this->putJson('/test-product-write/'.$other->id, ['name' => ' rog zephyrus g14 ', 'brand' => ' asus ', 'category' => 'Gaming'])
            ->assertUnprocessable()->assertJsonPath('message', 'This product already exists.');
        $this->assertSame('Zenbook 14', $other->fresh()->name);
    }

    public function test_html_form_submissions_return_to_the_form_with_the_clear_error(): void
    {
        Product::create($this->product);
        $this->from('/product-form')->post('/test-product-write', $this->product)
            ->assertRedirect('/product-form')->assertSessionHasErrors(['name' => 'This product already exists.']);
    }

    public function test_different_models_can_still_be_added(): void
    {
        Product::create($this->product);
        $this->postJson('/test-product-write', array_replace($this->product, ['name' => 'Zenbook 14']))
            ->assertCreated()->assertJsonPath('name', 'Zenbook 14');
        $this->assertDatabaseCount('products', 2);
    }

    public function test_unrelated_unique_errors_are_not_mislabelled_as_product_duplicates(): void
    {
        config(['app.debug' => false]);
        Route::post('/test-unrelated-duplicate', function () {
            DB::table('cache')->insert(['key' => 'products_unique_brand_model', 'value' => 'test', 'expiration' => 9999999999]);
            DB::table('cache')->insert(['key' => 'products_unique_brand_model', 'value' => 'test', 'expiration' => 9999999999]);
        });
        $this->postJson('/test-unrelated-duplicate')->assertStatus(500)
            ->assertJsonMissing(['message' => 'This product already exists.']);
    }
}
