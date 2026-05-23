# Saldoo Backend

API REST Laravel do Saldoo. O backend concentra autenticacao JWT, autorizacao administrativa, persistencia PostgreSQL, calculos financeiros, score, metas, categorias e assistente financeiro local.

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
app/Http/Controllers/Api/  Controllers REST
app/Http/Middleware/       JWT e permissao administrativa
app/Http/Requests/         Validacoes de entrada
app/Http/Resources/        Serializacao de responses
app/Actions/               Casos de uso de escrita
app/DTOs/                  Dados validados entre camadas
app/Repositories/          Persistencia especifica
app/Models/                Modelos Eloquent
app/Services/              JWT, score, dashboard, chat e responses
app/Modules/Finance/       Dominio financeiro
database/migrations/       Schema, constraints e indices
database/seeders/          Categorias e usuarios seedados
routes/api.php             Rotas REST
tests/Feature/             Testes de fluxo da API
```

## Banco

O ambiente local usa PostgreSQL em `localhost:5436`. Dentro do Compose, a API acessa o servico `postgres:5432`.

## Autenticacao

Tokens JWT sao emitidos em `/api/auth/login` e `/api/auth/register`. Rotas protegidas usam o header:

```text
Authorization: Bearer <token>
```

Usuarios seedados:

```text
admin@saldoo.local / Admin@123456
usuario@saldoo.local / Usuario@123456
```

## Padroes Da API

Responses de sucesso seguem:

```json
{
  "data": {}
}
```

Erros de validacao, autenticacao e autorizacao retornam JSON padronizado com mensagem e detalhes por campo quando aplicavel.
