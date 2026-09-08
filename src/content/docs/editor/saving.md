---
title: Saving and conflicts
description: Understand staged edits, Save, working-tree writes, Git review, and conflict handling in the local editor.
---

Chirp v1 separates typing from writing to disk for rich-text edits.

## While you type

The editor stages changes in the browser’s IndexedDB database:

```text
Database: chirp-staging
Store: drafts
```

A staged draft contains the content id, source path, full file content, the file hash from when editing began, and an update timestamp.

Staging is local to the browser. It survives tab closes, crashes, and back-button navigation when IndexedDB is available. It is not a Git commit and does not change the file on disk.

## Save

Click **Save**, press `Ctrl+S`/`Cmd+S`, or press `Ctrl+Enter`/`Cmd+Enter`.

For an existing rich-text document:

1. Chirp gathers dirty staged drafts.
2. It checks the current file against the saved base hash.
3. If the file is unchanged, it writes the staged content to the working tree.
4. The staged browser record is cleared after a successful write.
5. The editor refreshes its base hash for the next edit.

If there are no staged rich-text drafts, the ordinary form save path writes the current collection values directly.

After Save, the UI reports the number of committed files and provides a back link. “Committed” here means written to the working tree, not committed to Git.

## Review with Git

```sh
git status
git diff
git diff -- src/content
```

A local filesystem save does not create a Git commit, push a branch, open a pull request, or call a remote publishing service. Commit the changes yourself when they are ready:

```sh
git add src/content public/uploads
git commit -m "Update content"
```

## Conflicts

When an existing document opens, Chirp records a SHA-256 hash of the source file. If the file changes in an IDE or another process before the staged edit is flushed, the server returns a conflict and refuses to overwrite it.

The editor reports the affected paths and asks you to reload. Reload the latest file, then apply the edit again.

This protects changes made outside the editor. It does not merge two versions automatically.

## New documents

New documents use the normal collection form save path because their final path is not known until Chirp derives the id from the submitted fields. The save endpoint validates the values, writes the new Markdown/mdx file, and redirects the editor to its canonical edit URL.

## Validation failures

If the submitted values do not satisfy the collection schema, Save returns validation errors and does not write the document. Fix the fields and submit again.

## Cache invalidation

Chirp caches collection metadata, but checks file and directory modification times. Edits and deletions made outside the editor are picked up when the collection cache becomes stale.
