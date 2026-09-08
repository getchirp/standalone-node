---
description: Configure local media folders, upload files, and use previews in Chirp v1.
title: "Media library"
---

The Media Library works with folders in your Astro project. It does not upload to a hosted asset service.

## Configure a media path

```ts
// astro.config.mjs
import chirp from 'chirp';

export default defineConfig({
  integrations: [
    chirp({
      media: {
        paths: [
          { label: 'Uploads', dir: 'public/uploads', urlBase: '/uploads' },
          { label: 'Images', dir: 'src/images', urlBase: '/images' },
        ],
        defaultUploadPath: 'Uploads',
      },
    }),
  ],
});
```

Paths are relative to the Astro project root. The default configuration exposes `public/` and detects `src/assets` or `src/images` when those directories exist.

## Open the library

Open `/admin/media` or choose **Media Library** from the command palette.

The library can browse configured folders and upload files into the selected path. Upload size is limited to 10 MB by default; `CHIRP_MAX_UPLOAD_MB` can change that limit.

## Public files and asset files

Files under `public/` are served by Astro without imports. For example:

```text
public/uploads/photo.webp → /uploads/photo.webp
```

Files under `src/assets` or `src/images` are project assets and normally need to be imported by Astro components. Chirp still provides a development preview for them.

## Image fields

An image field in the frontmatter inspector can select an upload and preview its current value. You can replace the image, edit the URL/path, or remove it. The stored value remains the value expected by the collection schema.

For Astro `image()` fields, Chirp preserves paths relative to the content file when it writes the document.

## Keep media changes reviewable

Uploads are ordinary files in the working tree. Check them before committing:

```sh
git status --short public/uploads
```
