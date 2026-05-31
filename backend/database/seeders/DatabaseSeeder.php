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
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
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
            ['name' => 'Outros', 'type' => 'both'],
        ])->each(fn (array $category): Category => Category::query()->firstOrCreate([
            'user_id' => null,
            'name' => $category['name'],
            'type' => $category['type'],
        ]));

        User::query()->updateOrCreate(
            ['email' => 'admin@saldoo.local'],
            [
                'name' => 'Admin Saldoo',
                'password' => 'Admin@123456',
                'account_type' => 'business',
                'role' => User::ROLE_ADMIN,
            ],
        );

        $demoUser = User::query()->updateOrCreate(
            ['email' => 'usuario@saldoo.local'],
            [
                'name' => 'Usuario Saldoo',
                'password' => 'Usuario@123456',
                'account_type' => 'personal',
                'role' => User::ROLE_USER,
            ],
        );

        $this->seedDemoFinancialDataset($demoUser);
    }

    private function seedDemoFinancialDataset(User $user): void
    {
        $categories = Category::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $user->id)
            ->get()
            ->keyBy('name');

        Income::query()->where('user_id', $user->id)->delete();
        Expense::query()->where('user_id', $user->id)->delete();
        FinancialGoal::query()->where('user_id', $user->id)->delete();

        $start = CarbonImmutable::create(2025, 1, 1)->startOfMonth();
        $end = CarbonImmutable::instance(now())->startOfMonth();

        $freelancePattern = [0, 450, 620, 0, 880, 520, 0, 740, 0, 980, 640, 1200];

        $monthIndex = 0;
        for ($month = $start; $month->lessThanOrEqualTo($end); $month = $month->addMonth(), $monthIndex++) {
            $yearOffset = $month->year - 2025;
            $salary = 4700 + ($yearOffset * 520) + (int) floor(($month->month - 1) / 6) * 120;
            $freelance = $freelancePattern[$monthIndex % count($freelancePattern)] + ($yearOffset * 90);
            $investment = 120 + (($month->month + $monthIndex) % 5) * 18 + ($yearOffset * 25);
            $bonus = in_array($month->month, [3, 6, 12], true) ? 900 + ($yearOffset * 140) : 0;

            $this->createIncome($user, $categories, 'Salario', $salary, $month->day(5), 'Salario mensal');
            if ($freelance > 0) {
                $this->createIncome($user, $categories, 'Freelance', $freelance, $month->day(18), 'Freelances');
            }
            $this->createIncome($user, $categories, 'Rendimentos', $investment, $month->day(26), 'Rendimentos');
            if ($bonus > 0) {
                $this->createIncome($user, $categories, 'Bonus', $bonus, $month->day(20), 'Bonus trimestral');
            }

            $rent = 1500 + ($yearOffset * 110);
            $internet = 110 + ($yearOffset * 8);
            $energy = 170 + (($month->month % 4) * 18) + ($yearOffset * 12);
            $food = 780 + (($month->month % 3) * 55) + ($yearOffset * 45);
            $transport = 320 + (($monthIndex % 4) * 22) + ($yearOffset * 18);
            $health = ($month->month % 4 === 0 ? 320 : 170) + ($yearOffset * 14);
            $education = 210 + (($month->month % 2) * 40) + ($yearOffset * 16);
            $leisure = 190 + (($month->month % 5) * 28) + ($yearOffset * 20);

            $this->createExpense($user, $categories, 'Moradia', $rent, $month->day(8), 'Moradia');
            $this->createExpense($user, $categories, 'Internet', $internet, $month->day(11), 'Internet residencial');
            $this->createExpense($user, $categories, 'Energia', $energy, $month->day(12), 'Conta de energia');
            $this->createExpense($user, $categories, 'Alimentacao', $food, $month->day(14), 'Alimentacao');
            $this->createExpense($user, $categories, 'Transporte', $transport, $month->day(16), 'Transporte');
            $this->createExpense($user, $categories, 'Saude', $health, $month->day(22), 'Saude');
            $this->createExpense($user, $categories, 'Educacao', $education, $month->day(23), 'Educacao');
            $this->createExpense($user, $categories, 'Lazer', $leisure, $month->day(27), 'Lazer');
        }

        FinancialGoal::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, 'Outros'),
            'title' => 'Reserva de emergencia',
            'target_amount' => 20000,
            'current_amount' => 9800,
            'due_on' => Carbon::instance($end->addMonths(8))->toDateString(),
        ]);

        FinancialGoal::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, 'Educacao'),
            'title' => 'Pos-graduacao',
            'target_amount' => 12000,
            'current_amount' => 4300,
            'due_on' => Carbon::instance($end->addMonths(14))->toDateString(),
        ]);
    }

    private function createIncome(
        User $user,
        Collection $categories,
        string $categoryName,
        float $amount,
        CarbonImmutable $occurredOn,
        string $description,
    ): void {
        Income::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, $categoryName),
            'amount' => round($amount, 2),
            'occurred_on' => $occurredOn->toDateString(),
            'description' => $description,
        ]);
    }

    private function createExpense(
        User $user,
        Collection $categories,
        string $categoryName,
        float $amount,
        CarbonImmutable $occurredOn,
        string $description,
    ): void {
        Expense::query()->create([
            'user_id' => $user->id,
            'category_id' => $this->categoryId($categories, $categoryName),
            'amount' => round($amount, 2),
            'occurred_on' => $occurredOn->toDateString(),
            'description' => $description,
        ]);
    }

    private function categoryId(Collection $categories, string $name): int
    {
        /** @var Category|null $category */
        $category = $categories->get($name);

        if (! $category) {
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
