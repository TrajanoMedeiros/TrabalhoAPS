<?php

class ScoreController {

    public function getScore() {
        $userId = AuthController::getAuthenticatedUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $pdo = Database::getConnection();

        // Calculate Total Income
        $stmtIn = $pdo->prepare("SELECT SUM(valor) as total FROM incomes WHERE id_usuario = ?");
        $stmtIn->execute([$userId]);
        $totalIncome = $stmtIn->fetch()['total'] ?? 0;

        // Calculate Total Expenses
        $stmtOut = $pdo->prepare("SELECT SUM(valor) as total FROM expenses WHERE id_usuario = ?");
        $stmtOut->execute([$userId]);
        $totalExpense = $stmtOut->fetch()['total'] ?? 0;

        // Score Logic
        $baseScore = 500;
        $score = $baseScore;

        if ($totalIncome > 0) {
            $margin = $totalIncome - $totalExpense;
            
            if ($margin > 0) {
                // Positive behavior: Savings
                $savingsRatio = $margin / $totalIncome;
                // Add up to 300 points if they save a lot
                $score += min(300, 300 * $savingsRatio);
            } else {
                // Negative behavior: Debt
                $debtRatio = abs($margin) / $totalIncome;
                // Subtract up to 400 points
                $score -= min(400, 400 * $debtRatio);
            }

            // Consistency Bonus (if they have more than 5 transactions)
            $stmtCount = $pdo->prepare("SELECT COUNT(*) as qtd FROM incomes WHERE id_usuario = ?");
            $stmtCount->execute([$userId]);
            $countIn = $stmtCount->fetch()['qtd'] ?? 0;

            $stmtCountOut = $pdo->prepare("SELECT COUNT(*) as qtd FROM expenses WHERE id_usuario = ?");
            $stmtCountOut->execute([$userId]);
            $countOut = $stmtCountOut->fetch()['qtd'] ?? 0;

            if (($countIn + $countOut) >= 5) {
                $score += 50; // Active user bonus
            }

        } else if ($totalExpense > 0) {
            // Expenses but no income = very bad
            $score -= 300;
        }

        // Ensure score is between 0 and 1000
        $finalScore = max(0, min(1000, round($score)));

        header('Content-Type: application/json');
        echo json_encode([
            "score" => $finalScore,
            "details" => [
                "total_incomes" => (float) $totalIncome,
                "total_expenses" => (float) $totalExpense
            ],
            "message" => "Score calculado com base no histórico do usuário."
        ]);
    }
}
