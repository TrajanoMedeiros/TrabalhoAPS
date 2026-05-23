<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApiResponse;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly JwtService $jwt) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:180', 'unique:users,email'],
            'senha' => ['required', 'string', 'min:8', 'max:255'],
            'tipo_usuario' => ['nullable', 'in:personal,business'],
        ]);

        $user = User::query()->create([
            'name' => $data['nome'],
            'email' => mb_strtolower($data['email']),
            'password' => $data['senha'],
            'account_type' => $data['tipo_usuario'] ?? 'personal',
        ]);

        $token = $this->jwt->issue($user);

        return ApiResponse::success([
            'user' => $this->presentUser($user),
            'token' => $token['token'],
            'expires_at' => $token['expires_at'],
        ], 'Conta criada com sucesso.', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'senha' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', mb_strtolower($data['email']))->first();
        if (! $user || ! Hash::check($data['senha'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Email ou senha invalidos.',
            ]);
        }

        $token = $this->jwt->issue($user);

        return ApiResponse::success([
            'user' => $this->presentUser($user),
            'token' => $token['token'],
            'expires_at' => $token['expires_at'],
        ], 'Login realizado com sucesso.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'user' => $this->presentUser($request->user()),
        ]);
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
