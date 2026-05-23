<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database;
use PDO;

final class CategoryRepository
{
    public function findAllForUser(int $userId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT id_categoria, nome, tipo, id_usuario, created_at
             FROM categories
             WHERE id_usuario IS NULL OR id_usuario = :id_usuario
             ORDER BY tipo ASC, nome ASC'
        );
        $stmt->execute([':id_usuario' => $userId]);

        return array_map([$this, 'normalize'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function findByIdForUser(int $id, int $userId): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT id_categoria, nome, tipo, id_usuario, created_at
             FROM categories
             WHERE id_categoria = :id
               AND (id_usuario IS NULL OR id_usuario = :id_usuario)'
        );
        $stmt->execute([':id' => $id, ':id_usuario' => $userId]);

        $category = $stmt->fetch(PDO::FETCH_ASSOC);
        return $category ? $this->normalize($category) : null;
    }

    public function existsForUse(int $id, int $userId, string $usage): bool
    {
        $stmt = Database::connection()->prepare(
            'SELECT 1
             FROM categories
             WHERE id_categoria = :id
               AND (id_usuario IS NULL OR id_usuario = :id_usuario)
               AND (tipo = :usage OR tipo = :both)
             LIMIT 1'
        );
        $stmt->execute([
            ':id' => $id,
            ':id_usuario' => $userId,
            ':usage' => $usage,
            ':both' => 'both',
        ]);

        return (bool) $stmt->fetchColumn();
    }

    public function createForUser(int $userId, array $data): array
    {
        $stmt = Database::connection()->prepare(
            'INSERT INTO categories (nome, tipo, id_usuario)
             VALUES (:nome, :tipo, :id_usuario)
             RETURNING id_categoria, nome, tipo, id_usuario, created_at'
        );
        $stmt->execute([
            ':nome' => $data['nome'],
            ':tipo' => $data['tipo'],
            ':id_usuario' => $userId,
        ]);

        return $this->normalize($stmt->fetch(PDO::FETCH_ASSOC));
    }

    public function updateForUser(int $id, int $userId, array $data): ?array
    {
        $stmt = Database::connection()->prepare(
            'UPDATE categories
             SET nome = :nome, tipo = :tipo
             WHERE id_categoria = :id AND id_usuario = :id_usuario
             RETURNING id_categoria, nome, tipo, id_usuario, created_at'
        );
        $stmt->execute([
            ':nome' => $data['nome'],
            ':tipo' => $data['tipo'],
            ':id' => $id,
            ':id_usuario' => $userId,
        ]);

        $category = $stmt->fetch(PDO::FETCH_ASSOC);
        return $category ? $this->normalize($category) : null;
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        $stmt = Database::connection()->prepare(
            'DELETE FROM categories WHERE id_categoria = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([':id' => $id, ':id_usuario' => $userId]);

        return $stmt->rowCount() > 0;
    }

    private function normalize(array $category): array
    {
        return [
            'id_categoria' => (int) $category['id_categoria'],
            'nome' => $category['nome'],
            'tipo' => $category['tipo'] ?? 'both',
            'id_usuario' => $category['id_usuario'] === null ? null : (int) $category['id_usuario'],
            'created_at' => $category['created_at'] ?? null,
        ];
    }
}
