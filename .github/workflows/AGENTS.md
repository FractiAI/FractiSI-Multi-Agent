# Continuous integration

CI runs the real gates, so a failure here usually means committed evidence went stale: run `node scripts/run_pipeline.mjs --rebuild` and commit the result. Keep CI free of GPU and network steps beyond dependency installs, and keep Node 18 in the matrix because `package.json` promises it.
