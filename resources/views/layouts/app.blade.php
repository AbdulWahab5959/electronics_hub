<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $app->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel eCommerce') }}</title>

    <!-- Bootstrap CSS via Vite -->
    @vite(['resources/css/app.css'])
</head>
<body>
    <div class="min-vh-100">
        @include('layouts.navigation')

        <!-- Page Heading -->
        @if (isset($header))
            <header class="bg-white shadow-sm mb-4">
                <div class="container py-3">
                    {{ $header }}
                </div>
            </header>
        @endif

        <!-- Page Content -->
        <main class="container py-4">
            {{ $slot }}
        </main>
    </div>

    <!-- Bootstrap JavaScript via Vite -->
    @vite(['resources/js/app.js'])
</body>
</html>