import { getCollection } from 'astro:content';
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph';

export const getStaticPaths = async () => {
  const posts = await getCollection('post', ({ data }) => !data.draft);
  return posts.map((p) => ({ params: { slug: p.id } }));
};

export const GET = createMarkdownEndpoint({
  entries: () => getCollection('post', ({ data }) => !data.draft),
  mapper: (post, slug) => {
    if (post.id !== slug) return null;
    return {
      frontmatter: {
        title: post.data.title,
        canonical: `https://chirp.md/blog/${post.resolvedCategory.id}/${post.id}`,
        pubDate: post.data.date,
        author: post.data.author,
        description: post.data.description,
        tags: post.data.tags,
      },
      body: post.body ?? '',
    };
  },
  cacheControl: null,
});
