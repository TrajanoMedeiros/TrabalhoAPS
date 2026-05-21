<?php

require_once __DIR__ . '/../Database.php';

class Expense
{
    
    public static function findAllByUser(int $userId, array $filters = []): array
    {
        $pdo = Database::getConnection();

        $sql = 'SELECT d.id_despesa, d.valor, d.data, d.descricao,
                       d.id_usuario, d.id_categoria, d.created_at,
                       c.nome AS categoria_nome
                FROM expenses d
                LEFT JOIN categories c ON c.id_categoria = d.id_categoria
                WHERE d.id_usuario = :id_usuario';
        $params = [':id_usuario' => $userId];

        if (!empty($filters['mes'])) {
            $sql .= ' AND EXTRACT(MONTH FROM d.data) = :mes';
            $params[':mes'] = (int) $filters['mes'];
        }

        if (!empty($filters['ano'])) {
            $sql .= ' AND EXTRACT(YEAR FROM d.data) = :ano';
            $params[':ano'] = (int) $filters['ano'];
        }

        $sql .= ' ORDER BY d.data DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    
    public static function findById(int $id, int $userId): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT d.id_despesa, d.valor, d.data, d.descricao,
                    d.id_usuario, d.id_categoria, d.created_at,
                    c.nome AS categoria_nome
             FROM expenses d
             LEFT JOIN categories c ON c.id_categoria = d.id_categoria
             WHERE d.id_despesa = :id AND d.id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':id'         => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }


    public static function create(array $data): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO expenses (valor, data, descricao, id_usuario, id_categoria)
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

   
    public static function update(int $id, int $userId, array $data): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE expenses
             SET valor = :valor, data = :data, descricao = :descricao, id_categoria = :id_categoria
             WHERE id_despesa = :id AND id_usuario = :id_usuario'
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

   
    public static function delete(int $id, int $userId): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'DELETE FROM expenses WHERE id_despesa = :id AND id_usuario = :id_usuario'
        );
        $stmt->execute([
            ':id'         => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->rowCount();
    }

    
    public static function getTotal(int $userId, array $filters = []): float
    {
        $pdo = Database::getConnection();

        $sql = 'SELECT COALESCE(SUM(valor), 0) AS total
                FROM expenses
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
