<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `documents` table.
 *
 * Stores files uploaded by clients (driving licence, ID card, passport)
 * and a verification flag the gestionnaire can flip after manual review.
 */
return new class extends Migration {
    /**
     * Build the documents table.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->enum('type', ['permis', 'cin', 'passeport']);

            // Relative path on `storage/app/public/documents` returned by
            // Storage::disk('public')->putFile(). The accessor converts
            // it into a downloadable URL.
            $table->string('file_path');

            $table->boolean('verified')->default(false);
            $table->date('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Drop the documents table.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
