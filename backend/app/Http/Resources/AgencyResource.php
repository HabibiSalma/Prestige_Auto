<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes the JSON for an Agency. Adds a `vehicles_count` field when the
 * controller has loaded the count using ->withCount('vehicles'), useful
 * for the agencies listing page.
 */
class AgencyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'city'           => $this->city,
            'address'        => $this->address,
            'latitude'       => $this->latitude,
            'longitude'      => $this->longitude,
            'phone'          => $this->phone,
            'email'          => $this->email,
            'description'    => $this->description,
            'vehicles_count' => $this->when(isset($this->vehicles_count), $this->vehicles_count),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
