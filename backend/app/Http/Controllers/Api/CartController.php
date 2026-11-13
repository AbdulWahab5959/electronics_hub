<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Cart, Product, User};
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = $request->user()->cart()->with('product')->get();
        $total = 0;
        foreach ($items as $item) {
            if ($item->product) {
                $item->name = $item->product->name;
                $item->price = $item->product->price;
                $item->image = $item->product->image;
            }
            $item->setAttribute('stock', $item->product?->stock ?? 0);
            $total += CheckoutService::minor((string) $item->price) * $item->quantity;
        }
        return response()->json(['success' => true, 'data' => [
            'items' => $items, 'total' => CheckoutService::decimal($total), 'count' => $items->sum('quantity'),
        ]]);
    }

    public function add(Request $request)
    {
        $data = $request->validate(['product_id' => 'required|integer|exists:products,id', 'quantity' => 'required|integer|min:1|max:99']);
        $item = DB::transaction(function () use ($request, $data) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $product = Product::whereKey($data['product_id'])->lockForUpdate()->firstOrFail();
            $item = $request->user()->cart()->where('product_id', $product->id)->first();
            $quantity = ($item?->quantity ?? 0) + $data['quantity'];
            abort_if($quantity > $product->stock || $quantity > 99, 409, 'Requested quantity is not available.');
            $item ??= new Cart(['user_id' => $request->user()->id, 'product_id' => $product->id]);
            $item->fill(['name' => $product->name, 'price' => $product->price, 'image' => $product->image, 'quantity' => $quantity])->save();
            return $item;
        }, 3);
        return response()->json(['success' => true, 'data' => $item->load('product')], 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1|max:99']);
        $item = DB::transaction(function () use ($request, $id, $data) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $item = $request->user()->cart()->findOrFail($id);
            $product = Product::whereKey($item->product_id)->lockForUpdate()->firstOrFail();
            abort_if($data['quantity'] > $product->stock, 409, 'Requested quantity is not available.');
            $item->update(['quantity' => $data['quantity'], 'price' => $product->price]);
            return $item;
        }, 3);
        return response()->json(['success' => true, 'data' => $item->load('product')]);
    }

    public function remove(Request $request, $id)
    {
        DB::transaction(function () use ($request, $id) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $request->user()->cart()->findOrFail($id)->delete();
        });
        return response()->json(['success' => true, 'message' => 'Item removed']);
    }

    public function clear(Request $request)
    {
        DB::transaction(function () use ($request) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $request->user()->cart()->delete();
        });
        return response()->json(['success' => true, 'message' => 'Cart cleared']);
    }
}
