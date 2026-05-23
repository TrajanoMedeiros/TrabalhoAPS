<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_manage_financial_flow(): void
    {
        $this->seed();

        $token = $this->postJson('/api/auth/register', [
            'nome' => 'Teste Saldoo',
            'email' => 'teste@saldoo.local',
            'senha' => 'Senha123',
            'tipo_usuario' => 'personal',
        ])->assertCreated()
            ->json('data.token');

        $categories = $this->withToken($token)
            ->getJson('/api/categories')
            ->assertOk()
            ->json('data.categories');

        $incomeCategory = collect($categories)->firstWhere('tipo', 'income')['id_categoria'];
        $expenseCategory = collect($categories)->firstWhere('tipo', 'expense')['id_categoria'];

        $this->withToken($token)->postJson('/api/incomes', [
            'valor' => 5200,
            'data' => '2026-05-23',
            'descricao' => 'Salario',
            'id_categoria' => $incomeCategory,
        ])->assertCreated();

        $this->withToken($token)->postJson('/api/expenses', [
            'valor' => 860.50,
            'data' => '2026-05-23',
            'descricao' => 'Mercado',
            'id_categoria' => $expenseCategory,
        ])->assertCreated();

        $this->withToken($token)->postJson('/api/goals', [
            'titulo' => 'Reserva',
            'valor_alvo' => 10000,
            'valor_atual' => 1800,
            'data_limite' => '2026-12-31',
        ])->assertCreated();

        $this->withToken($token)
            ->getJson('/api/dashboard?mes=5&ano=2026')
            ->assertOk()
            ->assertJsonPath('data.dashboard.saldo_atual', 4339.5)
            ->assertJsonPath('data.dashboard.metas.total', 1);

        $this->withToken($token)
            ->getJson('/api/score')
            ->assertOk()
            ->assertJsonStructure(['data' => ['score' => ['score', 'nivel', 'details', 'recomendacoes']]]);

        $this->withToken($token)
            ->postJson('/api/chat', ['mensagem' => 'Como melhorar meu score?'])
            ->assertOk()
            ->assertJsonStructure(['data' => ['chat' => ['resposta', 'contexto']]]);
    }
}
