<?php

class ScoreController {

    public function getScore() {
        $userId = Middleware::auth();

        $pdo = Database::getConnection();

        
        $totalIncome = Income::getTotal($userId);

        
        $totalExpense = Expense::getTotal($userId);

        // Logica do Score
        $baseScore = 500;
        $score = $baseScore;

        if ($totalIncome > 0) {
            $margin = $totalIncome - $totalExpense;
            
            if ($margin > 0) {
                
                $savingsRatio = $margin / $totalIncome;
                
                $score += min(300, 300 * $savingsRatio);
            } else {
                
                $debtRatio = abs($margin) / $totalIncome;
                
                $score -= min(400, 400 * $debtRatio);
            }

            
            $stmtCount = $pdo->prepare("SELECT COUNT(*) as qtd FROM incomes WHERE id_usuario = ?");
            $stmtCount->execute([$userId]);
            $countIn = $stmtCount->fetch()['qtd'] ?? 0;

            $stmtCountOut = $pdo->prepare("SELECT COUNT(*) as qtd FROM expenses WHERE id_usuario = ?");
            $stmtCountOut->execute([$userId]);
            $countOut = $stmtCountOut->fetch()['qtd'] ?? 0;

            if (($countIn + $countOut) >= 5) {
                $score += 50;
            }

            // Bonus por meta
            $goals = FinancialGoal::findAllByUser($userId);
            if (count($goals) > 0) {
                $score += 25; 
                $completedGoals = 0;
                foreach ($goals as $goal) {
                    if ((float)$goal['valor_atual'] >= (float)$goal['valor_alvo']) {
                        $completedGoals++;
                    }
                }
                if ($completedGoals > 0) {
                    $score += min(75, $completedGoals * 25); 
                }
            }

        } else if ($totalExpense > 0) {
            
            $score -= 300;
        }

        
        $finalScore = max(0, min(1000, round($score)));

        $level = 'Crítico';
        if ($finalScore >= 800) $level = 'Excelente';
        else if ($finalScore >= 600) $level = 'Bom';
        else if ($finalScore >= 400) $level = 'Regular';
        else if ($finalScore >= 200) $level = 'Ruim';

        header('Content-Type: application/json');
        echo json_encode([
            "score" => $finalScore,
            "nivel" => $level,
            "details" => [
                "total_incomes" => (float) $totalIncome,
                "total_expenses" => (float) $totalExpense,
                "saldo" => (float) ($totalIncome - $totalExpense)
            ],
            "message" => "Score calculado com base no histórico do usuário."
        ]);
    }
}
