# Rhyming templates

A delta records overrides only, so an expression missing a pattern key reconstructs with that key present. `findMatch` excludes those expressions, and direct callers must too. `deepEqual` compares JSON text, so key order matters and it errs toward false negatives.
