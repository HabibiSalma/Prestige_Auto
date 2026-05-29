<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RoleMiddleware — restrict a route to one or more roles.
 *
 * Registered as the "role" alias inside bootstrap/app.php.
 *
 * Usage in routes/api.php:
 *   Route::middleware('role:gestionnaire,proprietaire')->group(function () { ... });
 *
 * Returns 401 if the user is not logged in, 403 if their role is not
 * in the allowed list.
 */
class RoleMiddleware
{
    /**
     * Pass the request through if the authenticated user has one of the
     * allowed roles, otherwise abort with the proper HTTP code.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Authentification requise.'], 401);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return $next($request);
    }
}
