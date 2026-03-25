-- =============================================================
-- Seed: dados dos clientes — sem score pré-setado
-- O score é gerado via SELECT salvar_score(id) FROM usuario
-- =============================================================

BEGIN;

-- =============================================================
-- USUÁRIOS
-- =============================================================

INSERT INTO usuario (id, nome, email, cpf, renda_mensal) VALUES
('bbbbbbbb-0000-0000-0000-000000000001', 'Ana Beatriz Lima',       'ana.lima@email.com',       '11111111101', 12000.00),
('bbbbbbbb-0000-0000-0000-000000000002', 'Carlos Eduardo Souza',   'carlos.souza@email.com',   '22222222202',  4500.00),
('bbbbbbbb-0000-0000-0000-000000000003', 'Fernanda Gomes Rocha',   'fernanda.rocha@email.com', '33333333303',  7200.00),
('bbbbbbbb-0000-0000-0000-000000000004', 'Ricardo Martins Filho',  'ricardo.martins@email.com','44444444404', 18500.00),
('bbbbbbbb-0000-0000-0000-000000000005', 'Juliana Pereira Costa',  'juliana.costa@email.com',  '55555555505',  3200.00),
('bbbbbbbb-0000-0000-0000-000000000006', 'Bruno Henrique Alves',   'bruno.alves@email.com',    '66666666606',  9000.00),
('bbbbbbbb-0000-0000-0000-000000000007', 'Mariana Oliveira Nunes', 'mariana.nunes@email.com',  '77777777707',  5800.00),
('bbbbbbbb-0000-0000-0000-000000000008', 'Thiago Ferreira Dias',   'thiago.dias@email.com',    '88888888808', 15000.00),
('bbbbbbbb-0000-0000-0000-000000000009', 'Camila Santos Moreira',  'camila.santos@email.com',  '99999999909',  6400.00),
('bbbbbbbb-0000-0000-0000-000000000010', 'Lucas Barbosa Teixeira', 'lucas.teixeira@email.com', '10101010100',  2800.00);

-- =============================================================
-- TRANSAÇÕES (março 2025)
-- =============================================================

