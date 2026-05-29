<?php

/**
 * CORS configuration — required so the Vite dev server (http://localhost:5173)
 * can call the Laravel API (http://localhost:8000) during development without
 * the browser blocking the request.
 *
 * The "supports_credentials" flag is true because Sanctum stateful SPA mode
 * relies on cookies; it has no effect when you stay in pure token mode.
 */

return [

    /*
    | Paths the CORS layer covers. Keep them broad so /api and /sanctum/csrf-cookie
    | both work out of the box.
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    /*
    | The list of frontends allowed to call us. Wildcards are NOT allowed
    | when supports_credentials is true, so list each origin explicitly.
    */
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false because we don't ride on session cookies — the auth token is
    // sent in the Authorization header by axios. Keeping it false also lets
    // us widen allowed_origins to '*' later if needed (with true, '*' is forbidden).
    'supports_credentials' => false,
];
