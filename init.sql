CREATE TABLE users (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

-- Insert some default categories
INSERT INTO categories (nome) VALUES ('Salário'), ('Alimentação'), ('Transporte'), ('Lazer'), ('Educação'), ('Saúde'), ('Moradia'), ('Outros');

CREATE TABLE incomes (
    id_receita SERIAL PRIMARY KEY,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_categoria INT NOT NULL REFERENCES categories(id_categoria),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id_despesa SERIAL PRIMARY KEY,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_categoria INT NOT NULL REFERENCES categories(id_categoria),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_histories (
    id_historico SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE
);

CREATE TABLE financial_indicators (
    id_indicador SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    id_historico INT NOT NULL REFERENCES financial_histories(id_historico) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_goals (
    id_meta SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    valor_alvo NUMERIC(10, 2) NOT NULL,
    valor_atual NUMERIC(10, 2) DEFAULT 0,
    data_limite DATE,
    id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
    id_categoria INT REFERENCES categories(id_categoria),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
