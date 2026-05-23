# Saldoo Frontend

Aplicacao React + TypeScript + TailwindCSS responsavel pela experiencia web do Saldoo.

## Comandos

```bash
npm run dev
npm run lint
npm run build
```

Rodando pela raiz do monorepo:

```bash
npm run dev:frontend
```

## Organizacao

```text
src/
  App.tsx             fluxo principal da aplicacao
  components.tsx      componentes reutilizaveis simples
  lib/api.ts          cliente HTTP e tratamento de erro
  lib/format.ts       formatadores de moeda, data e mes
  types.ts            contratos compartilhados com a API
```

## Integracao

O Vite usa proxy para encaminhar `/api` para `http://127.0.0.1:8000`. Com isso, o frontend pode rodar isoladamente enquanto o backend roda localmente ou em container.

## UX

A interface cobre autenticacao, dashboard, lancamentos, metas, assistente e ajustes. Os fluxos possuem estados de loading, erro e sucesso, labels nos campos, navegacao responsiva e componentes padronizados.
