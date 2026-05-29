<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for PUT /api/vehicles/{vehicle}. Same shape as the store
 * request but every field is optional (sometimes) — managers can update
 * just a single attribute (e.g. flip the status).
 */
class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasStaffAccess() ?? false;
    }

    /**
     * Strip agency_id from incoming gestionnaire requests — they must not
     * be able to transfer a vehicle to another agency. Only proprietaires
     * can change a vehicle's agency.
     */
    protected function prepareForValidation(): void
    {
        if ($this->user()?->isGestionnaire()) {
            $this->offsetUnset('agency_id');
        }
    }

    public function rules(): array
    {
        return [
            'agency_id'     => ['sometimes', 'exists:agencies,id'],
            'brand'         => ['sometimes', 'string', 'max:60'],
            'model'         => ['sometimes', 'string', 'max:60'],
            'year'          => ['sometimes', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'category'      => ['sometimes', 'in:sportive,berline,suv,compacte,luxe,electrique,monospace'],
            'fuel_type'     => ['sometimes', 'in:essence,diesel,hybride,electrique'],
            'seats'         => ['sometimes', 'integer', 'min:1', 'max:9'],
            'price_per_day' => ['sometimes', 'numeric', 'min:0'],
            'status'        => ['sometimes', 'in:disponible,louee,maintenance'],
            'description'   => ['nullable', 'string', 'max:2000'],
            'is_premium'    => ['sometimes', 'boolean'],
            'rating'        => ['sometimes', 'numeric', 'min:0', 'max:5'],
        ];
    }
}
