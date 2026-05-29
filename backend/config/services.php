<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    | Cloudinary — used for persistent media storage in production. When
    | CLOUDINARY_URL is set, uploaded avatars / vehicle photos / documents
    | are pushed to Cloudinary (so they survive Render's ephemeral disk).
    | When it is empty (local dev), uploads fall back to the local public
    | disk automatically. See App\Support\CloudinaryStorage.
    | Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
    */
    'cloudinary' => [
        'url' => env('CLOUDINARY_URL'),
    ],

];
