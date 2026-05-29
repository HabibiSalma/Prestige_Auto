<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

/**
 * VehicleController — public catalogue + staff-only CRUD.
 *
 * Public endpoints (index, show) are accessible without authentication
 * so visitors can browse before signing up. The mutating endpoints
 * (store, update, destroy) are protected by the `role:gestionnaire,proprietaire`
 * middleware defined in routes/api.php.
 */
class VehicleController extends Controller
{
    /**
     * GET /api/vehicles — public.
     *
     * Returns the catalogue with optional filters & sorting. The query
     * parameters mirror what the FilterSidebar component sends.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Vehicle::query()
            ->with(['agency', 'images'])
            ->where('status', '!=', 'maintenance');   // hide cars in repair

        // -- Filters ----------------------------------------------------
        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('brand', 'like', "%{$term}%")
                  ->orWhere('model', 'like', "%{$term}%");
            });
        }

        foreach (['category', 'fuel_type', 'agency_id'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->input($field));
            }
        }

        if ($request->filled('seats')) {
            $query->where('seats', '>=', (int) $request->input('seats'));
        }

        if ($request->filled('max_price')) {
            $query->where('price_per_day', '<=', (float) $request->input('max_price'));
        }

        // -- Sorting ----------------------------------------------------
        switch ($request->input('sort', 'recommended')) {
            case 'price_asc':
                $query->orderBy('price_per_day', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_per_day', 'desc');
                break;
            case 'rating':
                $query->orderByDesc('rating');
                break;
            default:
                // "recommended" = premium first, then by rating
                $query->orderByDesc('is_premium')->orderByDesc('rating');
        }

        // Paginate. Front-end can pass ?per_page=12 if it wants smaller pages.
        $perPage = min((int) $request->input('per_page', 12), 50);

        return VehicleResource::collection($query->paginate($perPage));
    }

    /**
     * GET /api/dashboard/vehicles — staff only.
     *
     * Same shape as the public index() but with two important differences:
     *   1. Returns ALL statuses (incl. `maintenance`) — managers need to see
     *      and act on broken cars, which the catalogue hides.
     *   2. Gestionnaires are FORCE-SCOPED to their assigned agency. Any
     *      ?agency_id sent by them is ignored. Proprietaires can optionally
     *      filter by agency_id from the UI.
     */
    public function dashboardIndex(Request $request): AnonymousResourceCollection
    {
        $user  = $request->user();
        $query = Vehicle::query()->with(['agency', 'images'])->latest();

        if ($user->isGestionnaire()) {
            // Hard scope — never lets a gestionnaire see other agencies' fleet.
            $query->where('agency_id', User::myAgencyId());
        } elseif ($request->filled('agency_id')) {
            // Proprietaire: optional UI filter (no security implication, they
            // have global access anyway).
            $query->where('agency_id', $request->input('agency_id'));
        }

        $perPage = min((int) $request->input('per_page', 50), 100);

        return VehicleResource::collection($query->paginate($perPage));
    }

    /**
     * GET /api/vehicles/{vehicle} — public.
     *
     * Returns one vehicle with its agency, gallery and the array of
     * already-booked dates the booking calendar needs.
     */
    public function show(Vehicle $vehicle): VehicleResource
    {
        $vehicle->load(['agency', 'images']);

        // Attach the booked-dates array dynamically — the Resource exposes
        // it via $this->when(isset($this->booked_dates), ...).
        $vehicle->booked_dates = $vehicle->bookedDates();

        return new VehicleResource($vehicle);
    }

