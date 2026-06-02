<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
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
        $this->assertDatabaseHas('incomes', [
            'id' => $income['id'],
            'description' => 'Salario',
        ]);

        $expense = $this->withToken($token)->postJson('/api/expenses', [
            'valor' => 860.50,
            'data' => '2026-05-23',
            'descricao' => 'Mercado',
            'id_categoria' => $expenseCategory,
        ])->assertCreated()
            ->json('data.expense');
        $this->assertDatabaseHas('expenses', [
            'id' => $expense['id'],
            'description' => 'Mercado',
        ]);

        $this->withToken($token)
            ->getJson('/api/incomes/'.$income['id'])
            ->assertOk()
            ->assertJsonPath('data.income.id', $income['id']);

        $this->withToken($token)
            ->getJson('/api/expenses/'.$expense['id'])
            ->assertOk()
            ->assertJsonPath('data.expense.id', $expense['id']);

        $this->withToken($token)->putJson('/api/incomes/'.$income['id'], [
            'valor' => 5300,
            'data' => '2026-05-23',
            'descricao' => 'Salario ajustado',
            'id_categoria' => $incomeCategory,
        ])->assertOk()
            ->assertJsonPath('data.income.descricao', 'Salario ajustado');
        $this->assertDatabaseHas('incomes', [
            'id' => $income['id'],
            'description' => 'Salario ajustado',
        ]);

        $this->withToken($token)->putJson('/api/expenses/'.$expense['id'], [
            'valor' => 800.50,
            'data' => '2026-05-23',
            'descricao' => 'Mercado mensal',
            'id_categoria' => $expenseCategory,
        ])->assertOk()
            ->assertJsonPath('data.expense.descricao', 'Mercado mensal');
        $this->assertDatabaseHas('expenses', [
            'id' => $expense['id'],
            'description' => 'Mercado mensal',
        ]);

        $goal = $this->withToken($token)->postJson('/api/goals', [
            'titulo' => 'Reserva',
            'valor_alvo' => 10000,
            'valor_atual' => 1800,
            'data_limite' => '2026-12-31',
        ])->assertCreated()
            ->json('data.goal');
        $this->assertDatabaseHas('financial_goals', [
            'id' => $goal['id_meta'],
            'title' => 'Reserva',
        ]);

        $this->withToken($token)->putJson('/api/goals/'.$goal['id_meta'], [
            'titulo' => 'Reserva ajustada',
            'valor_alvo' => 10000,
            'valor_atual' => 2500,
            'data_limite' => '2026-12-31',
            'id_categoria' => null,
        ])->assertOk()
            ->assertJsonPath('data.goal.titulo', 'Reserva ajustada')
            ->assertJsonPath('data.goal.valor_atual', 2500);
        $this->assertDatabaseHas('financial_goals', [
            'id' => $goal['id_meta'],
            'title' => 'Reserva ajustada',
            'current_amount' => 2500,
        ]);

        $this->withToken($token)
            ->getJson('/api/goals/'.$goal['id_meta'])
            ->assertOk()
            ->assertJsonPath('data.goal.id_meta', $goal['id_meta']);

        $customCategory = $this->withToken($token)->postJson('/api/categories', [
            'nome' => 'Freelas',
            'tipo' => 'income',
        ])->assertCreated()
            ->json('data.category');
        $this->assertDatabaseHas('categories', [
            'id' => $customCategory['id_categoria'],
            'name' => 'Freelas',
        ]);

        $this->withToken($token)->putJson('/api/categories/'.$customCategory['id_categoria'], [
            'nome' => 'Freelas Premium',
            'tipo' => 'income',
        ])->assertOk()
            ->assertJsonPath('data.category.nome', 'Freelas Premium');
        $this->assertDatabaseHas('categories', [
            'id' => $customCategory['id_categoria'],
            'name' => 'Freelas Premium',
        ]);

        $this->withToken($token)
            ->getJson('/api/categories/'.$customCategory['id_categoria'])
            ->assertOk()
            ->assertJsonPath('data.category.id_categoria', $customCategory['id_categoria']);

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

        $this->withToken($token)
            ->deleteJson('/api/goals/'.$goal['id_meta'])
            ->assertOk();
        $this->assertDatabaseMissing('financial_goals', [
            'id' => $goal['id_meta'],
        ]);

        $this->withToken($token)
            ->deleteJson('/api/incomes/'.$income['id'])
            ->assertOk();
        $this->assertDatabaseMissing('incomes', [
            'id' => $income['id'],
        ]);

        $this->withToken($token)
            ->deleteJson('/api/expenses/'.$expense['id'])
            ->assertOk();
        $this->assertDatabaseMissing('expenses', [
            'id' => $expense['id'],
        ]);

        $this->withToken($token)
            ->deleteJson('/api/categories/'.$customCategory['id_categoria'])
            ->assertOk();
        $this->assertDatabaseMissing('categories', [
            'id' => $customCategory['id_categoria'],
        ]);
    }

    public function test_seeded_admin_can_access_admin_overview(): void
    {
        $this->seed();

        $adminToken = $this->postJson('/api/auth/login', [
            'email' => 'admin@saldoo.com',
            'senha' => 'Admin@2026',
        ])->assertOk()
            ->assertJsonPath('data.user.papel', 'admin')
            ->json('data.token');

        $userToken = $this->postJson('/api/auth/login', [
            'email' => 'carlos.silva@saldoo.com',
            'senha' => 'User@2026',
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

    public function test_seeded_user_has_demo_financial_dataset_until_current_month(): void
    {
        $this->seed();

        $user = User::query()->where('email', 'carlos.silva@saldoo.com')->firstOrFail();
        $firstIncome = Income::query()->where('user_id', $user->id)->oldest('occurred_on')->first();
        $firstExpense = Expense::query()->where('user_id', $user->id)->oldest('occurred_on')->first();
        $lastIncome = Income::query()->where('user_id', $user->id)->latest('occurred_on')->first();
        $lastExpense = Expense::query()->where('user_id', $user->id)->latest('occurred_on')->first();

        $this->assertNotNull($firstIncome);
        $this->assertNotNull($firstExpense);
        $this->assertNotNull($lastIncome);
        $this->assertNotNull($lastExpense);

        $this->assertTrue($firstIncome->occurred_on->format('Y-m') === '2025-01');
        $this->assertTrue($firstExpense->occurred_on->format('Y-m') === '2025-01');
        $this->assertTrue($lastIncome->occurred_on->format('Y-m') === now()->format('Y-m'));
        $this->assertTrue($lastExpense->occurred_on->format('Y-m') === now()->format('Y-m'));
    }

    public function test_seeded_user_core_endpoints_are_accessible_without_runtime_errors(): void
    {
        $this->seed();

        $token = $this->postJson('/api/auth/login', [
            'email' => 'carlos.silva@saldoo.com',
            'senha' => 'User@2026',
        ])->assertOk()
            ->json('data.token');

        $month = now()->month;
        $year = now()->year;

        $this->withToken($token)
            ->getJson('/api/users/me')
            ->assertOk()
            ->assertJsonPath('data.user.email', 'carlos.silva@saldoo.com');

        $this->withToken($token)
            ->getJson('/api/dashboard?mes='.$month.'&ano='.$year)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'dashboard' => [
                        'saldo_atual',
                        'total_receitas',
                        'total_despesas',
                        'taxa_economia',
                        'distribuicao_gastos',
                        'distribuicao_receitas',
                        'metas',
                        'transacoes_recentes',
                    ],
                ],
            ]);

        $this->withToken($token)
            ->getJson('/api/dashboard/history?meses=6')
            ->assertOk()
            ->assertJsonCount(6, 'data.history');

        $this->withToken($token)
            ->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.categories.0.id_categoria', fn ($value) => is_int($value));

        $this->withToken($token)
            ->getJson('/api/incomes?mes='.$month.'&ano='.$year)
            ->assertOk()
            ->assertJsonPath('data.incomes.0.id', fn ($value) => is_int($value));

        $this->withToken($token)
            ->getJson('/api/expenses?mes='.$month.'&ano='.$year)
            ->assertOk()
            ->assertJsonPath('data.expenses.0.id', fn ($value) => is_int($value));

        $this->withToken($token)
            ->getJson('/api/goals')
            ->assertOk()
            ->assertJsonPath('data.goals.0.id_meta', fn ($value) => is_int($value));

        $this->withToken($token)
            ->getJson('/api/score')
            ->assertOk()
            ->assertJsonPath('data.score.score', fn ($value) => is_int($value));

        $this->withToken($token)
            ->postJson('/api/chat', ['mensagem' => 'Me de um resumo financeiro rapido'])
            ->assertOk()
            ->assertJsonPath('data.chat.resposta', fn ($value) => is_string($value) && mb_strlen($value) > 0);
    }

    public function test_chat_returns_friendly_fallback_when_provider_is_missing(): void
    {
        $this->seed();

        config()->set('services.ai.endpoint', null);
        config()->set('services.ai.token', null);

        $token = $this->postJson('/api/auth/login', [
            'email' => 'carlos.silva@saldoo.com',
            'senha' => 'User@2026',
        ])->assertOk()
            ->json('data.token');

        $this->withToken($token)
            ->postJson('/api/chat', ['mensagem' => 'Como melhorar meu score?'])
            ->assertOk()
            ->assertJsonPath(
                'data.chat.resposta',
                'Assistente temporariamente indisponível. Verifique a configuração da API.',
            );
    }
}
