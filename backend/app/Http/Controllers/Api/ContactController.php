<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendContactNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email:rfc|max:254',
            'subject' => 'required|string|max:160',
            'message' => 'required|string|min:10|max:5000',
            'website' => 'prohibited',
        ]);
        $reference = 'TH-'.Str::upper(Str::random(10));
        $recipient = config('contact.notification_to');
        $recipient = is_string($recipient) && filter_var($recipient, FILTER_VALIDATE_EMAIL) ? $recipient : null;
        $contactId = DB::table('contact_messages')->insertGetId([
            'reference' => $reference,
            'name' => $data['name'], 'email' => $data['email'],
            'subject' => $data['subject'], 'message' => $data['message'],
            'created_at' => now(), 'updated_at' => now(),
            'notification_recipient' => $recipient,
        ]);

        if ($recipient) {
            try {
                SendContactNotification::dispatch($contactId);
                DB::table('contact_messages')->where('id', $contactId)->update(['notification_queued_at' => now()]);
            } catch (\Throwable $exception) {
                // Message receipt succeeds even if the queue is temporarily unavailable.
                Log::warning('Contact notification could not be queued; database copy retained.', ['contact_id' => $contactId]);
            }
        }

        return response()->json(['message' => 'Your message has been received.', 'reference' => $reference], 201);
    }
}
