<?php

namespace App\Http\Requests;

use App\DTOs\GoalData;
use Illuminate\Foundation\Http\FormRequest;

class GoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'min:2', 'max:120'],
            'valor_alvo' => ['required', 'numeric', 'gt:0'],
            'valor_atual' => ['nullable', 'numeric', 'gte:0'],
            'data_limite' => ['nullable', 'date_format:Y-m-d'],
            'id_categoria' => ['nullable', 'integer', 'exists:categories,id'],
        ];
    }

    public function toDto(): GoalData
    {
        $data = $this->validated();

        return new GoalData(
            title: $data['titulo'],
            targetAmount: (float) $data['valor_alvo'],
            currentAmount: (float) ($data['valor_atual'] ?? 0),
            dueOn: $data['data_limite'] ?? null,
            categoryId: isset($data['id_categoria']) ? (int) $data['id_categoria'] : null,
        );
    }
}
