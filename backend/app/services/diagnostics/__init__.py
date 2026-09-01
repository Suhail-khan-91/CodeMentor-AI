"""
CodeMentor AI — Code Diagnostics Package (Phase A4).

Deterministic educational diagnostics for Python syntax, indentation, and runtime errors.
"""

from app.services.diagnostics.base import CodeDiagnostic
from app.services.diagnostics.engine import DiagnosticEngine, diagnose_error

__all__ = ["CodeDiagnostic", "DiagnosticEngine", "diagnose_error"]
