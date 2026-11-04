# Rhyming templates

A rhyme is the same fields holding the same kinds of values. The catalog stores templates, and the codec turns an expression into a reference plus a delta.

## Contents

| Path | What it is |
|---|---|
| [`catalog.mjs`](catalog.mjs) | Rhyming Template catalog: reusable organizational patterns, frozen on registration and matched by shape. |
| [`codec.mjs`](codec.mjs) | Expression codec: an expression is a template reference plus a delta of field overrides and optional state. |
| [`index.mjs`](index.mjs) | Re-exports this folder's public API. |
| [`shape.mjs`](shape.mjs) | Shape comparison for Rhyming Templates: the same keys holding the same kinds of values. |
