<?php

class IncomeController {

    public function index() {
        $userId = Middleware::auth();

        $filters = [];
        if (isset($_GET['mes'])) $filters['mes'] = (int) $_GET['mes'];
        if (isset($_GET['ano'])) $filters['ano'] = (int) $_GET['ano'];

        $incomes = Income::findAllByUser($userId, $filters);

        header('Content-Type: application/json');
        echo json_encode($incomes);
    }

    public function show($id) {
        $userId = Middleware::auth();

        $income = Income::findById($id, $userId);
        if (!$income) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Income not found"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode($income);
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
        $income = Income::create($data);

        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Income created successfully", "data" => $income]);
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

        $rowCount = Income::update($id, $userId, $data);
        if ($rowCount === 0) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Income not found or not owned by user"]);
            return;
        }

        $income = Income::findById($id, $userId);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Income updated successfully", "data" => $income]);
    }

    public function destroy($id) {
        $userId = Middleware::auth();

        $rowCount = Income::delete($id, $userId);
        if ($rowCount === 0) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Income not found or not owned by user"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(["message" => "Income deleted successfully"]);
    }
}
