"""
CodeMentor AI — Mock LLM Provider (Phase A7).

A deterministic, offline Socratic tutor client for testing, local offline usage,
and test suite execution without external API dependencies or costs.
"""

from typing import Optional, Dict, Any
from app.services.ai.base import BaseLLMClient, AITutorResponse


class MockLLMClient(BaseLLMClient):
    """Deterministic offline AI tutor simulator enforcing pedagogical constraints."""

    def __init__(self, model_name: str = "mock-socratic-tutor"):
        self.model_name = model_name

    def is_available(self) -> bool:
        return True

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AITutorResponse:
        """
        Generate contextual Socratic responses based on keywords in the assembled user prompt.
        Guarantees zero full copy-paste solutions.
        """
        prompt_lower = user_prompt.lower()

        # 1. Custom student question inquiry
        if "student question" in prompt_lower:
            guidance = (
                "That's a thoughtful question! Let's break down how Python sees this: "
                "when you write an expression, Python evaluates it from inside out. "
                "What value do you think the inner function produces first?"
            )
            nudge = "Think about the data type that your expression produces at each step."
            strategy = "Isolate the inner expression and test its result before passing it to the outer function."
            clue = "# Try breaking it into steps:\nfirst_result = ...\nfinal_result = process(first_result)"
            suggested = ["Inspect intermediate variable values", "Check variable data types"]

        # 2. Syntax / Indentation Error Context
        elif "syntaxerror" in prompt_lower or "indentationerror" in prompt_lower:
            guidance = (
                "Python stopped because it found a line whose structure it couldn't understand yet. "
                "Look closely at the highlighted line. Does every opening punctuation mark have a matching partner?"
            )
            nudge = "Check closing quotes, parentheses, and colons at the end of statement headers."
            strategy = "Inspect the characters right before where the cursor or line indicator points."
            clue = "# Structure check:\nif condition:\n    ... # indented block"
            suggested = ["Check for missing colons", "Match all brackets () and quotes"]

        # 3. Type / Name / ZeroDivision Runtime Error
        elif "typeerror" in prompt_lower or "nameerror" in prompt_lower or "zerodivision" in prompt_lower:
            guidance = (
                "Your program started running, but hit an unexpected operation on a value. "
                "Ask yourself: what exact type of value is stored in the variable right before this operation occurs?"
            )
            nudge = "Remember that mathematical operators like +, -, *, and / require numbers, not unparsed text."
            strategy = "Inspect your variable types using type() or convert text to int() / float() before operations."
            clue = "# Conversion pattern:\nnumeric_val = int(...) # convert text before calculation"
            suggested = ["Check variable types", "Wrap string input in int() or float()"]

        # 4. Test Case Failure / Logic Mismatch
        elif "test evaluation" in prompt_lower or "failed test cases" in prompt_lower:
            guidance = (
                "Your code ran smoothly without crashing, but the output didn't quite match the expected answer. "
                "Notice the difference between what was expected and what printed: is there extra text, missing punctuation, or a calculation difference?"
            )
            nudge = "Automated test suites look for character-by-character matches. Extra prompt text or whitespace can trigger a failure."
            strategy = "Review the exact required output format in the challenge description and compare it with your actual output."
            clue = "# Output pattern:\nprint(f\"...{result}...\")"
            suggested = ["Compare actual vs expected character by character", "Remove interactive prompt strings from input()"]

        # 5. General Fallback
        else:
            guidance = (
                "Let's tackle this step by step. What is the very first thing your program needs to do: "
                "read an input, define a variable, or perform a calculation?"
            )
            nudge = "Divide the problem into 3 steps: Input, Process, and Output."
            strategy = "Write one line at a time, running your code after each line to see what happens."
            clue = "# Step-by-step skeleton:\n# 1. Read input\n# 2. Calculate\n# 3. Print"
            suggested = ["Break the task into smaller steps", "Review challenge instructions"]

        return AITutorResponse(
            success=True,
            status="success",
            socratic_guidance=guidance,
            conceptual_nudge=nudge,
            strategy=strategy,
            structural_clue=clue,
            source="ai_tutor",
            provider="mock",
            model=self.model_name,
            suggested_actions=suggested
        )
