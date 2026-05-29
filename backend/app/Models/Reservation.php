<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Reservation model — one rental contract.
 *
 * The model also exposes a couple of business helpers (`canBeCancelled`,
 * `numberOfDays`) so controllers stay thin and the logic lives next to
 * the data it operates on.
 */
class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'agency_id',
        'start_date',
        'end_date',
        'pickup_time',
        'return_time',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_price' => 'float',
    ];

    /* =====================================================================
     * Relationships
     * =================================================================== */

    /**
     * The client who booked.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The reserved vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * The pick-up agency.
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /* =====================================================================
     * Domain helpers
     * =================================================================== */

    /**
     * Length of the rental, in days. Used to display "X jours" on the
     * confirmation page and to recompute totals.
     */
    public function numberOfDays(): int
    {
        // +1 because the first day counts.
        return (int) $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Business rule: a client can cancel a reservation ONLY while it is
     * still in "pending" state — i.e. before the agency has acted on it.
     *
     * Why so strict?
     *   - "confirmed" means the agency has already blocked the car and may
     *     have refused another customer for the same period;
     *   - "active" means the car is currently being driven;
     *   - "completed" / "cancelled" are terminal — nothing left to do.
     *
     * Staff (gestionnaire / proprietaire) bypass this rule inside the
     * controller — they can cancel at any time on the customer's behalf.
     */
    public function canBeCancelled(): bool
    {
        return $this->status === 'pending';
    }
}
