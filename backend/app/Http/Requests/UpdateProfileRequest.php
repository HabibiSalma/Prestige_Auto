<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for PUT /api/profile.
 *
 * Used by clients to update their own personal information.
 * Email is unique but must ignore the current user (otherwise the
 * uniqueness check fails on every save).
 */
class UpdateProfileRequest extends FormRequest
{
    /**
     * Anyone authenticated can update their own profile — Sanctum middleware
     * already guards the route, so we only need to return true here.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name'               => ['sometimes', 'required', 'string', 'min:2', 'max:120'],
            'email'              => ['sometimes', 'required', 'email', "unique:users,email,{$userId}"],
            'phone'              => ['nullable', 'string', 'max:30'],
            'city'               => ['nullable', 'string', 'max:120'],
            'address'            => ['nullable', 'string', 'max:255'],
            'licence_number'     => ['nullable', 'string', 'max:60'],
            'licence_expires_at' => ['nullable', 'date', 'after:today'],
        ];
    }
}
