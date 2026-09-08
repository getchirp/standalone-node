# chirp.md

This sample runs Astro with `@astrojs/node` and Chirp's filesystem content
adapter. Chirp edits files under `src/content` during `astro dev`.

## GitHub Codespaces

The forwarded Codespaces connection is not loopback, so opt in to Chirp's
remote-development guard when starting the dev server:

```sh
CHIRP_ALLOW_REMOTE=1 pnpm dev -- --host 0.0.0.0
```

The default remains local-only. Chirp still rejects cross-origin mutation
requests when remote development is enabled.
