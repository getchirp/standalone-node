---
title: Your first edit
description: Open a collection, edit an entry, save the file, and review the result in Git.
---

## Open the editor

Start the Astro development server and open `/admin`:

```sh
pnpm dev
```

The admin root redirects to the first available collection. You can also open a collection directly, such as `/admin/posts`.

## Open an entry

Select a collection, then choose an entry from the table or cards view. Collection lists can be filtered, sorted, paginated, and switched between table and cards layouts.

A collection list reads metadata first. The document body is loaded when you open an entry.

## Edit fields

The form comes from the collection schema. Depending on the schema, you may see:

- text inputs and long-text fields
- dates
- numbers
- booleans
- enum selects
- repeatable arrays
- taxonomy/reference selectors
- image fields with upload and preview
- the TipTap Markdown/mdx editor for the body

Optional fields can remain empty. Default values come from the schema when the active editor path can resolve them; the saved document still remains the source file in your project.

## Save

The editor has a primary **Save** button. Keyboard users can press `Ctrl+S` or `Cmd+S`, and `Ctrl+Enter` or `Cmd+Enter` also submits the editor form.

For rich-text documents, edits are staged in the browser while you work. Save flushes the staged content to the working tree. For ordinary frontmatter forms, Save posts the form directly to the collection endpoint.

After a successful save, inspect the file with Git:

```sh
git status
git diff -- src/content
```

## Create a document

Choose **New** from a collection. Fill in the schema fields and save. Chirp derives a slug from the title, name, or id field for a new content item, then keeps the editor open at the new item’s canonical URL.

## Delete a document

Use the collection row actions to delete an existing item. The filesystem adapter removes the source file. Review the deletion with `git status` before committing it.

## If the page changes outside Chirp

Chirp records the file hash when an existing item opens. If an IDE or another process changes that file before you save, the staged flush returns a conflict instead of overwriting the newer file. Reload the page, review the current content, and apply your edit again.
