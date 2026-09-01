"""
CodeMentor AI — Code Runner Package (Phase A3).

Provides the factory method to obtain the configured code execution backend.
"""

from typing import Optional
from flask import current_app

from app.services.runner.base import BaseRunner, ExecutionResult
from app.services.runner.subprocess_runner import SubprocessRunner


def get_runner(
    runner_type: Optional[str] = None,
    timeout: Optional[float] = None,
    max_output_bytes: Optional[int] = None,
    max_code_length: Optional[int] = None
) -> BaseRunner:
    """
    Factory function returning the active BaseRunner implementation.

    In Phase A3, the default is SubprocessRunner.
    In future phases, DockerRunner or WasmRunner can be selected via configuration.
    """
    # Attempt to read config from current Flask app context if available
    if current_app:
        r_type = runner_type or current_app.config.get("RUNNER_TYPE", "subprocess")
        t_out = timeout if timeout is not None else current_app.config.get("EXECUTION_TIMEOUT", 5.0)
        m_bytes = max_output_bytes if max_output_bytes is not None else current_app.config.get("MAX_OUTPUT_BYTES", 65536)
        m_len = max_code_length if max_code_length is not None else current_app.config.get("MAX_CODE_LENGTH", 50000)
    else:
        r_type = runner_type or "subprocess"
        t_out = timeout if timeout is not None else 5.0
        m_bytes = max_output_bytes if max_output_bytes is not None else 65536
        m_len = max_code_length if max_code_length is not None else 50000

    if r_type == "subprocess":
        return SubprocessRunner(
            default_timeout=t_out,
            max_output_bytes=m_bytes,
            max_code_length=m_len
        )
    else:
        # Fallback to SubprocessRunner if unknown type requested
        return SubprocessRunner(
            default_timeout=t_out,
            max_output_bytes=m_bytes,
            max_code_length=m_len
        )


__all__ = ["BaseRunner", "ExecutionResult", "SubprocessRunner", "get_runner"]
