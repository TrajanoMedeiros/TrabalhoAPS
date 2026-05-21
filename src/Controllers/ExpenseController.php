<?php

class ExpenseController {

    public function index() {
        $userId = Middleware::auth();

        $filters = [];
        if (isset($_GET['mes'])) $filters['mes'] = (int) $_GET['mes'];
        if (isset($_GET['ano'])) $filters['ano'] = (int) $_GET['ano'];

        $expenses = Expense::findAllByUser($userId, $filters);

        header('Content-Type: application/json');
        echo json_encode($expenses);
    }

    public function show($id) {
        $userId = Middleware::auth();

        $expense = Expense::findById($id, $userId);
        if (!$expense) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Expense not found"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode($expense);
    }

    public function store() {
        $userId = Middleware::auth();

        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['valor']) || !isset($data['data']) || !isset($data['id_categoria'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Missing required fields: valor, data, id_categoria"]);
            return;
        }

        $data['id_usuario'] = $userId;
        $expense = Expense::create($data);

        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Expense created successfully", "data" => $expense]);
    }

    public function update($id) {
        $userId = Middleware::auth();

        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["error" => "No data provided"]);
            return;
        }

        $rowCount = Expense::update($id, $userId, $data);
        if ($rowCount === 0) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Expense not found or not owned by user"]);
            return;
        }

        $expense = Expense::findById($id, $userId);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Expense updated successfully", "data" => $expense]);
    }

    public function destroy($id) {
        $userId = Middleware::auth();

        $rowCount = Expense::delete($id, $userId);
        if ($rowCount === 0) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Expense not found or not owned by user"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(["message" => "Expense deleted successfully"]);
    }
}
