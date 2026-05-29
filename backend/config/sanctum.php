<?php

use Laravel\Sanctum\Sanctum;

/**
 * Sanctum configuration.
 *
 * We support BOTH modes:
 *   - Token mode (default in our SPA): the React app stores the token
 *     in localStorage and sends it as Authorization: Bearer xxx.
 *   - Stateful SPA mode (cookies): activated whenever a request comes
 *     from one of the `stateful` domains below.
 */
return [

    'stateful' => explode(',', env(
        'SANCTUM_STATEFUL_DOMAINS',
        sprintf(
            '%s%s',
            'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
            Sanctum::currentApplicationUrlWithPort()
        )
    )),

    'guard' => ['web'],

    /*
    | How long a token stays valid (in minutes). Null = never expires.
    | We use null for the student demo so they don't get logged out mid-session.
    */
    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies'      => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token'  => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
