<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * These fields can be filled using create() or update()
     */
    protected $fillable = [
        'name',           // Product name
        'description',    // Product description
        'price',          // Current selling price
        'original_price', // Original price before discount
        'image',          // Product image URL
        'rating',         // Average rating (0-5)
        'reviews',        // Number of reviews
        'category',       // Category name
        'brand',          // Brand name
        'stock',          // Available quantity
        'is_new',         // Boolean - is this new arrival?
        'is_featured',    // Boolean - show on homepage?
        'discount',       // Discount percentage
        'specifications', // JSON - product specs (RAM, processor, etc.)
        'features',       // JSON - list of features
    ];

    /**
     * The attributes that should be cast.
     * Automatically converts JSON to array when accessed
     */
    protected $casts = [
        'specifications' => 'array',  // specs column becomes array in PHP
        'features' => 'array',        // features column becomes array in PHP
        'is_new' => 'boolean',        // automatically converts to true/false
        'is_featured' => 'boolean',   // automatically converts to true/false
    ];

    /**
     * RELATIONSHIPS
     * Define how this model connects to other tables
     */

    // One product can be in many carts
    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    // One product can be in many wishlists
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class);
    }

    // One product can be in many orders
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }
}