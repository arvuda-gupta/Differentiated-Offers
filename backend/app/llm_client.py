from app.config import settings
from app.llm import OpenAIProvider


class LLMClient:
    """
    Reusable LLM Client wrapper.
    Delegates to configured LLM Provider (OpenAIProvider) while maintaining
    100% backward compatibility for all agent invocations.
    """

    def __init__(self) -> None:
        if settings.LLM_PROVIDER.lower() == "openai":
            self.provider = OpenAIProvider()
        else:
            self.provider = OpenAIProvider()

    def generate(self, prompt: str) -> str:
        """
        Sends prompt to the configured LLM provider and returns the raw string response.
        """
        return self.provider.generate(prompt)
