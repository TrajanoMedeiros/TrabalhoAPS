<?php

class UserController {

    public function show() {
        $userId = Middleware::auth();
        $user = User::findById($userId);
        if (!$user) {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
            return;
        }
        header('Content-Type: application/json');
        echo json_encode($user);
    }

    public function update() {
        $userId = Middleware::auth();
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data)) {
            http_response_code(400);
            echo json_encode(["error" => "No data provided"]);
            return;
        }

       
        $allowed = [];
        if (isset($data['nome'])) $allowed['nome'] = $data['nome'];
        if (isset($data['email'])) $allowed['email'] = $data['email'];

        if (empty($allowed)) {
            http_response_code(400);
            echo json_encode(["error" => "No valid fields to update (allowed: nome, email)"]);
            return;
        }

         
        if (isset($allowed['email'])) {
            $existing = User::findByEmail($allowed['email']);
            if ($existing && $existing['id_usuario'] != $userId) {
                http_response_code(400);
                echo json_encode(["error" => "Email already in use"]);
                return;
            }
        }

        User::update($userId, $allowed);
        $user = User::findById($userId);

        header('Content-Type: application/json');
        echo json_encode(["message" => "Profile updated successfully", "data" => $user]);
    }

    public function changePassword() {
        $userId = Middleware::auth();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['senha_atual']) || !isset($data['nova_senha'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields: senha_atual, nova_senha"]);
            return;
        }

        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT senha FROM users WHERE id_usuario = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($data['senha_atual'], $row['senha'])) {
            http_response_code(400);
            echo json_encode(["error" => "Current password is incorrect"]);
            return;
        }

        $newHash = password_hash($data['nova_senha'], PASSWORD_DEFAULT);
        User::updatePassword($userId, $newHash);

        header('Content-Type: application/json');
        echo json_encode(["message" => "Password changed successfully"]);
    }

    public function destroy() {
        $userId = Middleware::auth();
        User::delete($userId);

        header('Content-Type: application/json');
        echo json_encode(["message" => "Account deleted successfully"]);
    }
}
