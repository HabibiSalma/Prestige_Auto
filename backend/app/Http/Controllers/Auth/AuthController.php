<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * AuthController — handles registration, login and logout.
 *
 * Uses Laravel Sanctum bearer tokens: every successful login/register
 * returns a token string the SPA stores in localStorage and sends back
 * as `Authorization: Bearer <token>` on subsequent requests.
 */
class AuthController extends Controller
{
    /**
     * POST /api/auth/register — public.
     *
     * Creates a new user with role=client (the only role a public visitor
     * can self-assign). Returns the user object + a freshly issued token
     * so the SPA can log the user in immediately.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => $request->password, // hashed automatically by the cast
            'role'     => 'client',           // forced — never trust input
        ]);

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * POST /api/auth/login — public.
     *
     * Validates the credentials, then either issues a Sanctum token
     * (success) or returns 401 (failure). We never leak whether the
     * email exists — same generic message either way.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user->load('agency')),
            'token' => $token,
        ]);
    }

    /**
     * POST /api/auth/logout — requires auth.
     *
     * Revokes only the token used for the current request, so other
     * devices stay logged in.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * GET /api/auth/me — requires auth.
     *
     * Convenience endpoint the SPA hits on boot to refresh the cached
     * user (useful when the token was loaded from localStorage and we
     * want to verify it's still valid).
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('agency'));
    }
}
