---
title: Local-only mode
description: How Chirp runs locally, what stays on your machine, and what happens in an Astro build.
---

Chirp v1 is a local editor. It runs alongside `astro dev` on your machine and writes to the project working tree.

There is no deployed editor, hosted dashboard, team workspace, remote publishing service, or authentication flow in v1. Run the editor locally, review the resulting file changes with Git, and use your normal site deployment process.

## Runtime boundaries

Chirp is active only for the Astro `dev` command:

```text
astro dev    → Chirp routes and editor UI are available
astro build  → Chirp is skipped
astro preview → Chirp is skipped
```

The production build does not receive Chirp routes, middleware, or client code.

## Local state

Some state stays in the browser:

- staged edits in IndexedDB, in the `chirp-staging` database
- collection view preferences in `localStorage`
- command-palette fragments in `sessionStorage`
- the saved theme preference, when the editor exposes it

Project state stays on disk:

- `.chirp/cache/` for the collection cache
- content files in the folders configured by Astro
- YAML and JSON data files
- media uploads in the configured media directories

## No login in local mode

The local editor has no user account or session gate in v1. Anyone who can use the development server can use the editor. Keep the dev server local unless you intentionally understand the network exposure of your development environment.

## Git remains the publish workflow

Saving changes writes files to the working tree. It does not create a Git commit or push to a remote repository:

```sh
git status
git diff
git add src/content
git commit -m "Update content"
```

Your Astro build and deployment process remains separate from the editor.
