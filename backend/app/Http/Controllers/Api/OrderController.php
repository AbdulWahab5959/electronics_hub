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
        $orders = $request->user()
            ->orders()
            ->with(['items.product', 'user'])  // load product images & user details
            ->orderBy('created_at', 'desc')
            ->get();

        // Append computed subtotal for each order
        $orders->each(function ($order) {
            $order->append('subtotal');
        });

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get single order details by ID
     * GET /api/orders/{id}
     */
    public function show($id)
    {
        $order = Order::with(['items.product', 'user'])
            ->findOrFail($id);

        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->append('subtotal');

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Get single order details by order number (human-readable)
     * GET /api/orders/number/{orderNumber}
     */
    public function showByNumber($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product', 'user'])
            ->firstOrFail();

        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->append('subtotal');

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Create a new order (checkout)
     * POST /api/orders
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'payment_method'   => 'required|string',
            'shipping_cost'    => 'numeric|min:0',
            'tax'              => 'numeric|min:0',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.name'     => 'required|string',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Calculate totals
        $subtotal = collect($validated['items'])->sum(fn($item) => $item['price'] * $item['quantity']);
        $shippingCost = $validated['shipping_cost'] ?? 0;
        $tax = $validated['tax'] ?? 0;
        $total = $subtotal + $shippingCost + $tax;

        // Create order
        $order = Order::create([
            'user_id'          => $request->user()->id,
            'order_number'     => 'ORD-' . strtoupper(uniqid()),
            'total'            => $total,
            'shipping_address' => $validated['shipping_address'],
            'payment_method'   => $validated['payment_method'],
            'shipping_cost'    => $shippingCost,
            'tax'              => $tax,
            'status'           => 'pending',
        ]);

        // Create order items
        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $item['product_id'] ?? null,
                'name'       => $item['name'],
                'price'      => $item['price'],
                'quantity'   => $item['quantity'],
            ]);
        }

        // (Optional) Clear backend cart if you later decide to use it
        // Cart::where('user_id', $request->user()->id)->delete();

        $order->load(['items.product', 'user']);
        $order->append('subtotal');

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully',
            'data'    => $order
        ], 201);
    }

    /**
     * Cancel a pending order
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
     * Track order by order number (public, no login required)
     * GET /api/orders/track/{orderNumber}
     */
    public function track($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product', 'user'])
            ->firstOrFail();

        $order->append('subtotal');

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}