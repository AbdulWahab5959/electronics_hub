<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;


class ProfileController extends Controller
{
    /**
     * Get user profile
     * GET /api/profile
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Add additional stats to response
        $stats = [
            'orders_count' => $user->orders()->count(),
            'wishlist_count' => $user->wishlist()->count(),
            'cart_count' => $user->cart()->sum('quantity'),
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'stats' => $stats
            ]
        ]);
    }
    
    /**
     * Update user profile
     * PUT /api/profile
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|numeric|digits_between:7,15',
            'bio' => 'sometimes|string|max:500',
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }
    
    /**
     * Change user password
     * POST /api/change-password
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);
        
        $user = $request->user();
        
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }
        
        $user->password = Hash::make($validated['password']);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
    
    /**
     * Get all user addresses
     * GET /api/addresses
     */
    public function addresses(Request $request)
    {
        $addresses = $request->user()->addresses()
            ->orderByRaw('is_default DESC')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }
    
    /**
     * Get single address
     * GET /api/addresses/{id}
     */
    public function getAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $address
        ]);
    }
    
    /**
     * Create new address
     * POST /api/addresses
     */
    public function storeAddress(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:50',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip_code' => 'required|string|max:20',  // Fixed: zipCode → zip_code
            'country' => 'required|string|max:100',
            'is_default' => 'boolean',  // Fixed: isDefault → is_default
        ]);
        
        // If this is the first address, make it default
        $isFirstAddress = $request->user()->addresses()->count() === 0;
        
        if ($validated['is_default'] || $isFirstAddress) {
            // Remove default from all other addresses
            $request->user()->addresses()->update(['is_default' => false]);
            $validated['is_default'] = true;
        }
        
        $address = $request->user()->addresses()->create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Address added successfully',
            'data' => $address
        ], 201);
    }
    
    /**
     * Update existing address
     * PUT /api/addresses/{id}
     */
    public function updateAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'zip_code' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
            'is_default' => 'boolean',
        ]);
        
        // If setting as default, remove default from others
        if (isset($validated['is_default']) && $validated['is_default']) {
            $request->user()->addresses()
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }
        
        $address->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully',
            'data' => $address
        ]);
    }
    
    /**
     * Delete address
     */
    public function deleteAddress($id)
    {
        $address = auth()->user()->addresses()->findOrFail($id);
        
        // Check if this was the default address
        $wasDefault = $address->is_default;
        
        $address->delete();
        
        // If deleted address was default, make another address default
        if ($wasDefault) {
            $newDefault = auth()->user()->addresses()->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully'
        ]);
    }
    
    /**
     * Set default address
     * POST /api/addresses/{id}/set-default
     */
    public function setDefaultAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        
        // Remove default from all addresses
        $request->user()->addresses()->update(['is_default' => false]);
        
        // Set this address as default
        $address->update(['is_default' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Default address updated',
            'data' => $address
        ]);
    }
    
    /**
     * Upload profile picture
     * POST /api/user/avatar
     */
     public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar in 'storage/app/public/avatars'
        $path = $request->file('avatar')->store('avatars', 'public');

        // Update user record
        $user->avatar = $path;
        $user->save();

        // Return full URL
        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar' => asset('storage/' . $path),
        ]);
    }
    
    /**
     * Delete account (with confirmation)
     * DELETE /api/profile
     */
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);
        
        $user = $request->user();
        
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password is incorrect'
            ], 422);
        }
        
        // Delete related data
        $user->addresses()->delete();
        $user->cart()->delete();
        $user->wishlist()->delete();
        $user->tokens()->delete();
        
        // Delete user
        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
    }
}