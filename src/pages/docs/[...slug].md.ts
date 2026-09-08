import { getCollection } from 'astro:content';
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph';

export const getStaticPaths = async () => {
  const docs = await getCollection('doc');
  return docs.map((d) => ({ params: { slug: d.id } }));
};

export const GET = createMarkdownEndpoint({
  entries: () => getCollection('doc'),
  mapper: (doc, slug) => {
    if (doc.id !== slug) return null;
    return {
      frontmatter: {
        title: doc.data.title,
        canonical: `https://chirp.md/docs/${doc.id}`,
        description: doc.data.description,
      },
      body: doc.body ?? '',
    };
  },
  cacheControl: null,
});
