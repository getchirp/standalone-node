---
title: "Never Ask Twice: the rule behind every Chirp decision"
description: "The principle behind every Chirp decision: the best publishing software remembers for people. Where it came from, and how we apply it daily."
date: 2026-06-24
category: philosophy
author: Chris Rault
tags: [philosophy, ux, editor, design-principles]
---

Every product has one rule that explains most of its decisions. Ours is this: **Never Ask Twice.**

The best publishing software remembers. It remembers what you wrote last time, how you like your images sized, which categories you use most often, and who needs to approve what. It doesn't make you re-enter the same metadata for every post. It doesn't forget your preferences when you close the tab.

## Where it came from

I learned this watching real editors work at Wine Folly. These were people who published dozens of articles a month - detailed, photograph-heavy, research-backed content. And they spent a shocking amount of time doing the same small things over and over:

- Typing the same author name into a byline field
- Selecting the same category from a dropdown
- Reformatting images to the same dimensions
- Copy-pasting the same SEO description template

The CMS made them repeat themselves on every post. Not because the tasks were complex (they weren't), but because the software had no memory.

I built a shortcode system to help. Then a visual builder with reusable presets. The difference was immediate: publishing time dropped by 40%. But more importantly, editors stopped dreading the busywork. They could focus on writing.

## How we apply it

Never Ask Twice is now the first filter for every feature decision at Chirp. When we consider a new capability, we ask: does this reduce repetition, or add to it?

Some examples of the principle in action:

- **Schemas drive the editor.** Your Zod content collection schema is the only configuration the editor needs. Define it once (fields, types, validation) and the editing UI is generated automatically.
- **Presets remember.** Define a content preset once (title format, image dimensions, category defaults, SEO template) and apply it to any new draft in one click.
- **The media library deduplicates.** Upload an image once; reuse it across any number of posts. The library tracks usage so you never accidentally delete something that's live.
- **Approval paths are templates.** Set up who reviews what once per content type. Every new draft follows the same path without manual assignment.
- **Your content is yours.** Plain Markdown files in your Git repo. No vendor lock-in means you never have to re-enter or migrate your content for a platform change.

## The harder cases

Some things legitimately need to be asked again. A publication date, for instance - you don't want yesterday's date carried forward automatically. The principle isn't "never ask anything." It's "the default behavior should be remembering, and the exceptions should be explicit."

When we're unsure, we ship the remembering version first and add an opt-out. It's easier to make something forgetful later than to retrofit memory into a system designed around repetition.

The philosophy applies to how we build Chirp itself. We don't duplicate configuration across the editor, the CLI, the API, and the documentation. One schema, consumed everywhere. The same thing our users get.

Never Ask Twice isn't just a feature. It's the reason Chirp exists.
