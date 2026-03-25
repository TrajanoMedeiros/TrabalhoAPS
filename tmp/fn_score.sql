-- =============================================================
-- Função de cálculo de score + queries com INNER JOIN
-- =============================================================

-- =============================================================
-- FUNÇÃO: calcular_score
-- Lê os dados reais das tabelas e retorna o score calculado
-- =============================================================

CREATE OR REPLACE FUNCTION calcular_score(
    p_usuario_id UUID,
    p_referencia DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS TABLE (
    score_total     INT,
    classificacao   TEXT,
    pts_gastos      INT,
    pts_reserva     INT,
    pts_metas       INT,
    pts_contas      INT,
    pts_renda       INT,
    detalhe_gastos  TEXT,
    detalhe_reserva TEXT,
    detalhe_metas   TEXT,
    detalhe_contas  TEXT,
    detalhe_renda   TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_inicio        DATE     := date_trunc('month', p_referencia)::DATE;
    v_fim           DATE     := (date_trunc('month', p_referencia) + INTERVAL '1 month - 1 day')::DATE;
    v_renda         NUMERIC  := 0;
    v_receita       NUMERIC  := 0;
    v_despesa       NUMERIC  := 0;
    v_investido     NUMERIC  := 0;
    v_metas_ativas  INT      := 0;
    v_metas_concl   INT      := 0;
    v_metas_prog    NUMERIC  := 0;
    v_contas_total  INT      := 0;
    v_contas_venc   INT      := 0;
    v_pts_gastos    INT      := 0;
    v_pts_reserva   INT      := 0;
    v_pts_metas     INT      := 0;
    v_pts_contas    INT      := 0;
    v_pts_renda     INT      := 0;
    v_base          NUMERIC  := 0;
    v_razao_gasto   NUMERIC  := 0;
    v_razao_invest  NUMERIC  := 0;
    v_total         INT      := 0;
    v_class         TEXT;
BEGIN

    -- renda cadastrada
    SELECT renda_mensal INTO v_renda FROM usuario WHERE id = p_usuario_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário % não encontrado', p_usuario_id;
    END IF;

    -- receitas e despesas do mês
    SELECT
        COALESCE(SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.tipo = 'despesa' THEN t.valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.tipo = 'despesa' AND c.nome = 'Investimentos' THEN t.valor ELSE 0 END), 0)
    INTO v_receita, v_despesa, v_investido
    FROM transacao t
    LEFT JOIN categoria c ON c.id = t.categoria_id
    WHERE t.usuario_id = p_usuario_id
      AND t.data BETWEEN v_inicio AND v_fim;

    -- despesa de consumo exclui o que foi investido
    v_despesa := v_despesa - v_investido;
    v_base    := GREATEST(v_renda, v_receita, 1);

    -- -------------------------------------------------------
    -- COMPONENTE 1 — Controle de gastos (até 300 pts)
    -- -------------------------------------------------------
    v_razao_gasto := v_despesa / v_base;
    v_pts_gastos  := CASE
        WHEN v_razao_gasto <= 0.30 THEN 300
        WHEN v_razao_gasto <= 0.40 THEN 270
        WHEN v_razao_gasto <= 0.50 THEN 240
        WHEN v_razao_gasto <= 0.60 THEN 200
        WHEN v_razao_gasto <= 0.70 THEN 160
        WHEN v_razao_gasto <= 0.80 THEN 110
        WHEN v_razao_gasto <= 0.90 THEN  60
        WHEN v_razao_gasto <= 1.00 THEN  20
        ELSE 0
    END;

    -- -------------------------------------------------------
    -- COMPONENTE 2 — Reserva / investimento (até 250 pts)
    -- -------------------------------------------------------
    v_razao_invest := v_investido / v_base;
    v_pts_reserva  := CASE
        WHEN v_razao_invest >= 0.30 THEN 250
        WHEN v_razao_invest >= 0.20 THEN 210
        WHEN v_razao_invest >= 0.15 THEN 175
        WHEN v_razao_invest >= 0.10 THEN 130
        WHEN v_razao_invest >= 0.05 THEN  80
        WHEN v_razao_invest >  0.00 THEN  30
        ELSE 0
    END;

    -- -------------------------------------------------------
    -- COMPONENTE 3 — Metas (até 200 pts)
    -- -------------------------------------------------------
    SELECT
        COUNT(*)              FILTER (WHERE status = 'em_andamento'),
        COUNT(*)              FILTER (WHERE status = 'concluida'),
        COALESCE(AVG(CASE WHEN valor_alvo > 0 THEN valor_atual / valor_alvo ELSE 0 END)
                 FILTER (WHERE status = 'em_andamento'), 0)
    INTO v_metas_ativas, v_metas_concl, v_metas_prog
    FROM meta WHERE usuario_id = p_usuario_id;

    v_pts_metas :=
        CASE WHEN v_metas_ativas >= 3 THEN 80
             WHEN v_metas_ativas =  2 THEN 60
             WHEN v_metas_ativas =  1 THEN 40
             ELSE 0 END
        + CASE WHEN v_metas_prog >= 0.75 THEN 80
               WHEN v_metas_prog >= 0.50 THEN 60
               WHEN v_metas_prog >= 0.25 THEN 40
               WHEN v_metas_prog >  0.00 THEN 20
               ELSE 0 END
        + LEAST(v_metas_concl * 20, 40);

    -- -------------------------------------------------------
    -- COMPONENTE 4 — Contas em dia (até 150 pts)
    -- -------------------------------------------------------
    SELECT
        COUNT(*) FILTER (WHERE tipo = 'pagar'),
        COUNT(*) FILTER (WHERE tipo = 'pagar' AND status = 'vencido')
    INTO v_contas_total, v_contas_venc
    FROM conta
    WHERE usuario_id = p_usuario_id
      AND vencimento BETWEEN v_inicio AND v_fim;

    v_pts_contas := CASE
        WHEN v_contas_total = 0 THEN 120
        WHEN v_contas_venc  = 0 THEN 150
        WHEN v_contas_venc  = 1 THEN  90
        WHEN v_contas_venc  = 2 THEN  50
        WHEN v_contas_venc  = 3 THEN  20
        ELSE 0
    END;

    -- -------------------------------------------------------
    -- COMPONENTE 5 — Renda (até 100 pts)
    -- -------------------------------------------------------
    v_pts_renda := CASE
        WHEN v_renda >= 20000 THEN 100
        WHEN v_renda >= 15000 THEN  90
        WHEN v_renda >= 10000 THEN  80
        WHEN v_renda >=  7000 THEN  65
        WHEN v_renda >=  5000 THEN  50
        WHEN v_renda >=  3000 THEN  35
        WHEN v_renda >=  1500 THEN  20
        ELSE 10
    END;

    -- -------------------------------------------------------
    -- TOTAL
    -- -------------------------------------------------------
    v_total := LEAST(v_pts_gastos + v_pts_reserva + v_pts_metas + v_pts_contas + v_pts_renda, 1000);
    v_class := CASE
        WHEN v_total >= 800 THEN 'excelente'
        WHEN v_total >= 650 THEN 'bom'
        WHEN v_total >= 450 THEN 'regular'
        WHEN v_total >= 250 THEN 'ruim'
        ELSE 'critico'
    END;

    RETURN QUERY SELECT
        v_total, v_class,
        v_pts_gastos, v_pts_reserva, v_pts_metas, v_pts_contas, v_pts_renda,
        format('Despesas R$ %s / Base R$ %s = %s%%',
            to_char(v_despesa,      'FM999G990D00'),
            to_char(v_base,         'FM999G990D00'),
            to_char(v_razao_gasto * 100, 'FM990D0')),
        format('Investido R$ %s / Base R$ %s = %s%%',
            to_char(v_investido,    'FM999G990D00'),
            to_char(v_base,         'FM999G990D00'),
            to_char(v_razao_invest * 100, 'FM990D0')),
        format('Ativas: %s | Concluídas: %s | Progresso médio: %s%%',
            v_metas_ativas, v_metas_concl,
            to_char(v_metas_prog * 100, 'FM990D0')),
        format('Contas a pagar: %s | Vencidas: %s',
            v_contas_total, v_contas_venc),
        format('Renda cadastrada: R$ %s',
            to_char(v_renda, 'FM999G990D00'));
END;
$$;

-- =============================================================
-- FUNÇÃO AUXILIAR: salvar_score
-- Persiste o resultado na tabela score
-- =============================================================

CREATE OR REPLACE FUNCTION salvar_score(
    p_usuario_id UUID,
    p_referencia DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
    SELECT * INTO r FROM calcular_score(p_usuario_id, p_referencia);
    INSERT INTO score (usuario_id, pontuacao, classificacao, referencia_mes)
    VALUES (p_usuario_id, r.score_total, r.classificacao, p_referencia)
    ON CONFLICT (usuario_id, referencia_mes)
    DO UPDATE SET
        pontuacao     = EXCLUDED.pontuacao,
        classificacao = EXCLUDED.classificacao,
        calculado_em  = NOW();
END;
$$;

-- =============================================================
-- QUERIES DE EXEMPLO
-- =============================================================

-- 1. Score em tempo real (sem persistir) de um único usuário
SELECT score_total, classificacao,
       pts_gastos, pts_reserva, pts_metas, pts_contas, pts_renda
FROM calcular_score('bbbbbbbb-0000-0000-0000-000000000001', '2025-03-01');


-- 2. Score em tempo real de todos os usuários (lateral join)
SELECT u.id, u.nome, u.renda_mensal,
       s.score_total, s.classificacao,
       s.pts_gastos, s.pts_reserva, s.pts_metas, s.pts_contas, s.pts_renda
FROM usuario u
CROSS JOIN LATERAL calcular_score(u.id, '2025-03-01') s
ORDER BY s.score_total DESC;


-- 3. Usuário + score persistido via INNER JOIN
SELECT u.id, u.nome, u.renda_mensal,
       s.pontuacao, s.classificacao, s.referencia_mes, s.calculado_em
FROM usuario u
INNER JOIN score s ON s.usuario_id = u.id
WHERE s.referencia_mes = '2025-03-01'
ORDER BY s.pontuacao DESC;


-- 4. Usuário + score + detalhes dos componentes em tempo real
SELECT u.nome, u.renda_mensal,
       cs.score_total, cs.classificacao,
       cs.detalhe_gastos,
       cs.detalhe_reserva,
       cs.detalhe_metas,
       cs.detalhe_contas,
       cs.detalhe_renda
FROM usuario u
CROSS JOIN LATERAL calcular_score(u.id, '2025-03-01') cs
ORDER BY cs.score_total DESC;


-- 5. Salvar score de todos os usuários para um mês específico
SELECT salvar_score(id, '2025-03-01') FROM usuario;

-- Salvar score do mês atual para todos:
-- SELECT salvar_score(id) FROM usuario;
