from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    """
    Abstract Base Class for LLM Providers.
    Exposes a unified interface for prompt generation across LLM backends.
    """

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """
        Sends prompt to LLM and returns raw string output.
        """
        pass
