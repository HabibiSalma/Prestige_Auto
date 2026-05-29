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
    | The list of frontends allowed to call us. In production set FRONTEND_URL
    | to the deployed Vercel domain (e.g. https://prestige-auto.vercel.app);
    | the two localhost entries keep the Vite dev server working.
    */
    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ])),

    /*
    | Also allow Vercel preview deployments (the auto-generated
    | *.vercel.app URLs for each branch/PR) to call the API without a
    | re-deploy. Safe here because we use bearer tokens, not cookies.
    */
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false because we don't ride on session cookies — the auth token is
    // sent in the Authorization header by axios. Keeping it false also lets
    // us widen allowed_origins to '*' later if needed (with true, '*' is forbidden).
    'supports_credentials' => false,
];
