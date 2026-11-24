<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Jobs\SendContactNotification;
use Illuminate\Support\Facades\Queue;

class ContactMessageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['contact.notification_to' => 'support@example.test']);
        Queue::fake([SendContactNotification::class]);
    }

    private function validMessage(): array
    {
        return ['name' => 'Storefront QA', 'email' => 'qa@example.test', 'subject' => 'Product availability', 'message' => 'Please confirm whether this laptop is available at your store.'];
    }

    public function test_guest_message_is_saved_and_returns_only_a_reference(): void
    {
        $response = $this->postJson('/api/contact', $this->validMessage())->assertCreated();
        $response->assertJsonStructure(['message', 'reference'])->assertJsonMissingPath('email')->assertJsonMissingPath('name');
        $this->assertDatabaseHas('contact_messages', [...$this->validMessage(), 'reference' => $response->json('reference')]);
        Queue::assertPushed(SendContactNotification::class, 1);
        $this->getJson('/api/contact')->assertStatus(405);
    }

    public function test_invalid_or_bot_messages_are_not_saved(): void
    {
        $this->postJson('/api/contact', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
        $this->postJson('/api/contact', [...$this->validMessage(), 'email' => 'invalid', 'message' => 'short'])->assertUnprocessable();
        $this->postJson('/api/contact', [...$this->validMessage(), 'website' => 'spam.example'])->assertUnprocessable();
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_message_limits_are_enforced(): void
    {
        $this->postJson('/api/contact', [...$this->validMessage(), 'message' => str_repeat('x', 5001)])->assertUnprocessable()->assertJsonValidationErrors('message');
        $this->postJson('/api/contact', [...$this->validMessage(), 'name' => str_repeat('x', 121)])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_repeated_submissions_are_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) $this->postJson('/api/contact', $this->validMessage())->assertCreated();
        $this->postJson('/api/contact', $this->validMessage())->assertTooManyRequests();
        $this->assertDatabaseCount('contact_messages', 5);
    }
}
