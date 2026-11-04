# Core

`readOptionalJson` returns `{}` on failure, so use it only for optional configuration. Evidence readers throw, because an empty record must never read as a real one. This folder is in the source fingerprint.
