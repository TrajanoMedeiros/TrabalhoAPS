<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSharedCategories();
        $this->seedDemoUsers();

        $this->call(DemoDatasetSeeder::class);
    }

    private function seedSharedCategories(): void
    {
        collect([
            ['name' => 'Salario', 'type' => 'income'],
            ['name' => 'Freelance', 'type' => 'income'],
            ['name' => 'Bonus', 'type' => 'income'],
            ['name' => 'Investimentos', 'type' => 'income'],
            ['name' => 'Rendimentos', 'type' => 'income'],
            ['name' => 'Reembolso', 'type' => 'income'],
            ['name' => 'Alimentacao', 'type' => 'expense'],
            ['name' => 'Transporte', 'type' => 'expense'],
            ['name' => 'Moradia', 'type' => 'expense'],
            ['name' => 'Internet', 'type' => 'expense'],
            ['name' => 'Energia', 'type' => 'expense'],
            ['name' => 'Saude', 'type' => 'expense'],
            ['name' => 'Educacao', 'type' => 'expense'],
            ['name' => 'Lazer', 'type' => 'expense'],
            ['name' => 'Assinaturas', 'type' => 'expense'],
            ['name' => 'Outros', 'type' => 'both'],
        ])->each(fn (array $category): Category => Category::query()->firstOrCreate([
            'user_id' => null,
            'name' => $category['name'],
            'type' => $category['type'],
        ]));
    }

    private function seedDemoUsers(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@saldoo.com'],
            [
                'name' => 'Administrador Saldoo',
                'password' => 'Admin@2026',
                'account_type' => 'business',
                'role' => User::ROLE_ADMIN,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'carlos.silva@saldoo.com'],
            [
                'name' => 'Carlos Henrique Silva',
                'password' => 'User@2026',
                'account_type' => 'personal',
                'role' => User::ROLE_USER,
            ],
        );
    }
}
