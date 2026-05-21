<?php

require_once __DIR__ . '/../Database.php';

class User
{
    /**
     * Find a user by ID (excludes password).
     */
    public static function findById(int $id): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT id_usuario, nome, email, created_at
             FROM users
             WHERE id_usuario = :id'
        );
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Find a user by email (includes password hash for authentication).
     */
    public static function findByEmail(string $email): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'SELECT * FROM users WHERE email = :email'
        );
        $stmt->execute([':email' => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Create a new user and return the generated ID.
     */
    public static function create(string $nome, string $email, string $senhaHash): int|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO users (nome, email, senha)
             VALUES (:nome, :email, :senha)
             RETURNING id_usuario'
        );
        $stmt->execute([
            ':nome'  => $nome,
            ':email' => $email,
            ':senha' => $senhaHash,
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int) $row['id_usuario'] : false;
    }

    /**
     * Update user profile fields (nome, email).
     */
    public static function update(int $id, array $data): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE users
             SET nome = :nome, email = :email
             WHERE id_usuario = :id'
        );
        $stmt->execute([
            ':nome'  => $data['nome'],
            ':email' => $data['email'],
            ':id'    => $id,
        ]);

        return $stmt->rowCount();
    }

    /**
     * Update the user's password.
     */
    public static function updatePassword(int $id, string $senhaHash): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE users SET senha = :senha WHERE id_usuario = :id'
        );
        $stmt->execute([
            ':senha' => $senhaHash,
            ':id'    => $id,
        ]);

        return $stmt->rowCount();
    }

    /**
     * Delete a user by ID.
     */
    public static function delete(int $id): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'DELETE FROM users WHERE id_usuario = :id'
        );
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount();
    }
}
