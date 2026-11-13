<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('login', fn (Request $r) => [
            Limit::perMinute(30)->by('ip:'.$r->ip()),
            Limit::perMinute(5)->by('login:'.strtolower((string) $r->input('email')).'|'.$r->ip()),
        ]);
        RateLimiter::for('registration', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));
        RateLimiter::for('recovery', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));
        RateLimiter::for('verification', fn (Request $r) => Limit::perMinute(1)->by((string) $r->user()->id));
    }
}
