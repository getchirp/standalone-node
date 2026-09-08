import { createApiCatalog } from '@jdevalk/astro-seo-graph';

export const GET = createApiCatalog({
  siteUrl: 'https://chirp.md',
  schemaEndpoints: [
    {
      path: '/schema/pages.json',
      schemaType: 'WebPage',
      serviceDoc: '/seo-graph/',
    },
  ],
  schemaMap: { path: '/schemamap.xml', serviceDoc: '/seo-graph/' },
  additional: [],
  cacheControl: null,
});
