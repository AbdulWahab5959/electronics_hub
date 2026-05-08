<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Display user's shopping cart
     * 
     * GET /api/cart
     * 
     * Returns all items in the authenticated user's cart
     * Also calculates total price and item count
     */
    public function index(Request $request)
    {
        // Get all cart items for the logged-in user
        // Load the related product data
        $cart = $request->user()->cart()->with('product')->get();
        
        // Calculate total price of all items
        $total = $cart->sum(function($item) {
            return $item->price * $item->quantity;
        });
        
        // Calculate total number of items
        $count = $cart->sum('quantity');
        
        return response()->json([
            'success' => true,
            'data' => [
                'items' => $cart,
                'total' => $total,
                'count' => $count,
            ]
        ]);
    }

    /**
     * Add product to cart
     * 
     * POST /api/cart
     * 
     * Request body: { "product_id": 1, "quantity": 2 }
     * 
     * If product already exists in cart, increases quantity
     * Otherwise, creates new cart item
     */
    public function add(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // Find the product
        $product = Product::findOrFail($validated['product_id']);
        
        // Check if product is already in user's cart
        $existingItem = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existingItem) {
            // Product exists - update quantity
            $existingItem->quantity += $validated['quantity'];
            $existingItem->save();
            $cartItem = $existingItem;
        } else {
            // Product not in cart - create new entry
            $cartItem = Cart::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $validated['quantity'],
                'image' => $product->image,
            ]);
        }

        // Reload with product relationship
        $cartItem->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => $cartItem
        ], 201);
    }

    /**
     * Update cart item quantity
     * 
     * PUT /api/cart/{id}
     * 
     * Request body: { "quantity": 5 }
     */
    public function update(Request $request, $id)
    {
        // Validate quantity
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Find cart item belonging to authenticated user
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        // Update quantity
        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'data' => $cartItem
        ]);
    }

    /**
     * Remove single item from cart
     * 
     * DELETE /api/cart/{id}
     */
    public function remove(Request $request, $id)
    {
        // Find and delete cart item
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
    }

    /**
     * Clear entire cart (remove all items)
     * 
     * DELETE /api/cart
     */
    public function clear(Request $request)
    {
        // Delete all cart items for this user
        Cart::where('user_id', $request->user()->id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Cart cleared'
        ]);
    }
}