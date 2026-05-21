<?php

require_once __DIR__ . '/../Database.php';

class FinancialGoal
{
    /**
     * Find all financial goals for a user, with category info.
     */
    public static function findAllByUser(int $userId): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT m.id_meta, m.titulo, m.valor_alvo, m.valor_atual,
                    m.data_limite, m.id_usuario, m.id_categoria, m.created_at,
                    c.nome AS categoria_nome
             FROM financial_goals m
             LEFT JOIN categories c ON c.id_categoria = m.id_categoria
             WHERE m.id_usuario = :id_usuario
             ORDER BY m.data_limite ASC'
        );
        $stmt->execute([':id_usuario' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find a single financial goal by ID scoped to a user.
     */
    public static function findById(int $id, int $userId): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT m.id_meta, m.titulo, m.valor_alvo, m.valor_atual,
                    m.data_limite, m.id_usuario, m.id_categoria, m.created_at,
                    c.nome AS categoria_nome
             FROM financial_goals m
             LEFT JOIN categories c ON c.id_categoria = m.id_categoria
             WHERE m.id_meta = :id AND m.id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':id'         => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Create a new financial goal.
     */
    public static function create(array $data): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO financial_goals (titulo, valor_alvo, valor_atual, data_limite, id_usuario, id_categoria)
             VALUES (:titulo, :valor_alvo, :valor_atual, :data_limite, :id_usuario, :id_categoria)
             RETURNING *'
        );
        $stmt->execute([
            ':titulo'       => $data['titulo'],
            ':valor_alvo'   => $data['valor_alvo'],
            ':valor_atual'  => $data['valor_atual'] ?? 0,
            ':data_limite'  => $data['data_limite'] ?? null,
            ':id_usuario'   => $data['id_usuario'],
            ':id_categoria' => $data['id_categoria'] ?? null,
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Update a financial goal scoped to a user.
     */
    public static function update(int $id, int $userId, array $data): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE financial_goals
             SET titulo = :titulo,
                 valor_alvo = :valor_alvo,
                 valor_atual = :valor_atual,
                 data_limite = :data_limite,
                 id_categoria = :id_categoria
             WHERE id_meta = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':titulo'       => $data['titulo'],
            ':valor_alvo'   => $data['valor_alvo'],
            ':valor_atual'  => $data['valor_atual'] ?? 0,
            ':data_limite'  => $data['data_limite'] ?? null,
            ':id_categoria' => $data['id_categoria'] ?? null,
            ':id'           => $id,
            ':id_usuario'   => $userId,
        ]);

        return $stmt->rowCount();
    }

    /**
     * Delete a financial goal scoped to a user.
     */
    public static function delete(int $id, int $userId): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'DELETE FROM financial_goals WHERE id_meta = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':id'         => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->rowCount();
    }
}
