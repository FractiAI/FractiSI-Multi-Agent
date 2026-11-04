# Tests: `cli/commands`

`join.test.mjs` answers prompts as they appear, because `readline` drops piped lines that arrive before the next question. It runs with an empty `PATH` so no mail client opens.
