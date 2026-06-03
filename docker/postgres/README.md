# Saldoo PostgreSQL

## Visão Geral

O **Saldoo PostgreSQL** é o módulo responsável pela persistência de dados da plataforma Saldoo. Executado através de containers Docker, ele fornece um ambiente de banco de dados consistente para desenvolvimento local, testes e integração com os demais módulos do sistema.

A utilização de PostgreSQL permite armazenar com segurança informações relacionadas a usuários, receitas, despesas, categorias, metas financeiras, score financeiro e demais entidades da aplicação.

O banco de dados faz parte da infraestrutura da plataforma e foi configurado para funcionar de forma isolada, garantindo previsibilidade e facilidade de configuração para qualquer desenvolvedor que trabalhe no projeto.

---

## Objetivo

O objetivo deste módulo é fornecer uma camada de persistência confiável para a aplicação, permitindo que frontend, backend e assistente financeiro operem sobre uma fonte única de dados.

Entre suas responsabilidades estão:

* Armazenamento de usuários;
* Persistência de receitas e despesas;
* Armazenamento de categorias financeiras;
* Persistência de metas financeiras;
* Suporte aos cálculos utilizados pelo dashboard e score financeiro;
* Garantia de integridade relacional entre entidades.

---

## Arquitetura

O banco de dados é executado através do Docker Compose centralizado da plataforma.

```text
Frontend
    │
    ▼
Backend Laravel
    │
    ▼
PostgreSQL
```

Todo acesso ao banco é realizado pelo backend através do Eloquent ORM, mantendo a camada de persistência isolada da interface e dos consumidores externos.

---

## Configuração Local

A instância PostgreSQL é exposta localmente para facilitar desenvolvimento e inspeção através de ferramentas como DBeaver, pgAdmin ou clientes SQL.

### Conexão Local

```text
Host:     127.0.0.1
Porta:    5436
Database: saldoo
Usuário:  saldoo
Senha:    saldoo
```

---

## Integração com Docker

Dentro do ambiente Docker, os serviços não utilizam o host local para comunicação.

O backend se conecta ao banco utilizando o nome interno do serviço:

```text
Host: postgres
Porta: 5432
```

Essa abordagem mantém o ambiente desacoplado da configuração específica da máquina do desenvolvedor.

---

## Estrutura de Dados

O banco de dados suporta os principais domínios da plataforma:

* Usuários
* Categorias
* Receitas
* Despesas
* Metas financeiras
* Indicadores financeiros
* Dados utilizados pelo assistente financeiro

As estruturas são criadas e atualizadas através das migrations do Laravel, garantindo versionamento e evolução controlada do schema.

---

## Decisões Técnicas

### Por que PostgreSQL?

O PostgreSQL foi escolhido por oferecer:

* Confiabilidade para aplicações transacionais;
* Excelente suporte a relacionamentos complexos;
* Recursos avançados de integridade de dados;
* Alto nível de estabilidade e maturidade.

### Por que Docker?

A utilização de containers garante:

* Ambiente consistente entre desenvolvedores;
* Configuração simplificada;
* Menor dependência de instalações locais;
* Facilidade de reprodução do ambiente.

### Por que uma instância dedicada?

Manter o banco isolado em um módulo próprio simplifica manutenção, backup, evolução da infraestrutura e futuras estratégias de deploy.

---

## Licença

Este projeto está licenciado sob a licença MIT.
