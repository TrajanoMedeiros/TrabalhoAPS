<?php

namespace App\Http\Resources;

use App\Models\User;

class UserResource
{
    public static function make(User $user): array
    {
        return [
            'id_usuario' => $user->id,
            'nome' => $user->name,
            'email' => $user->email,
            'tipo_usuario' => $user->account_type,
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }
}
