<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // 1. Validate incoming data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // 2. Create user with hashed password
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // 3. Log the user in automatically after registration
        Auth::login($user);
        
        // 4. Regenerate session to prevent fixation attacks
        $request->session()->regenerate();

        // 5. Return user data (password hidden automatically by Laravel)
        return response()->json([
            'user' => $user,
            'message' => 'Registration successful'
        ], 201);
    }

    /**
     * Login an existing user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request)
    {
        // 1. Validate credentials format
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Attempt to authenticate
        if (!Auth::attempt($request->only('email', 'password'), true)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // 3. Regenerate session ID (CRITICAL for security)
        $request->session()->regenerate();

        // 4. Return authenticated user
        return response()->json([
            'user' => Auth::user(),
            'message' => 'Login successful'
        ]);
    }

    /**
     * Logout user and destroy session
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // 1. Logout from web guard
        Auth::guard('web')->logout();
        
        // 2. Invalidate the session (remove from server)
        $request->session()->invalidate();
        
        // 3. Regenerate CSRF token
        $request->session()->regenerateToken();

        // 4. Return success response
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get the authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}