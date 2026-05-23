<?php

namespace App\Http\Requests;

use App\DTOs\TransactionData;
use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'valor' => ['required', 'numeric', 'gt:0'],
            'data' => ['required', 'date_format:Y-m-d'],
            'descricao' => ['nullable', 'string', 'max:500'],
            'id_categoria' => ['required', 'integer', 'exists:categories,id'],
        ];
    }

    public function toDto(): TransactionData
    {
        $data = $this->validated();

        return new TransactionData(
            amount: (float) $data['valor'],
            occurredOn: $data['data'],
            description: $data['descricao'] ?? null,
            categoryId: (int) $data['id_categoria'],
        );
    }
}
