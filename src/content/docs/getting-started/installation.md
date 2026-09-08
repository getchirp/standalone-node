---
title: Installation
description: Install Chirp as a development dependency in an Astro project and open the local editor at /admin.
---

<aside class="callout callout--note" aria-label="Prerequisites">
  <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-info"/></svg>
  <div>
    <p class="callout__title">Prerequisites</p>
    <p>Use Node.js 22 or newer and Astro 4 through 7. Chirp needs an Astro content config and a local filesystem project.</p>
  </div>
</aside>

## Install Chirp

Run the install command from the root of your Astro project:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm add -D chirp</code></pre>
</div>

The equivalent npm command is:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> npm install --save-dev chirp</code></pre>
</div>

Chirp is a development dependency. It is not a runtime dependency for your published site.

## Add the integration

Import Chirp in `astro.config.mjs` and add it to `integrations`:

<div class="code-block">
  <pre><code>import { defineConfig } from 'astro/config';
import chirp from 'chirp';

export default defineConfig({
  integrations: [chirp()],
});</code></pre>
</div>

The default editor path is `/admin`. You can change it with `mountPath`:

<div class="code-block">
  <pre><code>integrations: [
  chirp({ mountPath: '/content' }),
],</code></pre>
</div>

## Start the editor

Start Astro in development mode:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm dev</code></pre>
</div>

Open `http://localhost:4321/admin`. Chirp reads the content config, discovers the collections, and lists them in the editor.

If you configured another `mountPath`, use that path instead.

## Point Chirp at a content directory

By default, Chirp resolves content from the project root. If your content lives in a subdirectory or Git submodule, set the filesystem adapter root:

<div class="code-block">
  <pre><code>import { fileURLToPath } from 'node:url';

chirp({
  adapter: {
    type: 'filesystem',
    root: fileURLToPath(new URL('./src/content', import.meta.url)),
  },
});</code></pre>
</div>

Collection loader paths in `src/content.config.ts` still describe the collections. The adapter root tells Chirp where those paths should be resolved from.

## Configure uploads

The default media paths include `public/` and, when present, `src/assets` or `src/images`. To make uploads explicit, configure a media path:

<div class="code-block">
  <pre><code>chirp({
  media: {
    paths: [
      { label: 'Uploads', dir: 'public/uploads', urlBase: '/uploads' },
    ],
    defaultUploadPath: 'Uploads',
  },
});</code></pre>
</div>

An upload written to `public/uploads/photo.webp` is available to the Astro site at `/uploads/photo.webp`.

## Production behavior

Chirp registers its routes and middleware only when Astro runs `astro dev`. `astro build` and `astro preview` skip the integration, so the production build receives no Chirp routes, middleware, or client code.

Add `.chirp/` to `.gitignore`. It contains the local collection cache, not content that belongs in your repository.
