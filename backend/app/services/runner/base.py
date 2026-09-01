"""
CodeMentor AI — Base Runner Interface & Data Models (Phase A3).

Defines the abstract interface and standard execution result structure.
Any execution backend (Subprocess, Docker, Wasm/Pyodide, gVisor) must
implement this interface to ensure zero coupling with routes or downstream engines.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class ExecutionResult:
    """Standardized representation of code execution outcome."""
    status: str              # "success" | "runtime_error" | "syntax_error" | "timeout"
    stdout: str
    stderr: str
    exit_code: Optional[int]
    execution_time_ms: float
    timed_out: bool
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    line_number: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to a structured dictionary for JSON response."""
        error_summary = None
        if self.error_type and self.error_message:
            error_summary = f"{self.error_type}: {self.error_message}"
        elif self.error_type:
            error_summary = self.error_type
        elif self.error_message:
            error_summary = self.error_message

        return {
            "status": self.status,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "exit_code": self.exit_code,
            "execution_time_ms": round(self.execution_time_ms, 2),
            "timed_out": self.timed_out,
            "error": error_summary,
            "details": {
                "error_type": self.error_type,
                "error_message": self.error_message,
                "line_number": self.line_number
            }
        }


class BaseRunner(ABC):
    """Abstract base class for all code execution backends."""

    @abstractmethod
    def run(self, code: str, stdin: str = "", timeout: Optional[float] = None) -> ExecutionResult:
        """
        Execute Python code and return an ExecutionResult.

        :param code: Python source code string to execute
        :param stdin: Optional standard input data to supply to the process
        :param timeout: Execution timeout in seconds (uses runner default if None)
        :return: ExecutionResult dataclass instance
        """
        pass
