<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\AuthenticationException;
use App\Http\HttpException;
use App\Http\JsonResponse;
use App\Http\Request;
use App\Repositories\UserRepository;
use App\Support\Auth;
use App\Support\Jwt;
use App\Support\Validator;

final class AuthController
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository();
    }

    public function register(Request $request, array $params): JsonResponse
    {
        $data = Validator::make($request->json())
            ->requiredString('nome', 'Nome', 120, 2)
            ->requiredEmail()
            ->requiredPassword()
            ->enum('tipo_usuario', ['personal', 'business'], 'personal')
            ->validate();

        if ($this->users->findByEmail($data['email']) !== null) {
            throw new HttpException(409, 'Este email ja esta em uso.');
        }

        $user = $this->users->create([
            'nome' => $data['nome'],
            'email' => $data['email'],
            'senha' => password_hash($data['senha'], PASSWORD_DEFAULT),
            'tipo_usuario' => $data['tipo_usuario'],
        ]);
        $token = Jwt::issue($user['id_usuario'], $user['email']);

        return JsonResponse::success([
            'user' => $user,
            'token' => $token['token'],
            'expires_at' => $token['expires_at'],
        ], 'Conta criada com sucesso.', 201);
    }

    public function login(Request $request, array $params): JsonResponse
    {
        $data = Validator::make($request->json())
            ->requiredEmail()
            ->requiredString('senha', 'Senha', 255)
            ->validate();

        $user = $this->users->findByEmail($data['email']);
        if ($user === null || !password_verify($data['senha'], $user['senha'])) {
            throw new AuthenticationException('Email ou senha invalidos.');
        }

        $publicUser = $this->users->findById((int) $user['id_usuario']);
        $token = Jwt::issue((int) $user['id_usuario'], $user['email']);

        return JsonResponse::success([
            'user' => $publicUser,
            'token' => $token['token'],
            'expires_at' => $token['expires_at'],
        ], 'Login realizado com sucesso.');
    }

    public function me(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $user = $this->users->findById($userId);
        if ($user === null) {
            throw new AuthenticationException('Usuario autenticado nao encontrado.');
        }

        return JsonResponse::success(['user' => $user]);
    }
}
