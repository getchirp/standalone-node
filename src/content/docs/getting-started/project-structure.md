---
title: Project structure
description: Understand where Chirp reads content, where it stores local cache data, and which files it writes.
---

Chirp works with the files already in your Astro project. The exact folders come from your loaders in `src/content.config.ts`.

A typical project looks like this:

```
your-project/
├── astro.config.mjs
├── package.json
├── src/
│   ├── content.config.ts
│   └── content/
│       ├── posts/
│       │   ├── first-post.md
│       │   └── second-post.mdx
│       ├── data/
│       │   ├── post-categories.yaml
│       │   └── collection-views.yaml
│       └── pages/
│           └── about.md
├── public/
│   └── uploads/
└── .chirp/
    └── cache/
```

Your loader paths may be different. Chirp supports both current Astro config locations:

- `src/content.config.ts` (current Astro convention)
- `src/content/config.ts` (legacy convention)

The same JavaScript, TypeScript, MJS, and CJS variants are accepted.

## Files Chirp reads

- `src/content.config.ts` or its supported equivalent for collection schemas and loaders.
- Markdown and mdx files for content collections.
- YAML, YML, and JSON files for data collections.
- Files in configured media paths for the Media Library.

For a directory-backed collection, Chirp reads the folder and matching loader pattern. For a file-backed data collection, it reads the configured YAML, YML, or JSON file.

## Files Chirp writes

When you save, Chirp writes the collection’s frontmatter and body back to the source file. It preserves `.md` versus `.mdx` for existing content and writes YAML data back to the configured data file.

Media uploads are written to the selected media path, such as `public/uploads`.

Chirp does not create a Git commit. Saved changes appear in your working tree for you to review and commit.

## The `.chirp` directory

`.chirp/` is local editor cache data. The collection cache is under `.chirp/cache/`. Add it to `.gitignore`:

```
.chirp/
```

Deleting `.chirp/` clears the cache. It does not delete your Markdown, mdx, YAML, JSON, or media files. Chirp recreates the cache when the dev server needs it.

## Files Chirp does not add to production

Chirp is active only during `astro dev`. `astro build` and `astro preview` do not receive Chirp routes or middleware. Your content and site build remain ordinary Astro files.

## Optional collection view configuration

If your project has `src/content/data/collection-views.yaml`, Chirp can use it for server-side defaults such as a collection’s table/cards layout, columns, filter, and sort:

```yaml
post:
  layout: table
  columns:
    - title
    - status
```

This file is separate from the browser’s saved view preferences. Browser preferences are stored in local storage and are not content files.
