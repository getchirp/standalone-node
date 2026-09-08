---
title: Editing basics
description: Learn the collection view, document editor, frontmatter inspector, and local media workflow in Chirp v1.
---

Chirp has two main surfaces:

- a collection view for finding and organizing entries
- an edit view for changing frontmatter and Markdown or mdx content

The editor is generated from your Astro content config.

## Collection views

Open `/admin` or a collection path such as `/admin/posts`.

Collection views support:

- table or cards layout
- text filtering
- sorting by a field
- pagination
- configurable visible columns
- folders and nested folders
- row selection and deletion
- taxonomy management where the collection references a taxonomy

The default sort uses a date-like field when one is available. View preferences are stored in browser local storage per host and collection. URL parameters override the saved preference.

You can also set project defaults in `src/content/data/collection-views.yaml`:

```yaml
post:
  layout: table
  columns:
    - title
    - status
```

This YAML file is separate from browser-local view preferences.

## Edit view

Select an entry to open its edit view. The top bar contains the breadcrumb, status control when the schema has a `status` field, a frontmatter-panel toggle, and **Save**.

The main writing area contains:

- a title field when the collection has a title-like field
- an excerpt field when the schema has an excerpt-like field
- the body editor for Markdown or mdx content
- the frontmatter inspector for the remaining fields

The frontmatter inspector is the generated form described in [Field types](/docs/content/field-types).

## Markdown and mdx editing

Content collections get a rich-text editor for the body. It writes Markdown or mdx back to the existing file format. The editor supports common text formatting, headings, blockquotes, links, images, and block insertion through `/`.

The slash menu is searchable. Use `Escape` to close an open menu or dialog. Select an image to edit its width, link, alt text, or caption when those controls are available in the current editor surface.

## Images and media

Open the Media Library from the command palette or its admin route at `/admin/media`.

The media configuration determines which folders are available. With this configuration:

```ts
chirp({
  media: {
    paths: [
      { label: 'Uploads', dir: 'public/uploads', urlBase: '/uploads' },
    ],
    defaultUploadPath: 'Uploads',
  },
});
```

an upload saved to `public/uploads/photo.jpg` is served at `/uploads/photo.jpg`.

Image frontmatter fields can select an upload, preview the current value, replace it, edit its URL/path, or remove it.

## Status fields

If a collection declares a field named `status`, the rich-text edit bar can expose its enum values as a status menu. The common values are `Draft`, `In review`, and `Published`. This changes the field value in frontmatter; it is not a remote publishing workflow.

## New documents

Use **New** from a collection view. Chirp renders the schema, derives an id from a title-like value, and writes the new file into the selected collection folder when you save.

## Local files are the source of truth

The editor does not store your content in a hosted database. It reads and writes your project files. After saving, use `git diff` to review exactly what changed.
