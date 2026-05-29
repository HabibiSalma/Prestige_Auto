<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Notification model — single line of communication displayed
 * inside the bell-icon dropdown in the Navbar.
 *
 * Created automatically by the ReservationController (and any future
 * observer) when something notable happens to the user: their booking
 * has been approved, rejected, pickup is tomorrow, etc.
 */
class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Recipient.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Local query scope to filter unread rows easily:
     * Notification::unread()->count()
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
