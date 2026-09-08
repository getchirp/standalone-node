---
title: Taxonomies in YAML
description: Define categories and tags as YAML-backed Astro collections and reference them from Markdown or mdx frontmatter.
---

A taxonomy is a data collection whose entries live in YAML. In v1, categories and tags are ordinary Astro collections loaded with `file()` and referenced with `reference()`.

## Define the taxonomy collection

Create a YAML file:

```yaml
# src/content/data/post-categories.yaml
- name: Product News
  slug: product-news
  color: hsl(42, 100%, 45%)
- name: Tutorials
  slug: tutorials
  color: hsl(210, 80%, 50%)
```

Declare it in `src/content.config.ts`:

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

Export it with the other collections:

```ts
export const collections = { post, postCategories };
```

## Reference a category

Reference the collection from a content schema:

```ts
const post = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    category: reference('postCategories').optional(),
  }),
});
```

In a Markdown file, store the referenced entry’s id. With the example above:

```yaml
---
title: A post about Astro
category: tutorials
---
```

The editor loads the YAML entries and presents their labels. A reference selector uses the referenced item’s configured label field, then falls back to `name`, `title`, or the item id.

## Define tags

Tags use the same pattern, usually without a color:

```yaml
# src/content/data/post-tags.yaml
- name: Web Development
  slug: web-development
- name: editor
  slug: editor
```

```ts
const postTags = defineCollection({
  loader: file('./src/content/data/post-tags.yaml'),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
  }),
});

const post = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    tags: z.array(reference('postTags')).optional(),
  }),
});
```

Add the selected ids as an array in frontmatter:

```yaml
tags:
  - web-development
  - editor
```

To use the inline tags control with taxonomy autocomplete, keep the field as an array of strings and point the control at the taxonomy collection:

```ts
tags: z.array(z.string())
  .describe('ui-attrs:{"control":"tags","collection":"postTags","labelField":"name","placeholder":"Search or type tags"}')
  .optional(),
```

The editor renders one textarea. Users can type space-separated tags or choose matching taxonomy entries from autocomplete. The saved value is an array of strings containing the typed values or taxonomy ids.

If the field must be a relation rather than a tag string, use `z.array(reference('postTags'))` instead. That uses the native reference picker and stores the selected ids as an array.

## Manage taxonomies in the editor

When Chirp detects references to a data collection, the collection view can expose taxonomy management. The data file remains the source of truth; editing a taxonomy entry changes the YAML file in the working tree.

Review those changes with Git before committing them.

## Taxonomy rules

- Use stable ids in the `slug` field.
- Keep the id used in frontmatter present in the YAML file.
- Do not use a display label in frontmatter when the schema expects a reference id.
- Keep category and tag schemas explicit; a reference does not infer fields from the target collection.
- Restart `astro dev` after changing the collection config. YAML data edits are picked up through the collection cache invalidation path.
