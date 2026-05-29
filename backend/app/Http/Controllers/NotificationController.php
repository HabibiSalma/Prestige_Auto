<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * NotificationController — feeds the bell-icon dropdown in the Navbar.
 *
 * Every user only sees their own notifications (enforced by where
 * user_id = current). No need for role checks here.
 */
class NotificationController extends Controller
{
    /**
     * GET /api/notifications — auth required.
     *
     * Returns up to the 20 most recent notifications + the unread count
     * so the bell can show a red badge.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items  = $user->notifications()->limit(20)->get();
        $unread = $user->notifications()->unread()->count();

        return response()->json([
            'data'   => NotificationResource::collection($items),
            'unread' => $unread,
        ]);
    }

    /**
     * POST /api/notifications/{notification}/read — auth required.
     *
     * Marks one notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update(['read_at' => now()]);

        return response()->json(new NotificationResource($notification));
    }

    /**
     * POST /api/notifications/read-all — auth required.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->unread()->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}
