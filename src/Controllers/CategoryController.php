<?php

class CategoryController {
    
    public function index() {
        $userId = AuthController::getAuthenticatedUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM categories");
        $categories = $stmt->fetchAll();

        header('Content-Type: application/json');
        echo json_encode($categories);
    }
}
