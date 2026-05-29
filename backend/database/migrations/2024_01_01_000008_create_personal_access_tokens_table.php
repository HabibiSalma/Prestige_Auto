<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `personal_access_tokens` table required
 * by Laravel Sanctum to store API tokens.
 *
 * Sanctum publishes its own version of this migration when you run
 * `php artisan vendor:publish --provider="Laravel\Sanctum\..."`, but
 * shipping it ourselves lets `php artisan migrate` work out of the box.
 */
return new class extends Migration {
    /**
     * Build the personal_access_tokens table.
     */
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');         // tokenable_type + tokenable_id
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Drop the personal_access_tokens table.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
