# Analysis

Statistics live here, once. The process is the unit of replication, so bootstrap over per-process values and leave within-process iterations unresampled. The real-model lab runs one process per combination, so it resamples per-trial medians instead and its intervals say so. Claim statuses are computed in `claims.mjs`: add a test that changing the data changes the status. Keep historical and current evidence in separate fields.
