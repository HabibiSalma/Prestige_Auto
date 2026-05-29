<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes the JSON payload returned for any User. Keeping it in one
 * place guarantees that no controller ever leaks the password hash
 * or fields the front-end is not supposed to see.
 */
class UserResource extends JsonResource
{
    /**
     * Convert the model to a plain array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'email'              => $this->email,
            'phone'              => $this->phone,
            'role'               => $this->role,
            'agency_id'          => $this->agency_id,
            'city'               => $this->city,
            'address'            => $this->address,
            'avatar'             => $this->avatar,
            'licence_number'     => $this->licence_number,
            'licence_expires_at' => $this->licence_expires_at?->format('Y-m-d'),

            // Eager-loaded relations are exposed only when present, so we
            // don't trigger N+1 queries when the controller didn't ask.
            'agency'             => new AgencyResource($this->whenLoaded('agency')),

            'created_at'         => $this->created_at?->toISOString(),
        ];
    }
}
