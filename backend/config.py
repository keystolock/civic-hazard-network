"""
config.py — Centralised application settings via pydantic-settings
===================================================================
All configuration values are read from environment variables or from a
`.env` file in the working directory (loaded by python-dotenv).

Usage:
    from config import settings
    print(settings.GEMINI_API_KEY)
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings — values come from the .env file or environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",          # Silently ignore unknown env vars
    )

    # ── Google Gemini ──────────────────────────────────────────────────────────
    # ⚠  PLACEHOLDER: Replace with your real key in .env — never commit the key.
    GEMINI_API_KEY: str = Field(
        default="YOUR_API_KEY_HERE",
        description="Google AI Studio API key for Gemini multimodal calls",
    )

    # ── Telegram ───────────────────────────────────────────────────────────────
    # ⚠  PLACEHOLDER: Replace with your real Telegram Bot token in .env.
    TELEGRAM_BOT_TOKEN: str = Field(
        default="YOUR_TELEGRAM_BOT_TOKEN_HERE",
        description="Token issued by @BotFather on Telegram",
    )
    # ⚠  PLACEHOLDER: Replace with the target chat/channel ID in .env.
    TELEGRAM_CHAT_ID: str = Field(
        default="YOUR_TELEGRAM_CHAT_ID_HERE",
        description="Telegram chat_id or @channel_username that receives alerts",
    )

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./civic_hazard.db",
        description="SQLAlchemy async database URL (SQLite default; swap to asyncpg for Postgres)",
    )

    # ── CORS ───────────────────────────────────────────────────────────────────
    FRONTEND_ORIGINS: List[str] = Field(
        default=["http://localhost:3000"],
        description="Comma-separated list of allowed CORS origins",
    )

    # ── Storage ────────────────────────────────────────────────────────────────
    UPLOAD_DIR: str = Field(
        default="uploads",
        description="Directory for uploaded hazard images",
    )

    # ── Deduplication ─────────────────────────────────────────────────────────
    DEDUP_RADIUS_METERS: float = Field(
        default=250.0,
        description="Spatial deduplication radius in metres",
    )
    DEDUP_IMAGE_HASH_THRESHOLD: int = Field(
        default=10,
        description="Max Hamming distance between perceptual hashes to flag as duplicate image",
    )

    # ── AI Feature Flags ──────────────────────────────────────────────────────
    AI_VERIFICATION_ENABLED: bool = Field(
        default=True,
        description="Set to False to skip Gemini calls during development",
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()


# Convenience singleton imported by other modules
settings: Settings = get_settings()
