<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('type', 20)->default('both');
            $table->timestamps();

            $table->unique(['user_id', 'name', 'type']);
        });

        Schema::create('incomes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('occurred_on');
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'occurred_on']);
        });

        Schema::create('expenses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('occurred_on');
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'occurred_on']);
        });

        Schema::create('financial_goals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 120);
            $table->decimal('target_amount', 12, 2);
            $table->decimal('current_amount', 12, 2)->default(0);
            $table->date('due_on')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'due_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_goals');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('incomes');
        Schema::dropIfExists('categories');
    }
};
