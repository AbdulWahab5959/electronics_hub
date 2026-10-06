<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/contact-us', function () {
    return view('contact-us');
});

// TEMPORARY TEST ROUTE - Remove after testing
Route::get('/test-mail', function () {
    try {
        Mail::raw('Test email from TechHub at ' . now(), function ($message) {
            $message->to('usmanhassan16903@gmail.com')
                    ->subject('SMTP Test - TechHub');
        });
        return '✅ Email sent! Check your Gmail inbox (and spam folder).';
    } catch (Exception $e) {
        return '❌ Error: ' . $e->getMessage();
    }
});