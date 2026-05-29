<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shape of a Notification row — what the Navbar bell-dropdown receives.
 */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'message'    => $this->message,
            'type'       => $this->type,
            'read'       => (bool) $this->read_at,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
