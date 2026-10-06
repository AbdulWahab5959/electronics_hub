<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Display user's wishlist
     * 
     * GET /api/wishlist
     * 
     * Returns all saved products in the authenticated user's wishlist
     */
    public function index(Request $request)
    {
        // Get all wishlist items for the logged-in user
        // Load the related product data for each item
        $wishlist = $request->user()->wishlist()
            ->with('product')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $wishlist
        ]);
    }

    /**
     * Add product to wishlist
     * 
     * POST /api/wishlist
     * 
     * Request body: { "product_id": 1 }
     * 
     * Checks if product already exists in wishlist to prevent duplicates
     */
    public function add(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        // Find the product
        $product = Product::findOrFail($validated['product_id']);
        
        // Check if product is already in user's wishlist
        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        // If already in wishlist, return error with 409 Conflict status
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Product already in wishlist'
            ], 409);
        }

        // Create new wishlist entry
        $wishlistItem = Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'image' => $product->image,
        ]);

        // Load product relationship for response
        $wishlistItem->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Added to wishlist',
            'data' => $wishlistItem
        ], 201);
    }

    /**
     * Remove product from wishlist
     * 
     * DELETE /api/wishlist/{id}
     * 
     * Note: {id} is the wishlist ID, not product ID
     */
    public function remove(Request $request, $id)
    {
        // Find the wishlist item belonging to authenticated user
        $wishlistItem = Wishlist::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        // Delete the wishlist item
        $wishlistItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Removed from wishlist'
        ]);
    }

    /**
     * Check if product is in wishlist
     * 
     * GET /api/wishlist/check/{productId}
     * 
     * Returns boolean indicating if product is saved
     */
    public function check(Request $request, $productId)
    {
        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'success' => true,
            'in_wishlist' => $exists,
            'product_id' => (int)$productId
        ]);
    }
}