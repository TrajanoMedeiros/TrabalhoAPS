# Saldoo IA

## Visão Geral

O **Saldoo IA** é um assistente financeiro desacoplado desenvolvido para complementar a plataforma Saldoo. Seu objetivo é transformar dados financeiros em informações mais acessíveis, permitindo que usuários obtenham orientações e insights contextualizados a partir de suas receitas, despesas, metas e indicadores financeiros.

O módulo foi projetado para funcionar de forma independente da aplicação principal, podendo operar tanto com um motor local determinístico quanto integrado à API do Saldoo para utilizar dados reais da conta autenticada.

Essa abordagem permite evoluir os recursos de inteligência artificial sem aumentar o acoplamento entre o sistema financeiro e os componentes de IA.

---

## O Problema

Muitos sistemas de gestão financeira apresentam números, gráficos e relatórios, mas deixam para o usuário a responsabilidade de interpretar essas informações e transformá-las em decisões práticas.

Isso normalmente gera dificuldades como:

* Falta de contexto sobre a situação financeira atual;
* Dificuldade para identificar padrões de gastos;
* Pouca orientação para atingir metas financeiras;
* Necessidade de interpretar manualmente dashboards e indicadores.

Essas limitações reduzem o valor percebido das informações armazenadas pelo sistema.

---

## A Solução

O Saldoo IA atua como uma camada de interpretação sobre os dados financeiros da plataforma.

Quando integrado à API do Saldoo, o assistente pode utilizar informações da conta autenticada para fornecer respostas mais contextualizadas, auxiliando o usuário na compreensão de sua situação financeira.

Quando executado sem integração externa, o sistema continua funcional através de um motor local determinístico, permitindo testes, desenvolvimento e utilização independente.

Além disso, o módulo suporta integração opcional com modelos generativos por meio do Gemini, ampliando a capacidade de geração de respostas e recomendações.

---

## Principais Funcionalidades

### Assistente Financeiro

* Interpretação de informações financeiras;
* Respostas contextualizadas;
* Suporte a consultas financeiras básicas;
* Recomendações baseadas nos dados disponíveis.

### Integração com a API

* Consumo de dados financeiros da conta autenticada;
* Utilização de JWT para autenticação;
* Consulta de score financeiro;
* Consulta de dashboard financeiro.

### Modo Local

* Funcionamento sem dependências externas;
* Respostas determinísticas;
* Ambiente ideal para desenvolvimento e testes.

### IA Generativa Opcional

* Integração com Gemini;
* Respostas mais naturais;
* Possibilidade de expansão futura para outros provedores.

---

## Arquitetura

O módulo foi desenvolvido de forma desacoplada do restante do monorepo.

```text
ia/
├── chatbot.py
├── requirements.txt
└── módulos auxiliares
```

O assistente pode operar em três modos:

### Modo Local

Utiliza apenas o motor interno para responder perguntas sem dependência de serviços externos.

### Modo Integrado

Consome informações da API do Saldoo utilizando um token JWT válido.

### Modo Generativo

Utiliza modelos Gemini para enriquecer as respostas mantendo a possibilidade de consultar dados financeiros da API.

---

## Decisões Técnicas

### Por que um módulo separado?

A separação permite que a IA evolua independentemente da aplicação principal, reduzindo acoplamento e facilitando manutenção.

### Por que suporte a motor local?

Permite funcionamento offline e facilita desenvolvimento sem dependência de serviços externos.

### Por que integração via API?

Mantém uma fronteira clara entre domínio financeiro e inteligência artificial, preservando a arquitetura da plataforma.

### Por que suporte opcional ao Gemini?

Permite utilizar recursos generativos quando desejado sem tornar a plataforma dependente de um único provedor.

---

## Casos de Uso

* Consultar informações financeiras de forma conversacional;
* Obter contexto sobre receitas e despesas;
* Acompanhar metas financeiras;
* Interpretar indicadores financeiros;
* Receber recomendações baseadas nos dados da conta.

---

## Licença

Este projeto está licenciado sob a licença MIT.
