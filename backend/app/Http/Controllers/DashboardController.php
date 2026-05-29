<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * DashboardController — analytics endpoint feeding the React dashboard.
 *
 * Gestionnaire -> data scoped to their agency.
 * Proprietaire -> data aggregated over the whole platform.
 */
class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/overview — staff only.
     *
     * Returns the KPI numbers, the last-30-day revenue series for the
     * line chart, and the fleet-utilisation breakdown for the donut chart.
     */
    public function overview(Request $request): JsonResponse
    {
        $user        = $request->user();
        $scopeAgency = $user->isGestionnaire() ? $user->agency_id : null;

        // ---- KPIs ---------------------------------------------------
        $startOfMonth = Carbon::now()->startOfMonth();

        $monthRevenue = Reservation::query()
            ->when($scopeAgency, fn ($q) => $q->where('agency_id', $scopeAgency))
            ->whereIn('status', ['confirmed', 'active', 'completed'])
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total_price');

        $totalReservations = Reservation::query()
            ->when($scopeAgency, fn ($q) => $q->where('agency_id', $scopeAgency))
            ->count();

        $availableVehicles = Vehicle::query()
            ->when($scopeAgency, fn ($q) => $q->where('agency_id', $scopeAgency))
            ->where('status', 'disponible')
            ->count();

        // "Active clients" = distinct users with at least one reservation in scope.
        $activeClients = Reservation::query()
            ->when($scopeAgency, fn ($q) => $q->where('agency_id', $scopeAgency))
            ->distinct('user_id')
            ->count('user_id');

        // ---- Revenue line (last 30 days) ----------------------------
        $from = Carbon::now()->subDays(29)->startOfDay();
        $revenueRows = Reservation::query()
            ->when($scopeAgency, fn ($q) => $q->where('agency_id', $scopeAgency))
            ->whereIn('status', ['confirmed', 'active', 'completed'])
            ->where('created_at', '>=', $from)
            ->get(['total_price', 'created_at'])
            ->groupBy(fn ($r) => $r->created_at->format('Y-m-d'))
            ->map(fn ($group) => round($group->sum('total_price'), 2));

        // Build a full series with zeros for empty days — the chart needs
        // a continuous X axis.
        $series = [];
        for ($i = 0; $i < 30; $i++) {
            $day = $from->copy()->addDays($i)->format('Y-m-d');
            $series[] = [
                'date'    => $day,
                'revenue' => (float) ($revenueRows[$day] ?? 0),
            ];
        }

        // ---- Fleet utilisation donut --------------------------------
        $fleet = Vehicle::query()
            ->when($scopeAgency, fn ($q) => $q->where('agency_id', $scopeAgency))
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $fleetDistribution = [
            'disponible'  => (int) ($fleet['disponible']  ?? 0),
            'louee'       => (int) ($fleet['louee']       ?? 0),
            'maintenance' => (int) ($fleet['maintenance'] ?? 0),
        ];

        return response()->json([
            'kpis' => [
                'month_revenue'      => round($monthRevenue, 2),
                'total_reservations' => $totalReservations,
                'available_vehicles' => $availableVehicles,
                'active_clients'     => $activeClients,
            ],
            'revenue_series'     => $series,
            'fleet_distribution' => $fleetDistribution,
        ]);
    }

    /**
     * GET /api/dashboard/users — proprietaire only.
     *
     * Lightweight user listing for the Users tab in the global dashboard.
     */
    public function users(): JsonResponse
    {
        $users = User::with('agency')->orderBy('name')->get();
        return response()->json([
            'data' => \App\Http\Resources\UserResource::collection($users),
        ]);
    }

    /**
     * PUT /api/dashboard/users/{user}/role — proprietaire only.
     *
     * Changes a user's role. Also handles the gestionnaire->agency
     * mapping: a gestionnaire MUST have an agency_id, others MUST NOT.
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        // required_if makes agency_id mandatory *only* when promoting to
        // gestionnaire — clients and proprietaires don't need one.
        $data = $request->validate([
            'role'      => ['required', 'in:client,gestionnaire,proprietaire'],
            'agency_id' => ['nullable', 'required_if:role,gestionnaire', 'exists:agencies,id'],
        ], [
            'agency_id.required_if' => "Un gestionnaire doit obligatoirement être rattaché à une agence.",
        ]);

        $user->role      = $data['role'];
        // Only gestionnaires keep an agency_id; the column is wiped on
        // role downgrades/upgrades so we never leak a stale link.
        $user->agency_id = $data['role'] === 'gestionnaire' ? $data['agency_id'] : null;
        $user->save();

        return response()->json(new \App\Http\Resources\UserResource($user->load('agency')));
    }

    /**
     * DELETE /api/dashboard/users/{user} — proprietaire only.
     *
     * Soft-deletes a user account. We refuse two cases for safety:
     *   - the owner trying to delete themselves (would lock them out),
     *   - deleting any user that has an "active" reservation in progress
     *     (would orphan a rental contract still on the road).
     *
     * The User model uses the SoftDeletes trait, so the row stays in DB
     * with a deleted_at timestamp — historical reservations and documents
     * keep resolving and nothing breaks in the dashboard reports.
     */
    public function deleteUser(Request $request, User $user): JsonResponse
    {
        // Guard #1 — never let the caller delete themselves.
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        // Guard #2 — block deletion if a reservation is currently active.
        $hasActive = $user->reservations()
            ->whereIn('status', ['active'])
            ->exists();

        if ($hasActive) {
            return response()->json([
                'message' => "Impossible : cet utilisateur a une location en cours.",
            ], 422);
        }

        $user->delete();   // soft delete

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
