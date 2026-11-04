from tiny_footprint_labs.llm.prompts import SYSTEM_PREFIX, session_turn


def test_the_prefix_is_long_and_shared() -> None:
    assert len(SYSTEM_PREFIX) > 1000


def test_turns_differ_between_sessions_and_turns() -> None:
    assert session_turn(1, 0) != session_turn(2, 0)
    assert session_turn(1, 0) != session_turn(1, 1)
    assert session_turn(1, 0).endswith("Assistant:")
