<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `vehicles` table.
 *
 * Each row is one car in the rental fleet. A vehicle ALWAYS belongs
 * to exactly one agency (the pick-up point). The `status` column is
 * what the booking flow consults to know if a car can be rented today.
 */
return new class extends Migration {
    /**
     * Build the vehicles table.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            // Agency that physically holds the vehicle.
            $table->foreignId('agency_id')
                  ->constrained('agencies')
                  ->cascadeOnDelete();

            $table->string('brand');                   // e.g. Porsche
            $table->string('model');                   // e.g. 911 Carrera
            $table->unsignedSmallInteger('year');      // e.g. 2024

            // Functional category — drives the filters on the catalogue page.
            $table->enum('category', [
                'sportive', 'berline', 'suv',
                'compacte', 'luxe', 'electrique', 'monospace',
            ]);

            // Type of fuel — also a catalogue filter.
            $table->enum('fuel_type', [
                'essence', 'diesel', 'hybride', 'electrique',
            ]);

            $table->unsignedTinyInteger('seats')->default(4);
            $table->decimal('price_per_day', 10, 2);

            // Operational status. Only "disponible" cars accept new bookings.
            $table->enum('status', [
                'disponible', 'louee', 'maintenance',
            ])->default('disponible');

            $table->text('description')->nullable();

            // is_premium controls the gold "Premium" badge on the card.
            $table->boolean('is_premium')->default(false);

            // Average rating (0.0 - 5.0) shown as gold stars on the card.
            $table->decimal('rating', 2, 1)->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Composite index that speeds up the catalogue's most common query:
            // "show me available vehicles ordered by price".
            $table->index(['status', 'price_per_day']);
        });
    }

    /**
     * Drop the vehicles table.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
