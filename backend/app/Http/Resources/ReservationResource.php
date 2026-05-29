<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes a Reservation row for the API. Includes the computed
 * `days` count and a `can_cancel` flag so the client doesn't have
 * to re-implement the business rule.
 */
class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'vehicle_id'   => $this->vehicle_id,
            'agency_id'    => $this->agency_id,
            'start_date'   => $this->start_date?->format('Y-m-d'),
            'end_date'     => $this->end_date?->format('Y-m-d'),
            'pickup_time'  => $this->pickup_time,
            'return_time'  => $this->return_time,
            'total_price'  => $this->total_price,
            'status'       => $this->status,
            'notes'        => $this->notes,

            'days'         => $this->numberOfDays(),
            'can_cancel'   => $this->canBeCancelled(),

            'user'         => new UserResource($this->whenLoaded('user')),
            'vehicle'      => new VehicleResource($this->whenLoaded('vehicle')),
            'agency'       => new AgencyResource($this->whenLoaded('agency')),

            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
