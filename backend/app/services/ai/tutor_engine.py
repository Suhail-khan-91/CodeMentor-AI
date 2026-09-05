"""
CodeMentor AI — AI Tutor Engine Orchestrator (Phase A7).

Coordinates context gathering across A3 Runner, A4 Diagnostics, A5 Evaluation,
and A6 Deterministic Hints to synthesize Socratic AI guidance.
"""

from typing import Optional, Dict, Any
from app.services.ai.base import AITutorResponse, BaseLLMClient
from app.services.ai.prompt_builder import build_tutor_prompt
from app.services.ai.providers import get_llm_provider
from app.services.evaluator.base import TaskDefinition, EvaluationResult
from app.services.hints import generate_hints


class AITutorEngine:
    """Orchestrates AI tutoring with pedagogical grounding and provider abstraction."""

    def __init__(self, client: Optional[BaseLLMClient] = None):
        self._client = client

    def get_client(self) -> BaseLLMClient:
        if self._client is None:
            self._client = get_llm_provider()
        return self._client

    def ask_tutor(
        self,
        code: str,
        task: Optional[TaskDefinition] = None,
        execution_details: Optional[Dict[str, Any]] = None,
        evaluation_result: Optional[EvaluationResult] = None,
        diagnostic: Optional[Dict[str, Any]] = None,
        student_question: Optional[str] = None,
        client_override: Optional[BaseLLMClient] = None
    ) -> AITutorResponse:
        """
        Request Socratic tutoring guidance for the given student state.

        1. Inspects A6 deterministic hint engine for any known mistake rules.
        2. Builds assembled prompt containing code, tracebacks, diffs, and rules.
        3. Calls the configured LLM client.
        4. Returns structured AITutorResponse.
        """
        # 1. Evaluate A6 deterministic hints if not already provided
        rule_hints_dict = None
        try:
            hint_resp = generate_hints(code=code, task=task, evaluation_result=evaluation_result)
            if hint_resp.has_hints:
                rule_hints_dict = hint_resp.to_dict()
        except Exception:
            rule_hints_dict = None

        # 2. Build Socratic pedagogical prompt
        system_prompt, user_prompt = build_tutor_prompt(
            code=code,
            task=task,
            execution_details=execution_details,
            evaluation_result=evaluation_result,
            diagnostic=diagnostic,
            rule_hints=rule_hints_dict,
            student_question=student_question
        )

        # 3. Generate response via active LLM client
        active_client = client_override or self.get_client()

        try:
            response = active_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                context={
                    "task_id": task.id if task else None,
                    "student_question": student_question
                }
            )
            return response
        except Exception as e:
            return AITutorResponse(
                success=False,
                status="error",
                socratic_guidance="The AI Tutor encountered a temporary communication issue. Try again shortly.",
                error_message=str(e),
                provider=getattr(active_client, "model_name", "unknown")
            )
