<?php

class DashboardController {

    public function getDashboard() {
        $userId = Middleware::auth();


        $filters = [];
        if (isset($_GET['mes'])) $filters['mes'] = (int) $_GET['mes'];
        if (isset($_GET['ano'])) $filters['ano'] = (int) $_GET['ano'];

        // Totals (with optional month/year filter)
        $totalIncome = Income::getTotal($userId, $filters);
        $totalExpense = Expense::getTotal($userId, $filters);
        $saldoAtual = $totalIncome - $totalExpense;

        $pdo = Database::getConnection();


        $distQuery = "
            SELECT c.nome as categoria, SUM(d.valor) as total 
            FROM expenses d 
            JOIN categories c ON d.id_categoria = c.id_categoria 
            WHERE d.id_usuario = ?
        ";
        $distParams = [$userId];

        if (isset($filters['mes'])) {
            $distQuery .= " AND EXTRACT(MONTH FROM d.data) = ?";
            $distParams[] = $filters['mes'];
        }
        if (isset($filters['ano'])) {
            $distQuery .= " AND EXTRACT(YEAR FROM d.data) = ?";
            $distParams[] = $filters['ano'];
        }

        $distQuery .= " GROUP BY c.nome ORDER BY total DESC";
        $stmtDist = $pdo->prepare($distQuery);
        $stmtDist->execute($distParams);
        $distribuicao = $stmtDist->fetchAll();


        $incDistQuery = "
            SELECT c.nome as categoria, SUM(r.valor) as total 
            FROM incomes r 
            JOIN categories c ON r.id_categoria = c.id_categoria 
            WHERE r.id_usuario = ?
        ";
        $incDistParams = [$userId];

        if (isset($filters['mes'])) {
            $incDistQuery .= " AND EXTRACT(MONTH FROM r.data) = ?";
            $incDistParams[] = $filters['mes'];
        }
        if (isset($filters['ano'])) {
            $incDistQuery .= " AND EXTRACT(YEAR FROM r.data) = ?";
            $incDistParams[] = $filters['ano'];
        }

        $incDistQuery .= " GROUP BY c.nome ORDER BY total DESC";
        $stmtIncDist = $pdo->prepare($incDistQuery);
        $stmtIncDist->execute($incDistParams);
        $distribuicaoReceitas = $stmtIncDist->fetchAll();


        $goals = FinancialGoal::findAllByUser($userId);
        $goalsTotal = 0;
        $goalsProgress = 0;
        foreach ($goals as $goal) {
            $goalsTotal += (float) $goal['valor_alvo'];
            $goalsProgress += (float) $goal['valor_atual'];
        }


        $stmtRecentInc = $pdo->prepare("
            SELECT r.id_receita as id, r.valor, r.data, r.descricao, c.nome as categoria, 'receita' as tipo
            FROM incomes r 
            LEFT JOIN categories c ON r.id_categoria = c.id_categoria 
            WHERE r.id_usuario = ? 
            ORDER BY r.data DESC, r.created_at DESC 
            LIMIT 5
        ");
        $stmtRecentInc->execute([$userId]);
        $recentIncomes = $stmtRecentInc->fetchAll();

        $stmtRecentExp = $pdo->prepare("
            SELECT d.id_despesa as id, d.valor, d.data, d.descricao, c.nome as categoria, 'despesa' as tipo
            FROM expenses d 
            LEFT JOIN categories c ON d.id_categoria = c.id_categoria 
            WHERE d.id_usuario = ? 
            ORDER BY d.data DESC, d.created_at DESC 
            LIMIT 5
        ");
        $stmtRecentExp->execute([$userId]);
        $recentExpenses = $stmtRecentExp->fetchAll();


        $recentTransactions = array_merge($recentIncomes, $recentExpenses);
        usort($recentTransactions, function($a, $b) {
            return strtotime($b['data']) - strtotime($a['data']);
        });
        $recentTransactions = array_slice($recentTransactions, 0, 10);

        header('Content-Type: application/json');
        echo json_encode([
            "saldo_atual" => (float) $saldoAtual,
            "total_receitas" => (float) $totalIncome,
            "total_despesas" => (float) $totalExpense,
            "distribuicao_gastos" => $distribuicao,
            "distribuicao_receitas" => $distribuicaoReceitas,
            "metas" => [
                "total" => count($goals),
                "valor_alvo_total" => (float) $goalsTotal,
                "valor_atual_total" => (float) $goalsProgress,
                "progresso_percentual" => $goalsTotal > 0 ? round(($goalsProgress / $goalsTotal) * 100, 1) : 0
            ],
            "transacoes_recentes" => $recentTransactions
        ]);
    }

    public function getMonthlyHistory() {
        $userId = Middleware::auth();

        $months = isset($_GET['meses']) ? (int) $_GET['meses'] : 6;
        $months = max(1, min(24, $months)); // Clamp between 1 and 24

        $history = FinancialHistory::getMonthlyHistory($userId, $months);

        header('Content-Type: application/json');
        echo json_encode($history);
    }
}
