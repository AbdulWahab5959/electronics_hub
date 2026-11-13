<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class CheckoutService
{
    public static function minor(string $amount): int
    {
        abort_unless(preg_match('/^\\d{1,8}(?:\\.\\d{1,2})?$/', $amount), 422, 'Invalid product price.');
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');
        return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
    }

    public static function decimal(int $minor): string
    {
        return intdiv($minor, 100).'.'.str_pad((string) ($minor % 100), 2, '0', STR_PAD_LEFT);
    }

    public function snapshot(User $user, bool $lock = false): array
    {
        abort_unless(config('checkout.enabled'), 503, 'Checkout is not available yet.');
        $cart = Cart::where('user_id', $user->id)->orderBy('product_id')->get();
        abort_if($cart->isEmpty(), 422, 'Your cart is empty.');
        abort_if($cart->count() > 50, 422, 'A cart may contain up to 50 products.');
        $query = Product::whereIn('id', $cart->pluck('product_id'))->orderBy('id');
        if ($lock) $query->lockForUpdate();
        $products = $query->get()->keyBy('id');
        $items = [];
        $subtotal = 0;
        foreach ($cart as $row) {
            $product = $products->get($row->product_id);
            abort_unless($product && $row->quantity >= 1 && $row->quantity <= 99, 422, 'A cart item is no longer available.');
            abort_if($product->stock < $row->quantity, 409, 'Insufficient stock for '.$product->name.'. Please update your cart.');
            $price = self::minor((string) $product->price);
            $line = $price * $row->quantity;
            $subtotal += $line;
            $items[] = [
                'product_id' => $product->id, 'name' => $product->name,
                'image' => $product->image, 'price' => self::decimal($price),
                'quantity' => (int) $row->quantity, 'line_total' => self::decimal($line),
            ];
        }
        $shipping = (int) config('checkout.shipping_minor');
        $basisPoints = (int) config('checkout.tax_basis_points');
        abort_if($shipping < 0 || $shipping > 9999999999 || $basisPoints < 0 || $basisPoints > 10000, 503, 'Checkout rates are not configured correctly.');
        $tax = intdiv($subtotal * $basisPoints + 5000, 10000);
        $total = $subtotal + $shipping + $tax;
        abort_if($total > 9999999999, 422, 'Order amount exceeds the supported limit.');
        return [
            'currency' => config('checkout.currency'), 'items' => $items,
            'subtotal' => self::decimal($subtotal), 'shipping_cost' => self::decimal($shipping),
            'tax' => self::decimal($tax), 'total' => self::decimal($total),
            'payment_methods' => ['cod'],
        ];
    }

    public function quote(User $user): array
    {
        $snapshot = $this->snapshot($user);
        $expires = now()->addMinutes(config('checkout.quote_minutes'));
        $claim = [
            'id' => (string) Str::uuid(), 'user_id' => $user->id, 'expires' => $expires->timestamp,
            'fingerprint' => $this->fingerprint($snapshot),
        ];
        return $snapshot + [
            'quote_token' => Crypt::encryptString(json_encode($claim, JSON_THROW_ON_ERROR)),
            'expires_at' => $expires->toIso8601String(),
        ];
    }

    public function claim(string $token, User $user): array
    {
        try {
            $claim = json_decode(Crypt::decryptString($token), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable $exception) {
            abort(422, 'Invalid checkout quote. Please review your cart again.');
        }
        abort_unless(is_array($claim) && isset($claim['id'], $claim['user_id'], $claim['expires'], $claim['fingerprint']), 422, 'Invalid quote.');
        abort_unless($claim['user_id'] === $user->id, 403, 'This quote belongs to another customer.');
        abort_if($claim['expires'] <= now()->timestamp, 409, 'Your quote expired. Please review your order again.');
        return $claim;
    }

    public function fingerprint(array $snapshot): string
    {
        return hash('sha256', json_encode($snapshot, JSON_THROW_ON_ERROR));
    }

    public function requestHash(array $data): string
    {
        // Object field order must not change the meaning of an idempotent request.
        $sort = function (array $value) use (&$sort): array {
            ksort($value);
            foreach ($value as &$item) if (is_array($item)) $item = $sort($item);
            return $value;
        };
        unset($data['idempotency_key']);
        return hash('sha256', json_encode($sort($data), JSON_THROW_ON_ERROR));
    }
}
