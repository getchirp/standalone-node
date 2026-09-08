import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { collections } from '../../content.config';

// ---------------------------------------------------------------------------
// Card content
// ---------------------------------------------------------------------------

interface OgCard {
  slug: string;
  title: string;
  subtitle: string;
}

/** Keep long descriptions short enough for the card. */
function truncate(text: string, max = 130): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** <em>…</em> in titles is rendered as plain text (no rich-text card support). */
function stripEm(text: string): string {
  return text.replace(/<em>(.*?)<\/em>/g, '$1');
}

/** Shrink the title font for long titles so they stay within the card. */
function titleSize(title: string): number {
  if (title.length > 70) return 48;
  if (title.length > 48) return 56;
  if (title.length > 30) return 64;
  return 70;
}

// Cards for pages that are not content items (landing pages, section indexes).
const landingCards: OgCard[] = [
  { slug: 'index', title: 'Your Astro content.', subtitle: 'A better way to edit it.' },
  { slug: 'about', title: 'The Chirp Story', subtitle: 'Why we built it.' },
  {
    slug: 'blog',
    title: 'Notes on publishing.',
    subtitle: 'Engineering decisions, product thinking and release notes - written the way we build: no filler.',
  },
  {
    slug: 'docs',
    title: 'Documentation',
    subtitle: 'Install and use the local Astro editor, configure schema-driven fields, and save content safely.',
  },
  {
    slug: 'guides',
    title: 'Learn by doing.',
    subtitle: 'Step-by-step guides for installing Chirp, defining content schemas, and editing local markdown and mdx files.',
  },
  {
    slug: 'releases',
    title: 'What shipped.',
    subtitle: 'Every release, every fix, every improvement - in the order they shipped.',
  },
];

type Entry = { id: string; data: Record<string, any> };
type CardBuilder = (entry: Entry) => OgCard | null;

// Route prefix and card text per collection. The `slug`/`id` values come from
// the Astro content config (the glob loader uses the frontmatter `slug` as the
// entry id, e.g. the home page entry has id "/").
const cardBuilders: Record<string, CardBuilder> = {
  post: (e) => ({ slug: `blog/${e.id}`, title: e.data.title, subtitle: truncate(e.data.description) }),
  doc: (e) => ({ slug: `docs/${e.id}`, title: e.data.title, subtitle: truncate(e.data.description ?? e.data.title) }),
  guide: (e) => ({ slug: `guides/${e.id}`, title: e.data.title, subtitle: truncate(e.data.description) }),
  release: (e) => ({
    slug: `releases/${e.id}`,
    title: e.data.title,
    subtitle: truncate(`${e.data.product} ${e.data.version} - ${e.data.summary}`),
  }),
  page: (e) => ({
    slug: `page/${String(e.data.slug ?? e.id).replace(/^\//, '') || 'home'}`,
    title: e.data.title,
    subtitle: truncate(e.data.description),
  }),
  postCategories: (e) => ({ slug: `categories/${e.id}`, title: e.data.name, subtitle: 'Blog category' }),
  product: (e) => ({ slug: `products/${e.id}`, title: e.data.name, subtitle: truncate(e.data.tagline) }),
};

// ---------------------------------------------------------------------------
// OG image endpoint (astro-og-canvas renders 1200×630 JPEGs via CanvasKit)
// ---------------------------------------------------------------------------

async function buildPages(): Promise<Record<string, { title: string; subtitle: string }>> {
  const pages: Record<string, { title: string; subtitle: string }> = {};
  for (const card of landingCards) pages[card.slug] = { title: card.title, subtitle: card.subtitle };

  // Drive cards from the collections actually defined in content.config.ts.
  for (const [name, builder] of Object.entries(cardBuilders)) {
    if (!(name in collections)) continue;
    let entries: Entry[];
    try {
      entries = (await getCollection(name)) as Entry[];
    } catch {
      continue;
    }
    for (const entry of entries) {
      const card = builder(entry);
      if (card) pages[card.slug] = { title: card.title, subtitle: card.subtitle };
    }
  }
  return pages;
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: await buildPages(),
  // The pages keys are already the og slugs ('blog/slug', 'docs/a/b', …).
  getSlug: (path) => path,
  getImageOptions: (_path, page) => ({
    format: 'JPEG',
    quality: 90,
    title: stripEm(page.title),
    description: page.subtitle,
    logo: {
      path: './src/assets/chirp-mark.webp',
    },
    bgGradient: [[245, 242, 233]],
    padding: 80,
    font: {
      title: {
        color: [34, 30, 23],
        families: ['Noto Sans'],
        weight: 'Bold',
        size: titleSize(stripEm(page.title)),
      },
      description: {
        color: [89, 86, 77],
        families: ['Noto Sans'],
        weight: 'Normal',
        size: 32,
        lineHeight: 1.35,
      },
    },
  }),
});
