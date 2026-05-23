<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database;
use PDO;

final class UserRepository
{
    public function findById(int $id): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT id_usuario, nome, email, tipo_usuario, created_at, updated_at
             FROM users
             WHERE id_usuario = :id'
        );
        $stmt->execute([':id' => $id]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? $this->normalize($user) : null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM users WHERE email = :email');
        $stmt->execute([':email' => $email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function create(array $data): array
    {
        $pdo = Database::connection();
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare(
                'INSERT INTO users (nome, email, senha, tipo_usuario)
                 VALUES (:nome, :email, :senha, :tipo_usuario)
                 RETURNING id_usuario, nome, email, tipo_usuario, created_at, updated_at'
            );
            $stmt->execute([
                ':nome' => $data['nome'],
                ':email' => $data['email'],
                ':senha' => $data['senha'],
                ':tipo_usuario' => $data['tipo_usuario'],
            ]);

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            $history = $pdo->prepare(
                'INSERT INTO financial_histories (id_usuario)
                 VALUES (:id_usuario)
                 ON CONFLICT (id_usuario) DO NOTHING'
            );
            $history->execute([':id_usuario' => $user['id_usuario']]);

            $pdo->commit();
            return $this->normalize($user);
        } catch (\Throwable $exception) {
            $pdo->rollBack();
            throw $exception;
        }
    }

    public function update(int $id, array $data): ?array
    {
        if ($data === []) {
            return $this->findById($id);
        }

        $fields = [];
        $params = [':id' => $id];

        foreach (['nome', 'email', 'tipo_usuario'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = $field . ' = :' . $field;
                $params[':' . $field] = $data[$field];
            }
        }

        if ($fields === []) {
            return $this->findById($id);
        }

        $fields[] = 'updated_at = CURRENT_TIMESTAMP';

        $stmt = Database::connection()->prepare(
            'UPDATE users SET ' . implode(', ', $fields) . '
             WHERE id_usuario = :id
             RETURNING id_usuario, nome, email, tipo_usuario, created_at, updated_at'
        );
        $stmt->execute($params);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? $this->normalize($user) : null;
    }

    public function updatePassword(int $id, string $hash): void
    {
        $stmt = Database::connection()->prepare(
            'UPDATE users SET senha = :senha, updated_at = CURRENT_TIMESTAMP WHERE id_usuario = :id'
        );
        $stmt->execute([':senha' => $hash, ':id' => $id]);
    }

    public function delete(int $id): void
    {
        $stmt = Database::connection()->prepare('DELETE FROM users WHERE id_usuario = :id');
        $stmt->execute([':id' => $id]);
    }

    private function normalize(array $user): array
    {
        return [
            'id_usuario' => (int) $user['id_usuario'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'tipo_usuario' => $user['tipo_usuario'] ?? 'personal',
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null,
        ];
    }
}
