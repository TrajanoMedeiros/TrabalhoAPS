# Saldoo

Saldoo e uma aplicacao SaaS de gestao financeira pessoal. A plataforma permite registrar receitas, despesas, categorias e metas, acompanhar score financeiro e conversar com um assistente que usa os dados persistidos da conta autenticada.

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS e lucide-react.
- Backend: Laravel, API REST, JWT stateless, Eloquent, migrations, seeders e testes feature.
- Banco: PostgreSQL 16 em Docker, exposto localmente em `localhost:5436`.
- Infra: Docker Compose centralizado em `docker/`.
- IA: chatbot Python desacoplado em `ia/`, com motor local e integracao opcional com Gemini.
- Orquestracao local: npm workspaces e scripts na raiz.

## Estrutura Do Monorepo

```text
frontend/  Aplicacao web React + TypeScript + TailwindCSS
backend/   API REST Laravel, dominio financeiro e persistencia
docker/    Compose, runtime PHP e configuracao do PostgreSQL
ia/        Assistente financeiro desacoplado
README.md  Documentacao principal de onboarding
```

A raiz tambem contem `package.json` e `package-lock.json` para permitir `npm run dev` a partir do monorepo. Frontend, backend, Docker e IA permanecem independentes e podem evoluir separadamente.

## Requisitos

- Node.js 22+
- npm 10+
- Docker e Docker Compose
- PHP 8.4+ e Composer apenas para rodar o backend fora do container
- Python 3.11+ apenas para executar o chatbot em `ia/`

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

Frontend:

```bash
cd frontend
npm run dev
```

Backend em container, a partir da raiz:

```bash
npm run dev:backend
```

Backend local, quando PHP e extensoes estiverem instalados:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Infraestrutura isolada:

```bash
npm run dev:docker
```

IA local:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r ia/requirements.txt
python ia/chatbot.py
```

## Scripts Da Raiz

| Script | Descricao |
| --- | --- |
| `npm run dev` | Sobe Postgres, backend Laravel e frontend Vite. |
| `npm run dev:frontend` | Inicia apenas o frontend em `5173`. |
| `npm run dev:backend` | Inicia apenas o backend em container na porta `8000`. |
| `npm run dev:docker` | Sobe apenas o PostgreSQL na porta `5436`. |
| `npm run docker:down` | Derruba a stack Docker. |
| `npm run build` | Executa build de producao do frontend. |
| `npm run lint` | Executa ESLint do frontend e Pint do backend. |
| `npm run test` | Executa a suite Laravel no container usando SQLite em memoria. |

## Variaveis De Ambiente

O backend usa `backend/.env`. Para desenvolvimento, copie `backend/.env.example`.

| Variavel | Uso | Padrao local |
| --- | --- | --- |
| `APP_URL` | URL publica da API | `http://localhost:8000` |
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

Variaveis opcionais da IA:

| Variavel | Uso |
| --- | --- |
| `SALDOO_API_URL` | URL da API usada pelo chatbot. Padrao: `http://127.0.0.1:8000`. |
| `SALDOO_API_TOKEN` | Token JWT usado para carregar dashboard e score. |
| `GEMINI_API_KEY` | Ativa resposta generativa opcional. |
| `GEMINI_MODEL` | Modelo Gemini opcional. Padrao: `gemini-2.5-flash`. |

## Usuarios Seedados

Ao executar `php artisan migrate --seed` ou `npm run dev`, o banco cria usuarios funcionais:

| Papel | Email | Senha |
| --- | --- | --- |
| Administrador | `admin@saldoo.local` | `Admin@123456` |
| Usuario comum | `usuario@saldoo.local` | `Usuario@123456` |

O administrador acessa `/api/admin/overview`. Usuarios comuns recebem `403` nessa rota.

## Arquitetura

### Frontend

O frontend fica em `frontend/src` com responsabilidades separadas:

