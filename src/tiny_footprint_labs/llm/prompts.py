"""The shared system block and per-session turns used by the real-model lab."""

from __future__ import annotations

# Long shared system/policy block: the duplicated resident state LLM servers pay for.
SYSTEM_PREFIX = (
    "You are Tiny Footprint serving fabric. Shared organizational pattern once. "
    "Policy: be concise, exact, and reuse templates. "
    "Tools: search, retrieve, cite, refuse unsafe ops. "
    "Style: professional, no marketing fluff, measure before claiming CapEx. "
) * 12


def session_turn(session: int, turn: int) -> str:
    """The text one session contributes on one turn; it differs between sessions."""
    return f"\nUser: Session {session}: summarize Tiny Footprint for ops lead {session}. turn={turn}\nAssistant:"
