<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * 
     * These fields can be filled when creating/updating a cart item
     */
    protected $fillable = [
        'user_id',      // Which user owns this cart item
        'product_id',   // Which product was added
        'name',         // Product name (snapshot at add time)
        'price',        // Product price (snapshot at add time)
        'quantity',     // How many of this product
        'image',        // Product image URL (snapshot)
    ];

    /**
     * RELATIONSHIPS
     * Connect cart item to other tables
     */

    /**
     * A cart item belongs to a user
     * Foreign key: user_id
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A cart item belongs to a product
     * Foreign key: product_id
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * HELPER METHODS
     * Convenience functions for calculations
     */

    /**
     * Calculate total price for this cart item
     * Returns: price × quantity
     */
    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}