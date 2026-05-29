<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for POST /api/documents — clients upload their licence,
 * CIN or passport here.
 */
class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type'       => ['required', 'in:permis,cin,passeport'],
            // Accept PDF or common image formats up to 5 MB.
            'file'       => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ];
    }
}
