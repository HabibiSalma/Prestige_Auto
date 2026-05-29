<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Prestige Auto — API routes
|--------------------------------------------------------------------------
|
| All endpoints are JSON. The SPA authenticates via Sanctum bearer tokens
| (Authorization: Bearer <token>) issued by the AuthController.
|
| Conventions:
|   - Public routes are declared at the top.
|   - Authenticated-only routes are inside the auth:sanctum group.
|   - Staff-only routes use the "role:..." middleware on top of auth.
|
*/

// =============================================================================
// PUBLIC — anybody can hit these
// =============================================================================

// Auth — anyone can sign up or log in
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// Public catalogue — visitors browse cars / agencies before signing up
Route::get('/vehicles',           [VehicleController::class, 'index']);
Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);

Route::get('/agencies',          [AgencyController::class, 'index']);
Route::get('/agencies/{agency}', [AgencyController::class, 'show']);


// =============================================================================
// AUTHENTICATED — any logged-in user (client, gestionnaire, proprietaire)
// =============================================================================
Route::middleware('auth:sanctum')->group(function () {

    // Session helpers
    Route::get('/auth/me',     [AuthController::class, 'me']);     // who am I?
    Route::post('/auth/logout',[AuthController::class, 'logout']); // revoke token

    // Profile (every role can update its own data)
    Route::put ('/profile',        [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // Reservations — listing is scoped per role inside the controller
    Route::get ('/reservations',                          [ReservationController::class, 'index']);
    Route::post('/reservations',                          [ReservationController::class, 'store']);
    Route::get ('/reservations/{reservation}',            [ReservationController::class, 'show']);
    Route::post('/reservations/{reservation}/cancel',     [ReservationController::class, 'cancel']);

    // Documents (client uploads own, staff sees everyone)
    Route::get   ('/documents',              [DocumentController::class, 'index']);
    Route::post  ('/documents',              [DocumentController::class, 'store']);
    Route::delete('/documents/{document}',   [DocumentController::class, 'destroy']);

    // Notifications (bell)
    Route::get ('/notifications',                        [NotificationController::class, 'index']);
    Route::post('/notifications/read-all',               [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{notification}/read',    [NotificationController::class, 'markAsRead']);


    // ==========================================================================
    // STAFF ONLY — gestionnaire or proprietaire
    // ==========================================================================
    Route::middleware('role:gestionnaire,proprietaire')->group(function () {

        // Fleet management (vehicles)
        Route::post  ('/vehicles',                       [VehicleController::class, 'store']);
        Route::put   ('/vehicles/{vehicle}',             [VehicleController::class, 'update']);
        Route::delete('/vehicles/{vehicle}',             [VehicleController::class, 'destroy']);

        // Vehicle photos — upload, promote to main, delete a single image
        Route::post  ('/vehicles/{vehicle}/images',                    [VehicleController::class, 'uploadImages']);
        Route::post  ('/vehicles/{vehicle}/images/{image}/main',       [VehicleController::class, 'setMainImage']);
        Route::delete('/vehicles/{vehicle}/images/{image}',            [VehicleController::class, 'deleteImage']);

        // Reservation workflow
        Route::post('/reservations/{reservation}/approve', [ReservationController::class, 'approve']);
        Route::post('/reservations/{reservation}/reject',  [ReservationController::class, 'reject']);

        // Document verification
        Route::post('/documents/{document}/verify', [DocumentController::class, 'verify']);

        // Analytics dashboard (auto-scoped per role inside the controller)
        Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

        // Staff fleet listing — same shape as the public /api/vehicles but
        // shows ALL statuses (incl. maintenance) and is auto-scoped to the
        // gestionnaire's agency. Proprietaire sees the entire platform.
        Route::get('/dashboard/vehicles', [VehicleController::class, 'dashboardIndex']);
    });


    // ==========================================================================
    // PROPRIETAIRE ONLY — full platform admin
    // ==========================================================================
    Route::middleware('role:proprietaire')->group(function () {

        // Agency CRUD
        Route::post  ('/agencies',          [AgencyController::class, 'store']);
        Route::put   ('/agencies/{agency}', [AgencyController::class, 'update']);
        Route::delete('/agencies/{agency}', [AgencyController::class, 'destroy']);

        // User & role management
        Route::get   ('/dashboard/users',             [DashboardController::class, 'users']);
        Route::put   ('/dashboard/users/{user}/role', [DashboardController::class, 'updateUserRole']);
        Route::delete('/dashboard/users/{user}',      [DashboardController::class, 'deleteUser']);
    });
});
