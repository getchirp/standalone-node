---
title: Your first content collection
description: Define an Astro content collection and let Chirp generate the local editing form from its schema.
section: Content
difficulty: beginner
readTime: 8 min
icon: database
color: blue
order: 2
---

## Define the schema

Every Chirp-editable collection starts as a normal Astro content collection. Define it once, in `content.config.ts`, the way you already do:

<div class="code-block">
  <pre><code>const post = defineCollection({
  schema: z.object({
    title: z.string().max(60),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
  }),
});</code></pre>
</div>

## Reload and inspect

Restart Astro and open `/admin`. The collection appears in the collection list, and its fields appear in the edit form.

- **Strings become text fields.**
- **Enums become selects.**
- **Dates become date inputs.**
- **Booleans become checkboxes.**
- **Arrays become repeatable inputs or reference selectors, depending on their element type.**

## Change the schema, change the editor

Change the schema, restart `astro dev`, and open the collection again. The editor reparses the config and updates the generated fields. For semantic roles and reference controls, use the `.describe()` patterns in [Describe field attributes](/docs/content/describe-attributes).

The editor does not maintain a second field-mapping file. Astro’s collection schema remains the source of truth.
