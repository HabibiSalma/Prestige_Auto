<?php

namespace App\Models;

use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Vehicle model — one car in the rental fleet.
 *
 * Belongs to one agency, has many photos and many reservations.
 * Exposes a helper to compute the list of days already booked,
 * which the front-end uses to grey-out dates in the calendar.
 */
class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agency_id',
        'brand',
        'model',
        'year',
        'category',
        'fuel_type',
        'seats',
        'price_per_day',
        'status',
        'description',
        'is_premium',
        'rating',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'price_per_day' => 'float',
        'rating' => 'float',
        'year' => 'integer',
        'seats' => 'integer',
    ];

    /* =====================================================================
     * Relationships
     * =================================================================== */

    /**
     * Agency that owns the vehicle.
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * All photos attached to the vehicle, main first.
     */
    public function images(): HasMany
    {
        return $this->hasMany(VehicleImage::class)->orderByDesc('is_main')->orderBy('sort_order');
    }

    /**
     * All reservations (past, current, future) for this vehicle.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /* =====================================================================
     * Domain helpers
     * =================================================================== */

    /**
     * Return an array of "YYYY-MM-DD" strings for every day already
     * locked by a non-cancelled reservation. Consumed by the date-picker
     * on the booking page to disable those dates.
     */
    public function bookedDates(): array
    {
        $dates = [];

        $bookings = $this->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'active'])
            ->get(['start_date', 'end_date']);

        foreach ($bookings as $reservation) {
            $period = CarbonPeriod::create($reservation->start_date, $reservation->end_date);
            foreach ($period as $day) {
                $dates[] = $day->format('Y-m-d');
            }
        }

        return array_values(array_unique($dates));
    }

    /**
     * Check if a [start, end] period is free for this vehicle. We refuse
     * a booking if ANY overlapping non-cancelled reservation exists.
     */
    public function isAvailableBetween(string $start, string $end): bool
    {
        return ! $this->reservations()
            ->whereIn('status', ['pending', 'confirmed', 'active'])
            ->where(function ($query) use ($start, $end) {
                // Classic overlap test: existing.start <= new.end
                //                       AND existing.end   >= new.start
                $query->where('start_date', '<=', $end)
                      ->where('end_date',   '>=', $start);
            })
            ->exists();
    }
}
