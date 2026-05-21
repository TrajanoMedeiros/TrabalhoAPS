<?php

class CategoryController {
    
    public function index() {
        $userId = Middleware::auth();

        $categories = Category::findAll();

        header('Content-Type: application/json');
        echo json_encode($categories);
    }

    public function show($id) {
        $userId = Middleware::auth();

        $category = Category::findById($id);
        if (!$category) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Category not found"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode($category);
    }

    public function store() {
        $userId = Middleware::auth();

        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nome'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Missing required field: nome"]);
            return;
        }

        $category = Category::create($data['nome']);

        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Category created successfully", "data" => $category]);
    }

    public function update($id) {
        $userId = Middleware::auth();

        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nome'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Missing required field: nome"]);
            return;
        }

        $rowCount = Category::update($id, $data['nome']);
        if ($rowCount === 0) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Category not found"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(["message" => "Category updated successfully"]);
    }

    public function destroy($id) {
        $userId = Middleware::auth();

        $rowCount = Category::delete($id);
        if ($rowCount === 0) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Category not found"]);
            return;
        }

        header('Content-Type: application/json');
        echo json_encode(["message" => "Category deleted successfully"]);
    }
}
