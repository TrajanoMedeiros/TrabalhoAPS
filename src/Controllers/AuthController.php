<?php

class AuthController {
    
    // Simple mock JWT token generation for the "basico bem feito" requirement
    private function generateToken($userId) {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode(['user_id' => $userId, 'exp' => time() + 3600]));
        $signature = hash_hmac('sha256', "$header.$payload", 'secret_key', true);
        return "$header.$payload." . base64_encode($signature);
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['nome']) || !isset($data['email']) || !isset($data['senha'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields"]);
            return;
        }

        $pdo = Database::getConnection();
        
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id_usuario FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Email already in use"]);
            return;
        }

        $hashedPassword = password_hash($data['senha'], PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users (nome, email, senha) VALUES (?, ?, ?) RETURNING id_usuario");
        $stmt->execute([$data['nome'], $data['email'], $hashedPassword]);
        $user = $stmt->fetch();
        
        // Create history entry
        $stmtHistory = $pdo->prepare("INSERT INTO financial_histories (id_usuario) VALUES (?)");
        $stmtHistory->execute([$user['id_usuario']]);

        $token = $this->generateToken($user['id_usuario']);

        http_response_code(201);
        echo json_encode(["message" => "User registered successfully", "token" => $token]);
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['email']) || !isset($data['senha'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields"]);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id_usuario, senha FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['senha'], $user['senha'])) {
            $token = $this->generateToken($user['id_usuario']);
            echo json_encode(["message" => "Login successful", "token" => $token]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
        }
    }

    // Static helper to get authenticated user from request header
    public static function getAuthenticatedUserId() {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $parts = explode('.', $token);
            if (count($parts) === 3) {
                $payload = json_decode(base64_decode($parts[1]), true);
                if (isset($payload['user_id'])) {
                    return $payload['user_id'];
                }
            }
        }
        return null;
    }
}
