<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('welcome'));
Route::get('/contact-us', fn () => view('contact-us'));
// Mail diagnostics must not be exposed as public endpoints.
