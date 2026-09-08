---
title: Describe field attributes
description: Use Zod .describe() strings to give fields semantic roles or editor-specific options.
---

Chirp reads literal `.describe()` strings from the source schema. Use `ui-attrs:` when a field needs a semantic role or a control option that cannot be inferred from its type or name.

```ts
title: z.string().describe('ui-attrs:title'),
excerpt: z.string().optional().describe('ui-attrs:excerpt'),
image: z.string().optional().describe('ui-attrs:image'),
slug: z.string().describe('ui-attrs:slug'),
```

The description must be a literal string. Expressions, concatenation, and computed descriptions are not reliable for the source parser.

## Semantic fields

These shorthand values are recognized by the active source parser:

| Description | Effect |
|---|---|
| `ui-attrs:title` | Marks the field as the collection’s title/identity field. |
| `ui-attrs:excerpt` | Uses the excerpt textarea and identifies summary text. |
| `ui-attrs:image` | Selects image semantics and the image-capable control. |
| `ui-attrs:gallery` | Records gallery semantics; nested gallery fields still depend on their own supported types. |
| `ui-attrs:slug` | Uses the slug field treatment. |
| `ui-attrs:body` | Identifies a rich-text/body field. |
| `ui-attrs:usd` | Uses the USD price field. |

A semantic title also determines which field is pinned first in collection tables. This is useful when the title field is called `name` instead of `title`.

## JSON attributes

Use JSON when the active field renderer supports an option:

```ts
excerpt: z.string().optional().describe(
  'ui-attrs:{"placeholder":"Short summary","rows":4}',
),
```

The active excerpt renderer reads `placeholder` and `rows`.

Reference and tag fields support these options:

```ts
category: reference('postCategories')
  .describe('ui-attrs:{"control":"radio","search":true}')
  .optional(),

tags: z.array(z.string())
  .describe('ui-attrs:{"control":"tags","placeholder":"Type tags separated by spaces"}')
  .optional(),

taxonomyTags: z.array(z.string())
  .describe('ui-attrs:{"control":"tags","collection":"postTags","labelField":"name","placeholder":"Search or type tags"}')
  .optional(),

related: z.array(reference('post')).optional(),
```

- `control: "radio"` renders a single-choice reference list.
- `control: "checkbox"` renders a multi-choice reference list and stores the selected ids as an array.
- `search: true` adds a filter for larger reference lists.
- `control: "tags"` renders a string array as one textarea. Tags are separated by spaces and saved as an array of strings.
- `collection` adds autocomplete choices from a collection while keeping the stored value as an array of strings. Use it with `control: "tags"`.
- `placeholder` sets the tag textarea placeholder.
- `labelField` can choose the display property instead of the default `name`/`title` fallback.
- `z.array(reference('collection'))` remains a native relation list. Use it when the field should store references rather than freeform tag strings.

## Demo example

The v1 demo uses the same patterns in `demos/v1.local/src/content.config.ts`:

```ts
const post = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().describe('ui-attrs:title'),
    slug: z.string().describe('ui-attrs:slug'),
    excerpt: z.string().optional().describe('ui-attrs:excerpt'),
    category: reference('post_category')
      .describe('ui-attrs:{"control":"radio","search":true}')
      .optional(),
    tags: z.array(z.string())
      .describe('ui-attrs:{"control":"tags","collection":"postTags","labelField":"name","placeholder":"Search or type tags"}')
      .optional(),
    image: z.string().url().optional(),
  }),
});
```

In that example:

- `title` is the collection identity field.
- `excerpt` is the summary field.
- `category` becomes a searchable radio list.
- `tags` becomes a single tag textarea with autocomplete from `postTags`.
- `image` is detected as image-like by the active analyzer; use `ui-attrs:image` when you want the semantic to be explicit.

## What `.describe()` does not do

`ui-attrs` is not a general parser for arbitrary UI configuration. Unknown JSON keys may be preserved in field metadata, but a control only changes when the active renderer reads that key. The tags control applies to arrays of strings; reference arrays use the native relation picker instead.

Restart `astro dev` after changing a `.describe()` string so Chirp reparses the config.
