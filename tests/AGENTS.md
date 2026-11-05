# Tests

A new module needs a test at the same relative path, and a gate enforces both directions. Tests use real data: temporary directories, real child processes and real small models. Tests that read `output/` fail when evidence is stale, which is intended: regenerate and commit.
