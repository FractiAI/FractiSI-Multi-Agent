# Source

Dependencies point down, and a gate enforces the layers in `src/gates/layers.mjs`. Every module needs a mirrored test, which a gate also enforces. Node code has no runtime dependencies and targets Node 18, because customers install this with nothing else. Python imports heavy packages inside the functions that use them.