    /**
     * POST /api/vehicles — staff only (gestionnaire / proprietaire).
     *
     * Creates a new vehicle and optionally uploads its photos. The first
     * uploaded image is marked as main, so the catalogue card has
     * something to show right away.
     */
    public function store(StoreVehicleRequest $request): VehicleResource
    {
        $vehicle = Vehicle::create($request->validated());

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('vehicles', 'public');
                VehicleImage::create([
                    'vehicle_id' => $vehicle->id,
                    'image_path' => $path,
                    'is_main'    => $i === 0,
                    'sort_order' => $i,
                ]);
            }
        }

        return new VehicleResource($vehicle->load(['agency', 'images']));
    }

    /**
     * PUT /api/vehicles/{vehicle} — staff only.
     *
     * Partial update — any subset of fields is accepted thanks to the
     * `sometimes` rule on every attribute in UpdateVehicleRequest. A
     * gestionnaire can only touch vehicles of their own agency.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): VehicleResource
    {
        $this->assertCanManage($vehicle);

        $vehicle->update($request->validated());

        return new VehicleResource($vehicle->load(['agency', 'images']));
    }

    /**
     * DELETE /api/vehicles/{vehicle} — staff only.
     *
     * Soft delete so reservations linked to this vehicle still resolve.
     */
    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $this->assertCanManage($vehicle);

        $vehicle->delete();

        return response()->json(['message' => 'Véhicule supprimé.']);
    }

    /**
     * POST /api/vehicles/{vehicle}/images — staff only.
     *
     * Upload one or several photos for an existing vehicle. Each file is
     * stored on the "public" disk (under /storage/vehicles/...) and a row
     * is inserted into vehicle_images. If the vehicle had no image yet,
     * the first uploaded one is automatically flagged as main.
     *
     * Response: the refreshed vehicle (with images) so the front-end can
     * just swap its local state without re-fetching the catalogue.
     */
    public function uploadImages(Request $request, Vehicle $vehicle): VehicleResource
    {
        $this->assertCanManage($vehicle);

        $request->validate([
            'images'   => ['required', 'array'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $existing = $vehicle->images()->count();

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('vehicles', 'public');
            VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'image_path' => $path,
                'is_main'    => $existing === 0 && $i === 0,
                'sort_order' => $existing + $i,
            ]);
        }

        return new VehicleResource($vehicle->fresh(['agency', 'images']));
    }

    /**
     * POST /api/vehicles/{vehicle}/images/{image}/main — staff only.
     *
     * Promote one image to "main" status. We unset is_main on every other
     * image of the same vehicle so only one row is ever flagged.
     */
    public function setMainImage(Vehicle $vehicle, VehicleImage $image): VehicleResource
    {
        $this->assertCanManage($vehicle);

        // Safety: make sure the image actually belongs to this vehicle —
        // otherwise a malicious caller could promote someone else's photo.
        abort_unless($image->vehicle_id === $vehicle->id, 404);

        $vehicle->images()->update(['is_main' => false]);
        $image->update(['is_main' => true]);

        return new VehicleResource($vehicle->fresh(['agency', 'images']));
    }

    /**
     * DELETE /api/vehicles/{vehicle}/images/{image} — staff only.
     *
     * Removes one photo: deletes the file from disk (if it's a local
     * upload) and the DB row. If we just deleted the main image, the
     * next remaining image is promoted to main so the catalogue card
     * is never left blank.
     */
    public function deleteImage(Vehicle $vehicle, VehicleImage $image): VehicleResource
    {
        $this->assertCanManage($vehicle);

        abort_unless($image->vehicle_id === $vehicle->id, 404);

        $wasMain = $image->is_main;
        $path    = $image->image_path;

        // Only attempt to delete the physical file if it's a local path
        // (the seeder uses absolute URLs to placeholder images).
        if ($path && ! str_starts_with($path, 'http')
            && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        // Re-elect a main image if the deleted one was the main.
        if ($wasMain) {
            $next = $vehicle->images()->orderBy('sort_order')->first();
            $next?->update(['is_main' => true]);
        }

        return new VehicleResource($vehicle->fresh(['agency', 'images']));
    }

    /* =====================================================================
     * Internal guard
     * =================================================================== */

    /**
     * Abort with 403 if the authenticated user is a gestionnaire trying to
     * act on a vehicle that does not belong to their agency. Proprietaires
     * always pass through (full platform access).
     *
     * Called from update(), destroy(), uploadImages(), setMainImage() and
     * deleteImage() — every endpoint that MUTATES a vehicle row.
     */
    private function assertCanManage(Vehicle $vehicle): void
    {
        $user = auth()->user();

        if ($user && $user->isGestionnaire()
            && $vehicle->agency_id !== $user->agency_id) {
            abort(403, "Ce véhicule appartient à une autre agence.");
        }
    }
}
