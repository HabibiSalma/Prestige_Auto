<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * ProfileController — endpoints the authenticated user uses to
 * read/update their OWN profile (any role). Avatar upload lives here
 * too for convenience.
 */
class ProfileController extends Controller
{
    /**
     * PUT /api/profile — auth required.
     */
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());
        return new UserResource($user->fresh('agency'));
    }

    /**
     * POST /api/profile/avatar — auth required.
     *
     * Accepts a single image file. Old avatar (if any) is deleted from
     * disk so we don't accumulate orphans.
     */
    public function uploadAvatar(Request $request): UserResource
    {
        $request->validate([
            'avatar' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return new UserResource($user->fresh('agency'));
    }
}
