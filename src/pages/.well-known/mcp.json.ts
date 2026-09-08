import type { APIRoute } from 'astro';
import { collections } from '../../content.config';

// Descriptive metadata per collection, keyed by the collection name defined in
// content.config.ts. Unknown collections still get a card (generic metadata).
const COLLECTION_META: Record<string, { description: string; base: string; formats: string[] }> = {
  doc: {
    description: 'Documentation pages with optional sidebar ordering and labels.',
    base: 'src/content/docs',
    formats: ['md', 'mdx'],
  },
  post: {
    description: 'Blog posts with category, date, author, and tags.',
    base: 'src/content/posts',
    formats: ['md', 'mdx'],
  },
  page: {
    description: 'Site pages with URL slug, robots directives, and structured data.',
    base: 'src/content/pages',
    formats: ['md', 'mdx'],
  },
  postCategories: {
    description: 'Blog post categories loaded from a single YAML data file.',
    base: 'src/content/post-categories.yaml',
    formats: ['yaml'],
  },
  guide: {
    description: 'Guides tagged by section, difficulty, and reading time.',
    base: 'src/content/guides',
    formats: ['md', 'mdx'],
  },
  product: {
    description: 'Product pages with pricing and capabilities.',
    base: 'src/content/products',
    formats: ['md', 'mdx'],
  },
  release: {
    description: 'Versioned release notes with changelog entries.',
    base: 'src/content/releases',
    formats: ['md', 'mdx'],
  },
};

export const GET: APIRoute = () => {
  // Expose the collections actually defined in content.config.ts.
  const exposed = Object.keys(collections).map((name) => ({
    name,
    ...(COLLECTION_META[name] ?? {
      description: `Content collection: ${name}`,
      base: `src/content/${name}`,
      formats: ['md', 'mdx'],
    }),
  }));

  // MCP remote server discovery (https://modelcontextprotocol.io/specification/2025-06-18).
  const discovery = {
    name: 'Chirp WebMCP Content Collections',
    version: '1.0.0',
    mcpServers: {
      chirp: {
        url: 'https://chirp.md/_webmcp/manifest.json',
        transport: 'webmcp',
        // Extension: the content collections this server exposes.
        collections: exposed,
      },
    },
  };

  return new Response(JSON.stringify(discovery, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
