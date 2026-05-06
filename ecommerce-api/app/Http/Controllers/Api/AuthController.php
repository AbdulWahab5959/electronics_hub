<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Send email verification
        event(new Registered($user));

        // Log the user in
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'message' => 'Registration successful. Please verify your email.',
            'requires_verification' => true
        ], 201);
    }

    /**
     * Verify email address
     */
    public function verifyEmail(Request $request)
    {
        $user = User::findOrFail($request->id);

        if (!hash_equals((string) $request->hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Invalid verification link'
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json([
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Resend verification email
     * Works for both authenticated and non-authenticated users
     */
    public function resendVerification(Request $request)
    {
        $user = null;

        // Check if user is authenticated
        if ($request->user()) {
            $user = $request->user();
        } else {
            // If not authenticated, get email from request body
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);
            $user = User::where('email', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address.'
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified. You can login now.'
            ], 400);
        }

        // Send verification email
        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification email sent! Please check your inbox.'
        ]);
    }

    /**
     * Login with email verification check
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check if user exists
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if email is verified
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
        }

        // Attempt login
        if (!Auth::attempt($request->only('email', 'password'), true)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => Auth::user(),
            'message' => 'Login successful'
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}