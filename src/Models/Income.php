<?php

require_once __DIR__ . '/../Database.php';

class Income
{
    /**
     * Find all incomes for a user with optional month/year filters.
     */
    public static function findAllByUser(int $userId, array $filters = []): array
    {
        $pdo = Database::getConnection();

        $sql = 'SELECT r.id_receita, r.valor, r.data, r.descricao,
                       r.id_usuario, r.id_categoria, r.created_at,
                       c.nome AS categoria_nome
                FROM incomes r
                LEFT JOIN categories c ON c.id_categoria = r.id_categoria
                WHERE r.id_usuario = :id_usuario';
        $params = [':id_usuario' => $userId];

        if (!empty($filters['mes'])) {
            $sql .= ' AND EXTRACT(MONTH FROM r.data) = :mes';
            $params[':mes'] = (int) $filters['mes'];
        }

        if (!empty($filters['ano'])) {
            $sql .= ' AND EXTRACT(YEAR FROM r.data) = :ano';
            $params[':ano'] = (int) $filters['ano'];
        }

        $sql .= ' ORDER BY r.data DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find a single income by ID scoped to a user.
     */
    public static function findById(int $id, int $userId): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT r.id_receita, r.valor, r.data, r.descricao,
                    r.id_usuario, r.id_categoria, r.created_at,
                    c.nome AS categoria_nome
             FROM incomes r
             LEFT JOIN categories c ON c.id_categoria = r.id_categoria
             WHERE r.id_receita = :id AND r.id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':id'         => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Create a new income record.
     */
    public static function create(array $data): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO incomes (valor, data, descricao, id_usuario, id_categoria)
             VALUES (:valor, :data, :descricao, :id_usuario, :id_categoria)
             RETURNING *'
        );
        $stmt->execute([
            ':valor'        => $data['valor'],
            ':data'         => $data['data'],
            ':descricao'    => $data['descricao'] ?? null,
            ':id_usuario'   => $data['id_usuario'],
            ':id_categoria' => $data['id_categoria'],
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Update an existing income record scoped to a user.
     */
    public static function update(int $id, int $userId, array $data): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE incomes
             SET valor = :valor, data = :data, descricao = :descricao, id_categoria = :id_categoria
             WHERE id_receita = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':valor'        => $data['valor'],
            ':data'         => $data['data'],
            ':descricao'    => $data['descricao'] ?? null,
            ':id_categoria' => $data['id_categoria'],
            ':id'           => $id,
            ':id_usuario'   => $userId,
        ]);

        return $stmt->rowCount();
    }

    /**
     * Delete an income record scoped to a user.
     */
    public static function delete(int $id, int $userId): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'DELETE FROM incomes WHERE id_receita = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':id'         => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->rowCount();
    }

    /**
     * Get total income for a user with optional month/year filters.
     */
    public static function getTotal(int $userId, array $filters = []): float
    {
        $pdo = Database::getConnection();

        $sql = 'SELECT COALESCE(SUM(valor), 0) AS total
                FROM incomes
                WHERE id_usuario = :id_usuario';
        $params = [':id_usuario' => $userId];

        if (!empty($filters['mes'])) {
            $sql .= ' AND EXTRACT(MONTH FROM data) = :mes';
            $params[':mes'] = (int) $filters['mes'];
        }

        if (!empty($filters['ano'])) {
            $sql .= ' AND EXTRACT(YEAR FROM data) = :ano';
            $params[':ano'] = (int) $filters['ano'];
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (float) $row['total'];
    }
}
