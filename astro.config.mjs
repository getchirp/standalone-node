import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import seoGraph from '@jdevalk/astro-seo-graph/integration';
import webmcp from '@freshjuice/astro-webmcp';
import node from '@astrojs/node';
import { satteri } from '@astrojs/markdown-satteri';
import { fileURLToPath } from 'node:url';
import chirp from '@chirp.md/chirp';

export default defineConfig({
  site: 'https://chirp.md',
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  build: {
    assets: '_assets',
    format: 'file',
  },
  vite: { build: { cssMinify: 'lightningcss' } },
  experimental: {
    incrementalBuild: true,
  },
  markdown: {
    processor: satteri({
      features: {
        smartPunctuation: {
          dashes: false,
        },
      },
    }),
  },
  integrations: [
    mdx(),
    chirp({
      sidebar: false,
      tables: false,
      adapter: {
        type: 'filesystem',
        root: fileURLToPath(new URL('./src/content', import.meta.url)),
      },
      syntaxLanguages: ['astro', 'javascript', 'typescript', 'bash', 'json'],
      mdxComponents: {
       	blog: [
          {
           	dir: 'src/components/blocks',
          },
       	],
  	  },
      media: {
        paths: [
          { label: 'Assets', dir: 'src/assets', urlBase: '/src/assets' },
          { label: 'Public', dir: 'public', urlBase: '/' },
        ],
        defaultUploadPath: 'Assets',
      },
    }),
    seoGraph({
      validateH1: true,
      validateUniqueMetadata: true,
      validateImageAlt: true,
      validateMetadataLength: true,
      validateInternalLinks: true,
      markdownAlternate: false,
      llmsTxt: {
        title: 'Chirp',
        siteUrl: 'https://chirp.md',
        summary: 'A local, visual markdown and mdx editor for the Astro project you already have.',
        details:
          'Chirp reads your Astro content collections and writes changes back to the same files. Your files, schema and git history remain the source of truth; nothing touches production.',
      },
      indexNow: process.env.INDEXNOW_KEY ? {
        key: process.env.INDEXNOW_KEY,
        host: 'chirp.md',
        siteUrl: 'https://chirp.md',
      } : undefined,
    }),
    sitemap({
      entryLimit: 1000,
    }),
    webmcp({
      collections: ['blog', 'docs', 'guides', 'releases']
    })
  ],
});
