import { createSchemaMap } from '@jdevalk/astro-seo-graph';

export const GET = createSchemaMap({
  siteUrl: 'https://chirp.md',
  entries: [
    { path: '/schema/pages.json', lastModified: new Date() },
  ],
  cacheControl: null,
});
