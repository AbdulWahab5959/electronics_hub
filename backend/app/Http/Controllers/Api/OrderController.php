<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Cart, Order, Product, User};
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['success' => true, 'data' => $request->user()->orders()->with('items.product')->latest()->get()]);
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with('items.product')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function showByNumber(Request $request, $orderNumber)
    {
        $order = $request->user()->orders()->with('items.product')->where('order_number', $orderNumber)->firstOrFail();
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function quote(Request $request, CheckoutService $checkout)
    {
        return response()->json(['success' => true, 'data' => $checkout->quote($request->user())]);
    }

    public function store(Request $request, CheckoutService $checkout)
    {
        $data = $request->validate([
            'idempotency_key' => 'required|uuid',
            'quote_token' => 'required|string|max:10000',
            'payment_method' => 'required|in:cod',
            'shipping_address' => 'required|array:fullName,email,phone,address,apartment,city,state,zipCode,country',
            'shipping_address.fullName' => 'required|string|max:255',
            'shipping_address.email' => 'required|email|max:255',
            'shipping_address.phone' => 'required|string|max:30',
            'shipping_address.address' => 'required|string|max:500',
            'shipping_address.apartment' => 'nullable|string|max:100',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'required|string|max:100',
            'shipping_address.zipCode' => 'nullable|string|max:20',
            'shipping_address.country' => 'required|in:PK',
            'items' => 'prohibited', 'tax' => 'prohibited',
            'shipping_cost' => 'prohibited', 'total' => 'prohibited', 'discount' => 'prohibited',
        ]);
        $hash = $checkout->requestHash($data);
        $created = false;
        $order = DB::transaction(function () use ($request, $data, $checkout, $hash, &$created) {
            // One lock order for checkout, cancellation and cart mutations: user, then products.
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $existing = $request->user()->orders()->where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing) {
                abort_unless(hash_equals($existing->request_hash, $hash), 409, 'This request key was already used for a different order.');
                return $existing->load('items.product');
            }
            $claim = $checkout->claim($data['quote_token'], $request->user());
            abort_if(Order::where('quote_id', $claim['id'])->exists(), 409, 'This quote was already used. Review your cart again.');
            $snapshot = $checkout->snapshot($request->user(), true);
            abort_unless(hash_equals($claim['fingerprint'], $checkout->fingerprint($snapshot)), 409, 'Your cart or prices changed. Review your order again.');
            $order = $request->user()->orders()->create([
                'order_number' => 'ORD-'.Str::upper((string) Str::ulid()),
                'total' => $snapshot['total'], 'currency' => $snapshot['currency'],
                'shipping_cost' => $snapshot['shipping_cost'], 'tax' => $snapshot['tax'],
                'shipping_address' => $data['shipping_address'], 'payment_method' => 'cod',
                'status' => 'pending', 'payment_status' => 'awaiting_collection',
                'idempotency_key' => $data['idempotency_key'], 'request_hash' => $hash, 'quote_id' => $claim['id'],
            ]);
            foreach ($snapshot['items'] as $item) {
                $order->items()->create(collect($item)->only(['product_id', 'name', 'price', 'quantity'])->all());
                Product::whereKey($item['product_id'])->decrement('stock', $item['quantity']);
            }
            Cart::where('user_id', $request->user()->id)->delete();
            $created = true;
            return $order->load('items.product');
        }, 3);
        return response()->json(['success' => true, 'data' => $order], $created ? 201 : 200);
    }

    public function cancel(Request $request, $id)
    {
        $order = DB::transaction(function () use ($request, $id) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $order = $request->user()->orders()->lockForUpdate()->findOrFail($id);
            if ($order->status === 'cancelled') return $order;
            abort_unless($order->status === 'pending' && $order->payment_status === 'awaiting_collection', 409, 'This order can no longer be cancelled here.');
            foreach ($order->items()->orderBy('product_id')->get() as $item) {
                if ($item->product_id) Product::whereKey($item->product_id)->increment('stock', $item->quantity);
            }
            $order->update(['status' => 'cancelled', 'payment_status' => 'cancelled']);
            return $order;
        }, 3);
        return response()->json(['success' => true, 'data' => $order, 'message' => 'Order cancelled']);
    }

    public function track(Request $request, $orderNumber)
    {
        $order = $request->user()->orders()->where('order_number', $orderNumber)->firstOrFail();
        return response()->json(['success' => true, 'data' => $order->only(['order_number', 'status', 'created_at', 'updated_at'])]);
    }
}
