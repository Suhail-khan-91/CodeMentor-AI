"""
CodeMentor AI — Debug Mode Package (Phase A13).

Curated debugging challenges, test cases, and evaluation wrappers.
"""

from app.services.debugger.base import DebugChallenge
from app.services.debugger.challenges import (
    DEBUG_CHALLENGES,
    get_debug_challenges,
    get_debug_challenge,
)

__all__ = [
    "DebugChallenge",
    "DEBUG_CHALLENGES",
    "get_debug_challenges",
    "get_debug_challenge",
]
