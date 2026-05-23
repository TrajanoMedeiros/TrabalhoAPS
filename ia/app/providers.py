from app.advisor import LocalAdvisor, build_generative_prompt
from app.config import Settings
from app.saldoo_client import FinancialContext

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover
    genai = None
    types = None


class AssistantService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.local = LocalAdvisor()

    def answer(self, question: str, context: FinancialContext) -> str:
        if not self.settings.gemini_api_key or genai is None or types is None:
            return self.local.answer(question, context)

        client = genai.Client(api_key=self.settings.gemini_api_key)
        prompt = build_generative_prompt(question, context)

        try:
            response = client.models.generate_content(
                model=self.settings.gemini_model,
                contents=[
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=prompt)],
                    )
                ],
            )
        except Exception:
            return self.local.answer(question, context)

        return response.text or self.local.answer(question, context)
