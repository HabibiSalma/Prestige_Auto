<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Agency model — one physical rental location.
 *
 * Has many vehicles (its fleet), many reservations (the bookings made
 * for cars in this fleet) and many gestionnaires (its managers).
 */
class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city',
        'address',
        'latitude',
        'longitude',
        'phone',
        'email',
        'description',
    ];

    /**
     * Make sure JSON output contains numeric coords, not strings —
     * Leaflet needs real numbers.
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    /* =====================================================================
     * Relationships
     * =================================================================== */

    /**
     * Vehicles parked at this agency.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Reservations linked to this agency (the pick-up point).
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Gestionnaires assigned to manage this agency.
     */
    public function managers(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'gestionnaire');
    }
}
