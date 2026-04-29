<?php

class DashboardController {

    public function getDashboard() {
        $userId = AuthController::getAuthenticatedUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $pdo = Database::getConnection();

        // Saldo atual (RF05)
        $stmtIn = $pdo->prepare("SELECT SUM(valor) as total FROM incomes WHERE id_usuario = ?");
        $stmtIn->execute([$userId]);
        $totalIncome = $stmtIn->fetch()['total'] ?? 0;

        $stmtOut = $pdo->prepare("SELECT SUM(valor) as total FROM expenses WHERE id_usuario = ?");
        $stmtOut->execute([$userId]);
        $totalExpense = $stmtOut->fetch()['total'] ?? 0;

        $saldoAtual = $totalIncome - $totalExpense;

        // Distribuição de gastos por categoria (RF07)
        $stmtDist = $pdo->prepare("
            SELECT c.nome as categoria, SUM(d.valor) as total 
            FROM expenses d 
            JOIN categories c ON d.id_categoria = c.id_categoria 
            WHERE d.id_usuario = ? 
            GROUP BY c.nome
        ");
        $stmtDist->execute([$userId]);
        $distribuicao = $stmtDist->fetchAll();

        header('Content-Type: application/json');
        echo json_encode([
            "saldo_atual" => (float) $saldoAtual,
            "total_receitas" => (float) $totalIncome,
            "total_despesas" => (float) $totalExpense,
            "distribuicao_gastos" => $distribuicao
        ]);
    }
}
