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
            ->assertJsonPath('data.user.papel', 'user')
            ->json('data.token');

        $categories = $this->withToken($token)
            ->getJson('/api/categories')
            ->assertOk()
            ->json('data.categories');

        $incomeCategory = collect($categories)->firstWhere('tipo', 'income')['id_categoria'];
        $expenseCategory = collect($categories)->firstWhere('tipo', 'expense')['id_categoria'];

        $income = $this->withToken($token)->postJson('/api/incomes', [
            'valor' => 5200,
            'data' => '2026-05-23',
            'descricao' => 'Salario',
            'id_categoria' => $incomeCategory,
        ])->assertCreated()
            ->json('data.income');

        $expense = $this->withToken($token)->postJson('/api/expenses', [
            'valor' => 860.50,
            'data' => '2026-05-23',
            'descricao' => 'Mercado',
            'id_categoria' => $expenseCategory,
        ])->assertCreated()
            ->json('data.expense');

        $this->withToken($token)->putJson('/api/incomes/'.$income['id'], [
            'valor' => 5300,
            'data' => '2026-05-23',
            'descricao' => 'Salario ajustado',
            'id_categoria' => $incomeCategory,
        ])->assertOk()
            ->assertJsonPath('data.income.descricao', 'Salario ajustado');

        $this->withToken($token)->putJson('/api/expenses/'.$expense['id'], [
            'valor' => 800.50,
            'data' => '2026-05-23',
            'descricao' => 'Mercado mensal',
            'id_categoria' => $expenseCategory,
        ])->assertOk()
            ->assertJsonPath('data.expense.descricao', 'Mercado mensal');

        $goal = $this->withToken($token)->postJson('/api/goals', [
            'titulo' => 'Reserva',
            'valor_alvo' => 10000,
            'valor_atual' => 1800,
            'data_limite' => '2026-12-31',
        ])->assertCreated()
            ->json('data.goal');

        $this->withToken($token)->putJson('/api/goals/'.$goal['id_meta'], [
            'titulo' => 'Reserva ajustada',
            'valor_alvo' => 10000,
            'valor_atual' => 2500,
            'data_limite' => '2026-12-31',
            'id_categoria' => null,
        ])->assertOk()
            ->assertJsonPath('data.goal.titulo', 'Reserva ajustada')
            ->assertJsonPath('data.goal.valor_atual', 2500);

        $customCategory = $this->withToken($token)->postJson('/api/categories', [
            'nome' => 'Freelas',
            'tipo' => 'income',
        ])->assertCreated()
            ->json('data.category');

        $this->withToken($token)->putJson('/api/categories/'.$customCategory['id_categoria'], [
            'nome' => 'Freelas Premium',
            'tipo' => 'income',
        ])->assertOk()
            ->assertJsonPath('data.category.nome', 'Freelas Premium');

        $this->withToken($token)
            ->getJson('/api/dashboard?mes=5&ano=2026')
            ->assertOk()
            ->assertJsonPath('data.dashboard.saldo_atual', 4499.5)
            ->assertJsonPath('data.dashboard.metas.total', 1);

        $this->withToken($token)
            ->getJson('/api/score')
            ->assertOk()
            ->assertJsonStructure(['data' => ['score' => ['score', 'nivel', 'details', 'recomendacoes']]]);

        $this->withToken($token)
            ->postJson('/api/chat', ['mensagem' => 'Como melhorar meu score?'])
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'chat' => [
                        'resposta',
                        'contexto' => [
                            'saldo_atual',
                            'total_receitas',
                            'total_despesas',
                            'score',
                            'nivel',
                            'metas',
                            'recomendacoes',
                            'tendencia',
                        ],
                    ],
                ],
            ]);
    }

    public function test_seeded_admin_can_access_admin_overview(): void
    {
        $this->seed();

        $adminToken = $this->postJson('/api/auth/login', [
            'email' => 'admin@saldoo.local',
            'senha' => 'Admin@123456',
        ])->assertOk()
            ->assertJsonPath('data.user.papel', 'admin')
            ->json('data.token');

        $userToken = $this->postJson('/api/auth/login', [
            'email' => 'usuario@saldoo.local',
            'senha' => 'Usuario@123456',
        ])->assertOk()
            ->assertJsonPath('data.user.papel', 'user')
            ->json('data.token');

        $this->withToken($userToken)
            ->getJson('/api/admin/overview')
            ->assertForbidden()
            ->assertJsonPath('error.message', 'Acesso restrito a administradores.');

        $this->withToken($adminToken)
            ->getJson('/api/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.overview.usuarios.administradores', 1)
            ->assertJsonStructure([
                'data' => [
                    'overview' => [
                        'usuarios' => ['total', 'administradores', 'comuns'],
                        'financeiro' => ['receitas_total', 'despesas_total', 'saldo_total', 'metas_total'],
                    ],
                ],
            ]);
    }
}
