<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        abort_unless($request->hasSession(), 400, 'Use the configured storefront origin for session authentication.');
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user = User::create($data);
        // A limited session permits resend/logout only until verification.
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        event(new Registered($user));

        return response()->json([
            'message' => 'Account created. Verify your email, then sign in.',
            'requires_verification' => true,
            'email' => $user->email,
        ], 201);
    }

    public function login(Request $request)
    {
        abort_unless($request->hasSession(), 400, 'Use the configured storefront origin for session authentication.');
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ]);
        $user = User::where('email', $data['email'])->first();
        // Do not disclose verification state until credentials are correct.
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
        }
        Auth::guard('web')->login($user, $user->hasVerifiedEmail() && $request->boolean('remember'));
        $request->session()->regenerate();
        if (!$user->hasVerifiedEmail()) {
            return $this->pendingVerification($user);
        }

        return response()->json(['user' => $user, 'message' => 'Login successful']);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        if (!$request->user()->hasVerifiedEmail()) {
            return $this->pendingVerification($request->user());
        }

        return response()->json(['user' => $request->user()]);
    }

    private function pendingVerification(User $user)
    {
        return response()->json([
            'message' => 'Please verify your email before continuing.',
            'requires_verification' => true,
            'email' => $user->email,
        ], 403);
    }

    public function verifyEmail(Request $request)
    {
        $user = User::findOrFail($request->route('id'));
        abort_unless(hash_equals(sha1($user->getEmailForVerification()), (string) $request->route('hash')), 403);
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified. You can now sign in.']);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();
        if (!$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json(['message' => 'If verification is needed, an email has been sent.']);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:255']);
        Password::sendResetLink($data);

        return response()->json(['success' => true, 'message' => 'If an account exists, a reset link has been sent.']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $status = Password::reset($data, function ($user, $password) {
            $user->forceFill(['password' => Hash::make($password)])->setRememberToken(Str::random(60));
            $user->save();
            event(new PasswordReset($user));
        });
        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => 'The reset link is invalid or expired. Request another link.']);
        }

        return response()->json(['success' => true, 'message' => 'Password reset. Sign in with your new password.']);
    }
}
