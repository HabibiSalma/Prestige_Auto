<?php

namespace App\Support;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Transparent upload helper that routes file storage to Cloudinary in
 * production and falls back to Laravel's local "public" disk in local dev.
 *
 * Activation is purely env-driven: when CLOUDINARY_URL is set, the file is
 * pushed to Cloudinary and its permanent secure URL is returned. Otherwise
 * the file is stored on the public disk and a relative path is returned —
 * exactly the legacy behaviour, so nothing changes locally.
 *
 * The returned value is what gets persisted in the DB column
 * (avatar / image_path / file_path). The model URL accessors and
 * UserResource already pass through any value starting with "http", so a
 * Cloudinary URL renders directly with no extra mapping. This is also why
 * the seeder's external Unsplash URLs keep working unchanged.
 */
class CloudinaryStorage
{
    /** Is remote (Cloudinary) storage configured? */
    public static function enabled(): bool
    {
        return ! empty(config('services.cloudinary.url'));
    }

    /**
     * Store an uploaded file and return the value to persist in the DB.
     *
     * @param  string  $dir  logical folder: avatars | vehicles | documents
     * @return string        Cloudinary secure URL, or a local relative path
     */
    public static function store(UploadedFile $file, string $dir): string
    {
        if (! self::enabled()) {
            // Local dev / no Cloudinary: original behaviour.
            return $file->store($dir, 'public');
        }

        $result = self::client()->uploadApi()->upload($file->getRealPath(), [
            'folder'        => 'prestige-auto/'.$dir,
            // "auto" lets the same call handle images AND document files (pdf, etc.)
            'resource_type' => 'auto',
        ]);

        return (string) $result['secure_url'];
    }

    /**
     * Best-effort deletion of a previously stored value.
     *
     * - Local relative paths are removed from the public disk.
     * - Cloudinary URLs are destroyed via their derived public_id.
     * - External URLs we don't own (e.g. seeded Unsplash links) are ignored.
     *
     * Never throws: media cleanup must not break the surrounding request.
     */
    public static function delete(?string $value): void
    {
        if (! $value) {
            return;
        }

        // Local path on the public disk.
        if (! str_starts_with($value, 'http')) {
            if (Storage::disk('public')->exists($value)) {
                Storage::disk('public')->delete($value);
            }
            return;
        }

        // A full URL. Only attempt a remote destroy if it's our Cloudinary.
        if (! self::enabled() || ! str_contains($value, 'res.cloudinary.com')) {
            return;
        }

        $publicId = self::publicIdFromUrl($value);
        if (! $publicId) {
            return;
        }

        foreach (['image', 'raw', 'video'] as $type) {
            try {
                self::client()->uploadApi()->destroy($publicId, [
                    'resource_type' => $type,
                    'invalidate'    => true,
                ]);
            } catch (\Throwable $e) {
                // Orphaned remote file is acceptable; keep the request alive.
            }
        }
    }

    private static function client(): Cloudinary
    {
        return new Cloudinary(config('services.cloudinary.url'));
    }

    /**
     * Extract the Cloudinary public_id (incl. folder, excl. extension) from
     * a secure URL such as:
     *   https://res.cloudinary.com/<cloud>/image/upload/v123/prestige-auto/avatars/abc.jpg
     */
    private static function publicIdFromUrl(string $url): ?string
    {
        if (! preg_match('#/upload/(?:v\d+/)?(.+)$#', $url, $m)) {
            return null;
        }

        // Strip the file extension, keep the folder path.
        return preg_replace('/\.[^.\/]+$/', '', $m[1]);
    }
}
