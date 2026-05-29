<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `notifications` table.
 *
 * Simple in-app notification system. We render the unread ones in the
 * bell icon in the Navbar. `read_at` doubles as a "is read" flag (NULL
 * means unread).
 *
 * NOTE: we don't use Laravel's built-in notifications table because we
 * want a simple, predictable shape (title + message + type).
 */
return new class extends Migration {
    /**
     * Build the notifications table.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'success', 'warning'])->default('info');

            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Drop the notifications table.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
