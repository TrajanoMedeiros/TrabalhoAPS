<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success(['user' => $this->presentUser($request->user())]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'nome' => ['sometimes', 'required', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'required', 'email', 'max:180', Rule::unique('users', 'email')->ignore($user->id)],
            'tipo_usuario' => ['sometimes', 'required', 'in:personal,business'],
        ]);

        if (array_key_exists('nome', $data)) {
            $user->name = $data['nome'];
        }
        if (array_key_exists('email', $data)) {
            $user->email = mb_strtolower($data['email']);
        }
        if (array_key_exists('tipo_usuario', $data)) {
            $user->account_type = $data['tipo_usuario'];
        }

        $user->save();

        return ApiResponse::success(['user' => $this->presentUser($user)], 'Perfil atualizado com sucesso.');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'senha_atual' => ['required', 'string'],
            'nova_senha' => ['required', 'string', 'min:8', 'max:255'],
        ]);

        $user = $request->user();
        if (! Hash::check($data['senha_atual'], $user->password)) {
            throw ValidationException::withMessages([
                'senha_atual' => 'Senha atual incorreta.',
            ]);
        }

        $user->password = $data['nova_senha'];
        $user->save();

        return ApiResponse::success([], 'Senha atualizada com sucesso.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->delete();

        return ApiResponse::success([], 'Conta removida com sucesso.');
    }

    private function presentUser(User $user): array
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
