---
title: Update or remove Chirp
description: Update the local editor package safely, or remove it without changing your content files.
---

## Update Chirp

Update the package with the package manager your project uses:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm update chirp
<span class="code-prompt">$</span> npm update chirp</code></pre>
</div>

To move to a specific version:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm add -D chirp@1.0.0</code></pre>
</div>

Stop and restart `astro dev` after changing the package. Chirp reads the Astro content config when the dev server starts.

Your content files are independent of the package version. Updating Chirp does not migrate Markdown, mdx, YAML, or JSON content.

## Remove Chirp

1. Remove `chirp()` from `astro.config.mjs`.
2. Remove the package:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> pnpm remove chirp
<span class="code-prompt">$</span> npm uninstall chirp</code></pre>
</div>

3. Remove `.chirp/` if you no longer need its local cache.
4. Remove any Chirp-specific adapter or media configuration that you added to `astro.config.mjs`.
5. Remove `.chirp/` from `.gitignore` only if nothing else in the project uses that directory.

Removing Chirp does not delete your content. Markdown and mdx files stay in their collection folders, YAML and JSON data files stay where they are, and uploaded media remains in its configured directory.

## What removal does not undo

Chirp writes real files to the working tree. Removing the package does not revert edits that have already been saved. Use Git to review or restore those changes:

<div class="code-block">
  <pre><code><span class="code-prompt">$</span> git status
<span class="code-prompt">$</span> git diff</code></pre>
</div>
