CREATE TABLE IF NOT EXISTS users (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'personal'
        CHECK (tipo_usuario IN ('personal', 'business')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'both'
        CHECK (tipo IN ('income', 'expense', 'both')),
    id_usuario INT REFERENCES users(id_usuario) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_global_unique
    ON categories (LOWER(nome), tipo)
    WHERE id_usuario IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS categories_user_unique
    ON categories (LOWER(nome), tipo, id_usuario)
    WHERE id_usuario IS NOT NULL;

INSERT INTO categories (nome, tipo) VALUES
    ('Salario', 'income'),
    ('Freelance', 'income'),
    ('Investimentos', 'income'),
    ('Reembolso', 'income'),
    ('Alimentacao', 'expense'),
    ('Transporte', 'expense'),
    ('Moradia', 'expense'),
    ('Saude', 'expense'),
    ('Educacao', 'expense'),
    ('Lazer', 'expense'),
    ('Outros', 'both')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS incomes (
    id_receita SERIAL PRIMARY KEY,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor >= 0),
    data DATE NOT NULL,
    descricao TEXT,
    id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_categoria INT NOT NULL REFERENCES categories(id_categoria),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS incomes_user_date_index ON incomes (id_usuario, data DESC);

CREATE TABLE IF NOT EXISTS expenses (
    id_despesa SERIAL PRIMARY KEY,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor >= 0),
    data DATE NOT NULL,
    descricao TEXT,
    id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_categoria INT NOT NULL REFERENCES categories(id_categoria),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS expenses_user_date_index ON expenses (id_usuario, data DESC);

CREATE TABLE IF NOT EXISTS financial_histories (
    id_historico SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_indicators (
    id_indicador SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    id_historico INT NOT NULL REFERENCES financial_histories(id_historico) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_goals (
    id_meta SERIAL PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    valor_alvo NUMERIC(12, 2) NOT NULL CHECK (valor_alvo > 0),
    valor_atual NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor_atual >= 0),
    data_limite DATE,
    id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_categoria INT REFERENCES categories(id_categoria),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS financial_goals_user_date_index
    ON financial_goals (id_usuario, data_limite ASC NULLS LAST);
