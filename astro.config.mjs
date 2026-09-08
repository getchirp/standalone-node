import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import { satteri } from '@astrojs/markdown-satteri';
import { fileURLToPath } from 'node:url';
import chirp from '@chirp.md/chirp';

export default defineConfig({
  output: 'middleware',
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
      mountPath: '/',
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
    })
  ],
  adapter: node({
    mode: 'standalone',
  }),
});