---
title: Installation
description: Install Chirp as a development dependency, configure Astro, and open the local editor at /admin.
section: Getting Started
difficulty: beginner
readTime: 5 min
icon: brackets
color: green
order: 1
featured: true
---

<aside class="callout callout--note" aria-label="Prerequisites">
  <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-info"/></svg>
  <div>
    <p class="callout__title">Prerequisites</p>
    <p>An Astro 4+ project with at least one content collection, and Node 18 or newer. That's the whole list.</p>
  </div>
</aside>

## Install the package

Run this from your project root:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm add -D chirp</code></pre>
</div>

Add the integration to `astro.config.mjs`:

<div class="code-block">
  <pre><code>import chirp from 'chirp';

export default defineConfig({
  integrations: [chirp()],
});</code></pre>
</div>

## Start editing

Start Astro and open `/admin`:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm dev
<span class="code-ok">✓</span> Editor available at http://localhost:4321/admin</code></pre></div>

Chirp reads the collections in your Astro content config and generates the collection views and edit forms from their schemas.

## What got installed

Chirp adds a development dependency and runs only during `astro dev`. It writes your existing Markdown, mdx, YAML, JSON, and media files; it does not add a production runtime or hosted database. Add `.chirp/` to `.gitignore` for its local cache.

For adapter roots, media paths, updates, and removal, see [Installation](/docs/getting-started/installation) and [Update or remove Chirp](/docs/getting-started/update-remove).
