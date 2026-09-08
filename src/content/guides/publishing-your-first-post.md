---
title: Save your first post
description: Create a Markdown post in the local editor, save it to the working tree, and review the diff with Git.
section: Editor
difficulty: beginner
readTime: 6 min
icon: pencil
color: amber
order: 3
---

## Create the entry

Start Astro with `pnpm dev`, open `/admin`, select your posts collection, and choose **New**. Chirp builds the form from the collection schema.

Fill in the title, description, date, status, taxonomy fields, and body. The body editor writes Markdown or mdx, depending on the collection file.

## Save to disk

Click **Save** or press `Cmd/Ctrl+S`. For rich-text entries, Chirp stages the edit in the browser first and then writes it to the project working tree when you save.

```sh
git status
# new file: src/content/posts/my-first-post.md
```

## Review and commit

Inspect the generated frontmatter and body before committing:

```sh
git diff -- src/content/posts/my-first-post.md
git add src/content/posts/my-first-post.md
git commit -m "Add first post"
```

Chirp does not create the Git commit or publish to a remote service. Your repository and Astro deployment process remain in charge of that step.
