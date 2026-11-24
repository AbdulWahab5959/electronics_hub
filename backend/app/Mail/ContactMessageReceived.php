<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Carbon;

class ContactMessageReceived extends Mailable
{
    public function __construct(public array $contact) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            // Keep the authenticated store sender; replies go to the customer.
            replyTo: [new Address($this->contact['email'], str_replace(["\r", "\n"], ' ', $this->contact['name']))],
            subject: 'New TechHub contact message ['.$this->contact['reference'].']',
        );
    }

    public function content(): Content
    {
        return new Content(text: 'mail.contact-message', with: [
            'contact' => $this->contact,
            'receivedAt' => Carbon::parse($this->contact['created_at'])->timezone('Asia/Karachi')->format('d M Y, g:i A').' PKT',
        ]);
    }
}
