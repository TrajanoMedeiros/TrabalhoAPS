# Saldoo - Trabalho APS

Plataforma de gestao financeira para registrar receitas, despesas, metas, acompanhar score financeiro e receber orientacoes do assistente Saldoo.

## Stack

- **Frontend:** HTML, CSS e JavaScript sem build step, servido pelo PHP.
- **Backend:** PHP 8.2+ com roteador HTTP proprio, respostas JSON padronizadas e autoload PSR-4 via Composer.
- **Banco:** PostgreSQL 16.
- **Chatbot terminal:** Python 3 com integracao opcional ao Gemini.
- **Infra:** Docker Compose para app PHP e PostgreSQL.

## Setup Rapido

```bash
cp .env.example .env
composer install
docker compose up --build
```

A aplicacao fica disponivel em:

```text
http://localhost:8080
```

Healthcheck:

```bash
curl http://localhost:8080/api/health
```

## Variaveis De Ambiente

| Variavel | Uso | Padrao |
| --- | --- | --- |
| `APP_ENV` | Ambiente da aplicacao | `local` |
| `APP_DEBUG` | Exibe detalhes de erros internos | `true` |
| `APP_CORS_ORIGIN` | Origem liberada para CORS | `*` |
| `DB_HOST` | Host do PostgreSQL | `db` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco | `finance_db` |
| `DB_USER` | Usuario do banco | `finance_user` |
| `DB_PASS` | Senha do banco | `finance_pass` |
| `JWT_SECRET` | Segredo de assinatura JWT | alterar em producao |
| `JWT_TTL_SECONDS` | Duracao do token | `86400` |
| `GEMINI_API_KEY` | Chave opcional do chatbot terminal | vazio |
| `GEMINI_MODEL` | Modelo Gemini opcional | `gemini-2.5-flash` |

## Scripts

```bash
composer serve   # servidor PHP local em 0.0.0.0:8080
composer lint    # php -l em src/public/tests/tools e node --check no JS
composer test    # testes unitarios sem banco
composer build   # lint + test
```

Chatbot terminal:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
GEMINI_API_KEY=sua-chave python chatbot.py
```

Sem `GEMINI_API_KEY`, o chatbot usa respostas locais deterministicas para orientacao financeira basica.

## Arquitetura

```text
public/
  app.html              # shell da SPA
  index.php             # front controller HTTP
  assets/               # CSS, JS e marca
src/
  Controllers/          # orquestracao HTTP por caso de uso
  Http/                 # Request, Router, JsonResponse e exceptions
  Repositories/         # persistencia PostgreSQL por dominio
  Services/             # regras de dashboard, score e assistente
  Support/              # Env, JWT, Auth e Validator
  Database.php          # fabrica PDO
  routes.php            # mapa de rotas
tests/
  run.php               # testes unitarios leves
tools/
  lint.php              # lint local sem dependencia externa
init.sql                # schema e seed inicial
docker-compose.yml      # app + PostgreSQL
```

### Decisoes Tecnicas

- A API usa JWT stateless assinado com `JWT_SECRET`; nao ha cookie de sessao.
- Regras financeiras foram isoladas em `Services`, mantendo controllers pequenos.
- Acesso a dados fica em `Repositories` com prepared statements.
- O frontend e uma SPA sem dependencia de Node para reduzir complexidade do projeto academico.
- Categorias globais sao seedadas no banco; usuarios podem criar categorias proprias.
- O assistente web usa orientacao local baseada nos dados financeiros do usuario, evitando dependencia externa para o fluxo principal.

## Fluxos Principais

1. Usuario cria conta ou faz login.
2. Frontend armazena o token JWT em `localStorage`.
3. Dashboard carrega categorias, resumo financeiro, historico, score, receitas, despesas e metas.
4. Usuario registra receitas/despesas com categoria e data.
5. Usuario cria metas e atualiza progresso.
6. Score financeiro e recomendacoes sao recalculados a partir dos dados persistidos.
7. Assistente responde perguntas considerando saldo, receitas, despesas e score atual.

## Endpoints

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/api/health` | Status da API |
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Usuario autenticado |
| `GET` | `/api/categories` | Categorias disponiveis |
| `POST` | `/api/categories` | Cria categoria propria |
| `GET` | `/api/incomes` | Lista receitas |
| `POST` | `/api/incomes` | Cria receita |
| `PUT` | `/api/incomes/{id}` | Atualiza receita |
| `DELETE` | `/api/incomes/{id}` | Remove receita |
| `GET` | `/api/expenses` | Lista despesas |
| `POST` | `/api/expenses` | Cria despesa |
| `PUT` | `/api/expenses/{id}` | Atualiza despesa |
| `DELETE` | `/api/expenses/{id}` | Remove despesa |
| `GET` | `/api/goals` | Lista metas |
| `POST` | `/api/goals` | Cria meta |
| `PUT` | `/api/goals/{id}` | Atualiza meta |
| `DELETE` | `/api/goals/{id}` | Remove meta |
| `GET` | `/api/dashboard` | Resumo financeiro |
| `GET` | `/api/dashboard/history` | Historico mensal |
| `GET` | `/api/score` | Score financeiro |
| `POST` | `/api/chat` | Assistente financeiro |

Filtros opcionais em receitas, despesas e dashboard:

```text
?mes=5&ano=2026
```

## Qualidade

Antes de abrir PR:

```bash
composer build
docker compose up --build
```

Validar no navegador:

- cadastro e login
- criacao de receita
- criacao de despesa
- dashboard e score
- metas financeiras
- assistente
- layout mobile, tablet e desktop

## Observacao Sobre Design

O frontend foi implementado como SPA responsiva do Saldoo. Para fidelidade visual absoluta, o arquivo do Figma precisa estar acessivel para inspecao de medidas, tokens e estados.
