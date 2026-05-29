<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `agencies` table.
 *
 * An agency is a physical Prestige Auto location (e.g. "Prestige Casa Marina").
 * Each agency owns its own fleet of vehicles and is managed by one or more
 * gestionnaires. We store latitude/longitude so the front-end can render
 * agency markers on a Leaflet map.
 *
 * Created first because both users (gestionnaire.agency_id) and vehicles
 * reference this table via foreign keys.
 */
return new class extends Migration {
    /**
     * Build the agencies table.
     */
    public function up(): void
    {
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('city');
            $table->string('address');

            // GPS coordinates used by the Leaflet.js map on the Agencies page.
            // Decimal(10,7) is precise enough for street-level pin placement.
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Drop the agencies table.
     */
    public function down(): void
    {
        Schema::dropIfExists('agencies');
    }
};
