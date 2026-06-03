<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if ($user instanceof User) {
            return $user;
        }

        if (is_array($user)) {
            $id = (int) ($user['id'] ?? $user['id_usuario'] ?? 0);
            if ($id > 0) {
                $model = User::query()->find($id);
                if ($model instanceof User) {
                    return $model;
                }
            }
        }

        throw new AuthenticationException('Usuario autenticado invalido.');
    }

    protected function authenticatedUserId(Request $request): int
    {
        return (int) $this->authenticatedUser($request)->id;
    }
}
