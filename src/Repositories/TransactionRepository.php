<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Database;
use InvalidArgumentException;
use PDO;

final class TransactionRepository
{
    private const MAP = [
        'income' => ['table' => 'incomes', 'id' => 'id_receita', 'label' => 'receita'],
        'expense' => ['table' => 'expenses', 'id' => 'id_despesa', 'label' => 'despesa'],
    ];

    public function findAll(string $type, int $userId, array $filters = []): array
    {
        $meta = $this->meta($type);
        $params = [':id_usuario' => $userId];
        $sql = sprintf(
            'SELECT t.%s AS id, t.valor, t.data, t.descricao, t.id_usuario, t.id_categoria,
                    t.created_at, c.nome AS categoria_nome, c.tipo AS categoria_tipo
             FROM %s t
             LEFT JOIN categories c ON c.id_categoria = t.id_categoria
             WHERE t.id_usuario = :id_usuario',
            $meta['id'],
            $meta['table']
        );

        $this->appendFilters($sql, $params, $filters, 't');
        $sql .= ' ORDER BY t.data DESC, t.created_at DESC';

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);

        return array_map(fn (array $row): array => $this->normalize($row, $type), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function findById(string $type, int $id, int $userId): ?array
    {
        $meta = $this->meta($type);
        $stmt = Database::connection()->prepare(sprintf(
            'SELECT t.%s AS id, t.valor, t.data, t.descricao, t.id_usuario, t.id_categoria,
                    t.created_at, c.nome AS categoria_nome, c.tipo AS categoria_tipo
             FROM %s t
             LEFT JOIN categories c ON c.id_categoria = t.id_categoria
             WHERE t.%s = :id AND t.id_usuario = :id_usuario',
            $meta['id'],
            $meta['table'],
            $meta['id']
        ));
        $stmt->execute([':id' => $id, ':id_usuario' => $userId]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->normalize($row, $type) : null;
    }

    public function create(string $type, array $data): array
    {
        $meta = $this->meta($type);
        $stmt = Database::connection()->prepare(sprintf(
            'INSERT INTO %s (valor, data, descricao, id_usuario, id_categoria)
             VALUES (:valor, :data, :descricao, :id_usuario, :id_categoria)
             RETURNING %s',
            $meta['table'],
            $meta['id']
        ));
        $stmt->execute([
            ':valor' => $data['valor'],
            ':data' => $data['data'],
            ':descricao' => $data['descricao'] ?? null,
            ':id_usuario' => $data['id_usuario'],
            ':id_categoria' => $data['id_categoria'],
        ]);

        return $this->findById($type, (int) $stmt->fetchColumn(), (int) $data['id_usuario']);
    }

    public function update(string $type, int $id, int $userId, array $data): ?array
    {
        $meta = $this->meta($type);
        $stmt = Database::connection()->prepare(sprintf(
            'UPDATE %s
             SET valor = :valor,
                 data = :data,
                 descricao = :descricao,
                 id_categoria = :id_categoria,
                 updated_at = CURRENT_TIMESTAMP
             WHERE %s = :id AND id_usuario = :id_usuario
             RETURNING %s',
            $meta['table'],
            $meta['id'],
            $meta['id']
        ));
        $stmt->execute([
            ':valor' => $data['valor'],
            ':data' => $data['data'],
            ':descricao' => $data['descricao'] ?? null,
            ':id_categoria' => $data['id_categoria'],
            ':id' => $id,
            ':id_usuario' => $userId,
        ]);

        return $stmt->fetchColumn() ? $this->findById($type, $id, $userId) : null;
    }

    public function delete(string $type, int $id, int $userId): bool
    {
        $meta = $this->meta($type);
        $stmt = Database::connection()->prepare(sprintf(
            'DELETE FROM %s WHERE %s = :id AND id_usuario = :id_usuario',
            $meta['table'],
            $meta['id']
        ));
        $stmt->execute([':id' => $id, ':id_usuario' => $userId]);

        return $stmt->rowCount() > 0;
    }

    public function total(string $type, int $userId, array $filters = []): float
    {
        $meta = $this->meta($type);
        $params = [':id_usuario' => $userId];
        $sql = sprintf(
            'SELECT COALESCE(SUM(valor), 0) AS total FROM %s WHERE id_usuario = :id_usuario',
            $meta['table']
        );

        $this->appendFilters($sql, $params, $filters);

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);

        return (float) $stmt->fetchColumn();
    }

    public function categoryDistribution(string $type, int $userId, array $filters = []): array
    {
        $meta = $this->meta($type);
        $params = [':id_usuario' => $userId];
        $sql = sprintf(
            'SELECT c.nome AS categoria, COALESCE(SUM(t.valor), 0) AS total
             FROM %s t
             JOIN categories c ON c.id_categoria = t.id_categoria
             WHERE t.id_usuario = :id_usuario',
            $meta['table']
        );

        $this->appendFilters($sql, $params, $filters, 't');
        $sql .= ' GROUP BY c.nome ORDER BY total DESC, c.nome ASC';

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);

        return array_map(static fn (array $row): array => [
            'categoria' => $row['categoria'],
            'total' => (float) $row['total'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function recentCombined(int $userId, int $limit = 10): array
    {
        $rows = array_merge(
            $this->findAll('income', $userId),
            $this->findAll('expense', $userId)
        );

        usort($rows, static function (array $a, array $b): int {
            return strcmp($b['data'] . $b['created_at'], $a['data'] . $a['created_at']);
        });

        return array_slice($rows, 0, $limit);
    }

    public function monthlyHistory(int $userId, int $months): array
    {
        $stmt = Database::connection()->prepare(
            "WITH months AS (
                SELECT
                    EXTRACT(MONTH FROM d)::int AS mes,
                    EXTRACT(YEAR FROM d)::int AS ano
                FROM generate_series(
                    date_trunc('month', CURRENT_DATE) - (:months - 1) * INTERVAL '1 month',
                    date_trunc('month', CURRENT_DATE),
                    INTERVAL '1 month'
                ) AS d
            ),
            income_totals AS (
                SELECT EXTRACT(MONTH FROM data)::int AS mes,
                       EXTRACT(YEAR FROM data)::int AS ano,
                       COALESCE(SUM(valor), 0) AS total
                FROM incomes
                WHERE id_usuario = :income_user
                GROUP BY mes, ano
            ),
            expense_totals AS (
                SELECT EXTRACT(MONTH FROM data)::int AS mes,
                       EXTRACT(YEAR FROM data)::int AS ano,
                       COALESCE(SUM(valor), 0) AS total
                FROM expenses
                WHERE id_usuario = :expense_user
                GROUP BY mes, ano
            )
            SELECT m.mes, m.ano,
                   COALESCE(i.total, 0) AS total_receitas,
                   COALESCE(e.total, 0) AS total_despesas,
                   COALESCE(i.total, 0) - COALESCE(e.total, 0) AS saldo
            FROM months m
            LEFT JOIN income_totals i ON i.mes = m.mes AND i.ano = m.ano
            LEFT JOIN expense_totals e ON e.mes = m.mes AND e.ano = m.ano
            ORDER BY m.ano ASC, m.mes ASC"
        );
        $stmt->execute([
            ':months' => $months,
            ':income_user' => $userId,
            ':expense_user' => $userId,
        ]);

        return array_map(static fn (array $row): array => [
            'mes' => (int) $row['mes'],
            'ano' => (int) $row['ano'],
            'total_receitas' => (float) $row['total_receitas'],
            'total_despesas' => (float) $row['total_despesas'],
            'saldo' => (float) $row['saldo'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function appendFilters(string &$sql, array &$params, array $filters, string $alias = ''): void
    {
        $prefix = $alias === '' ? '' : $alias . '.';
        if (isset($filters['mes'])) {
            $sql .= ' AND EXTRACT(MONTH FROM ' . $prefix . 'data) = :mes';
            $params[':mes'] = $filters['mes'];
        }

        if (isset($filters['ano'])) {
            $sql .= ' AND EXTRACT(YEAR FROM ' . $prefix . 'data) = :ano';
            $params[':ano'] = $filters['ano'];
        }
    }

    private function normalize(array $row, string $type): array
    {
        return [
            'id' => (int) $row['id'],
            'tipo' => self::MAP[$type]['label'],
            'valor' => (float) $row['valor'],
            'data' => $row['data'],
            'descricao' => $row['descricao'],
            'id_usuario' => (int) $row['id_usuario'],
            'id_categoria' => (int) $row['id_categoria'],
            'categoria_nome' => $row['categoria_nome'],
            'categoria_tipo' => $row['categoria_tipo'],
            'created_at' => $row['created_at'] ?? null,
        ];
    }

    private function meta(string $type): array
    {
        if (!isset(self::MAP[$type])) {
            throw new InvalidArgumentException('Tipo de transacao invalido.');
        }

        return self::MAP[$type];
    }
}
