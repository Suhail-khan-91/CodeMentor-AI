"""
CodeMentor AI — Subprocess Code Runner Implementation (Phase A3).

Executes Python code in an isolated child process with timeout,
environment scrubbing, output truncation, and error extraction.
"""

import os
import sys
import time
import base64
import tempfile
import subprocess
from typing import Optional, Dict, List, Any

from app.services.runner.base import BaseRunner, ExecutionResult
from app.services.runner.parser import parse_traceback

# Safe environment variables to pass to child process
SAFE_ENV_KEYS = {
    # Windows system essentials
    "SYSTEMROOT", "WINDIR", "PATH", "PATHEXT", "TEMP", "TMP",
    "LOCALAPPDATA", "APPDATA", "USERPROFILE", "HOMEDRIVE", "HOMEPATH",
    "COMSPEC", "PROGRAMDATA", "PROGRAMFILES", "PROGRAMFILES(X86)",
    # Unix system essentials
    "PATH", "HOME", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR", "SHELL", "USER"
}

SCRIPT_FILENAME = "solution.py"


class SubprocessRunner(BaseRunner):
    """Executes Python code using a separate Python subprocess."""

    def __init__(
        self,
        default_timeout: float = 5.0,
        max_output_bytes: int = 65536,
        max_code_length: int = 50000
    ):
        self.default_timeout = default_timeout
        self.max_output_bytes = max_output_bytes
        self.max_code_length = max_code_length

    def _build_safe_env(self) -> Dict[str, str]:
        """Create a sanitized environment dictionary excluding server secrets."""
        safe_env = {}
        for key in SAFE_ENV_KEYS:
            if key in os.environ:
                safe_env[key] = os.environ[key]

        # Force unbuffered UTF-8 I/O, disable bytecode generation, and set headless Agg backend for matplotlib
        safe_env["PYTHONUNBUFFERED"] = "1"
        safe_env["PYTHONIOENCODING"] = "utf-8"
        safe_env["PYTHONDONTWRITEBYTECODE"] = "1"
        safe_env["MPLBACKEND"] = "Agg"
        return safe_env

    def run(
        self,
        code: str,
        stdin: str = "",
        files: Optional[List[Dict[str, str]]] = None,
        timeout: Optional[float] = None
    ) -> ExecutionResult:
        """Execute code in a separate Python process inside a temporary directory."""
        effective_timeout = timeout if timeout is not None else self.default_timeout

        # Ensure code doesn't exceed maximum length
        if len(code) > self.max_code_length:
            return ExecutionResult(
                status="error",
                stdout="",
                stderr=f"Code length exceeds maximum allowed limit of {self.max_code_length} characters.",
                exit_code=1,
                execution_time_ms=0.0,
                timed_out=False,
                error_type="ValueError",
                error_message=f"Code length exceeds maximum allowed limit ({len(code)} > {self.max_code_length})",
                line_number=None
            )

        # Create temporary directory for isolation
        with tempfile.TemporaryDirectory(prefix="codementor_run_") as temp_dir:
            # Write any attached data files (e.g. data.csv, dataset files)
            if files and isinstance(files, list):
                for f_item in files:
                    if isinstance(f_item, dict) and "name" in f_item:
                        clean_name = os.path.basename(f_item["name"])
                        f_content = f_item.get("content", "")
                        with open(os.path.join(temp_dir, clean_name), "w", encoding="utf-8") as df:
                            df.write(f_content)

            # Auto-capture Matplotlib figures if plotting libraries are used
            script_content = code
            if "matplotlib" in code or "plt." in code or "seaborn" in code or "sns." in code:
                plot_hook = (
                    "\n\n# CodeMentor Auto-Capture\n"
                    "try:\n"
                    "    import matplotlib.pyplot as _cm_plt\n"
                    "    if _cm_plt.get_fignums():\n"
                    "        _cm_plt.savefig('_codementor_plot.png', bbox_inches='tight', dpi=120)\n"
                    "        _cm_plt.close('all')\n"
                    "except Exception:\n"
                    "    pass\n"
                )
                script_content = code + plot_hook

            script_path = os.path.join(temp_dir, SCRIPT_FILENAME)
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(script_content)

            env = self._build_safe_env()
            cmd = [sys.executable, "-u", "-B", SCRIPT_FILENAME]
            stdin_bytes = stdin.encode("utf-8") if stdin else b""

            start_time = time.perf_counter()
            timed_out = False
            raw_stdout = b""
            raw_stderr = b""
            exit_code: Optional[int] = None

            try:
                proc = subprocess.Popen(
                    cmd,
                    cwd=temp_dir,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=env
                )

                try:
                    raw_stdout, raw_stderr = proc.communicate(
                        input=stdin_bytes,
                        timeout=effective_timeout
                    )
                    exit_code = proc.returncode
                except subprocess.TimeoutExpired:
                    timed_out = True
                    # Force process termination
                    try:
                        proc.kill()
                    except Exception:
                        pass
                    # Drain any remaining output
                    try:
                        partial_out, partial_err = proc.communicate(timeout=0.5)
                        raw_stdout = partial_out or b""
                        raw_stderr = partial_err or b""
                    except Exception:
                        pass
                    exit_code = None

            except Exception as e:
                execution_time_ms = (time.perf_counter() - start_time) * 1000.0
                return ExecutionResult(
                    status="error",
                    stdout="",
                    stderr=f"Failed to start execution process: {str(e)}",
                    exit_code=1,
                    execution_time_ms=execution_time_ms,
                    timed_out=False,
                    error_type="ProcessError",
                    error_message=str(e),
                    line_number=None
                )

            execution_time_ms = (time.perf_counter() - start_time) * 1000.0

            # Handle output truncation if output exceeds max_output_bytes
            stdout_truncated = False
            if len(raw_stdout) > self.max_output_bytes:
                raw_stdout = raw_stdout[:self.max_output_bytes]
                stdout_truncated = True

            stderr_truncated = False
            if len(raw_stderr) > self.max_output_bytes:
                raw_stderr = raw_stderr[:self.max_output_bytes]
                stderr_truncated = True

            stdout_str = raw_stdout.decode("utf-8", errors="replace").replace("\r\n", "\n")
            stderr_str = raw_stderr.decode("utf-8", errors="replace").replace("\r\n", "\n")

            # Clean temporary directory paths from stderr for clean student-facing tracebacks
            if temp_dir:
                stderr_str = stderr_str.replace(temp_dir + os.sep, "").replace(temp_dir + "/", "").replace(temp_dir, "")

            if stdout_truncated:
                stdout_str += "\n... [Output truncated: maximum 64KB limit reached]"
            if stderr_truncated:
                stderr_str += "\n... [Error output truncated: maximum 64KB limit reached]"

            # Check for captured or generated plot images
            plot_image = None
            target_plot_file = os.path.join(temp_dir, "_codementor_plot.png")
            if not os.path.exists(target_plot_file):
                # Check if code saved custom images
                for fname in os.listdir(temp_dir):
                    if fname.lower().endswith((".png", ".jpg", ".jpeg", ".svg")) and fname != SCRIPT_FILENAME:
                        target_plot_file = os.path.join(temp_dir, fname)
                        break

            if os.path.exists(target_plot_file):
                try:
                    with open(target_plot_file, "rb") as img_file:
                        b64_data = base64.b64encode(img_file.read()).decode("utf-8")
                        mime = "png" if target_plot_file.lower().endswith(".png") else "jpeg"
                        plot_image = f"data:image/{mime};base64,{b64_data}"
                except Exception:
                    pass

            # Handle timeout scenario
            if timed_out:
                return ExecutionResult(
                    status="timeout",
                    stdout=stdout_str,
                    stderr=f"Execution timed out after {effective_timeout:.1f} seconds.\n{stderr_str}".strip(),
                    exit_code=None,
                    execution_time_ms=execution_time_ms,
                    timed_out=True,
                    error_type="TimeoutError",
                    error_message=f"Execution exceeded maximum allowed time ({effective_timeout:.1f}s)",
                    line_number=None,
                    plot_image=plot_image
                )

            # Process completed normally or with error
            if exit_code == 0:
                return ExecutionResult(
                    status="success",
                    stdout=stdout_str,
                    stderr=stderr_str,
                    exit_code=0,
                    execution_time_ms=execution_time_ms,
                    timed_out=False,
                    error_type=None,
                    error_message=None,
                    line_number=None,
                    plot_image=plot_image
                )
            else:
                # Parse traceback to extract structured details for A4 / A5
                parsed = parse_traceback(stderr_str, SCRIPT_FILENAME)
                status = "syntax_error" if parsed["is_syntax_error"] else "runtime_error"

                return ExecutionResult(
                    status=status,
                    stdout=stdout_str,
                    stderr=stderr_str,
                    exit_code=exit_code,
                    execution_time_ms=execution_time_ms,
                    timed_out=False,
                    error_type=parsed["error_type"] or "RuntimeError",
                    error_message=parsed["error_message"] or "Script exited with non-zero exit code",
                    line_number=parsed["line_number"],
                    plot_image=plot_image
                )
