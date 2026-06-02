# Saldoo Backend

## Visão Geral

O **Saldoo Backend** é a API REST responsável por toda a lógica de negócio da plataforma Saldoo. Ele concentra autenticação, autorização, persistência de dados, cálculos financeiros, gerenciamento de metas, categorização de lançamentos, geração de score financeiro e integração com o assistente financeiro.

Desenvolvido em Laravel, o backend foi projetado para servir como a camada central da plataforma, garantindo segurança, consistência de dados e isolamento entre usuários em um ambiente SaaS.

A arquitetura prioriza organização de domínio, separação de responsabilidades e facilidade de manutenção, permitindo que novas funcionalidades sejam adicionadas sem comprometer a estrutura existente.

---

## O Problema

Sistemas financeiros exigem mais do que operações básicas de cadastro. É necessário garantir:

* Controle seguro de acesso aos dados;
* Consistência entre receitas, despesas e metas;
* Regras financeiras centralizadas;
* Escalabilidade para crescimento da aplicação;
* Padronização das respostas da API;
* Facilidade de manutenção conforme o domínio evolui.

Quando essas responsabilidades ficam distribuídas de forma inadequada, o sistema tende a se tornar difícil de manter e sujeito a inconsistências.

---

## A Solução

O Saldoo Backend centraliza toda a lógica financeira da plataforma em uma API estruturada e orientada a domínio.

A aplicação oferece:

* Autenticação baseada em JWT;
* Controle de permissões administrativas;
* Gerenciamento de usuários;
* Controle de receitas e despesas;
* Organização por categorias;
* Gestão de metas financeiras;
* Dashboard consolidado;
* Cálculo de score financeiro;
* Integração com assistente financeiro;
* Persistência segura em PostgreSQL.

A separação entre validação, casos de uso, persistência e exposição HTTP garante uma estrutura previsível e fácil de evoluir.

---

## Principais Funcionalidades

### Autenticação e Segurança

* Cadastro de usuários;
* Login via JWT;
* Recuperação do usuário autenticado;
* Controle de permissões administrativas;
* Rotas protegidas por token.

### Gestão Financeira

* Cadastro de receitas;
* Cadastro de despesas;
* Categorias personalizadas;
* Histórico financeiro;
* Dashboard consolidado.

### Metas Financeiras

* Criação de metas;
* Atualização de progresso;
* Monitoramento de objetivos financeiros.

### Score Financeiro

* Cálculo de indicadores financeiros;
* Avaliação da saúde financeira do usuário.

### Assistente Financeiro

* Integração com o módulo de IA;
* Consulta contextualizada de dados financeiros.

### Administração

* Visão consolidada da plataforma;
* Recursos exclusivos para administradores.

---

## Arquitetura

O backend segue uma arquitetura baseada em responsabilidades bem definidas.

```text
app/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Actions/
├── DTOs/
├── Repositories/
├── Models/
├── Services/
└── Modules/
```

### Controllers

Responsáveis por receber requisições HTTP e coordenar o fluxo da aplicação sem concentrar regras de negócio.

### Requests

Executam validações de entrada antes que os dados sejam processados.

### Resources

Padronizam a serialização das respostas enviadas pela API.

### Actions

Representam casos de uso específicos da aplicação, concentrando operações de escrita.

### DTOs

Transportam dados validados entre as camadas da aplicação.

### Repositories

Centralizam consultas e persistência específica do domínio.

### Services

Implementam serviços compartilhados como autenticação, dashboard, score financeiro e assistente.

### Models

Representam as entidades persistidas no banco de dados.

### Modules

Agrupam responsabilidades relacionadas ao domínio financeiro.

---

## Banco de Dados

A aplicação utiliza PostgreSQL como banco de dados principal.

O modelo foi projetado para garantir:

* Integridade relacional;
* Persistência consistente;
* Evolução controlada através de migrations;
* Consultas eficientes por meio de índices e constraints.

---

## Autenticação

A autenticação é baseada em JSON Web Tokens (JWT).

Os tokens são emitidos pelos endpoints de autenticação e utilizados para acessar recursos protegidos.

```text
Authorization: Bearer <token>
```

Esse modelo mantém a API stateless e simplifica a comunicação entre frontend e backend.

---

## Padrão de Respostas

As respostas seguem uma estrutura consistente para facilitar o consumo da API.

### Sucesso

```json
{
  "data": {}
}
```

### Erros

Erros de validação, autenticação e autorização retornam mensagens padronizadas e detalhes adicionais quando necessário.

Essa padronização melhora a previsibilidade para consumidores da API.

---

## Estratégia de Qualidade

O projeto adota mecanismos para garantir estabilidade e confiabilidade:

* Validação de entrada através de Requests;
* Testes automatizados de fluxo;
* Formatação padronizada de código;
* Isolamento de regras de negócio;
* Persistência desacoplada da camada HTTP.

Os testes utilizam SQLite em memória para evitar impactos no banco PostgreSQL utilizado durante o desenvolvimento.

---

## Decisões Técnicas

### Por que Laravel?

Oferece uma base sólida para desenvolvimento de APIs modernas, com recursos maduros para autenticação, validação, ORM e testes.

### Por que JWT?

Permite autenticação stateless, reduzindo acoplamento entre cliente e servidor.

### Por que PostgreSQL?

Fornece consistência, confiabilidade e recursos avançados adequados para aplicações financeiras.

### Por que Actions e DTOs?

Mantêm controllers enxutos e tornam os fluxos de negócio mais explícitos e fáceis de manter.

### Por que Repositories?

Centralizam consultas específicas e evitam espalhar regras de persistência pela aplicação.

---

## Licença

Este projeto está licenciado sob a licença MIT.
