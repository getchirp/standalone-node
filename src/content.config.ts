import { defineCollection, z, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
const postCategories = defineCollection({
  loader: file('./src/content/post-categories.yaml'),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    color: z.string().optional(),
  })
});

const post = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().describe('ui-attrs:excerpt'),
    date: z.coerce.date(),
    category: reference('postCategories').describe('ui-attrs:{"control":"radio"}'), 
    draft: z.boolean().default(false).describe('ui-attrs:toggle'),
    image: z.string().optional().describe('ui-attrs:image'),
    author: z.string().default('Chirp'),
    tags: z.array(z.string()).optional().describe('ui-attrs:{"control":"tags"}'),
  })
});

const page = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().describe('Page title shown in the editor and document metadata.'),
    description: z.string().describe('Concise description used for search and social previews.'),
    slug: z.string().default('/').describe('Public URL path for this page.'),
    canonical: z.string().url().optional().describe('Canonical URL when it differs from the generated page URL.'),
    socialImage: z.string().optional().describe('Local social preview image path.'),
    robots: z.object({
      index: z.boolean().default(true),
      follow: z.boolean().default(true),
    }).default({ index: true, follow: true }),
    schema: z.object({
      type: z.literal('SoftwareApplication'),
    }).default({ type: 'SoftwareApplication' }),
    draft: z.boolean().default(false),
    layout: z.string().optional(),
  })
});

const doc = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    sidebar: z.object({
      order: z.number().optional(),
      label: z.string().optional(),
    }).optional(),
  })
});

const guide = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['Getting Started', 'Content', 'Editor', 'Deployment', 'Plugins']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    readTime: z.string(),
    icon: z.string(),
    color: z.enum(['green', 'blue', 'amber', 'plum']),
    order: z.number(),
    featured: z.boolean().default(false),
  })
});

const product = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    price: z.number(),
    icon: z.string(),
    color: z.enum(['green', 'blue', 'amber', 'plum']),
    capabilities: z.array(z.string()),
    bundleTags: z.array(z.string()).optional(),
    order: z.number(),
  })
});

const release = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/releases' }),
  schema: z.object({
    version: z.string(),
    product: z.enum(['Chirp', 'Insights', 'Revisions', 'Blocks', 'SEO', 'CDN']),
    date: z.date(),
    title: z.string(),
    summary: z.string(),
    changes: z.array(z.object({
      type: z.enum(['new', 'fix', 'improved']),
      text: z.string(),
    })),
    postSlug: z.string().optional(),
  })
});

export const collections = { doc, post, page, postCategories, guide, release };