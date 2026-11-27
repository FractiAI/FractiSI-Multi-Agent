# Scripts

Keep these thin: a gate limits length and function count. A helper here is logic, so move it to `src/` and test it there. `z_generate_manuscript_variables.py` keeps that exact name because the template's render stage looks for it.

`publish-rhyme-standalones.mjs` packages Neural X-Ray + rhyme suites into `output/standalones/` and can `--push` to matching `FractiAI/synthobs-*` repos once those empty public repos exist (the Cursor GitHub App cannot create repositories under FractiAI).
