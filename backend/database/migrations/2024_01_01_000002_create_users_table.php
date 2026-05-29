<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `users` table.
 *
 * This table stores every person who can log into the platform.
 * The `role` column is what allows the same table to hold three
 * very different kinds of accounts: a regular client, an agency
 * manager (gestionnaire) and the platform owner (proprietaire).
 */
return new class extends Migration {
    /**
     * Build the users table with all the fields needed by the app
     * (profile info, login credentials, role, etc.).
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Role drives every authorization decision in the API.
            // "client" is the default; gestionnaire and proprietaire are
            // privileged accounts created either by seeders or by the owner.
            $table->enum('role', ['client', 'gestionnaire', 'proprietaire'])
                  ->default('client');

            // A gestionnaire is always attached to ONE agency.
            // Clients and proprietaires leave this column NULL.
            $table->foreignId('agency_id')
                  ->nullable()
                  ->constrained('agencies')
                  ->nullOnDelete();

            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('avatar')->nullable();

            // Driving licence info kept directly on the user record so it
            // can be displayed and edited from the profile page.
            $table->string('licence_number')->nullable();
            $table->date('licence_expires_at')->nullable();

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Drop the table when rolling back.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
