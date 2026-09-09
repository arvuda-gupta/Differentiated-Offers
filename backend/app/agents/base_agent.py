from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseAgent(ABC):
    """
    Abstract Base Class for all AI Agents in the platform.
    Provides a standardized execution interface for specialist agents across all lifecycle stages.
    """

    @abstractmethod
    def run(self, *args: Any, **kwargs: Any) -> Dict[str, Any]:
        """
        Main execution entry point for the agent.
        Must be implemented by concrete agent classes.
        """
        pass
