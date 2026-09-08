import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const skills = {
    version: '1.0',
    skills: [
      {
        name: 'search-site-content',
        description: 'Search articles and pages on Chirp by keyword using the site WebMCP manifest.',
        endpoint: 'https://chirp.md/_webmcp/manifest.json',
        transport: 'webmcp',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term' },
            collection: { type: 'string', description: 'Optional content collection filter' },
            limit: { type: 'number', description: 'Maximum number of results' },
          },
          required: ['query'],
        },
      },
      {
        name: 'browse-site-sections',
        description: 'List the content sections available on Chirp.',
        endpoint: 'https://chirp.md/_webmcp/manifest.json',
        transport: 'webmcp',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_blog_posts',
        description: 'Retrieve blog posts with full content in markdown format.',
        endpoint: 'https://chirp.md/blog/{slug}.md',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'The post slug' },
          },
          required: ['slug'],
        },
      },
      {
        name: 'get_documentation',
        description: 'Retrieve documentation pages in markdown format.',
        endpoint: 'https://chirp.md/docs/{slug}.md',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'The doc page slug' },
          },
          required: ['slug'],
        },
      },
      {
        name: 'browse_schema',
        description: 'Browse structured schema.org data for all pages via JSON-LD endpoints.',
        endpoint: 'https://chirp.md/schema/pages.json',
      },
    ],
  };

  return new Response(JSON.stringify(skills, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
