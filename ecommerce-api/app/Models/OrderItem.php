<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * 
     * These fields can be filled when creating/updating an order item
     */
    protected $fillable = [
        'order_id',      // Which order this item belongs to
        'product_id',    // Which product was purchased (optional, can be null)
        'name',          // Product name (snapshot at purchase time)
        'price',         // Price paid (snapshot at purchase time)
        'quantity',      // How many of this product
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',  // Ensures 2 decimal places
    ];

    /**
     * RELATIONSHIPS
     * Connect order item to order and product
     */

    /**
     * An order item belongs to an order
     * Foreign key: order_id
     * 
     * This allows: $orderItem->order to get the parent order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * An order item belongs to a product (optional)
     * Foreign key: product_id
     * 
     * This allows: $orderItem->product to get full product details
     * Note: product_id can be null if product is deleted later
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
     * Calculate subtotal for this order item
     * price × quantity
     * 
     * Usage: $orderItem->subtotal
     * Returns: $299.99 (if price=99.99, quantity=3)
     */
    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }

    /**
     * Get formatted subtotal with currency
     * 
     * Usage: $orderItem->formatted_subtotal
     * Returns: "$299.99"
     */
    public function getFormattedSubtotalAttribute()
    {
        return '$' . number_format($this->subtotal, 2);
    }

    /**
     * Get formatted price with currency
     * 
     * Usage: $orderItem->formatted_price
     * Returns: "$99.99"
     */
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }
}