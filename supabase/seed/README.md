# Preview seed (unpublished)

Wipeable fake listings so All-time / Today look like a real board **before go-live**.

- Descriptions start with `[SEED]`. Public names do not.
- Owned by the most recently signed-in user (20 ranked + pending / unallocated / ranked fixtures).
- Apply `preview_unseed.sql` before any public launch.

`preview_seed.sql` is idempotent: it wipes previous `[SEED]` rows, grants credits, allocates, then shifts Today and writes a closed Daily snapshot so All-time (#1 Northstar $170), Today (#1 Ledgerlift $85), and Daily (yesterday Ledgerlift $90) do not look the same.
