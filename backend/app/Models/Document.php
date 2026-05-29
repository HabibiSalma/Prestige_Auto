<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Document model — a piece of identity proof uploaded by a client.
 *
 * `file_path` is a relative path on the public disk. The accessor
 * exposes a ready-to-use URL so the front-end can show / download the file.
 */
class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'verified',
        'expires_at',
    ];

    protected $casts = [
        'verified' => 'boolean',
        'expires_at' => 'date',
    ];

    protected $appends = ['url'];

    /**
     * Owner of the document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Public URL pointing at the stored file.
     */
    protected function url(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->file_path) {
                return null;
            }
            if (str_starts_with($this->file_path, 'http')) {
                return $this->file_path;
            }
            return Storage::disk('public')->url($this->file_path);
        });
    }
}
