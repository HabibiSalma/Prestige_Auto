<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * ReservationController — booking workflow + status transitions.
 *
 * Endpoints behave differently depending on the caller's role:
 *  - clients see / cancel only their own bookings,
 *  - gestionnaires see bookings of their agency and can approve/reject,
 *  - proprietaires see and act on every booking.
 */
class ReservationController extends Controller
{
    /**
     * GET /api/reservations — auth required.
     *
     * Scope automatically applied:
     *  client       -> only user_id = me
     *  gestionnaire -> only reservations attached to my agency
     *  proprietaire -> everything
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Reservation::query()
            ->with(['user', 'vehicle.images', 'vehicle.agency', 'agency'])
            ->latest();

        // ?mine=1 means "show only the bookings I made personally as a
        // customer". This overrides role-based scoping so the "Mes
        // réservations" page works the same for clients, gestionnaires
        // and the proprietaire — they all see only their OWN rentals.
        if ($request->boolean('mine')) {
            $query->where('user_id', $user->id);
        } elseif ($user->isClient()) {
            // Safety net: even without ?mine=1 a client can never see
            // anyone else's bookings.
            $query->where('user_id', $user->id);
        } elseif ($user->isGestionnaire()) {
            // Dashboard view: gestionnaire sees their agency's bookings.
            $query->where('agency_id', $user->agency_id);
        }
        // proprietaire (without ?mine=1): no scoping — global dashboard view.

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return ReservationResource::collection($query->paginate(20));
    }

    /**
     * POST /api/reservations — auth required.
     *
     * Books a vehicle for the authenticated client. Validates that:
     *   1. the period is free (no overlapping confirmed/pending booking),
     *   2. the vehicle is not in maintenance.
     * Computes the total price server-side so the client can't tamper with it.
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($request->vehicle_id);

        if ($vehicle->status === 'maintenance') {
            return response()->json([
                'message' => 'Ce véhicule n\'est pas disponible à la location.',
            ], 422);
        }

        if (! $vehicle->isAvailableBetween($request->start_date, $request->end_date)) {
            return response()->json([
                'message' => 'Le véhicule est déjà réservé sur cette période.',
            ], 422);
        }

        // Recompute days & price on the server — never trust the client.
        $days  = Carbon::parse($request->start_date)
                        ->diffInDays(Carbon::parse($request->end_date)) + 1;
        $total = $days * $vehicle->price_per_day;

        $reservation = Reservation::create([
            'user_id'     => $request->user()->id,
            'vehicle_id'  => $vehicle->id,
            'agency_id'   => $request->agency_id,
            'start_date'  => $request->start_date,
            'end_date'    => $request->end_date,
            'pickup_time' => $request->pickup_time ?? '10:00',
            'return_time' => $request->return_time ?? '18:00',
            'total_price' => $total,
            'status'      => 'pending',
            'notes'       => $request->notes,
        ]);

        // Notify the client that their request was registered.
        Notification::create([
            'user_id' => $request->user()->id,
            'title'   => 'Réservation enregistrée',
            'message' => "Votre demande de réservation #{$reservation->id} a été enregistrée et est en attente de validation.",
            'type'    => 'info',
        ]);

        return response()->json(
            new ReservationResource($reservation->load(['vehicle.images', 'agency'])),
            201
        );
    }

    /**
     * GET /api/reservations/{reservation} — auth + ownership/role check.
     */
    public function show(Request $request, Reservation $reservation): ReservationResource
    {
        $this->authorizeAccess($request, $reservation);
        return new ReservationResource($reservation->load(['user', 'vehicle.images', 'vehicle.agency', 'agency']));
    }

    /**
     * POST /api/reservations/{reservation}/cancel — clients (and staff).
     *
     * A client may cancel their own booking only if `canBeCancelled()` is
     * true. Staff (gestionnaire of the agency or proprietaire) can cancel
     * at any time.
     */
    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        $isOwner       = $reservation->user_id === $user->id;
        $isAgencyStaff = $user->isGestionnaire() && $user->agency_id === $reservation->agency_id;

        if (! $isOwner && ! $isAgencyStaff && ! $user->isProprietaire()) {
            abort(403, 'Action non autorisée.');
        }

        // Clients can only cancel a reservation while it is still pending.
        // Staff (agency gestionnaire or proprietaire) bypass this rule
        // and may cancel on the customer's behalf at any moment.
        if ($isOwner && ! $isAgencyStaff && ! $user->isProprietaire()
            && ! $reservation->canBeCancelled()) {
            abort(422, "Seules les réservations en attente peuvent être annulées.");
        }

        $reservation->update(['status' => 'cancelled']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Réservation annulée',
            'message' => "La réservation #{$reservation->id} a été annulée.",
            'type'    => 'warning',
        ]);

        return response()->json(new ReservationResource($reservation->fresh()));
    }

    /**
     * POST /api/reservations/{reservation}/approve — staff only.
     *
     * Moves a pending booking to "confirmed" and notifies the client.
     */
    public function approve(Request $request, Reservation $reservation): JsonResponse
    {
        $this->authorizeStaff($request, $reservation);

        $reservation->update(['status' => 'confirmed']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Réservation confirmée',
            'message' => "Votre réservation #{$reservation->id} a été confirmée. À très vite !",
            'type'    => 'success',
        ]);

        return response()->json(new ReservationResource($reservation->fresh()->load(['vehicle.images'])));
    }

    /**
     * POST /api/reservations/{reservation}/reject — staff only.
     */
    public function reject(Request $request, Reservation $reservation): JsonResponse
    {
        $this->authorizeStaff($request, $reservation);

        $reservation->update(['status' => 'cancelled']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Réservation rejetée',
            'message' => "Votre réservation #{$reservation->id} a été rejetée par l'agence.",
            'type'    => 'warning',
        ]);

        return response()->json(new ReservationResource($reservation->fresh()));
    }

    /* =====================================================================
     * Internal guards
     * =================================================================== */

    /**
     * Owner OR staff of the right scope can see a reservation.
     */
    private function authorizeAccess(Request $request, Reservation $reservation): void
    {
        $user = $request->user();
        $allowed = $reservation->user_id === $user->id
            || $user->isProprietaire()
            || ($user->isGestionnaire() && $reservation->agency_id === $user->agency_id);

        abort_unless($allowed, 403, 'Action non autorisée.');
    }

    /**
     * Only the agency's gestionnaire or the proprietaire can approve/reject.
     */
    private function authorizeStaff(Request $request, Reservation $reservation): void
    {
        $user = $request->user();
        $allowed = $user->isProprietaire()
            || ($user->isGestionnaire() && $reservation->agency_id === $user->agency_id);

        abort_unless($allowed, 403, 'Action réservée au personnel.');
    }
}
