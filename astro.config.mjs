import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import { satteri } from '@astrojs/markdown-satteri';
import { fileURLToPath } from 'node:url';
import chirp from '@chirp.md/chirp';

export default defineConfig({
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  build: {
    assets: '_assets',
    format: 'file',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
    plugins: [
      {
        name: 'debug-save-origin',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.method === 'POST') {
              const names = [
                'host',
                'origin',
                'x-forwarded-host',
                'x-forwarded-proto',
                'x-forwarded-port',
                'sec-fetch-site',
              ];
              console.log(
                '[save origin]',
                Object.fromEntries(
                  names.map(name => [name, req.headers[name]]),
                ),
              );
            }
            next();
          });
        },
      },
    ],
  },
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
  security: {
    checkOrigin: true,
    allowedDomains: [{
      hostname: 'orange-space-succotash-vpgqjpr754xqcxj5g-4321.app.github.dev',
      protocol: 'https',
    }],
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