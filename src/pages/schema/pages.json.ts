import { createSchemaEndpoint } from '@jdevalk/astro-seo-graph';
import { buildWebPage, buildWebSite, buildPiece, makeIds } from '@jdevalk/seo-graph-core';

interface PageEntry {
  id: string;
  data: {
    title: string;
    description: string;
    url: string;
  };
}

const pages: PageEntry[] = [
  {
    id: 'index',
    data: {
      title: 'Chirp - Publishing without the friction',
      description:
        'Everything your team needs to publish with confidence. One place for your team to write, review, organize and publish.',
      url: 'https://chirp.md/',
    },
  },
  {
    id: 'about',
    data: {
      title: 'The Chirp Story - Why we built it',
      description:
        'The story of how twenty-plus years of building for the web shaped a philosophy - and how that philosophy became Chirp.',
      url: 'https://chirp.md/about',
    },
  },
];

const siteUrl = 'https://chirp.md';
const ids = makeIds({ siteUrl });

export const GET = createSchemaEndpoint({
  entries: () => Promise.resolve(pages),
  mapper: (page) => [
    buildWebPage(
      {
        url: page.data.url,
        name: page.data.title,
        description: page.data.description,
        inLanguage: 'en',
      },
      ids,
    ),
    buildPiece({
      '@type': 'Organization',
      '@id': `${siteUrl}/#/schema.org/Organization`,
      url: siteUrl,
      name: 'Chirp',
      description:
        'Modern publishing platform for teams - write, review, organize, and publish with confidence.',
    }),
    buildWebSite(
      {
        url: siteUrl,
        name: 'Chirp',
        description:
          'Modern publishing platform for teams - write, review, organize, and publish with confidence.',
      },
      ids,
    ),
  ],
  cacheControl: null,
});
