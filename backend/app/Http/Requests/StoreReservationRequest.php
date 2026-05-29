<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for POST /api/reservations.
 *
 * Any authenticated user can book (clients book for themselves,
 * staff can book on behalf of a walk-in customer — handled in the
 * controller). The vehicle availability check is done in the
 * controller because it needs a DB query.
 */
class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'vehicle_id'  => ['required', 'exists:vehicles,id'],
            'agency_id'   => ['required', 'exists:agencies,id'],

            // start must be today or later — no booking in the past.
            'start_date'  => ['required', 'date', 'after_or_equal:today'],
            'end_date'    => ['required', 'date', 'after_or_equal:start_date'],
            'pickup_time' => ['nullable', 'date_format:H:i'],
            'return_time' => ['nullable', 'date_format:H:i'],
            'notes'       => ['nullable', 'string', 'max:1000'],
        ];
    }
}
