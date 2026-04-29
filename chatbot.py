from google import genai
from google.genai import types
from config import API_KEY, MODEL


def iniciar_chatbot() -> None:
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