INSERT INTO transacao (usuario_id, categoria_id, valor, tipo, data, descricao) VALUES
-- Ana
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',12000.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000003',  900.00,'receita','2025-03-10','Dividendos'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000005', 1800.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000006',  950.00,'despesa','2025-03-07','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000007',  350.00,'despesa','2025-03-05','Combustível'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000008',  280.00,'despesa','2025-03-12','Plano de saúde'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000009',  450.00,'despesa','2025-03-08','MBA parcela 5'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000010',  400.00,'despesa','2025-03-22','Lazer'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000003', 2000.00,'despesa','2025-03-06','Aporte Tesouro Direto'),
('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000011',  110.00,'despesa','2025-03-01','Netflix + Spotify'),
-- Carlos
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001', 4500.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000004',  600.00,'receita','2025-03-20','Bico fim de semana'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000005', 1500.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000006',  900.00,'despesa','2025-03-08','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000006',  320.00,'despesa','2025-03-15','Delivery'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000007',  380.00,'despesa','2025-03-04','Transporte'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000012',  850.00,'despesa','2025-03-10','Parcela empréstimo'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000010',  450.00,'despesa','2025-03-17','Bares e lazer'),
('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000011',  100.00,'despesa','2025-03-01','Streaming'),
-- Fernanda
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000001', 7200.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000002', 1500.00,'receita','2025-03-18','Projeto freelance'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000005', 1600.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000006',  780.00,'despesa','2025-03-06','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000007',  200.00,'despesa','2025-03-04','Transporte'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000008',  250.00,'despesa','2025-03-11','Academia + odonto'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000009',  320.00,'despesa','2025-03-07','Curso motion design'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000010',  850.00,'despesa','2025-03-25','Viagem'),
('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000003',  800.00,'despesa','2025-03-06','Aporte CDB'),
-- Ricardo
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000001',18500.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000003', 2100.00,'receita','2025-03-12','Aluguel recebido + dividendos'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000005', 3200.00,'despesa','2025-03-05','Financiamento apê'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000006', 1100.00,'despesa','2025-03-07','Mercado + restaurante'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000007',  600.00,'despesa','2025-03-05','Carro + combustível'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000008',  480.00,'despesa','2025-03-10','Plano família'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000009',  890.00,'despesa','2025-03-08','Escola filhos'),
('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000003', 5000.00,'despesa','2025-03-06','Aporte previdência privada'),
-- Juliana
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000001', 3200.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000005', 1100.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000006',  700.00,'despesa','2025-03-07','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000006',  280.00,'despesa','2025-03-18','Delivery'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000007',  220.00,'despesa','2025-03-04','Ônibus + app'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000012',  600.00,'despesa','2025-03-10','Cartão de crédito rotativo'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000011',   80.00,'despesa','2025-03-01','Streaming'),
('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000010',  420.00,'despesa','2025-03-22','Saídas'),
-- Bruno
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000001', 9000.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000002',  800.00,'receita','2025-03-19','Consultoria'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000005', 2000.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000006',  850.00,'despesa','2025-03-07','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000007',  420.00,'despesa','2025-03-04','Carro'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000008',  300.00,'despesa','2025-03-11','Plano de saúde'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000009',  200.00,'despesa','2025-03-07','Inglês'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000010',  550.00,'despesa','2025-03-20','Viagem curta'),
('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000003', 1500.00,'despesa','2025-03-06','Aporte fundo imobiliário'),
-- Mariana
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000001', 5800.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000005', 1700.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000006',  820.00,'despesa','2025-03-07','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000006',  350.00,'despesa','2025-03-14','Restaurantes'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000007',  310.00,'despesa','2025-03-04','Transporte'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000008',  220.00,'despesa','2025-03-12','Saúde'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000010',  680.00,'despesa','2025-03-21','Lazer'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000011',  140.00,'despesa','2025-03-01','Assinaturas'),
('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000012',  280.00,'despesa','2025-03-15','Compra parcelada'),
-- Thiago
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000001',15000.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000002', 3500.00,'receita','2025-03-15','Projeto PJ'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000005', 2800.00,'despesa','2025-03-05','Financiamento imóvel'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000006', 1000.00,'despesa','2025-03-07','Mercado família'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000007',  700.00,'despesa','2025-03-04','Carro + combustível'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000008',  550.00,'despesa','2025-03-10','Plano família'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000010',  750.00,'despesa','2025-03-22','Lazer família'),
('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000003', 4000.00,'despesa','2025-03-06','Aporte ações'),
-- Camila
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000001', 6400.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000005', 1500.00,'despesa','2025-03-05','Aluguel'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000006',  700.00,'despesa','2025-03-07','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000007',  180.00,'despesa','2025-03-04','Transporte'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000008',  290.00,'despesa','2025-03-12','Saúde + academia'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000009',  260.00,'despesa','2025-03-08','Pós-graduação parcela'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000010',  380.00,'despesa','2025-03-20','Lazer'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000011',   90.00,'despesa','2025-03-01','Assinaturas'),
('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000003',  900.00,'despesa','2025-03-06','Aporte reserva'),
-- Lucas
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000001', 2800.00,'receita','2025-03-05','Salário'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000005',  950.00,'despesa','2025-03-05','Aluguel quarto'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000006',  600.00,'despesa','2025-03-07','Mercado'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000006',  250.00,'despesa','2025-03-16','Delivery'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000007',  200.00,'despesa','2025-03-04','Transporte'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000012',  480.00,'despesa','2025-03-10','Cartão atrasado'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000010',  290.00,'despesa','2025-03-18','Lazer'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000011',   70.00,'despesa','2025-03-01','Streaming'),
('bbbbbbbb-0000-0000-0000-000000000010','aaaaaaaa-0000-0000-0000-000000000012',  100.00,'despesa','2025-03-22','Outros');

-- =============================================================
-- CONTAS A PAGAR / RECEBER
-- =============================================================

