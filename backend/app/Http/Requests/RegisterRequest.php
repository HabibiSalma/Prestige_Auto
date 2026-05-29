<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Validation rules for POST /api/auth/register.
 *
 * Anyone can register (the endpoint is public), so authorize() returns
 * true. We intentionally do NOT accept a "role" field here — the role
 * is forced to "client" inside the controller.
 */
class RegisterRequest extends FormRequest
{
    /**
     * Always allow the request — the route itself is public.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The validation rules. The password must be confirmed (the front-end
     * sends a second "password_confirmation" field).
     */
    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:2', 'max:120'],
            'email'    => ['required', 'string', 'email', 'max:160', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ];
    }

    /**
     * Custom messages in French so they can be rendered as-is by the UI.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'Un compte existe déjà avec cet email.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ];
    }
}
