from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/nexmart"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = "http://localhost:5173"
    DEBUG: bool = True
    APP_NAME: str = "NEXMART API"
    # Disable only where an upstream proxy/CDN already throttles, or in tests.
    RATE_LIMIT_ENABLED: bool = True

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def _normalize_database_url(cls, v: str) -> str:
        """Accept URLs as issued by managed Postgres providers (Neon, Render,
        Heroku) and convert them to the asyncpg form SQLAlchemy expects."""
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        # asyncpg does not understand libpq-style TLS params.
        v = v.replace("sslmode=require", "ssl=require")
        v = v.replace("&channel_binding=require", "").replace(
            "channel_binding=require&", ""
        ).replace("?channel_binding=require", "")
        return v

    @property
    def sync_database_url(self) -> str:
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg2").replace(
            "postgresql+psycopg2", "postgresql+psycopg2"
        )


settings = Settings()

# Never allow the placeholder signing key outside local development.
if not settings.DEBUG and "change-this" in settings.SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is still the placeholder value. Set a strong random key "
        "(e.g. `python -c \"import secrets; print(secrets.token_urlsafe(64))\"`) "
        "in the environment before running with DEBUG=False."
    )
