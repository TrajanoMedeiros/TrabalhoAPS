<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\Request;
use App\Http\ValidationException;

final class Validator
{
    private array $errors = [];
    private array $clean = [];

    private function __construct(private readonly array $data)
    {
    }

    public static function make(array $data): self
    {
        return new self($data);
    }

    public static function periodFilters(Request $request): array
    {
        $filters = [];
        $month = $request->query('mes');
        $year = $request->query('ano');

        if ($month !== null && $month !== '') {
            $month = filter_var($month, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 12]]);
            if ($month === false) {
                throw new ValidationException('Filtro invalido.', ['mes' => 'Informe um mes entre 1 e 12.']);
            }
            $filters['mes'] = $month;
        }

        if ($year !== null && $year !== '') {
            $year = filter_var($year, FILTER_VALIDATE_INT, ['options' => ['min_range' => 2000, 'max_range' => 2100]]);
            if ($year === false) {
                throw new ValidationException('Filtro invalido.', ['ano' => 'Informe um ano entre 2000 e 2100.']);
            }
            $filters['ano'] = $year;
        }

        return $filters;
    }

    public function requiredString(string $field, string $label, int $max = 255, int $min = 1): self
    {
        $value = trim((string) ($this->data[$field] ?? ''));
        if ($value === '' || mb_strlen($value) < $min) {
            $this->errors[$field] = $label . ' e obrigatorio.';
            return $this;
        }

        if (mb_strlen($value) > $max) {
            $this->errors[$field] = $label . ' deve ter no maximo ' . $max . ' caracteres.';
            return $this;
        }

        $this->clean[$field] = $value;
        return $this;
    }

    public function optionalString(string $field, string $label, int $max = 255): self
    {
        if (!array_key_exists($field, $this->data) || $this->data[$field] === null || $this->data[$field] === '') {
            $this->clean[$field] = null;
            return $this;
        }

        $value = trim((string) $this->data[$field]);
        if (mb_strlen($value) > $max) {
            $this->errors[$field] = $label . ' deve ter no maximo ' . $max . ' caracteres.';
            return $this;
        }

        $this->clean[$field] = $value;
        return $this;
    }

    public function requiredEmail(string $field = 'email'): self
    {
        $value = strtolower(trim((string) ($this->data[$field] ?? '')));
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Informe um email valido.';
            return $this;
        }

        $this->clean[$field] = $value;
        return $this;
    }

    public function requiredPassword(string $field = 'senha', int $min = 8): self
    {
        $value = (string) ($this->data[$field] ?? '');
        if (mb_strlen($value) < $min) {
            $this->errors[$field] = 'A senha deve ter pelo menos ' . $min . ' caracteres.';
            return $this;
        }

        $this->clean[$field] = $value;
        return $this;
    }

    public function requiredMoney(string $field, string $label): self
    {
        return $this->money($field, $label, true);
    }

    public function optionalMoney(string $field, string $label): self
    {
        return $this->money($field, $label, false);
    }

    public function requiredDate(string $field, string $label): self
    {
        return $this->date($field, $label, true);
    }

    public function optionalDate(string $field, string $label): self
    {
        return $this->date($field, $label, false);
    }

    public function requiredInt(string $field, string $label, int $min = 1): self
    {
        return $this->integer($field, $label, true, $min);
    }

    public function optionalInt(string $field, string $label, int $min = 1): self
    {
        return $this->integer($field, $label, false, $min);
    }

    public function enum(string $field, array $allowed, ?string $default = null): self
    {
        $value = $this->data[$field] ?? $default;
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            $this->errors[$field] = 'Valor invalido.';
            return $this;
        }

        $this->clean[$field] = $value;
        return $this;
    }

    public function validate(): array
    {
        if ($this->errors !== []) {
            throw new ValidationException('Revise os campos informados.', $this->errors);
        }

        return $this->clean;
    }

    private function money(string $field, string $label, bool $required): self
    {
        $value = $this->data[$field] ?? null;
        if (($value === null || $value === '') && !$required) {
            $this->clean[$field] = null;
            return $this;
        }

        if (!is_numeric($value) || ($required && (float) $value <= 0) || (!$required && (float) $value < 0)) {
            $this->errors[$field] = $label . ' deve ser um valor positivo.';
            return $this;
        }

        $this->clean[$field] = round((float) $value, 2);
        return $this;
    }

    private function date(string $field, string $label, bool $required): self
    {
        $value = trim((string) ($this->data[$field] ?? ''));
        if ($value === '' && !$required) {
            $this->clean[$field] = null;
            return $this;
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            $this->errors[$field] = $label . ' deve estar no formato AAAA-MM-DD.';
            return $this;
        }

        [$year, $month, $day] = array_map('intval', explode('-', $value));
        if (!checkdate($month, $day, $year)) {
            $this->errors[$field] = $label . ' invalida.';
            return $this;
        }

        $this->clean[$field] = $value;
        return $this;
    }

    private function integer(string $field, string $label, bool $required, int $min): self
    {
        $value = $this->data[$field] ?? null;
        if (($value === null || $value === '') && !$required) {
            $this->clean[$field] = null;
            return $this;
        }

        $validated = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => $min]]);
        if ($validated === false) {
            $this->errors[$field] = $label . ' deve ser um numero inteiro valido.';
            return $this;
        }

        $this->clean[$field] = $validated;
        return $this;
    }
}
