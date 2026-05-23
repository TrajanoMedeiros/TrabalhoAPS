<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database;
use PDO;

final class GoalRepository
{
    public function findAllByUser(int $userId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT g.id_meta, g.titulo, g.valor_alvo, g.valor_atual, g.data_limite,
                    g.id_usuario, g.id_categoria, g.created_at, c.nome AS categoria_nome
             FROM financial_goals g
             LEFT JOIN categories c ON c.id_categoria = g.id_categoria
             WHERE g.id_usuario = :id_usuario
             ORDER BY g.data_limite ASC NULLS LAST, g.created_at DESC'
        );
        $stmt->execute([':id_usuario' => $userId]);

        return array_map([$this, 'normalize'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT g.id_meta, g.titulo, g.valor_alvo, g.valor_atual, g.data_limite,
                    g.id_usuario, g.id_categoria, g.created_at, c.nome AS categoria_nome
             FROM financial_goals g
             LEFT JOIN categories c ON c.id_categoria = g.id_categoria
             WHERE g.id_meta = :id AND g.id_usuario = :id_usuario'
        );
        $stmt->execute([':id' => $id, ':id_usuario' => $userId]);

        $goal = $stmt->fetch(PDO::FETCH_ASSOC);
        return $goal ? $this->normalize($goal) : null;
    }

    public function create(array $data): array
    {
        $stmt = Database::connection()->prepare(
            'INSERT INTO financial_goals
                (titulo, valor_alvo, valor_atual, data_limite, id_usuario, id_categoria)
             VALUES
                (:titulo, :valor_alvo, :valor_atual, :data_limite, :id_usuario, :id_categoria)
             RETURNING id_meta'
        );
        $stmt->execute([
            ':titulo' => $data['titulo'],
            ':valor_alvo' => $data['valor_alvo'],
            ':valor_atual' => $data['valor_atual'] ?? 0,
            ':data_limite' => $data['data_limite'] ?? null,
            ':id_usuario' => $data['id_usuario'],
            ':id_categoria' => $data['id_categoria'] ?? null,
        ]);

        return $this->findById((int) $stmt->fetchColumn(), (int) $data['id_usuario']);
    }

    public function update(int $id, int $userId, array $data): ?array
    {
        $stmt = Database::connection()->prepare(
            'UPDATE financial_goals
             SET titulo = :titulo,
                 valor_alvo = :valor_alvo,
                 valor_atual = :valor_atual,
                 data_limite = :data_limite,
                 id_categoria = :id_categoria,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id_meta = :id AND id_usuario = :id_usuario
             RETURNING id_meta'
        );
        $stmt->execute([
            ':titulo' => $data['titulo'],
            ':valor_alvo' => $data['valor_alvo'],
            ':valor_atual' => $data['valor_atual'],
            ':data_limite' => $data['data_limite'],
            ':id_categoria' => $data['id_categoria'],
            ':id' => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->fetchColumn() ? $this->findById($id, $userId) : null;
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = Database::connection()->prepare(
            'DELETE FROM financial_goals WHERE id_meta = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([':id' => $id, ':id_usuario' => $userId]);

        return $stmt->rowCount() > 0;
    }

    private function normalize(array $goal): array
    {
        $target = (float) $goal['valor_alvo'];
        $current = (float) $goal['valor_atual'];

        return [
            'id_meta' => (int) $goal['id_meta'],
            'titulo' => $goal['titulo'],
            'valor_alvo' => $target,
            'valor_atual' => $current,
            'progresso_percentual' => $target > 0 ? round(min(100, ($current / $target) * 100), 1) : 0,
            'data_limite' => $goal['data_limite'],
            'id_usuario' => (int) $goal['id_usuario'],
            'id_categoria' => $goal['id_categoria'] === null ? null : (int) $goal['id_categoria'],
            'categoria_nome' => $goal['categoria_nome'],
            'created_at' => $goal['created_at'] ?? null,
        ];
    }
}
