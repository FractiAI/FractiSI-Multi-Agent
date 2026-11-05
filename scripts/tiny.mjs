#!/usr/bin/env node
/** Thin orchestrator: the `tiny` CLI. Commands live in src/cli/. */
import { main } from '../src/cli/main.mjs';

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
