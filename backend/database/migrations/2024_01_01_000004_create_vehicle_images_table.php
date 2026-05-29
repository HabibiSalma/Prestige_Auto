<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `vehicle_images` table.
 *
 * A vehicle can have many photos. Exactly one of them is flagged as
 * `is_main` and is the picture shown on the catalogue cards. The others
 * appear as thumbnails on the vehicle-detail page.
 */
return new class extends Migration {
    /**
     * Build the vehicle_images table.
     */
    public function up(): void
    {
        Schema::create('vehicle_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                  ->constrained('vehicles')
                  ->cascadeOnDelete();

            // Either a relative path on disk (uploads/...) or a full URL
            // for placeholder/static images. The accessor in the model
            // turns it into a public URL the SPA can render.
            $table->string('image_path');

            $table->boolean('is_main')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Drop the vehicle_images table.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_images');
    }
};
