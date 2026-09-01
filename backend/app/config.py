"""
CodeMentor AI — Application configuration.

A single place to manage environment-based settings.
Add new config values here as future phases require them.
"""

import os
from dotenv import load_dotenv

# Load .env if it exists (local development only)
load_dotenv()


class BaseConfig:
    """Shared defaults for all environments."""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")
    # Code Runner Engine settings (Phase A3)
    EXECUTION_TIMEOUT = float(os.getenv("EXECUTION_TIMEOUT", "5.0"))
    MAX_CODE_LENGTH = int(os.getenv("MAX_CODE_LENGTH", "50000"))
    MAX_OUTPUT_BYTES = int(os.getenv("MAX_OUTPUT_BYTES", "65536"))
    RUNNER_TYPE = os.getenv("RUNNER_TYPE", "subprocess")


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class TestingConfig(BaseConfig):
    TESTING = True
    DEBUG = True


class ProductionConfig(BaseConfig):
    DEBUG = False


_CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str | None = None):
    """Return the appropriate config class based on name or FLASK_ENV."""
    env = name or os.getenv("FLASK_ENV", "development")
    return _CONFIGS.get(env, DevelopmentConfig)
