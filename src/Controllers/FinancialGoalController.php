<?php

class FinancialGoalController {

    public function index() {
        $userId = Middleware::auth();
        $goals = FinancialGoal::findAllByUser($userId);
        header('Content-Type: application/json');
        echo json_encode($goals);
    }

    public function show($id) {
        $userId = Middleware::auth();
        $goal = FinancialGoal::findById($id, $userId);
        if (!$goal) {
            http_response_code(404);
            echo json_encode(["error" => "Goal not found"]);
            return;
        }
        header('Content-Type: application/json');
        echo json_encode($goal);
    }

    public function store() {
        $userId = Middleware::auth();
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['titulo']) || !isset($data['valor_alvo'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields: titulo, valor_alvo"]);
            return;
        }

        $data['id_usuario'] = $userId;
        $goal = FinancialGoal::create($data);

        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Goal created successfully", "data" => $goal]);
    }

    public function update($id) {
        $userId = Middleware::auth();
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data)) {
            http_response_code(400);
            echo json_encode(["error" => "No data provided"]);
            return;
        }

        $rowCount = FinancialGoal::update($id, $userId, $data);
        if ($rowCount === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Goal not found or not owned by user"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(["message" => "Goal updated successfully"]);
    }

    public function destroy($id) {
        $userId = Middleware::auth();
        $rowCount = FinancialGoal::delete($id, $userId);
        if ($rowCount === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Goal not found or not owned by user"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(["message" => "Goal deleted successfully"]);
    }
}
