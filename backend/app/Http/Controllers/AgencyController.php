<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgencyRequest;
use App\Http\Resources\AgencyResource;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * AgencyController — list + CRUD for agencies.
 *
 * The "index" endpoint is public so the catalogue filters and the
 * Leaflet map can both consume it without authentication. The
 * mutating endpoints are limited to the proprietaire role.
 */
class AgencyController extends Controller
{
    /**
     * GET /api/agencies — public.
     *
     * Returns all agencies + their vehicle count, ready to be rendered
     * on the map page and inside the booking-step agency picker.
     */
    public function index(): AnonymousResourceCollection
    {
        $agencies = Agency::withCount('vehicles')->orderBy('name')->get();
        return AgencyResource::collection($agencies);
    }

    /**
     * GET /api/agencies/{agency} — public.
     */
    public function show(Agency $agency): AgencyResource
    {
        return new AgencyResource($agency->loadCount('vehicles'));
    }

    /**
     * POST /api/agencies — proprietaire only.
     */
    public function store(StoreAgencyRequest $request): AgencyResource
    {
        $agency = Agency::create($request->validated());
        return new AgencyResource($agency);
    }

    /**
     * PUT /api/agencies/{agency} — proprietaire only.
     */
    public function update(StoreAgencyRequest $request, Agency $agency): AgencyResource
    {
        $agency->update($request->validated());
        return new AgencyResource($agency);
    }

    /**
     * DELETE /api/agencies/{agency} — proprietaire only.
     */
    public function destroy(Agency $agency): JsonResponse
    {
        $agency->delete();
        return response()->json(['message' => 'Agence supprimée.']);
    }
}
