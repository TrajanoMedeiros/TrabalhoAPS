from typing import Any
import unicodedata

from app.saldoo_client import FinancialContext


SYSTEM_CONTEXT = (
    "Voce e o assistente financeiro do Saldoo. Responda em portugues do Brasil, "
    "com orientacao clara, segura e acionavel. Nao prometa retorno financeiro e "
    "nao substitua aconselhamento profissional."
)


class LocalAdvisor:
    def answer(self, question: str, context: FinancialContext) -> str:
        text = _normalize(question)

        if context.available:
            contextual_answer = self._answer_with_context(text, context)
            if contextual_answer:
                return contextual_answer

        if "score" in text:
            return (
                "Para melhorar seu score, mantenha pagamentos em dia, reduza gastos recorrentes "
                "e acompanhe mensalmente quanto da renda permanece livre."
            )

        if "divida" in text:
            return (
                "Liste as dividas por taxa de juros e vencimento. Priorize as mais caras, "
                "renegocie parcelas e evite assumir novas obrigacoes ate estabilizar o caixa."
            )

        if "econom" in text or "guardar" in text or "reserva" in text:
            return (
                "Comece com uma reserva pequena e automatica no dia em que a renda entra. "
                "Depois revise categorias variaveis para encontrar cortes sustentaveis."
            )

        return (
            "Registre receitas, despesas e metas com frequencia. Com historico consistente, "
            "o Saldoo consegue indicar prioridades, riscos e oportunidades de economia."
        )

    def _answer_with_context(self, text: str, context: FinancialContext) -> str | None:
        dashboard = context.dashboard or {}
        score = context.score or {}
        balance = float(dashboard.get("saldo_atual") or 0)
        income = float(dashboard.get("total_receitas") or 0)
        expense = float(dashboard.get("total_despesas") or 0)
        score_value = score.get("score")
        score_level = score.get("nivel")

        if "score" in text and score_value:
            return (
                f"Seu score financeiro atual e {score_value} ({score_level}). "
                "O melhor proximo passo e manter despesas abaixo da renda e evoluir metas "
                "sem comprometer a reserva."
            )

        if expense > income and income > 0:
            return (
                "Neste periodo suas despesas superam as receitas registradas. Priorize corte "
                "de recorrencias, renegociacao de compromissos e um teto semanal de gastos."
            )

        if balance > 0 and ("econom" in text or "guardar" in text or "reserva" in text):
            return (
                f"Voce tem saldo positivo de R$ {balance:,.2f}. Separe parte dele para reserva "
                "antes de novos gastos e acompanhe se a economia se repete no proximo mes."
            ).replace(",", "X").replace(".", ",").replace("X", ".")

        return None


def build_generative_prompt(question: str, context: FinancialContext) -> str:
    return "\n".join(
        [
            SYSTEM_CONTEXT,
            "",
            "Contexto financeiro disponivel:",
            _summarize_context(context),
            "",
            f"Pergunta do usuario: {question}",
        ]
    )


def _summarize_context(context: FinancialContext) -> str:
    if not context.available:
        return "Sem dados autenticados da API. Use orientacoes gerais e peca registros no Saldoo."

    return str(
        {
            "dashboard": _compact(context.dashboard),
            "score": _compact(context.score),
        }
    )


def _compact(value: dict[str, Any] | None) -> dict[str, Any]:
    if not value:
        return {}

    allowed = {
        "saldo_atual",
        "total_receitas",
        "total_despesas",
        "taxa_economia",
        "score",
        "nivel",
        "recomendacoes",
    }

    return {key: item for key, item in value.items() if key in allowed}


def _normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.lower())
    return "".join(character for character in normalized if not unicodedata.combining(character))
