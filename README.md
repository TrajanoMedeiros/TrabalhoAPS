# Saldoo - Trabalho APS

Saldoo e uma aplicacao de gestao financeira para registrar receitas, despesas e metas, acompanhar score financeiro e receber orientacoes do assistente com base nos dados persistidos.

## Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS e lucide-react.
- **Backend:** Laravel, APIs REST, JWT stateless, Eloquent, migrations e seeders.
- **Banco:** PostgreSQL 16 em Docker, exposto localmente na porta `5436`.
- **Infra:** Docker Compose centralizado em `docker/`.
- **Scripts:** npm workspaces na raiz para orquestrar frontend, backend e infraestrutura.
- **Auxiliar:** chatbot terminal Python em `scripts/`.

## Estrutura

```text
frontend/             React + TypeScript + TailwindCSS
backend/              Laravel REST API
docker/               Docker Compose, PHP runtime e notas de infra
docs/                 Documentacao complementar
scripts/              Scripts auxiliares fora do fluxo principal
package.json          Scripts raiz do monorepo
```

Frontend, backend e infraestrutura sao desacoplados. Cada parte roda separadamente, e a raiz oferece comandos para desenvolvimento integrado.

## Requisitos

- Node.js 22+
- npm 10+
- Docker e Docker Compose
- PHP 8.4+ e Composer, apenas se quiser rodar o backend fora do container

## Setup Rapido

```bash
npm install
cp backend/.env.example backend/.env
npm run dev
```

URLs locais:

```text
Frontend:   http://localhost:5173
Backend:    http://localhost:8000
PostgreSQL: localhost:5436
```

O comando `npm run dev` sobe o PostgreSQL, inicia o backend Laravel em container e inicia o frontend Vite com proxy para `/api`.

## Execucao Separada

Frontend isolado:

```bash
cd frontend
npm run dev
```

Backend com container equivalente:

```bash
npm run dev:backend
```

Backend local, quando PHP e extensoes estiverem instalados:

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Infraestrutura isolada:

```bash
npm run dev:docker
```

## Scripts Da Raiz

| Script | Descricao |
| --- | --- |
| `npm run dev` | Sobe Postgres, backend Laravel e frontend Vite. |
| `npm run dev:frontend` | Inicia apenas o frontend em `5173`. |
| `npm run dev:backend` | Inicia o backend em container na porta `8000`. |
| `npm run dev:docker` | Sobe apenas o PostgreSQL na porta `5436`. |
| `npm run docker:down` | Derruba a stack Docker. |
| `npm run build` | Executa build de producao do frontend. |
| `npm run lint` | Executa ESLint do frontend e Pint do backend. |
| `npm run test` | Executa a suite Laravel no container. |

## Variaveis De Ambiente

O backend usa `backend/.env`. Para desenvolvimento local, copie `backend/.env.example`.

| Variavel | Uso | Padrao local |
| --- | --- | --- |
| `APP_URL` | URL da API | `http://localhost:8000` |
| `FRONTEND_URL` | Origem esperada do frontend | `http://localhost:5173` |
| `DB_CONNECTION` | Driver do banco | `pgsql` |
| `DB_HOST` | Host do banco fora do container | `127.0.0.1` |
| `DB_PORT` | Porta local do PostgreSQL | `5436` |
| `DB_DATABASE` | Nome do banco | `saldoo` |
| `DB_USERNAME` | Usuario do banco | `saldoo` |
| `DB_PASSWORD` | Senha do banco | `saldoo` |
| `JWT_SECRET` | Segredo dos tokens JWT | trocar antes de producao |
| `JWT_TTL_SECONDS` | Duracao do token | `86400` |

Dentro do Docker, o Compose sobrescreve `DB_HOST=postgres` e `DB_PORT=5432`.

## Fluxos Principais

1. Usuario cria conta ou faz login.
2. Backend emite JWT stateless.
3. Frontend persiste o token em `localStorage` e consulta `/api/auth/me`.
4. Dashboard carrega resumo, historico, score, categorias, receitas, despesas e metas.
5. Usuario registra receitas/despesas com categoria e data.
6. Metas acompanham valor alvo, valor atual e progresso.
7. Score e recomendacoes sao recalculados a partir dos dados persistidos.
8. Assistente responde usando dashboard e score da conta autenticada.

## Arquitetura

O backend segue a estrutura padrao Laravel, com controllers finos em `backend/app/Http/Controllers/Api`, modelos Eloquent em `backend/app/Models`, servicos de dominio em `backend/app/Services`, middleware JWT em `backend/app/Http/Middleware` e rotas REST em `backend/routes/api.php`.

O frontend organiza a experiencia por responsabilidades simples em `frontend/src`: `App.tsx` coordena estado de tela e fluxos, `components.tsx` guarda elementos compartilhados, `lib/api.ts` padroniza chamadas HTTP e `types.ts` centraliza contratos usados pela UI.

## Endpoints Principais

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/api/health` | Status da API |
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Usuario autenticado |
| `GET/POST` | `/api/categories` | Categorias |
| `GET/POST` | `/api/incomes` | Receitas |
| `GET/POST` | `/api/expenses` | Despesas |
| `GET/POST` | `/api/goals` | Metas |
| `GET` | `/api/dashboard` | Resumo financeiro |
| `GET` | `/api/dashboard/history` | Historico mensal |
| `GET` | `/api/score` | Score financeiro |
| `POST` | `/api/chat` | Assistente financeiro |

Receitas, despesas e dashboard aceitam filtros:

```text
?mes=5&ano=2026
```

## Qualidade

Antes de abrir PR, rode:

```bash
npm run lint
npm run build
npm run test
```

Valide tambem no navegador:

- cadastro e login
- persistencia do token
- criacao e remocao de receita
- criacao e remocao de despesa
- criacao e progresso de meta
- dashboard e score
- assistente
- layout mobile, tablet e desktop

## Decisoes Tecnicas

- Monorepo simples com npm workspaces apenas para o frontend, evitando complexidade de orquestradores maiores.
- PostgreSQL fica isolado em `docker/` com volume persistente e healthcheck.
- Backend roda em container por padrao para evitar divergencia de extensoes PHP locais.
- JWT e usado para manter API stateless e facilitar integracao com o frontend.
- Regras financeiras ficam em servicos Laravel para manter controllers pequenos.
- O frontend usa Vite proxy para `/api`, mantendo ambientes frontend/backend independentes.
- A UI foi consolidada em React/Tailwind com componentes reutilizaveis, estados de loading/erro e responsividade.

## Chatbot Terminal

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
GEMINI_API_KEY=sua-chave python scripts/chatbot.py
```

Sem `GEMINI_API_KEY`, o chatbot usa respostas locais deterministicas.
