import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """
    Centralized Application Configuration.
    Loads and validates environment variables once on startup.
    """

    def __init__(self) -> None:
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "")
        if not self.DATABASE_URL:
            raise RuntimeError(
                "Mandatory configuration missing: DATABASE_URL environment variable is required."
            )

        self.LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
        self.OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
        self.AWS_REGION: str = os.getenv("AWS_REGION", "eu-central-1")
        self.AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
        self.AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.AWS_S3_BUCKET: Optional[str] = os.getenv("AWS_S3_BUCKET")
        self.AWS_BEDROCK_MODEL_ID: Optional[str] = os.getenv("AWS_BEDROCK_MODEL_ID")
        self.APP_ENV: str = os.getenv("APP_ENV", "development")


settings = Settings()
