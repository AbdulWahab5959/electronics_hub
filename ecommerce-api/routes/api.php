<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\WishlistController; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ============================================
// TEST ROUTE
// ============================================
Route::get('/test', function () {
    return response()->json(['message' => 'API working']);
});

// ============================================
// PUBLIC AUTH ROUTES (No authentication required)
// ============================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// ============================================
// PROTECTED AUTH ROUTES (Requires authentication)
// ============================================
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::post('/user/avatar', [ProfileController::class, 'uploadAvatar']);

    
    // Addresses
    Route::get('/addresses', [ProfileController::class, 'addresses']);
    Route::post('/addresses', [ProfileController::class, 'storeAddress']);
    Route::put('/addresses/{id}', [ProfileController::class, 'updateAddress']);
    Route::delete('/addresses/{id}', [ProfileController::class, 'deleteAddress']);
    
    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    
    // Cart (if using backend cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'add']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'remove']);
});

// ============================================
// PUBLIC PRODUCT ROUTES (No auth needed)
// ============================================
Route::get('/products/featured', [ProductController::class, 'featured']);

Route::get('/products/search', [ProductController::class, 'search']); // if you want a dedicated search endpoint

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/brands', [ProductController::class, 'brands']);