from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-6-luna"

    # ガードレール定数
    max_stored_examples: int = 100      # ストック上限（超えたらFIFOで押し出し）
    default_few_shot_count: int = 4     # 1回の生成で注入するデフォルト件数
    max_few_shot_count: int = 8         # 1回の生成で注入できる最大件数

    # ストレージ設定（将来 S3 へ切り替え可能にする）
    storage_file: Path = Path("data/examples.json")
    allowed_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
