<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User model — one row per account.
 *
 * Three possible roles: client, gestionnaire, proprietaire.
 * The `HasApiTokens` trait wires the model into Laravel Sanctum so
 * we can issue / revoke bearer tokens used by the React SPA.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Mass-assignable attributes. Anything not listed here cannot be
     * filled via `User::create($request->all())` — this is our safety net
     * against accidentally accepting "role" from a public form.
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'agency_id',
        'city',
        'address',
        'avatar',
        'licence_number',
        'licence_expires_at',
    ];

    /**
     * Hidden when the model is serialised to JSON. Without this, the
     * hashed password would leak in every API response.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casts.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',           // auto bcrypt when assigned
        'licence_expires_at' => 'date',
    ];

    /* =====================================================================
     * Relationships
     * =================================================================== */

    /**
     * Agency this user manages (NULL for clients and proprietaires).
     */
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    /**
     * All reservations made by this user as a client.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Documents (licence, ID, passport) uploaded by the user.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * In-app notifications sent to the user (bell icon).
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderByDesc('created_at');
    }

    /* =====================================================================
     * Role helpers — make controller code read like English.
     * =================================================================== */

    /**
     * True if the user is a regular client account.
     */
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    /**
     * True if the user is an agency manager.
     */
    public function isGestionnaire(): bool
    {
        return $this->role === 'gestionnaire';
    }

    /**
     * True if the user is the platform owner / admin.
     */
    public function isProprietaire(): bool
    {
        return $this->role === 'proprietaire';
    }

    /**
     * Shortcut used by Policies — proprietaire can do anything,
     * gestionnaire can manage their agency, client can only own data.
     */
    public function hasStaffAccess(): bool
    {
        return in_array($this->role, ['gestionnaire', 'proprietaire'], true);
    }

    /**
     * Return the agency_id of the currently authenticated gestionnaire,
     * or abort 403 if the user has no agency assigned.
     *
     * This is the single source of truth used by every staff controller
     * to scope queries: `Vehicle::where('agency_id', User::myAgencyId())`.
     * Calling it from a non-gestionnaire context (no agency_id) returns
     * a 403 — so we never leak data by accident if the calling code
     * forgot to branch on role.
     */
    public static function myAgencyId(): int
    {
        $agencyId = auth()->user()?->agency_id;

        if (! $agencyId) {
            abort(403, 'Aucune agence assignée à ce gestionnaire.');
        }

        return (int) $agencyId;
    }
}
