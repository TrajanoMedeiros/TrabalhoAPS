<?php

require_once __DIR__ . '/../Database.php';

class FinancialHistory
{
    /**
     * Get the last N months of income/expense totals for a user.
     *
     * Uses generate_series to guarantee a row for every month, even
     * when there is no income or expense data for that period.
     *
     * @return array<int, array{mes: int, ano: int, total_receitas: float, total_despesas: float, saldo: float}>
     */
    public static function getMonthlyHistory(int $userId, int $months = 6): array
    {
        $pdo = Database::getConnection();

        $sql = "
            WITH meses AS (
                SELECT
                    EXTRACT(MONTH FROM d)::int AS mes,
                    EXTRACT(YEAR  FROM d)::int AS ano
                FROM generate_series(
                    date_trunc('month', CURRENT_DATE) - (:months - 1) * INTERVAL '1 month',
                    date_trunc('month', CURRENT_DATE),
                    INTERVAL '1 month'
                ) AS d
            ),
            receitas AS (
                SELECT
                    EXTRACT(MONTH FROM data)::int AS mes,
                    EXTRACT(YEAR  FROM data)::int AS ano,
                    COALESCE(SUM(valor), 0) AS total
                FROM incomes
                WHERE id_usuario = :uid1
                GROUP BY mes, ano
            ),
            despesas AS (
                SELECT
                    EXTRACT(MONTH FROM data)::int AS mes,
                    EXTRACT(YEAR  FROM data)::int AS ano,
                    COALESCE(SUM(valor), 0) AS total
                FROM expenses
                WHERE id_usuario = :uid2
                GROUP BY mes, ano
            )
            SELECT
                m.mes,
                m.ano,
                COALESCE(r.total, 0) AS total_receitas,
                COALESCE(d.total, 0) AS total_despesas,
                COALESCE(r.total, 0) - COALESCE(d.total, 0) AS saldo
            FROM meses m
            LEFT JOIN receitas r ON r.mes = m.mes AND r.ano = m.ano
            LEFT JOIN despesas d ON d.mes = m.mes AND d.ano = m.ano
            ORDER BY m.ano ASC, m.mes ASC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':months' => $months,
            ':uid1'   => $userId,
            ':uid2'   => $userId,
        ]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Cast numeric strings to proper float types
        return array_map(function (array $row): array {
            return [
                'mes'             => (int)   $row['mes'],
                'ano'             => (int)   $row['ano'],
                'total_receitas'  => (float) $row['total_receitas'],
                'total_despesas'  => (float) $row['total_despesas'],
                'saldo'           => (float) $row['saldo'],
            ];
        }, $rows);
    }

    /**
     * Find the financial_histories record for a user.
     */
    public static function findByUser(int $userId): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT * FROM financial_histories WHERE id_usuario = :id_usuario'
        );
        $stmt->execute([':id_usuario' => $userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Create a financial_histories record for a user.
     */
    public static function createForUser(int $userId): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO financial_histories (id_usuario)
             VALUES (:id_usuario)
             RETURNING *'
        );
        $stmt->execute([':id_usuario' => $userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }
}
