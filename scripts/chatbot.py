import os

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover - dependencia opcional para uso via terminal
    genai = None
    types = None


API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def resposta_local(pergunta: str) -> str:
    texto = pergunta.lower()
    if "score" in texto:
        return (
            "Para melhorar o score, mantenha pagamentos em dia, reduza o uso de credito, "
            "registre sua renda e acompanhe seu comprometimento mensal."
        )
    if "divida" in texto or "dívida" in texto:
        return (
            "Liste as dividas por juros e vencimento, renegocie as mais caras primeiro "
            "e evite assumir parcelas acima da sua renda livre."
        )
    if "econom" in texto or "guardar" in texto:
        return (
            "Defina um valor pequeno para guardar assim que a renda entrar e acompanhe "
            "as categorias que mais variam no mes."
        )

    return (
        "Organize receitas, despesas e metas. Com historico suficiente, fica mais facil "
        "identificar riscos, sobras e prioridades financeiras."
    )


def iniciar_chatbot() -> None:
    if not API_KEY or genai is None or types is None:
        print("--- Saldoo Chatbot local ativo (digite 'sair' para encerrar) ---")
        print("Configure GEMINI_API_KEY para habilitar respostas com IA generativa.")
        while True:
            pergunta = input("Voce: ").strip()
            if pergunta.lower() in {"sair", "exit", "quit"}:
                print("Chatbot: Ate logo!")
                break
            if pergunta:
                print(f"Chatbot: {resposta_local(pergunta)}")
        return

    client = genai.Client(api_key=API_KEY)

    print("--- Gemini Chatbot ativo (digite 'sair' para encerrar) ---")
    while True:
        pergunta = input("Voce: ").strip()
        if pergunta.lower() in {"sair", "exit", "quit"}:
            print("Chatbot: Ate logo!")
            break
        if not pergunta:
            continue

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=pergunta)],
            )
        ]
        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="HIGH"),
        )

        print("Gemini: ", end="", flush=True)
        try:
            for chunk in client.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=config,
            ):
                if chunk.text:
                    print(chunk.text, end="", flush=True)
            print("\n" + "-" * 30)
        except Exception as exc:
            print(f"\nErro ao processar mensagem: {exc}\n")


if __name__ == "__main__":
    iniciar_chatbot()
