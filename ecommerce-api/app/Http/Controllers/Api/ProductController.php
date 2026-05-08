<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filters, sorting, and pagination
     * GET /api/products
     */
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Filter by category
        if ($request->has('category')) {
            $categories = explode(',', $request->category);
            $query->whereIn('category', $categories);
        }
        
        // Filter by price range
        if ($request->has('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }
        if ($request->has('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }
        
        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', '>=', $request->rating);
        }
        
        // Filter by brand
        if ($request->has('brand')) {
            $brands = explode(',', $request->brand);
            $query->whereIn('brand', $brands);
        }
        
        // Filter by in_stock
        if ($request->has('in_stock') && $request->in_stock) {
            $query->where('stock', '>', 0);
        }
        
        // Filter by on_sale
        if ($request->has('on_sale') && $request->on_sale) {
            $query->where('discount', '>', 0);
        }
        
        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }
        
        // Sort
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'popular':
                $query->orderBy('reviews', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }
        
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);
        
        // Add calculated fields to each product
        $products->getCollection()->transform(function($product) {
            $product->in_stock = $product->stock > 0;
            $product->is_on_sale = $product->discount > 0;
            $product->formatted_price = '$' . number_format($product->price, 2);
            if ($product->original_price) {
                $product->formatted_original_price = '$' . number_format($product->original_price, 2);
            }
            return $product;
        });
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Display the specified product
     * GET /api/products/{id}
     */
    public function show($id)
    {
        $product = Product::findOrFail($id);
        
        // Add calculated fields
        $product->in_stock = $product->stock > 0;
        $product->is_on_sale = $product->discount > 0;
        $product->formatted_price = '$' . number_format($product->price, 2);
        
        // Get related products (same category)
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get()
            ->map(function($related) {
                $related->formatted_price = '$' . number_format($related->price, 2);
                return $related;
            });
        
        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'related_products' => $relatedProducts
            ]
        ]);
    }
    
    /**
     * Get all unique categories with product counts
     * GET /api/categories
     */
    public function categories()
    {
        $categories = Product::select('category')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('category')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
    
    /**
     * Get all unique brands with product counts
     * GET /api/brands
     */
    public function brands()
    {
        $brands = Product::select('brand')
            ->whereNotNull('brand')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('brand')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }
    
    /**
     * Get featured products (for homepage)
     * GET /api/products/featured
     */
    public function featured()
    {
        $products = Product::where('is_featured', true)
            ->orWhere('is_new', true)
            ->limit(8)
            ->get()
            ->map(function($product) {
                $product->formatted_price = '$' . number_format($product->price, 2);
                return $product;
            });
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Get new arrivals
     * GET /api/products/new-arrivals
     */
    public function newArrivals()
    {
        $products = Product::where('is_new', true)
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get()
            ->map(function($product) {
                $product->formatted_price = '$' . number_format($product->price, 2);
                return $product;
            });
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Get best selling products
     * GET /api/products/best-selling
     */
    public function bestSelling()
    {
        // This would typically join with order_items table
        // For now, order by reviews count
        $products = Product::orderBy('reviews', 'desc')
            ->limit(8)
            ->get()
            ->map(function($product) {
                $product->formatted_price = '$' . number_format($product->price, 2);
                return $product;
            });
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Search products
     * GET /api/products/search?q=keyword
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2'
        ]);
        
        $keyword = $request->q;
        $products = Product::where('name', 'like', "%{$keyword}%")
            ->orWhere('description', 'like', "%{$keyword}%")
            ->orWhere('brand', 'like', "%{$keyword}%")
            ->paginate(20);
        
        $products->getCollection()->transform(function($product) {
            $product->formatted_price = '$' . number_format($product->price, 2);
            return $product;
        });
        
        return response()->json([
            'success' => true,
            'data' => $products,
            'keyword' => $keyword
        ]);
    }
}