---
title: "Why the editor is a dev dependency"
description: "Visitors should never pay for the editing experience. The case for zero runtime impact - and what it unlocks for performance budgets."
date: 2026-06-17
category: product
author: Chirp Team
tags: [architecture, performance, editor, static-sites]
---

Here's a sentence that shouldn't be controversial: **the editing experience and the reading experience are separate concerns.** They have different users, different performance requirements, and different availability needs. Bundling them together, as every traditional CMS does, forces compromises that hurt both.

Chirp takes the opposite approach. The editor is a dev dependency. It installs into your project, reads your schemas, helps your team create and edit content, and then gets out of the way. Your published site has no trace of it.

## The performance argument

When your editor runs inside your production site, every visitor pays for it. Even if the editor is behind an auth wall, the server still has to be capable of running it. The JavaScript bundle includes editor components. The database handles edit operations alongside read queries.

Separating them unlocks:

- **True static output.** Your Astro site builds to flat HTML files. No SSR, no API routes for content delivery, no database queries at render time. Just files on a CDN.
- **Smaller bundles for visitors.** Zero editor JavaScript shipped to readers. No rich text component, no media uploader, no collaboration protocol. Your pages are as lean as they can be.
- **Independent scaling.** The editing tier can be a single instance (or a small fleet) while the published site scales to millions of visitors through the CDN. They don't share resources.
- **Separate security surface.** An XSS in the editor can't touch your published content. The editor has write access to the content repo; the published site only reads from the build output.

## What "dev dependency" actually means

In practical terms, Chirp ships as an npm package. You add it to your Astro project's devDependencies. It runs one of two ways:

**Local mode.** The editor is a sidecar process on your machine. It watches your content directory, provides a local web UI at `localhost:4321/chirp`, and writes changes directly to your markdown files. Your Git workflow is unchanged - you commit content like you always have.

**Deployed mode.** The editor runs as a lightweight companion service (or within a container alongside your build pipeline). Editors access it at a subdomain like `edit.yoursite.com`. Changes are committed to your repo, which triggers a rebuild of the static site.

In both modes, the architecture is the same:

```
[Editor (Go sidecar)] → [Markdown files in Git] → [Astro build] → [Static HTML on CDN]
```

Your visitors never touch the editor. They never download its JavaScript. They never wait for its API.

## The trade-off

The trade-off is real-time preview. In a traditional CMS, you click "preview" and see your changes immediately because the editor and the site share a runtime. With Chirp, preview happens in the editor itself - it renders your content using the same Astro components, but locally, without a full site build.

For most teams, this is a net improvement. The editor preview is faster than waiting for a server-side render, and it shows exactly what the component will produce. But if your workflow depends on seeing changes in the context of the full site navigation and layout, you'll need to push and wait for a build.

We think the trade-off is worth it. Your visitors shouldn't carry the weight of your editing tools. They came for your content, not your CMS.
