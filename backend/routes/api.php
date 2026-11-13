<?php

use App\Http\Controllers\Api\{AuthController, ProductController, OrderController, CartController, ProfileController, WishlistController};
use Illuminate\Support\Facades\Route;

Route::get('/test', fn () => response()->json(['message' => 'API working']));
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:registration');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:recovery');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:recovery');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:30,1'])->name('verification.verify');

// Limited sessions can verify/resend/logout, but cannot access commerce data.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:verification');
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/user/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::get('/addresses', [ProfileController::class, 'addresses']);
    Route::get('/addresses/{id}', [ProfileController::class, 'getAddress']);
    Route::post('/addresses', [ProfileController::class, 'storeAddress']);
    Route::post('/addresses/{id}/set-default', [ProfileController::class, 'setDefaultAddress']);
    Route::put('/addresses/{id}', [ProfileController::class, 'updateAddress']);
    Route::delete('/addresses/{id}', [ProfileController::class, 'deleteAddress']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/track/{orderNumber}', [OrderController::class, 'track']);
    Route::get('/orders/number/{orderNumber}', [OrderController::class, 'showByNumber']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/checkout/quote', [OrderController::class, 'quote']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
    Route::post('/wishlist', [WishlistController::class, 'add']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'remove']);
});

Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/best-selling', [ProductController::class, 'bestSelling']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/brands', [ProductController::class, 'brands']);
