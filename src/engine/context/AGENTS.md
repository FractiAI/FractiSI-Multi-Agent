# Context folding

These are in-process lab meters. The buffer drops history beyond its window, so it is not lossless context, and it does not touch KV tensors. `foldRatio` compares against a baseline estimated from one turn.
