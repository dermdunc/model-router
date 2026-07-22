# Run Ledger — Model Router

A run is a unit of tracked work that produces a result requiring human review.

Each run is a YAML file: `runs/run-YYYYMMDD-MR-NNN.yaml`

**ID Prefix:** `MR` (auto-derived at scaffold time)

Run `just standardise-ledger -- --project model-router --force` to regenerate this file
with Haiku-powered task types and a refined prefix suited to this project.

See `runs/.schema.yaml` for the machine-readable schema used by `hekton-status`.
