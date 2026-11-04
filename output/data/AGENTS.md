# Data

`analysis_summary.json` is the single source of truth for figures, tokens and the results page. Read values from it. `render_receipt.json` changes only when the PDF does: rendering pins the PDF's stamp to the measured run, so a rebuild with the same template and toolchain leaves it unchanged.
