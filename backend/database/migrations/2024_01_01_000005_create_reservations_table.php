<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration that creates the `reservations` table.
 *
 * The heart of the business logic. Each row is a rental contract going
 * through a finite-state machine:
 *   pending  -> confirmed  -> active  -> completed
 *                       \-> cancelled (only before pickup)
 */
return new class extends Migration {
    /**
     * Build the reservations table.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // The client who booked.
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Which car was booked.
            $table->foreignId('vehicle_id')
                  ->constrained('vehicles')
                  ->cascadeOnDelete();

            // Pick-up agency (denormalised for fast reporting and so we keep
            // the historical agency even if the vehicle moves to another one).
            $table->foreignId('agency_id')
                  ->constrained('agencies')
                  ->cascadeOnDelete();

            $table->date('start_date');
            $table->date('end_date');
            $table->time('pickup_time')->default('10:00:00');
            $table->time('return_time')->default('18:00:00');

            // Total price computed at booking time = days * price_per_day.
            // Stored to lock-in the price even if the daily rate changes later.
            $table->decimal('total_price', 10, 2);

            $table->enum('status', [
                'pending', 'confirmed', 'active', 'completed', 'cancelled',
            ])->default('pending');

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index used by the availability checker to quickly find any
            // booking overlapping a given vehicle/period.
            $table->index(['vehicle_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Drop the reservations table.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
