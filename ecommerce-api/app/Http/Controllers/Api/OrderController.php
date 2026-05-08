<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Get user's orders
     * GET /api/orders
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
    
    /**
     * Get single order details
     * GET /api/orders/{id}
     */
    public function show($id)
    {
        $order = Order::with('items')->findOrFail($id);
        
        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
    
    /**
     * Create new order (checkout)
     * POST /api/orders
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'payment_method' => 'required|string',
            'shipping_cost' => 'numeric|min:0',
            'tax' => 'numeric|min:0',
        ]);

        // Get user's cart
        $cart = Cart::where('user_id', $request->user()->id)->get();
        
        if ($cart->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty'
            ], 422);
        }

        // Calculate totals
        $subtotal = $cart->sum(function($item) {
            return $item->price * $item->quantity;
        });
        
        $shippingCost = $validated['shipping_cost'] ?? 0;
        $tax = $validated['tax'] ?? 0;
        $total = $subtotal + $shippingCost + $tax;

        // Create order
        $order = Order::create([
            'user_id' => $request->user()->id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'total' => $total,
            'shipping_address' => $validated['shipping_address'],
            'payment_method' => $validated['payment_method'],
            'shipping_cost' => $shippingCost,
            'tax' => $tax,
            'status' => 'pending',
        ]);

        // Create order items from cart
        foreach ($cart as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'name' => $item->name,
                'price' => $item->price,
                'quantity' => $item->quantity,
            ]);
        }

        // Clear user's cart
        Cart::where('user_id', $request->user()->id)->delete();

        // Load order items for response
        $order->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully',
            'data' => $order
        ], 201);
    }

    /**
     * Cancel pending order
     * POST /api/orders/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $order->status = 'cancelled';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => $order
        ]);
    }

    /**
     * Track order by order number (no login required)
     * GET /api/orders/track/{orderNumber}
     */
    public function track($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}