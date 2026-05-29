<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for POST /api/agencies — only the proprietaire can
 * create or edit agencies.
 */
class StoreAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isProprietaire() ?? false;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:120'],
            'city'        => ['required', 'string', 'max:80'],
            'address'     => ['required', 'string', 'max:255'],
            'latitude'    => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'   => ['nullable', 'numeric', 'between:-180,180'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
