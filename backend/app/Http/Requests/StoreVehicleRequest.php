<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for POST /api/vehicles (create) — used by gestionnaires
 * and the proprietaire to add a new car to a fleet.
 */
class StoreVehicleRequest extends FormRequest
{
    /**
     * Only staff (gestionnaire or proprietaire) can create a vehicle.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasStaffAccess() ?? false;
    }

    /**
     * Runs BEFORE validation. We use it to overwrite any agency_id sent by
     * a gestionnaire with their own assigned agency_id — so they can never
     * create a vehicle under someone else's name, even by tampering with
     * the form payload.
     */
    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if ($user && $user->isGestionnaire() && $user->agency_id) {
            $this->merge(['agency_id' => $user->agency_id]);
        }
    }

    public function rules(): array
    {
        return [
            'agency_id'     => ['required', 'exists:agencies,id'],
            'brand'         => ['required', 'string', 'max:60'],
            'model'         => ['required', 'string', 'max:60'],
            'year'          => ['required', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'category'      => ['required', 'in:sportive,berline,suv,compacte,luxe,electrique,monospace'],
            'fuel_type'     => ['required', 'in:essence,diesel,hybride,electrique'],
            'seats'         => ['required', 'integer', 'min:1', 'max:9'],
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'status'        => ['nullable', 'in:disponible,louee,maintenance'],
            'description'   => ['nullable', 'string', 'max:2000'],
            'is_premium'    => ['nullable', 'boolean'],
            'rating'        => ['nullable', 'numeric', 'min:0', 'max:5'],

            // Optional gallery uploaded on creation.
            'images'        => ['nullable', 'array'],
            'images.*'      => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
