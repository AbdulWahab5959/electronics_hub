<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\CustomResetPassword;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $this->withHeaders(['Origin' => 'http://localhost:5173', 'Referer' => 'http://localhost:5173/']);
    }

    private function customer(bool $verified = true): User
    {
        $user = User::create(['name' => 'Customer', 'email' => 'buyer@example.test', 'password' => 'secure-password']);
        if ($verified) $user->markEmailAsVerified();
        return $user;
    }

    public function test_registration_creates_only_a_verification_session(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Customer', 'email' => 'new@example.test',
            'password' => 'secure-password', 'password_confirmation' => 'secure-password',
        ])->assertCreated()->assertJsonPath('requires_verification', true)->assertJsonMissingPath('user');
        $user = User::firstOrFail();
        $this->assertTrue(Hash::check('secure-password', $user->password));
        Notification::assertSentTo($user, CustomVerifyEmail::class);
        $this->getJson('/api/user')->assertForbidden()->assertJsonPath('requires_verification', true);
        $this->getJson('/api/cart')->assertForbidden();
        $this->postJson('/api/email/resend')->assertOk();
        $this->postJson('/api/email/resend')->assertStatus(429);
        $this->postJson('/api/logout')->assertOk();
        $this->app['auth']->forgetGuards(); // Model the next independent HTTP request.
        $this->getJson('/api/cart')->assertUnauthorized();
    }

    public function test_login_checks_password_before_disclosing_verification(): void
    {
        $this->customer(false);
        $this->postJson('/api/login', ['email' => 'buyer@example.test', 'password' => 'incorrect'])
            ->assertUnprocessable()->assertJsonMissingPath('requires_verification');
        $this->assertGuest();
        $this->postJson('/api/login', ['email' => 'buyer@example.test', 'password' => 'secure-password'])
            ->assertForbidden()->assertJsonPath('requires_verification', true);
        $this->getJson('/api/profile')->assertForbidden();
        $this->postJson('/api/email/resend')->assertOk();
    }

    public function test_verified_login_session_and_logout_work(): void
    {
        $user = $this->customer();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'secure-password'])
            ->assertOk()->assertJsonPath('user.id', $user->id);
        $this->getJson('/api/user')->assertOk()->assertJsonPath('user.id', $user->id);
        $this->getJson('/api/cart')->assertOk();
        $this->postJson('/api/logout')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_verification_requires_an_unmodified_unexpired_signature(): void
    {
        $user = $this->customer(false);
        $parameters = ['id' => $user->id, 'hash' => sha1($user->email)];
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), $parameters);
        $expired = URL::temporarySignedRoute('verification.verify', now()->subMinute(), $parameters);
        $this->getJson('/api/email/verify/'.$user->id.'/'.sha1($user->email))->assertForbidden();
        $this->getJson($expired)->assertForbidden();
        $this->getJson($url.'&tampered=1')->assertForbidden();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        $this->getJson($url)->assertOk();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->getJson($url)->assertOk();
    }

    public function test_notification_frontend_link_round_trips_to_the_signed_api_url(): void
    {
        $user = $this->customer(false);
        $url = (new CustomVerifyEmail())->toMail($user)->actionUrl;
        $this->assertStringStartsWith(rtrim(config('app.frontend_url'), '/').'/verify-email/', $url);
        $backend = str_replace(rtrim(config('app.frontend_url'), '/').'/verify-email', url('/api/email/verify'), $url);
        $this->getJson($backend)->assertOk();
    }

    public function test_password_recovery_is_generic_and_reset_token_cannot_be_reused(): void
    {
        $user = $this->customer();
        $known = $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
        $unknown = $this->postJson('/api/forgot-password', ['email' => 'unknown@example.test'])->assertOk();
        $this->assertSame($known->json(), $unknown->json());
        $token = null;
        Notification::assertSentTo($user, CustomResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;
            return true;
        });
        $payload = ['email' => $user->email, 'token' => $token,
            'password' => 'replacement-password', 'password_confirmation' => 'replacement-password'];
        $this->postJson('/api/reset-password', $payload)->assertOk();
        $this->assertTrue(Hash::check('replacement-password', $user->fresh()->password));
        $this->postJson('/api/reset-password', $payload)->assertUnprocessable();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'secure-password'])->assertUnprocessable();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'replacement-password'])->assertOk();
    }

    public function test_login_is_rate_limited_and_public_mail_diagnostic_is_removed(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'unknown@example.test', 'password' => 'incorrect'])->assertUnprocessable();
        }
        $this->postJson('/api/login', ['email' => 'unknown@example.test', 'password' => 'incorrect'])->assertStatus(429);
        $this->get('/test-mail')->assertNotFound();
    }
}
