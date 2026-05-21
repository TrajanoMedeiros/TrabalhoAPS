<?php

class Middleware {

    /**
     * Authenticate the request and return the user ID.
     * If authentication fails, sends a 401 response and exits.
     *
     * @return int The authenticated user's ID
     */
    public static function auth() {
        $headers = self::getAuthorizationHeader();

        if (!$headers) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Authorization header missing"]);
            exit;
        }

        $token = str_replace('Bearer ', '', $headers);
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Invalid token format"]);
            exit;
        }

        // Verify signature
        $signature = hash_hmac('sha256', "{$parts[0]}.{$parts[1]}", 'secret_key', true);
        if (base64_encode($signature) !== $parts[2]) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Invalid token signature"]);
            exit;
        }

        $payload = json_decode(base64_decode($parts[1]), true);

        if (!$payload || !isset($payload['user_id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Invalid token payload"]);
            exit;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(["error" => "Token expired"]);
            exit;
        }

        return (int) $payload['user_id'];
    }

    /**
     * Get the Authorization header from the request.
     *
     * @return string|null
     */
    private static function getAuthorizationHeader() {
        // Try apache_request_headers first
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization'])) {
                return $headers['Authorization'];
            }
            // Also check lowercase (some servers normalize)
            if (isset($headers['authorization'])) {
                return $headers['authorization'];
            }
        }

        // Fallback to $_SERVER
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        return null;
    }
}
