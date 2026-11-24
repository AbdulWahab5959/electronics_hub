<?php

namespace App\Jobs;

use App\Mail\ContactMessageReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Throwable;

class SendContactNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;
    public int $timeout = 30;

    public function __construct(public int $contactId)
    {
        $this->onConnection('database')->onQueue('contact-notifications');
    }

    public function backoff(): array { return [60, 300, 900, 3600]; }

    public function handle(): void
    {
        // The contact record was committed before this job was dispatched.
        // A row lock prevents concurrent/retried jobs from resending a sent message.
        DB::transaction(function () {
            $contact = DB::table('contact_messages')->where('id', $this->contactId)->lockForUpdate()->first();
            if (!$contact || $contact->notification_sent_at || !$contact->notification_recipient) return;
            if (!app()->runningUnitTests() && config('mail.default') !== 'smtp') {
                throw new RuntimeException('Contact notifications require the configured SMTP mailer.');
            }
            $sent = Mail::to($contact->notification_recipient)->send(new ContactMessageReceived((array) $contact));
            if (!$sent && !app()->runningUnitTests()) throw new RuntimeException('Mail transport did not confirm acceptance.');
            DB::table('contact_messages')->where('id', $contact->id)->update(['notification_sent_at' => now()]);
        });
    }

    public function failed(?Throwable $exception): void
    {
        // Do not put customer message bodies or SMTP credentials in application logs.
        Log::warning('Contact notification exhausted retries; database copy retained.', ['contact_id' => $this->contactId]);
    }
}
