<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class ProductDeduplicator
{
    public function merge(string $backupPath): array
    {
        return DB::transaction(function () use ($backupPath) {
            // Match the user/product locking order used by cart and checkout writes.
            DB::table('users')->orderBy('id')->lockForUpdate()->get();
            $products = DB::table('products')->orderBy('id')->lockForUpdate()->get();
            $groups = $products->groupBy(fn ($p) => json_encode(array_map(
                fn ($value) => mb_strtolower(trim($value ?? '')),
                [$p->brand, $p->name]
            )))->filter(fn ($group) => $group->count() > 1);
            if ($groups->isEmpty()) return ['removed' => 0, 'mapping' => []];

            $snapshot = ['products' => $products];
            foreach (['carts', 'wishlists', 'order_items', 'orders'] as $table) {
                $snapshot[$table] = DB::table($table)->orderBy('id')->lockForUpdate()->get();
            }
            $mapping = [];
            foreach ($groups as $group) {
                $keep = $group->first();
                foreach ($group->skip(1) as $duplicate) {
                    // Do not silently merge different configurations or prices.
                    if ($duplicate->price !== $keep->price || $duplicate->specifications !== $keep->specifications) {
                        throw new RuntimeException('Conflicting product details for '.$keep->name.'. No products were changed.');
                    }
                    $mapping[$duplicate->id] = $keep->id;
                }
            }
            // A failed backup aborts the transaction before any record changes.
            File::ensureDirectoryExists(dirname($backupPath));
            $json = json_encode(['mapping' => $mapping, 'tables' => $snapshot], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
            if (File::put($backupPath, $json) !== strlen($json)) throw new RuntimeException('Backup could not be saved.');

            foreach ($mapping as $oldId => $keepId) {
                $keep = $products->firstWhere('id', $keepId);
                foreach (DB::table('carts')->where('product_id', $oldId)->get() as $row) {
                    $existing = DB::table('carts')->where('user_id', $row->user_id)->where('product_id', $keepId)->first();
                    if ($existing) {
                        $quantity = $existing->quantity + $row->quantity;
                        if ($quantity > 99 || $quantity > $keep->stock) {
                            throw new RuntimeException('Merged cart would exceed available stock. No products were changed.');
                        }
                        DB::table('carts')->where('id', $existing->id)->update(['quantity' => $quantity]);
                        DB::table('carts')->where('id', $row->id)->delete();
                    } else {
                        DB::table('carts')->where('id', $row->id)->update(['product_id' => $keepId]);
                    }
                }
                foreach (DB::table('wishlists')->where('product_id', $oldId)->get() as $row) {
                    $exists = DB::table('wishlists')->where('user_id', $row->user_id)->where('product_id', $keepId)->exists();
                    if ($exists) DB::table('wishlists')->where('id', $row->id)->delete();
                    else DB::table('wishlists')->where('id', $row->id)->update(['product_id' => $keepId]);
                }
                // Keep every historical order line, including its price, name and quantity.
                DB::table('order_items')->where('product_id', $oldId)->update(['product_id' => $keepId]);
                DB::table('products')->where('id', $oldId)->delete();
            }
            // Duplicate inventory is not additional inventory: leave retained stock unchanged.
            return ['removed' => count($mapping), 'mapping' => $mapping];
        }, 3);
    }
}
