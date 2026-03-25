-- =============================================================
-- Schema: Sistema de Controle Financeiro
-- PostgreSQL — sem score pré-setado
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TABELAS
-- =============================================================

CREATE TABLE usuario (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    cpf           CHAR(11)     NOT NULL UNIQUE,
    renda_mensal  NUMERIC(12,2) NOT NULL DEFAULT 0,
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE categoria (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nome  VARCHAR(80) NOT NULL,
    tipo  VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa'))
);

CREATE TABLE transacao (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID          NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    categoria_id UUID          REFERENCES categoria(id) ON DELETE SET NULL,
    valor        NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    tipo         VARCHAR(10)   NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    data         DATE          NOT NULL,
    descricao    VARCHAR(255),
    criado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE conta (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID          NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    descricao  VARCHAR(255)  NOT NULL,
    valor      NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    tipo       VARCHAR(10)   NOT NULL CHECK (tipo IN ('pagar', 'receber')),
    vencimento DATE          NOT NULL,
    status     VARCHAR(10)   NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
    criado_em  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE meta (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID          NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    titulo      VARCHAR(150)  NOT NULL,
    valor_alvo  NUMERIC(12,2) NOT NULL CHECK (valor_alvo > 0),
    valor_atual NUMERIC(12,2) NOT NULL DEFAULT 0,
    prazo       DATE          NOT NULL,
    status      VARCHAR(15)   NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida', 'cancelada')),
    criado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- score vinculado ao usuario — calculado pela função, nunca inserido manualmente
CREATE TABLE score (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    pontuacao      SMALLINT    NOT NULL CHECK (pontuacao BETWEEN 0 AND 1000),
    classificacao  VARCHAR(15) NOT NULL CHECK (classificacao IN ('critico', 'ruim', 'regular', 'bom', 'excelente')),
    referencia_mes DATE        NOT NULL,
    calculado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, referencia_mes)
);

-- =============================================================
-- ÍNDICES
-- =============================================================

CREATE INDEX idx_transacao_usuario ON transacao(usuario_id, data DESC);
CREATE INDEX idx_conta_usuario     ON conta(usuario_id, vencimento);
CREATE INDEX idx_score_usuario     ON score(usuario_id, referencia_mes DESC);

-- =============================================================
-- CATEGORIAS PADRÃO
-- =============================================================

INSERT INTO categoria (id, nome, tipo) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'Salário',        'receita'),
('aaaaaaaa-0000-0000-0000-000000000002', 'Freelance',      'receita'),
('aaaaaaaa-0000-0000-0000-000000000003', 'Investimentos',  'receita'),
('aaaaaaaa-0000-0000-0000-000000000004', 'Outros receita', 'receita'),
('aaaaaaaa-0000-0000-0000-000000000005', 'Moradia',        'despesa'),
('aaaaaaaa-0000-0000-0000-000000000006', 'Alimentação',    'despesa'),
('aaaaaaaa-0000-0000-0000-000000000007', 'Transporte',     'despesa'),
('aaaaaaaa-0000-0000-0000-000000000008', 'Saúde',          'despesa'),
('aaaaaaaa-0000-0000-0000-000000000009', 'Educação',       'despesa'),
('aaaaaaaa-0000-0000-0000-000000000010', 'Lazer',          'despesa'),
('aaaaaaaa-0000-0000-0000-000000000011', 'Assinaturas',    'despesa'),
('aaaaaaaa-0000-0000-0000-000000000012', 'Outros despesa', 'despesa');
