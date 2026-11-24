<?php

namespace Tests\Feature;

use App\Jobs\SendContactNotification;
use App\Mail\ContactMessageReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use RuntimeException;
use Tests\TestCase;

class ContactNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['contact.notification_to' => 'owner@example.test']);
        Queue::fake([SendContactNotification::class]);
    }

    private function data(): array
    {
        return ['name' => 'Customer Name', 'email' => 'customer@example.test', 'subject' => 'Laptop question', 'message' => "Is this laptop available?\nPlease confirm the model."];
    }

    private function submit(): object
    {
        $this->postJson('/api/contact', $this->data())->assertCreated();
        return DB::table('contact_messages')->first();
    }

    public function test_notification_has_store_recipient_customer_reply_to_and_database_copy(): void
    {
        Mail::fake();
        $contact = $this->submit();
        config(['contact.notification_to' => 'changed-owner@example.test']);
        (new SendContactNotification($contact->id))->handle();
        Mail::assertSent(ContactMessageReceived::class, function ($mail) use ($contact) {
            $mail->assertHasReplyTo('customer@example.test');
            $mail->assertHasSubject('New TechHub contact message ['.$contact->reference.']');
            $mail->assertSeeInText($contact->reference);
            $mail->assertSeeInText($contact->message);
            return $mail->hasTo('owner@example.test');
        });
        $this->assertNotNull(DB::table('contact_messages')->value('notification_sent_at'));
        $this->assertDatabaseHas('contact_messages', $this->data());
        $this->assertDatabaseCount('contact_messages', 1);
    }

    public function test_duplicate_job_does_not_resend_a_sent_message(): void
    {
        Mail::fake();
        $contact = $this->submit();
        (new SendContactNotification($contact->id))->handle();
        (new SendContactNotification($contact->id))->handle();
        Mail::assertSent(ContactMessageReceived::class, 1);
    }

    public function test_mail_failure_retains_the_message_and_can_be_retried(): void
    {
        $contact = $this->submit();
        $manager = app('mail.manager');
        Mail::shouldReceive('to')->once()->with('owner@example.test')->andReturnSelf();
        Mail::shouldReceive('send')->once()->andThrow(new RuntimeException('Temporary transport failure'));
        $job = new SendContactNotification($contact->id);
        try { $job->handle(); $this->fail('Expected transport failure to trigger queue retry'); }
        catch (RuntimeException $error) { $this->assertSame('Temporary transport failure', $error->getMessage()); }
        $this->assertDatabaseHas('contact_messages', ['id' => $contact->id, 'notification_sent_at' => null, 'message' => $contact->message]);
        $this->assertSame(5, $job->tries);
        $this->assertSame([60, 300, 900, 3600], $job->backoff());
        Mail::swap($manager);
        Mail::fake();
        $job->handle();
        Mail::assertSent(ContactMessageReceived::class, 1);
        $this->assertNotNull(DB::table('contact_messages')->value('notification_sent_at'));
    }

    public function test_queue_failure_does_not_fail_receipt_or_lose_the_database_copy(): void
    {
        Bus::shouldReceive('dispatch')->once()->andThrow(new RuntimeException('Queue temporarily unavailable'));
        $this->postJson('/api/contact', $this->data())->assertCreated()->assertJsonStructure(['reference']);
        $this->assertDatabaseHas('contact_messages', [...$this->data(), 'notification_queued_at' => null, 'notification_sent_at' => null]);
    }

    public function test_recovery_command_skips_sent_recently_queued_and_legacy_messages(): void
    {
        $contact = $this->submit();
        $this->artisan('contact:retry-notifications')->assertSuccessful();
        Queue::assertPushed(SendContactNotification::class, 1);
        DB::table('contact_messages')->where('id', $contact->id)->update(['notification_queued_at' => now()->subHours(3)]);
        $this->artisan('contact:retry-notifications')->assertSuccessful();
        Queue::assertPushed(SendContactNotification::class, 2);
        DB::table('contact_messages')->where('id', $contact->id)->update(['notification_sent_at' => now()]);
        $this->artisan('contact:retry-notifications', ['--reference' => $contact->reference])->assertSuccessful();
        Queue::assertPushed(SendContactNotification::class, 2);
        DB::table('contact_messages')->where('id', $contact->id)->update(['notification_sent_at' => null, 'notification_recipient' => null]);
        $this->artisan('contact:retry-notifications', ['--reference' => $contact->reference])->assertSuccessful();
        Queue::assertPushed(SendContactNotification::class, 2);
    }

    public function test_unconfigured_recipient_still_preserves_the_message_without_sending(): void
    {
        config(['contact.notification_to' => null]);
        $this->submit();
        Queue::assertNothingPushed();
        $this->assertDatabaseHas('contact_messages', [...$this->data(), 'notification_recipient' => null]);
    }

    public function test_email_is_plain_text_and_customer_content_is_not_html(): void
    {
        $mail = new ContactMessageReceived([...$this->data(), 'reference' => 'TH-TEST', 'created_at' => '2026-11-20 10:00:00', 'message' => '<script>untrusted content</script>']);
        $this->assertNull($mail->content()->view);
        $this->assertSame('mail.contact-message', $mail->content()->text);
        $mail->assertSeeInText('<script>untrusted content</script>');
    }
}
