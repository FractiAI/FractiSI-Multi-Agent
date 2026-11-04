# Scripts

Thin entry points. Each one parses its arguments, calls one function in [`src/`](../src/README.md), and prints the result.

## Contents

| Path | What it is |
|---|---|
| [`analyze_results.mjs`](analyze_results.mjs) | Reduce all receipts to output/data/analysis_summary.json. |
| [`benchmark_child.mjs`](benchmark_child.mjs) | Run one measurement in this fresh process and print its JSON. |
| [`generate_figures.py`](generate_figures.py) | Render manuscript figures from output/data/analysis_summary.json. |
| [`generate_results_doc.mjs`](generate_results_doc.mjs) | Write docs/benchmarks/RESULTS.md and the README's evidence block. |
| [`gpu_live_chat_hbm_lab.py`](gpu_live_chat_hbm_lab.py) | Run the live GPU chat-stack lab and write its receipt. |
| [`gpu_llm_real_lab.py`](gpu_llm_real_lab.py) | Run the real-model lab for one model and backend, and write its receipt. |
| [`h100_prefix_cache_sim.py`](h100_prefix_cache_sim.py) | Compute the H100 KV-cache roofline and write its receipt. |
| [`localize-web-docs.mjs`](localize-web-docs.mjs) | Rewrite docs/web/*.html for offline viewing. |
| [`render_manuscript.mjs`](render_manuscript.mjs) | Render the hydrated manuscript through the template and write the render receipt. |
| [`run_deterministic_benchmarks.mjs`](run_deterministic_benchmarks.mjs) | Write the byte-stable receipts under output/data/deterministic/. |
| [`run_llm_matrix.py`](run_llm_matrix.py) | Run the real-model lab matrix under output/data/measured/llm/. |
| [`run_measured_benchmarks.mjs`](run_measured_benchmarks.mjs) | Measure heap and latency on this machine, under output/data/measured/. |
| [`run_node_tests.mjs`](run_node_tests.mjs) | Find every Node test and hand the list to the built-in runner. |
| [`run_pipeline.mjs`](run_pipeline.mjs) | Run the pipeline. |
| [`run_suite.mjs`](run_suite.mjs) | Run the registered suite on this host, writing output/data/suite/. |
| [`tiny.mjs`](tiny.mjs) | The `tiny` CLI. |
| [`validate_render.mjs`](validate_render.mjs) | Run the template's output validator over the rendered project. |
| [`verify_project.mjs`](verify_project.mjs) | Check the whole provenance chain and print each result. |
| [`z_generate_manuscript_variables.mjs`](z_generate_manuscript_variables.mjs) | Write output/data/manuscript_variables.json and hydrate output/manuscript/. |
| [`z_generate_manuscript_variables.py`](z_generate_manuscript_variables.py) | The name the template's render stage looks for. |
