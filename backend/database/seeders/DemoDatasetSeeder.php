<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Expense;
use App\Models\FinancialGoal;
use App\Models\Income;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class DemoDatasetSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()
            ->where('email', 'carlos.silva@saldoo.com')
            ->first();

        if (! $user instanceof User) {
            return;
        }

        $categories = Category::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $user->id)
            ->get()
            ->keyBy('name');

        Income::query()->where('user_id', $user->id)->delete();
        Expense::query()->where('user_id', $user->id)->delete();
        FinancialGoal::query()->where('user_id', $user->id)->delete();

        $start = CarbonImmutable::create(2025, 1, 1)->startOfMonth();
        $end = CarbonImmutable::create(2026, 6, 1)->startOfMonth();
        $incomeTotal = 0.0;
        $expenseTotal = 0.0;

        $freelancePattern = [0, 520, 740, 0, 920, 610, 0, 860, 0, 1060, 680, 1280];
        $monthIndex = 0;

        for ($month = $start; $month->lessThanOrEqualTo($end); $month = $month->addMonth(), $monthIndex++) {
            $yearOffset = $month->year - 2025;

            $salary = 4900 + ($yearOffset * 560) + (int) floor(($month->month - 1) / 6) * 140;
            $freelance = $freelancePattern[$monthIndex % count($freelancePattern)] + ($yearOffset * 90);
            $investment = 140 + (($monthIndex + $month->month) % 4) * 22 + ($yearOffset * 35);
            $reimbursement = in_array($month->month, [2, 5, 8, 11], true) ? 180 + ($yearOffset * 25) : 0;
            $bonus = in_array($month->month, [3, 6, 12], true) ? 950 + ($yearOffset * 160) : 0;

            $incomeTotal += $this->createIncome($user, $categories, 'Salario', $salary, $month->day(5), 'Salário mensal');

            if ($freelance > 0) {
                $incomeTotal += $this->createIncome($user, $categories, 'Freelance', $freelance, $month->day(14), 'Projeto freelance');
            }

            $incomeTotal += $this->createIncome($user, $categories, 'Rendimentos', $investment, $month->day(22), 'Rendimentos de investimentos');

            if ($reimbursement > 0) {
                $incomeTotal += $this->createIncome($user, $categories, 'Reembolso', $reimbursement, $month->day(20), 'Reembolso de despesas');
            }

            if ($bonus > 0) {
                $incomeTotal += $this->createIncome($user, $categories, 'Bonus', $bonus, $month->day(27), 'Bônus por desempenho');
            }

            $rent = 1580 + ($yearOffset * 120) + (int) floor(($monthIndex % 6) * 14);
            $internet = 118 + ($yearOffset * 8);
            $energy = 176 + (($month->month % 4) * 16) + ($yearOffset * 12);
            $food = 820 + (($month->month % 3) * 52) + ($yearOffset * 42);
            $transport = 340 + (($monthIndex % 4) * 18) + ($yearOffset * 16);
            $health = ($month->month % 4 === 0 ? 315 : 185) + ($yearOffset * 14);
            $education = 220 + (($month->month % 2) * 38) + ($yearOffset * 16);
            $leisure = 210 + (($month->month % 5) * 24) + ($yearOffset * 18);
            $subscriptions = 98 + (($monthIndex % 3) * 12) + ($yearOffset * 8);

            $expenseTotal += $this->createExpense($user, $categories, 'Moradia', $rent, $month->day(7), 'Aluguel do apartamento');
            $expenseTotal += $this->createExpense($user, $categories, 'Internet', $internet, $month->day(10), 'Internet residencial');
            $expenseTotal += $this->createExpense($user, $categories, 'Energia', $energy, $month->day(12), 'Conta de energia');
            $expenseTotal += $this->createExpense($user, $categories, 'Alimentacao', $food, $month->day(15), 'Compras do mês');
            $expenseTotal += $this->createExpense($user, $categories, 'Transporte', $transport, $month->day(18), 'Transporte e deslocamentos');
            $expenseTotal += $this->createExpense($user, $categories, 'Saude', $health, $month->day(22), 'Plano de saúde e farmácia');
            $expenseTotal += $this->createExpense($user, $categories, 'Educacao', $education, $month->day(24), 'Curso e certificações');
            $expenseTotal += $this->createExpense($user, $categories, 'Lazer', $leisure, $month->day(27), 'Lazer e viagens curtas');
            $expenseTotal += $this->createExpense($user, $categories, 'Assinaturas', $subscriptions, $month->day(28), 'Assinaturas digitais');
        }

        $netCashFlow = max(0, round($incomeTotal - $expenseTotal, 2));

        $this->createGoal(
            $user,
            $categories,
            'Reserva de emergencia',
            30000,
            min(30000, round($netCashFlow * 0.34, 2)),
            $end->addMonths(8)->endOfMonth(),
            'Outros',
        );

        $this->createGoal(
            $user,
            $categories,
            'Troca de notebook',
            9000,
            min(9000, round($netCashFlow * 0.14, 2)),
            $end->addMonths(5)->endOfMonth(),
            'Educacao',
        );

        $this->createGoal(
            $user,
            $categories,
            'Viagem para o Nordeste',
            15000,
            min(15000, round($netCashFlow * 0.18, 2)),
            $end->addMonths(10)->endOfMonth(),
            'Lazer',
        );

        $this->createGoal(
            $user,
            $categories,
            'Entrada do apartamento',
            45000,
            min(45000, round($netCashFlow * 0.26, 2)),
            $end->addMonths(24)->endOfMonth(),
            'Moradia',
        );
    }

    private function createIncome(
        User $user,
        Collection $categories,
        string $categoryName,
        float $amount,
        CarbonImmutable $occurredOn,
        string $description,
    ): float {
        Income::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, $categoryName),
            'amount' => round($amount, 2),
            'occurred_on' => $occurredOn->toDateString(),
            'description' => $description,
        ]);

        return round($amount, 2);
    }

    private function createExpense(
        User $user,
        Collection $categories,
        string $categoryName,
        float $amount,
        CarbonImmutable $occurredOn,
        string $description,
    ): float {
        Expense::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, $categoryName),
            'amount' => round($amount, 2),
            'occurred_on' => $occurredOn->toDateString(),
            'description' => $description,
        ]);

        return round($amount, 2);
    }

    private function createGoal(
        User $user,
        Collection $categories,
        string $title,
        float $targetAmount,
        float $currentAmount,
        CarbonImmutable $dueOn,
        string $categoryName,
    ): void {
        FinancialGoal::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, $categoryName),
            'title' => $title,
            'target_amount' => round($targetAmount, 2),
            'current_amount' => round($currentAmount, 2),
            'due_on' => $dueOn->toDateString(),
        ]);
    }

    private function categoryId(Collection $categories, string $name): int
    {
        /** @var Category|null $category */
        $category = $categories->get($name);

        if (! $category instanceof Category) {
            $category = Category::query()->firstOrCreate([
                'user_id' => null,
                'name' => $name,
                'type' => 'both',
            ]);

            $categories->put($name, $category);
        }

        return (int) $category->id;
    }
}
