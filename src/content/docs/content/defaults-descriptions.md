---
title: Defaults and descriptions
description: Use Zod defaults for initial values and descriptions for editor semantics and field help.
---

## Defaults

Zod defaults describe the value a field should use when a new document does not provide one:

```ts
status: z.enum(['Draft', 'Published']).default('Draft'),
featured: z.boolean().default(false),
```

Defaulted fields are treated as optional by the collection editor. They can remain absent from the submitted frontmatter when the form leaves them untouched; the Astro schema supplies the default when the content is loaded.

The v1 collection form does not provide a separate preset system or a guarantee that every default is shown with a reset control. Keep important defaults in the Astro schema and confirm the generated file after saving.

## Descriptions

The active source parser reads literal `ui-attrs:` descriptions from `.describe()`:

```ts
summary: z.string().describe(
  'ui-attrs:{"placeholder":"Shown on cards","rows":3}',
),
```

Supported controls read specific keys. For example, the excerpt field uses `placeholder` and `rows`; reference fields use `control`, `search`, `placeholder`, and `labelField`. A string array can use `control: "tags"`, with `collection` and `labelField` for taxonomy autocomplete.

For semantic roles, use the shorthand documented in [Describe field attributes](/docs/content/describe-attributes):

```ts
title: z.string().describe('ui-attrs:title'),
image: z.string().describe('ui-attrs:image'),
```

A description is not the same as a TypeScript comment. Put the attribute inside the Zod `.describe()` call and restart `astro dev` after changing it.
