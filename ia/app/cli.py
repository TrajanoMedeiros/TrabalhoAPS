from app.config import Settings
from app.providers import AssistantService
from app.saldoo_client import SaldooApiClient


def run() -> None:
    settings = Settings.from_environment()
    client = SaldooApiClient(settings.saldoo_api_url, settings.saldoo_api_token)
    context = client.financial_context()
    assistant = AssistantService(settings)

    mode = "integrado" if context.available else "local"
    print(f"--- Saldoo IA ({mode}) ativo. Digite 'sair' para encerrar. ---")

    while True:
        question = input("Voce: ").strip()
        if question.lower() in {"sair", "exit", "quit"}:
            print("Saldoo IA: Ate logo!")
            break
        if not question:
            continue

        print(f"Saldoo IA: {assistant.answer(question, context)}")
