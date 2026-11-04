# Real-model lab

"With Tiny Footprint" here means reusing a shared prefix, which is what a prefix cache does, so this lab does not test rhyming. Both arms must use identical token ids. Forward passes extend a cache by concatenation, so shared prefix tensors stay unmodified, and `as_cache` builds a fresh cache over them per call. Heavy imports stay inside functions.
