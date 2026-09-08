---
title: Validation and limits
description: Understand how Chirp applies Astro and Zod validation while you edit and save local content.
---

Chirp uses the collection schema when it saves a document. Form values arrive as strings, so the save endpoint coerces them into the field types before validation.

## Common constraints

These schema constraints are understood by the editor’s field model and validation path:

```ts
title: z.string().min(5).max(80),
rating: z.number().min(0).max(5),
email: z.string().email(),
url: z.string().url(),
```

The editor can report invalid values such as:

- missing required values
- strings shorter than `min()` or longer than `max()`
- numbers outside `min()` and `max()`
- invalid email or URL formats
- values that do not match enum choices
- values with the wrong type

## Save errors

If validation fails, the save request returns a validation response and the form remains open. Correct the fields and submit again. Chirp does not write an invalid document through the normal collection save path.

## Optional and defaulted fields

`.optional()`, `.nullable()`, `.default()`, `.prefault()`, and `.catch()` make a field non-required in the parsed field model. A default still belongs in the Astro schema; it is not a separate Chirp setting.

## Validation is not HTML validation

The active rich-text form uses `novalidate` and performs validation through the editor’s server-side save path. Do not rely on browser-native `required`, `min`, or `max` attributes being present on every generated control.

## Known v1 limitations

- The source parser only extracts enum choices reliably from literal string arrays.
- Complex Zod wrappers and advanced union types may fall back to a text control.
- Not every validator is projected into a matching HTML attribute.
- Nested objects are supported only when Chirp can parse and render their child fields safely.

When a field does not render as expected, inspect the generated form and simplify the schema expression or use a supported field type.
