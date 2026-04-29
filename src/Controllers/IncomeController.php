<?php

class IncomeController {

    public function index() {
        $userId = AuthController::getAuthenticatedUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT r.*, c.nome as categoria_nome FROM incomes r LEFT JOIN categories c ON r.id_categoria = c.id_categoria WHERE r.id_usuario = ?");
        $stmt->execute([$userId]);
        $incomes = $stmt->fetchAll();

        header('Content-Type: application/json');
        echo json_encode($incomes);
    }

    public function store() {
        $userId = AuthController::getAuthenticatedUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['valor']) || !isset($data['data']) || !isset($data['id_categoria'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO incomes (valor, data, descricao, id_usuario, id_categoria) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['valor'], $data['data'], $data['descricao'] ?? null, $userId, $data['id_categoria']]);

        http_response_code(201);
        echo json_encode(["message" => "Income created successfully"]);
    }
}