INSERT INTO conta (usuario_id, descricao, valor, tipo, vencimento, status) VALUES
-- Ana
('bbbbbbbb-0000-0000-0000-000000000001','Aluguel abril',            1800.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000001','MBA parcela 6',             450.00,'pagar',  '2025-04-08','pendente'),
('bbbbbbbb-0000-0000-0000-000000000001','Aluguel comercial receber', 2200.00,'receber','2025-04-10','pendente'),
-- Carlos
('bbbbbbbb-0000-0000-0000-000000000002','Aluguel abril',            1500.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000002','Parcela empréstimo',        850.00,'pagar',  '2025-04-10','pendente'),
('bbbbbbbb-0000-0000-0000-000000000002','Consulta médica',           250.00,'pagar',  '2025-03-20','vencido'),
('bbbbbbbb-0000-0000-0000-000000000002','Conta de água',             180.00,'pagar',  '2025-03-10','vencido'),
-- Fernanda
('bbbbbbbb-0000-0000-0000-000000000003','Aluguel abril',            1600.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000003','Recebível projeto',        2400.00,'receber','2025-04-15','pendente'),
-- Ricardo
('bbbbbbbb-0000-0000-0000-000000000004','Financiamento apê',        3200.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000004','Escola filhos abril',       890.00,'pagar',  '2025-04-08','pendente'),
('bbbbbbbb-0000-0000-0000-000000000004','Aluguel sala receber',     2100.00,'receber','2025-04-10','pendente'),
-- Juliana
('bbbbbbbb-0000-0000-0000-000000000005','Aluguel abril',            1100.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000005','Cartão de crédito',         600.00,'pagar',  '2025-03-15','vencido'),
-- Bruno
('bbbbbbbb-0000-0000-0000-000000000006','Aluguel abril',            2000.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000006','Consultoria receber',       800.00,'receber','2025-04-20','pendente'),
-- Mariana
('bbbbbbbb-0000-0000-0000-000000000007','Aluguel abril',            1700.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000007','Compra parcelada',          280.00,'pagar',  '2025-03-25','vencido'),
-- Thiago
('bbbbbbbb-0000-0000-0000-000000000008','Financiamento imóvel',     2800.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000008','Projeto PJ receber',       3500.00,'receber','2025-04-15','pendente'),
-- Camila
('bbbbbbbb-0000-0000-0000-000000000009','Aluguel abril',            1500.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000009','Pós-graduação parcela',     260.00,'pagar',  '2025-04-08','pendente'),
-- Lucas
('bbbbbbbb-0000-0000-0000-000000000010','Aluguel abril',             950.00,'pagar',  '2025-04-05','pendente'),
('bbbbbbbb-0000-0000-0000-000000000010','Cartão atrasado',           480.00,'pagar',  '2025-03-10','vencido'),
('bbbbbbbb-0000-0000-0000-000000000010','Boleto internet',           100.00,'pagar',  '2025-03-18','vencido');

-- =============================================================
-- METAS
-- =============================================================

INSERT INTO meta (usuario_id, titulo, valor_alvo, valor_atual, prazo, status) VALUES
-- Ana
('bbbbbbbb-0000-0000-0000-000000000001','Reserva de emergência',   72000.00, 48000.00,'2025-12-31','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000001','Entrada apartamento',    120000.00, 34000.00,'2027-06-30','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000001','Viagem Europa',           25000.00, 25000.00,'2025-03-01','concluida'),
-- Carlos
('bbbbbbbb-0000-0000-0000-000000000002','Quitar empréstimo',        7650.00,   850.00,'2026-03-10','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000002','Reserva mínima',           5200.00,   320.00,'2025-12-31','em_andamento'),
-- Fernanda
('bbbbbbbb-0000-0000-0000-000000000003','Reserva de emergência',   18000.00, 11500.00,'2025-09-30','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000003','Notebook novo',           14000.00,  7200.00,'2025-07-31','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000003','Viagem Chapada',           3000.00,  3000.00,'2025-03-01','concluida'),
-- Ricardo
('bbbbbbbb-0000-0000-0000-000000000004','Aposentadoria antecipada',500000.00,180000.00,'2035-01-01','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000004','Quitação imóvel',         280000.00, 95000.00,'2030-06-01','em_andamento'),
-- Juliana
('bbbbbbbb-0000-0000-0000-000000000005','Quitar cartão',            3600.00,   600.00,'2025-12-31','em_andamento'),
-- Bruno
('bbbbbbbb-0000-0000-0000-000000000006','Reserva de emergência',   30000.00, 18000.00,'2025-12-31','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000006','Carro novo',              55000.00, 12000.00,'2026-12-31','em_andamento'),
-- Mariana
('bbbbbbbb-0000-0000-0000-000000000007','Viagem internacional',    15000.00,  3200.00,'2026-01-31','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000007','Reserva emergência',      20000.00,  4500.00,'2026-06-30','em_andamento'),
-- Thiago
('bbbbbbbb-0000-0000-0000-000000000008','Independência financeira',800000.00,310000.00,'2038-01-01','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000008','Quitação imóvel',         420000.00,140000.00,'2032-01-01','em_andamento'),
-- Camila
('bbbbbbbb-0000-0000-0000-000000000009','Reserva de emergência',   20000.00,  8500.00,'2026-03-31','em_andamento'),
('bbbbbbbb-0000-0000-0000-000000000009','Intercâmbio',             18000.00,  2000.00,'2026-07-01','em_andamento'),
-- Lucas
('bbbbbbbb-0000-0000-0000-000000000010','Quitar dívidas',           4000.00,   200.00,'2025-12-31','em_andamento');

-- =============================================================
-- GERAR SCORES via função (nenhum score pré-setado)
-- =============================================================

SELECT salvar_score(id, '2025-03-01') FROM usuario;

COMMIT;