```text
components/  Componentes reutilizaveis e componentes financeiros
layouts/     Estrutura de navegacao e shell autenticado
pages/       Telas de autenticacao, dashboard, lancamentos, metas, assistente e ajustes
modules/     Fluxos por dominio: auth, finance, settings e assistant
hooks/       Orquestracao de estado de alto nivel
stores/      Estado inicial e constantes de UI
services/    Cliente HTTP e tratamento de erro
types/       Contratos TypeScript da API
utils/       Formatadores e helpers puros
routes/      Configuracao de navegacao
styles/      Tokens visuais
```

A UI evita informacoes tecnicas para o usuario final, usa estados de loading, erro e vazio, labels em formularios, navegacao responsiva e componentes consistentes.

### Backend

O backend segue Laravel com separacao por responsabilidade:

```text
app/Http/Controllers/Api/  Controllers REST finos
app/Http/Requests/         Validacoes de entrada
app/Http/Resources/        Serializacao padronizada
app/Actions/               Casos de uso de escrita
app/DTOs/                  Dados validados entre camadas
app/Repositories/          Consultas e persistencia especifica
app/Services/              Respostas, JWT, score, dashboard e chat
app/Models/                Modelos Eloquent e relacionamentos
app/Modules/Finance/       Marcador do dominio financeiro
database/migrations/       Schema, constraints e indices
database/seeders/          Categorias e usuarios iniciais
tests/Feature/             Fluxos integrados de API
```

Controllers nao carregam regras financeiras de escrita: validacao entra por Requests, dados seguem em DTOs, Actions executam casos de uso e Repositories concentram persistencia especifica.

### IA

O diretorio `ia/` contem um assistente desacoplado. Sem `GEMINI_API_KEY`, ele usa recomendacoes locais deterministicas. Com `SALDOO_API_TOKEN`, ele consulta dashboard e score da API para contextualizar as respostas.

## Endpoints Principais

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/api/health` | Status da API |
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Usuario autenticado |
| `GET/PUT/DELETE` | `/api/users/me` | Perfil do usuario |
| `PUT` | `/api/users/password` | Alteracao de senha |
| `GET/POST` | `/api/categories` | Categorias |
| `GET/POST` | `/api/incomes` | Receitas |
| `GET/POST` | `/api/expenses` | Despesas |
| `GET/POST` | `/api/goals` | Metas |
| `GET` | `/api/dashboard` | Resumo financeiro |
| `GET` | `/api/dashboard/history` | Historico mensal |
| `GET` | `/api/score` | Score financeiro |
| `POST` | `/api/chat` | Assistente financeiro |
| `GET` | `/api/admin/overview` | Visao administrativa protegida |

Receitas, despesas e dashboard aceitam filtros:

```text
?mes=5&ano=2026
```

## Qualidade E Validacao

Antes de abrir PR, rode:

```bash
npm run lint
npm run build
npm run test
```

A suite automatizada usa SQLite em memoria para nao alterar o PostgreSQL local de desenvolvimento.

Fluxos que devem ser conferidos no navegador:

- login com usuario seedado
- cadastro de novo usuario
- persistencia do token apos reload
- criacao e remocao de receita
- criacao e remocao de despesa
- criacao e progresso de meta
- dashboard, historico e score
- assistente autenticado
- ajustes de perfil, senha e categorias
- layout mobile, tablet e desktop

## Decisoes Tecnicas

- Monorepo simples, com npm workspaces apenas onde agrega clareza.
- Backend roda em container por padrao para evitar divergencia de extensoes PHP locais.
- PostgreSQL fica isolado em `docker/` com volume persistente, healthcheck e porta local `5436`.
- JWT mantem a API stateless e simplifica a integracao frontend/backend.
- Escritas financeiras usam Requests, DTOs, Actions e Repositories para manter controllers pequenos.
- Frontend separa UI, fluxos de dominio, estado inicial, services e tipos para facilitar manutencao.
- A IA fica desacoplada para evoluir sem acoplar dependencias generativas ao produto principal.
