"""
CodeMentor AI — Flask entry point.

Run with:
    python run.py
or:
    flask --app run:app run
"""

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port)
