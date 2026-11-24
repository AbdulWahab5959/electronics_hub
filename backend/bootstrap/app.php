<?php

use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    )

    ->withMiddleware(function ($middleware) {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->map(function (UniqueConstraintViolationException $exception) {
            // Inspect the driver error, not SQL bindings supplied by a user.
            $driverMessage = $exception->errorInfo[2] ?? '';
            $duplicateProduct = str_contains($driverMessage, 'products_unique_brand_model')
                || (str_contains($driverMessage, 'products.identity_brand')
                    && str_contains($driverMessage, 'products.identity_model'));

            return $duplicateProduct
                ? ValidationException::withMessages(['name' => 'This product already exists.'])
                : $exception;
        });
    })->create();
