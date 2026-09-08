---
title: Field types
description: See how Astro and Zod fields map to controls in the local Chirp editor.
---

Chirp generates the frontmatter form from the field type and, where available, the field name or `ui-attrs` semantic.

| Schema | v1 editor control | Notes |
|---|---|---|
| `z.string()` | Text input | A field named `slug` or `handle` gets slug treatment. |
| `z.string()` with `ui-attrs:excerpt` | Excerpt textarea | `rows` and `placeholder` can be supplied in JSON attributes. |
| `z.number()` | Number input | `ui-attrs:usd` uses the currency field with USD display. |
| `z.boolean()` | Checkbox/toggle | `true` is checked; an unchecked value is saved as false by the form coercion path. |
| `z.date()` or `z.coerce.date()` | Date input | Values are edited as date controls. |
| `z.enum([...])` | Select | Literal string choices are read from the schema. |
| `z.array(z.string())` | Repeatable text inputs | Add or remove items one at a time. |
| `z.array(z.string())` with `control: "tags"` | Tag textarea | One textarea stores space-separated values as an array. Add `collection` for autocomplete. |
| `z.array(z.enum([...]))` | Repeatable text inputs | Enum arrays use the array editor in collection forms. |
| `reference('collection')` | Reference selector | Options are loaded from the referenced collection. |
| `z.array(reference('collection'))` | Native reference list | Options are loaded from the referenced collection and saved as ids. |
| `z.string().url()` or image-like field | Image-capable field in v1 paths | The active renderer supports upload, URL editing, preview, and removal. |
| `image()` | Relative image field | Astro image paths are stored relative to the content file. |
| `z.object({...})` | Nested fields when source parsing succeeds | Structured values reaching unsupported scalar controls are read-only JSON. |
| `body` or `content` | Rich text editor | Content collections receive a body editor automatically. |

## Strings and excerpts

Ordinary strings render as text inputs. Fields named `title`, `name`, `slug`, `handle`, `excerpt`, `summary`, or `description` receive special treatment in the editor even without a description attribute.

An explicit semantic attribute is more reliable than a field-name heuristic:

```ts
description: z.string().describe('ui-attrs:excerpt'),
```

## Numbers and booleans

```ts
rating: z.number().min(0).max(5).optional(),
featured: z.boolean().default(false),
```

Numbers render as number inputs. Booleans render as checkboxes in the active collection editor. The richer control resolver can select stepper or slider controls, but those controls are not the contract to rely on for the v1 collection form.

## Dates and enums

```ts
date: z.date().optional(),
status: z.enum(['Draft', 'In review', 'Published']).default('Draft'),
```

Dates use the browser date input. Enum values are extracted when they are written as literal strings in the array passed to `z.enum()`.

## Arrays

Plain string arrays are repeatable fields:

```ts
tags: z.array(z.string()).optional(),
```

Use the add button to create another input. The saved value remains a YAML/JSON array.

For a keyboard-friendly tag field, use the tags control:

```ts
tags: z.array(z.string())
  .describe('ui-attrs:{"control":"tags"}')
  .optional(),
```

The editor shows one textarea, splits values on spaces, and saves an array of strings. Add a collection for taxonomy autocomplete:

```ts
tags: z.array(z.string())
  .describe('ui-attrs:{"control":"tags","collection":"postTags","labelField":"name"}')
  .optional(),
```

Use `z.array(reference('postTags'))` when the field should be a relation list whose values are collection ids. That uses the native reference picker rather than the tags textarea.

## Images

Image fields can come from Astro’s `image()` helper, the `ui-attrs:image` semantic, or common image field names such as `image`, `coverImage`, `heroImage`, and `thumbnail`.

The v1 image control can:

- select an upload
- preview the current image
- replace it
- edit the stored URL or path
- remove it

The active renderer accepts JPEG, PNG, WebP, and GIF uploads. Configure media paths in `astro.config.mjs` so the uploaded file lands where your site expects it.

## Rich text and body content

Content collections receive a `body` field when they do not declare one. That field opens the TipTap-based Markdown/mdx editor. The editor supports text formatting, headings, quotes, links, images, tables when enabled, and the slash menu for available blocks.

## Fields that need caution

- Discriminated unions are not a dependable collection form in v1.
- Arbitrary object values can become read-only JSON when the active renderer cannot safely map them to nested controls.
- Complex Zod types that the source parser cannot identify fall back to a text field.
- Validation metadata is collected, but not every constraint becomes a native HTML attribute.
