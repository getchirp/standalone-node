import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// This route is generated during the static build, so the value describes the
// build artifact rather than a live request-time health check.
const buildTimestamp = new Date().toISOString();

export const GET: APIRoute = async () => {
  try {
    const posts = await getCollection('post');
    const docs = await getCollection('doc');

    if (posts.length === 0 && docs.length === 0) {
      return new Response(JSON.stringify({ status: 'degraded', reason: 'no content loaded' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        posts: posts.length,
        docs: docs.length,
        timestamp: buildTimestamp,
        timestampSource: 'build',
      }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      },
    );
  } catch (error) {
    console.error('[health] content collection check failed', error);
    return new Response(JSON.stringify({ status: 'error', reason: 'health check failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
