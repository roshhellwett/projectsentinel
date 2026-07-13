from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = Field("", alias="SUPABASE_URL")
    supabase_service_role_key: str = Field("", alias="SUPABASE_SERVICE_ROLE_KEY")
    groq_api_key: str = Field("", alias="GROQ_API_KEY")
    groq_api_key_verify: str = Field("", alias="GROQ_API_KEY_VERIFY")
    newsapi_key: str = Field("", alias="NEWSAPI_KEY")
    gnews_api_key: str = Field("", alias="GNEWS_API_KEY")
    cors_origins: str = Field(
        "https://zenithopensourceprojects.vercel.app,https://verifiedindian.vercel.app,https://indiaverified.vercel.app",
        alias="CORS_ORIGINS",
    )
    port: int = Field(8000, alias="PORT")
    sentry_dsn: str = Field("", alias="SENTRY_DSN")
    environment: str = Field("development", alias="ENVIRONMENT")

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            return "development"
        return v

    model_config = {"populate_by_name": True}


settings = Settings()
