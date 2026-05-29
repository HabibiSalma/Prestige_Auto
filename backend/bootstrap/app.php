<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

/**
 * Laravel 11 application bootstrap.
 *
 * Replaces the old Kernel.php from earlier Laravel versions. We use it to:
 *   - register the API route file,
 *   - declare our custom "role" middleware alias,
 *   - enable Sanctum's "ensure frontend requests are stateful" middleware
 *     (needed if you ever switch to SPA cookie-mode; harmless in token-mode).
 */
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        api:      __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // NOTE: we DO NOT enable $middleware->statefulApi() here.
        // Our React SPA uses pure Sanctum bearer-token auth (Authorization
        // header), not cookie/session auth. Enabling statefulApi() would
        // make Sanctum try to verify a CSRF token on /api requests coming
        // from localhost:5173 and produce "CSRF token mismatch" errors on
        // /login and /register.

        // Register the "role" alias used in routes/api.php.
        // Example: ->middleware('role:gestionnaire,proprietaire')
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
