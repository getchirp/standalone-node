---
title: "One schema to rule the editor"
description: "Your Astro content collections already describe your content perfectly. Here's how we generate the entire editing UI from them - validation, fields, docs and all."
date: 2026-07-02
category: engineering
author: Team Chirp
tags: [ astro, content-collections, schema, editor, zod ]
image: /src/assets/1000058013.png
---

Every Astro site with content collections already has a complete, type-safe description of its content. The Zod schemas in `src/content/config.ts` define every field, every type, every validation rule. So why do most editors make you describe it all over again?

Chirp doesn't. It reads your content collection schemas directly and generates the editing experience from them. One schema. One source of truth. No duplication. 

## Reading Astro schemas at runtime

The trick is that Zod schemas carry their shape even after compilation. A Zod `z.object({ title: z.string(), date: z.date() })` knows it has a `title` string field and a `date` date field. Chirp's schema parser walks the Zod AST and extracts:

- **Field names and types.** String, number, date, boolean, enum, array, object - mapped directly to the appropriate form control.
- **Validation rules.** `min`, `max`, `regex`, `url`, `email` - converted to client-side and server-side checks.
- **Descriptions.** Comments above each field become inline help text.
- **Default values.** Pre-filled fields where the schema specifies them.
- **Relationships.** `reference()` calls become lookup fields with autocomplete.

## The generated UI

For a typical blog post schema:

```ts
const blog = defineCollection({
  schema: z.object({
    title: z.string().min(5).max(120),
    excerpt: z.string().min(15).max(160),
    publishDate: z.coerce.date(),
    featured: z.boolean().default(false),
    category: reference('categories'),
    tags: z.array(z.string()).optional(),
  })
});
```

Chirp generates:
- A text input for `title`, clamped at 5–120 characters, with a live character counter
- A textarea for `excerpt`, same bounds, with a preview of how it renders in search results
- A date picker for `publishDate`
- A toggle for `featured`, defaulting to off
- A category selector populated from your `categories` collection
- A tag input with autocomplete from existing tags

No configuration. No mapping file. It just works.

## Why this matters for teams

When the schema is the single source of truth, three things that normally drift apart stay perfectly in sync: the type system, the validation logic, and the editing UI. Add a field to your Zod schema, and it appears in the editor on the next build. Add a `min` constraint, and the editor enforces it before you can save.

For teams with non-technical editors, this solves a real problem. The developer defines the content model once, in code they already maintain. The editor gets a purpose-built form that matches the model exactly, with validation that prevents bad data from ever reaching production.

[Never Ask Twice](/blog/2026-06-24-never-ask-twice) isn't just for content - it's for configuration too.
