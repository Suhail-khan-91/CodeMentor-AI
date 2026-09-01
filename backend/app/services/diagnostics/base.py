"""
CodeMentor AI — Code Diagnostic Base Models (Phase A4).

Defines the structured CodeDiagnostic model returned by the diagnostic engine.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class CodeDiagnostic:
    """Standardized representation of an educational code diagnostic."""
    has_diagnostic: bool
    error_type: Optional[str]
    title: str
    friendly_explanation: str
    hint: Optional[str] = None
    line_number: Optional[int] = None
    code_snippet: Optional[str] = None
    category: str = "general"       # "syntax" | "runtime" | "indentation" | "timeout" | "general"
    confidence: str = "high"        # "high" | "medium"

    def to_dict(self) -> Dict[str, Any]:
        """Convert diagnostic to a clean dictionary for JSON serialization."""
        return {
            "has_diagnostic": self.has_diagnostic,
            "error_type": self.error_type,
            "title": self.title,
            "friendly_explanation": self.friendly_explanation,
            "hint": self.hint,
            "line_number": self.line_number,
            "code_snippet": self.code_snippet,
            "category": self.category,
            "confidence": self.confidence
        }
