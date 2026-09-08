---
title: Astro content collections
description: Define collections once in Astro and let Chirp generate the local editing form from the same loaders and Zod schemas.
---

Chirp reads the Astro content configuration when `astro dev` starts. It discovers the collection loaders, reads each Zod schema, and serializes the fields for the editor.

The schema is the source of truth. There is no separate Chirp field-mapping file.

## Current config location

For current Astro projects, put the config at `src/content.config.ts`:

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const post = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { post };
```

Chirp also checks the older `src/content/config.ts` location and its supported JavaScript, TypeScript, MJS, and CJS variants.

## Directory-backed collections

Use `glob()` for Markdown and mdx collections:

```ts
const post = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});
```

A file at `src/content/posts/hello.md` appears in the `post` collection. Chirp writes the frontmatter and body back to that file.

## YAML and JSON data collections

Use `file()` for a YAML, YML, or JSON collection:

```ts
const postCategories = defineCollection({
  loader: file('./src/content/data/post-categories.yaml'),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    color: z.string().optional(),
  }),
});
```

YAML list items become entries in the collection. Chirp can edit the data file through the collection UI.

## References

Use Astro’s `reference()` helper when a field points to another collection:

```ts
const post = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    category: reference('postCategories').optional(),
  }),
});
```

The editor loads the referenced entries and uses their `name`, `title`, or configured label field when it displays the choices. Reference arrays work for fields such as tags and related posts.

## What Chirp reads from the schema

Chirp uses the schema to determine:

- field names and labels
- field types and controls
- enum choices
- references to other collections
- optional and defaulted fields
- common Zod validation constraints
- semantic UI attributes from `.describe()`

The editor reads the config at dev-server startup. Restart `astro dev` after changing the collection definitions so the generated field model is rebuilt.

## v1 limits

The active collection editor supports the common field types documented here. Some advanced Zod types are not first-class controls and may fall back to text or read-only JSON. Discriminated unions and arbitrary nested objects are not a reliable general-purpose editing surface in v1..
