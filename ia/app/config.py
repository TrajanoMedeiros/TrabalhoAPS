from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str | None
    gemini_model: str
    saldoo_api_url: str
    saldoo_api_token: str | None

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            gemini_api_key=os.getenv("GEMINI_API_KEY"),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            saldoo_api_url=os.getenv("SALDOO_API_URL", "http://127.0.0.1:8000"),
            saldoo_api_token=os.getenv("SALDOO_API_TOKEN"),
        )
