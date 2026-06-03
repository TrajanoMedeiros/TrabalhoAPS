from dataclasses import dataclass
import json
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class FinancialContext:
    dashboard: dict[str, Any] | None = None
    score: dict[str, Any] | None = None

    @property
    def available(self) -> bool:
        return self.dashboard is not None or self.score is not None


class SaldooApiClient:
    def __init__(self, base_url: str, token: str | None) -> None:
        self.base_url = base_url.rstrip("/")
        self.token = token

    def financial_context(self) -> FinancialContext:
        if not self.token:
            return FinancialContext()

        return FinancialContext(
            dashboard=self._get("/api/dashboard").get("dashboard"),
            score=self._get("/api/score").get("score"),
        )

    def _get(self, path: str) -> dict[str, Any]:
        request = Request(
            f"{self.base_url}{path}",
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {self.token}",
            },
        )

        try:
            with urlopen(request, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (OSError, URLError, json.JSONDecodeError):
            return {}

        data = payload.get("data")
        return data if isinstance(data, dict) else {}
