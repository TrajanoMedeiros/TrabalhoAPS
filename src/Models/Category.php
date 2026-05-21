<?php

require_once __DIR__ . '/../Database.php';

class Category
{
    /**
     * Retrieve all categories ordered by name.
     */
    public static function findAll(): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query('SELECT * FROM categories ORDER BY nome');

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find a single category by ID.
     */
    public static function findById(int $id): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM categories WHERE id_categoria = :id');
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Create a new category.
     */
    public static function create(string $nome): array|false
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO categories (nome) VALUES (:nome) RETURNING *'
        );
        $stmt->execute([':nome' => $nome]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    /**
     * Update a category name.
     */
    public static function update(int $id, string $nome): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare(
            'UPDATE categories SET nome = :nome WHERE id_categoria = :id'
        );
        $stmt->execute([
            ':nome' => $nome,
            ':id'   => $id,
        ]);

        return $stmt->rowCount();
    }

    /**
     * Delete a category by ID.
     */
    public static function delete(int $id): int
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM categories WHERE id_categoria = :id');
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount();
    }
}
