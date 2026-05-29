<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes a vehicle photo. The model's `url` accessor already converts
 * relative paths to fully qualified URLs, so we just pass it through.
 */
class VehicleImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'      => $this->id,
            'url'     => $this->url,
            'is_main' => $this->is_main,
        ];
    }
}
