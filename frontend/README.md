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
  components/  Componentes reutilizaveis e blocos financeiros
  layouts/     Shell autenticado e navegacao
  pages/       Telas principais
  modules/     Fluxos por dominio
  hooks/       Orquestracao de estado de alto nivel
  stores/      Estado inicial e constantes
  services/    Cliente HTTP e erros
  types/       Contratos TypeScript
  utils/       Formatadores puros
  routes/      Itens de navegacao
  styles/      Tokens visuais
```

## Integracao

O Vite usa proxy para encaminhar `/api` para `http://127.0.0.1:8000`. Com isso, o frontend roda isoladamente enquanto o backend roda localmente ou em container.

## UX

A interface cobre autenticacao, dashboard, lancamentos, metas, assistente e ajustes. Os fluxos possuem estados de loading, erro e sucesso, labels nos campos, navegacao responsiva e componentes padronizados.
