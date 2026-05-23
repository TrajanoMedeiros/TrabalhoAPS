# Saldoo Backend

API REST Laravel do Saldoo. O backend concentra autenticacao JWT, persistencia PostgreSQL, calculos financeiros, score, metas, categorias e assistente financeiro local.

## Comandos

Rodando pelo container recomendado:

```bash
npm run dev:backend
```

Rodando localmente:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Qualidade:

```bash
./vendor/bin/pint --test
php artisan test
```

## Organizacao

```text
app/Http/Controllers/Api/   controllers REST
app/Http/Middleware/        autenticacao JWT
app/Models/                 modelos Eloquent
app/Services/               regras financeiras e presenters
database/migrations/        schema
database/seeders/           categorias padrao
routes/api.php              rotas REST
tests/Feature/              testes de fluxo da API
```

## Banco

O ambiente local usa PostgreSQL em `localhost:5436`. Dentro do Compose, a API acessa o servico `postgres:5432`.

## Autenticacao

Tokens JWT sao emitidos em `/api/auth/login` e `/api/auth/register`. Rotas protegidas usam o header:

```text
Authorization: Bearer <token>
```

## Padroes Da API

Responses de sucesso seguem:

```json
{
  "data": {}
}
```

Erros de validacao e autenticacao retornam JSON padronizado com mensagem e detalhes por campo quando aplicavel.
