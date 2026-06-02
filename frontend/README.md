# Saldoo Frontend

## Visão Geral

O **Saldoo Frontend** é a aplicação web responsável pela experiência do usuário dentro da plataforma Saldoo. Desenvolvido como uma Single Page Application (SPA), ele fornece uma interface moderna para gerenciamento financeiro pessoal, permitindo que usuários acompanhem receitas, despesas, metas financeiras, score financeiro e interajam com o assistente financeiro da plataforma.

O frontend foi projetado com foco em usabilidade, responsividade e organização de código, garantindo uma experiência consistente em diferentes dispositivos e facilitando a evolução contínua do produto.

---

## O Problema

Muitas aplicações financeiras apresentam interfaces complexas, excesso de informações e fluxos pouco intuitivos, tornando o acompanhamento financeiro mais difícil do que deveria ser.

Além disso, projetos frontend tendem a crescer rapidamente e se tornar difíceis de manter quando não existe uma estrutura clara para organização de componentes, fluxos de negócio e comunicação com APIs.

Esses problemas impactam tanto a experiência do usuário quanto a produtividade durante o desenvolvimento.

---

## A Solução

O Saldoo Frontend foi desenvolvido para oferecer uma experiência simples e organizada, permitindo que usuários gerenciem suas informações financeiras através de uma interface intuitiva e responsiva.

A aplicação centraliza funcionalidades como:

* Autenticação e gerenciamento de conta;
* Dashboard financeiro;
* Gestão de receitas e despesas;
* Controle de metas financeiras;
* Consulta de score financeiro;
* Interação com assistente financeiro;
* Configurações da conta.

Ao mesmo tempo, a estrutura interna do projeto foi organizada para manter separação clara entre interface, regras de apresentação, comunicação com APIs e fluxos de domínio.

---

## Principais Funcionalidades

### Autenticação

* Login de usuários;
* Cadastro de contas;
* Persistência de sessão;
* Controle de acesso às áreas protegidas.

### Dashboard

* Resumo financeiro;
* Indicadores principais;
* Histórico consolidado.

### Gestão Financeira

* Cadastro de receitas;
* Cadastro de despesas;
* Gerenciamento de categorias;
* Visualização de movimentações.

### Metas Financeiras

* Criação de metas;
* Acompanhamento de progresso;
* Visualização de objetivos financeiros.

### Assistente Financeiro

* Interface conversacional;
* Integração com o módulo de IA;
* Exibição de respostas contextualizadas.

### Configurações

* Atualização de perfil;
* Alteração de senha;
* Personalização de preferências.

---

## Arquitetura

O frontend segue uma arquitetura modular baseada em domínio, permitindo que funcionalidades cresçam de forma organizada e independente.

```text
src/
├── components/
├── layouts/
├── pages/
├── modules/
├── hooks/
├── stores/
├── services/
├── types/
├── utils/
├── routes/
└── styles/
```

### Components

Contém componentes reutilizáveis e blocos específicos utilizados ao longo da aplicação.

### Layouts

Responsáveis pela estrutura visual global da aplicação, navegação e áreas autenticadas.

### Pages

Representam as telas principais acessadas pelo usuário.

### Modules

Agrupam funcionalidades por domínio de negócio, reduzindo acoplamento e facilitando manutenção.

### Hooks

Centralizam lógica reutilizável relacionada ao gerenciamento de estado e comportamento da aplicação.

### Stores

Mantêm estados iniciais, constantes e informações compartilhadas.

### Services

Responsáveis pela comunicação com a API e tratamento de erros.

### Types

Definem contratos TypeScript utilizados em toda a aplicação.

### Utils

Funções auxiliares puras e formatadores.

### Routes

Configuração de navegação e proteção de rotas.

### Styles

Tokens visuais e definições globais de estilo.

---

## Tecnologias Utilizadas

### React

Responsável pela construção da interface baseada em componentes reutilizáveis.

### TypeScript

Fornece tipagem estática para aumentar a previsibilidade e segurança do código.

### Vite

Utilizado como ferramenta de desenvolvimento e build, oferecendo inicialização rápida e excelente experiência de desenvolvimento.

### TailwindCSS

Framework utilitário utilizado para construção rápida e consistente da interface.

---

## Integração com o Backend

A aplicação se comunica com a API do Saldoo através de requisições HTTP centralizadas.

Durante o desenvolvimento, o Vite utiliza proxy para encaminhar chamadas feitas para `/api` ao backend em execução.

Essa abordagem permite que frontend e backend evoluam de forma independente, reduzindo problemas relacionados a CORS e simplificando o ambiente de desenvolvimento.

---

## Experiência do Usuário

O frontend foi construído seguindo princípios de usabilidade e acessibilidade.

Os fluxos da aplicação incluem:

* Estados de carregamento;
* Tratamento de erros;
* Feedback visual para ações do usuário;
* Navegação responsiva;
* Componentes padronizados;
* Formulários com validação e labels descritivos.

Esses elementos ajudam a tornar a experiência mais previsível e intuitiva.

---

## Decisões Técnicas

### Por que React?

Permite construção de interfaces complexas através de componentes reutilizáveis e ecossistema consolidado.

### Por que TypeScript?

Reduz erros durante o desenvolvimento e melhora a manutenção do projeto.

### Por que Vite?

Oferece uma experiência de desenvolvimento mais rápida e simples quando comparada a ferramentas tradicionais de build.

### Por que uma arquitetura modular?

Facilita a escalabilidade da aplicação, reduz acoplamento e torna a manutenção mais previsível conforme novas funcionalidades são adicionadas.

---

## Licença

Este projeto está licenciado sob a licença MIT.
