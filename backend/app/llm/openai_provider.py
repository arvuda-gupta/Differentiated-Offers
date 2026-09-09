import json
import urllib.error
import urllib.request
from typing import Any, Dict

from app.config import settings
from app.llm.provider import BaseLLMProvider
from app.logger import logger


class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI LLM Provider implementation.
    Invokes OpenAI Chat Completions API with network timeout and fallback handling.
    """

    def __init__(self) -> None:
        self.api_key = settings.OPENAI_API_KEY
        self.model = getattr(settings, "LLM_MODEL", "gpt-4o-mini")

    def generate(self, prompt: str) -> str:
        """
        Sends prompt to OpenAI Chat Completions endpoint.
        """
        if not self.api_key:
            logger.info("OPENAI_API_KEY absent. Utilizing mock LLM fallback response.")
            return (
                "[MOCK LLM RESPONSE] Based on the customer needs and commercial offer context, "
                "the primary opportunity is to deliver an outcome-based advisory and risk guarantee "
                "solution targeting severe yield loss in European markets."
            )

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI Discovery Agent assistant for agricultural commercial offer development.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["choices"][0]["message"]["content"]
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, Exception) as err:
            logger.error(f"OpenAI API request failed: {err}. Returning network fallback response.")
            return (
                f"[MOCK LLM RESPONSE - NETWORK FALLBACK ({err})] Based on the customer needs and commercial offer context, "
                "the primary opportunity is to deliver an outcome-based advisory and risk guarantee solution "
                "targeting severe yield loss in European markets."
            )
