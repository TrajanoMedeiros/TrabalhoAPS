<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\HttpException;
use App\Http\JsonResponse;
use App\Http\Request;
use App\Http\ValidationException;
use App\Repositories\UserRepository;
use App\Support\Auth;
use App\Support\Validator;

final class UserController
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository();
    }

    public function show(Request $request, array $params): JsonResponse
    {
        $user = $this->requireUser($request);
        return JsonResponse::success(['user' => $user]);
    }

    public function update(Request $request, array $params): JsonResponse
    {
        $user = $this->requireUser($request);
        $body = $request->json();
        $data = [];

        if (array_key_exists('nome', $body)) {
            $data['nome'] = Validator::make(['nome' => $body['nome']])
                ->requiredString('nome', 'Nome', 120, 2)
                ->validate()['nome'];
        }

        if (array_key_exists('email', $body)) {
            $email = Validator::make(['email' => $body['email']])
                ->requiredEmail()
                ->validate()['email'];
            $existing = $this->users->findByEmail($email);
            if ($existing !== null && (int) $existing['id_usuario'] !== $user['id_usuario']) {
                throw new HttpException(409, 'Este email ja esta em uso.');
            }
            $data['email'] = $email;
        }

        if (array_key_exists('tipo_usuario', $body)) {
            $data['tipo_usuario'] = Validator::make(['tipo_usuario' => $body['tipo_usuario']])
                ->enum('tipo_usuario', ['personal', 'business'])
                ->validate()['tipo_usuario'];
        }

        if ($data === []) {
            throw new ValidationException('Nenhum campo valido informado.', [
                'campos' => 'Use nome, email ou tipo_usuario.',
            ]);
        }

        return JsonResponse::success([
            'user' => $this->users->update($user['id_usuario'], $data),
        ], 'Perfil atualizado com sucesso.');
    }

    public function changePassword(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $data = Validator::make($request->json())
            ->requiredString('senha_atual', 'Senha atual', 255)
            ->requiredPassword('nova_senha')
            ->validate();

        $stored = $this->users->findByEmail($this->requireUser($request)['email']);
        if ($stored === null || !password_verify($data['senha_atual'], $stored['senha'])) {
            throw new ValidationException('Senha atual incorreta.', ['senha_atual' => 'Confira sua senha atual.']);
        }

        $this->users->updatePassword($userId, password_hash($data['nova_senha'], PASSWORD_DEFAULT));

        return JsonResponse::success([], 'Senha atualizada com sucesso.');
    }

    public function destroy(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $this->users->delete($userId);

        return JsonResponse::success([], 'Conta removida com sucesso.');
    }

    private function requireUser(Request $request): array
    {
        $userId = Auth::userId($request);
        $user = $this->users->findById($userId);
        if ($user === null) {
            throw new HttpException(404, 'Usuario nao encontrado.');
        }

        return $user;
    }
}
