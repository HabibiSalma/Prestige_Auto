<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * VehicleImage model — one photo attached to a vehicle.
 *
 * `image_path` may be either:
 *   - a relative path on the public disk (uploads/cars/foo.jpg), OR
 *   - an absolute URL (https://...) when we want to reuse a CDN image.
 *
 * The `url` accessor below normalises both cases so the front-end
 * always receives a ready-to-render src attribute.
 */
class VehicleImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'image_path',
        'is_main',
        'sort_order',
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    /**
     * Always include the computed URL in JSON responses.
     */
    protected $appends = ['url'];

    /**
     * Parent vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Computed image URL — handles both stored uploads and external URLs.
     */
    protected function url(): Attribute
    {
        return Attribute::get(function () {
            $path = $this->image_path;

            if (! $path) {
                return null;
            }

            // Already a full URL — return as-is.
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            // Otherwise treat as a path on the public disk.
            return Storage::disk('public')->url($path);
        });
    }
}
