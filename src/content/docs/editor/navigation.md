---
title: Command palette and shortcuts
description: Navigate collections, create entries, open tools, and move through lists without leaving the keyboard.
---

## Command palette

Press `Ctrl+K` on Windows/Linux or `Cmd+K` on macOS. The palette is also available from the editor’s command trigger.

Use the palette to:

- switch to a collection
- create a new document
- create a folder in the current collection
- open Media Library
- open Settings
- view the site in a new tab
- open recent documents
- manage taxonomies when the current collection has them
- save the current rich-text page through **Publish this page**

The palette loads on first intent and searches collection metadata through the local admin API. Press `Escape` to close it.

Use the arrow keys to move through results and `Enter` to open the selected result. The palette footer shows the current navigation hints.

## Collection shortcuts

The first ten visible collections have number-row shortcuts:

| Shortcut | Action |
|---|---|
| `Ctrl+1` through `Ctrl+9` | Open collections 1 through 9 |
| `Ctrl+0` | Open the tenth collection |

These shortcuts work even while a form field has focus. Collection order is the registration order discovered from the content config.

## List navigation

When a collection table is active and you are not typing:

| Shortcut | Action |
|---|---|
| `j` | Move focus down |
| `k` | Move focus up |
| `x` | Select or deselect the focused row |
| `Enter` | Open the focused row |
| `Escape` | Clear the open shortcut layer, selected rows, or row focus |

Focus clamps at the first and last rows; it does not wrap.

## Editor shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` / `Cmd+S` | Save the current edit |
| `Ctrl+Enter` / `Cmd+Enter` | Save the current edit; the palette labels this action “Publish this page” |
| `/` | Open the rich-text block menu |
| `Escape` | Close the current editor layer or move out one layer |
| `?` | Open the keyboard-shortcuts overlay |

The `Publish` label is local-editor language. In v1 it invokes the same Save/flush path and does not commit to Git or publish remotely.

## Command-palette search

Static actions are ranked in the browser. Document searches call the local `/admin/api/search` endpoint. Search results exclude taxonomy backing collections from the global recent-document list.

The palette keeps a short session cache of its bootstrap data. It does not send content to a hosted service.
