from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Thunderstorm & Lightning Nowcasting System (SIH26072)"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "development-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

    DATABASE_URL: str = "sqlite+aiosqlite:///./nowcast.db"

    # Radar & Satellite Data Paths
    IMD_RADAR_DATA_DIR: str = "./data/radar"
    INSAT_DATA_DIR: str = "./data/satellite"

    # AI Model Checkpoint Paths
    CONVLSTM_MODEL_PATH: str = "./ml_pipeline/model_checkpoints/convlstm_radar_nowcast.onnx"
    LIGHTNING_MODEL_PATH: str = "./ml_pipeline/model_checkpoints/lightning_risk_xgb.onnx"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
