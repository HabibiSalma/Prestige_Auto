<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes the JSON returned for any Vehicle row. Includes the agency
 * info, the array of image URLs, and (when present) the pre-computed
 * list of booked dates used by the availability calendar.
 */
class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'agency_id'     => $this->agency_id,
            'brand'         => $this->brand,
            'model'         => $this->model,
            'year'          => $this->year,
            'category'      => $this->category,
            'fuel_type'     => $this->fuel_type,
            'seats'         => $this->seats,
            'price_per_day' => $this->price_per_day,
            'status'        => $this->status,
            'description'   => $this->description,
            'is_premium'    => $this->is_premium,
            'rating'        => $this->rating,

            'agency'        => new AgencyResource($this->whenLoaded('agency')),

            'images'        => VehicleImageResource::collection($this->whenLoaded('images')),

            // Convenience field: URL of the main image so cards don't have
            // to iterate the images array client-side.
            'main_image'    => $this->whenLoaded('images', function () {
                $main = $this->images->firstWhere('is_main', true) ?? $this->images->first();
                return $main?->url;
            }),

            // Only included when the controller calls ->setBookedDates(...)
            'booked_dates'  => $this->when(isset($this->booked_dates), $this->booked_dates),

            'created_at'    => $this->created_at?->toISOString(),
        ];
    }
}
