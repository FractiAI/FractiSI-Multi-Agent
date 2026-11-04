# Measured tier

Every store starts from wire text so nothing shares memory by accident, and every store must reproduce that text exactly. The full-build warm pass, the collect-until-settled loop, the isolation flags in `child-runner.mjs` and the controls each fixed a real misreading, so keep them. Narrow intervals only show that a reading repeats, so plot new data before trusting it: a systematic error repeats perfectly. Read RSS only through `rss-measure.mjs`, because reading it after building on the heap is confounded by committed pages.
