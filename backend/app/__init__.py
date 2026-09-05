"""
CodeMentor AI — Flask application factory.

Organises the app so that routes, services, and future engines
can be added cleanly in later phases without turning this file
into a monolith.
"""

import os
from flask import Flask
from flask_cors import CORS

from app.config import get_config
from app.routes.health import health_bp
from app.routes.runner import runner_bp
from app.routes.diagnostics import diagnostics_bp
from app.routes.evaluator import evaluator_bp
from app.routes.hints import hints_bp
from app.routes.tutor import tutor_bp
from app.routes.ai_config import ai_config_bp


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration
    cfg = get_config(config_name)
    app.config.from_object(cfg)

    # Enable CORS so the Vite dev server can reach the API
    CORS(app, origins=app.config.get("ALLOWED_ORIGIN", "*"))

    # -----------------------------------------------------------------
    # Register route blueprints
    # Future engines (AI hints, etc.) will each
    # register their own blueprint here.
    # -----------------------------------------------------------------
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(runner_bp, url_prefix="/api")
    app.register_blueprint(diagnostics_bp, url_prefix="/api")
    app.register_blueprint(evaluator_bp, url_prefix="/api")
    app.register_blueprint(hints_bp, url_prefix="/api")
    app.register_blueprint(tutor_bp, url_prefix="/api")
    app.register_blueprint(ai_config_bp, url_prefix="/api")

    return app
