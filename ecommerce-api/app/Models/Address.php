<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * 
     * These fields can be filled when creating/updating an address
     */
    protected $fillable = [
        'user_id',      // Which user owns this address
        'title',        // Label: "Home", "Work", "Office"
        'address',      // Street address
        'city',         // City name
        'state',        // State/Province
        'zip_code',     // Postal/ZIP code
        'country',      // Country name or code
        'is_default',   // Is this the default address?
    ];

    /**
     * The attributes that should be cast.
     * Automatically converts database values to PHP types
     */
    protected $casts = [
        'is_default' => 'boolean',  // 0/1 in DB becomes true/false in PHP
    ];

    /**
     * RELATIONSHIPS
     * Connect address to user
     */

    /**
     * An address belongs to a user
     * Foreign key: user_id
     * 
     * This allows: $address->user to get the user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * HELPER METHODS
     * Convenience functions
     */

    /**
     * Get formatted full address as a single string
     * 
     * Usage: $address->full_address
     * Returns: "123 Main St, Lahore, Punjab 54000, Pakistan"
     */
    public function getFullAddressAttribute()
    {
        $parts = [
            $this->address,
            $this->city,
            $this->state,
            $this->zip_code,
            $this->country,
        ];
        
        // Remove empty values and join with commas
        return implode(', ', array_filter($parts));
    }

    /**
     * Get short address (for dropdowns)
     * 
     * Usage: $address->short_address
     * Returns: "Home: 123 Main St, Lahore"
     */
    public function getShortAddressAttribute()
    {
        return $this->title . ': ' . $this->address . ', ' . $this->city;
    }
}