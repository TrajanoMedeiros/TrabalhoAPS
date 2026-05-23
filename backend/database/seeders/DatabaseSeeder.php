<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['name' => 'Salario', 'type' => 'income'],
            ['name' => 'Freelance', 'type' => 'income'],
            ['name' => 'Investimentos', 'type' => 'income'],
            ['name' => 'Reembolso', 'type' => 'income'],
            ['name' => 'Alimentacao', 'type' => 'expense'],
            ['name' => 'Transporte', 'type' => 'expense'],
            ['name' => 'Moradia', 'type' => 'expense'],
            ['name' => 'Saude', 'type' => 'expense'],
            ['name' => 'Educacao', 'type' => 'expense'],
            ['name' => 'Lazer', 'type' => 'expense'],
            ['name' => 'Outros', 'type' => 'both'],
        ])->each(fn (array $category): Category => Category::query()->firstOrCreate([
            'user_id' => null,
            'name' => $category['name'],
            'type' => $category['type'],
        ]));
    }
}
