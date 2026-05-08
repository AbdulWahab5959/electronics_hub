<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * 
     * These fields can be filled when creating/updating a wishlist item
     */
    protected $fillable = [
        'user_id',      // Which user owns this wishlist item
        'product_id',   // Which product was saved
        'name',         // Product name (snapshot at save time)
        'price',        // Product price (snapshot at save time)
        'image',        // Product image URL (snapshot)
    ];

    /**
     * RELATIONSHIPS
     * Connect wishlist item to other tables
     */

    /**
     * A wishlist item belongs to a user
     * Foreign key: user_id
     * 
     * This allows: $wishlistItem->user to get the user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A wishlist item belongs to a product
     * Foreign key: product_id
     * 
     * This allows: $wishlistItem->product to get full product details
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}