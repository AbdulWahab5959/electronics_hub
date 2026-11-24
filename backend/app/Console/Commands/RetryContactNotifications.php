<?php

namespace App\Console\Commands;

use App\Jobs\SendContactNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RetryContactNotifications extends Command
{
    protected $signature = 'contact:retry-notifications {--reference= : Retry one message by reference} {--limit=50}';
    protected $description = 'Requeue unsent Contact notifications; sent messages and legacy messages are excluded';

    public function handle(): int
    {
        $query = DB::table('contact_messages')->whereNotNull('notification_recipient')->whereNull('notification_sent_at');
        if ($reference = $this->option('reference')) $query->where('reference', $reference);
        else $query->where(fn ($q) => $q->whereNull('notification_queued_at')->orWhere('notification_queued_at', '<=', now()->subHours(2)));
        $contacts = $query->orderBy('id')->limit(max(1, min(500, (int) $this->option('limit'))))->get();
        foreach ($contacts as $contact) {
            SendContactNotification::dispatch($contact->id);
            DB::table('contact_messages')->where('id', $contact->id)->update(['notification_queued_at' => now()]);
        }
        $this->info($contacts->count().' notification(s) queued.');
        return self::SUCCESS;
    }
}
