// Cloudflare Worker proxy for the Streaming Availability API (v4).
//
// - Holds the API key as a Wrangler secret (env.STREAMING_API_KEY) — never in the bundle.
// - Caches trimmed responses in Workers KV (keyed by normalized title, ~12h TTL).
//   KV is used instead of the Cache API because the Cache API does NOT work on
//   *.workers.dev subdomains, which is where v1 is deployed.
// - Trims the upstream payload to only the fields the app needs.
//
// Field shapes verified against a live v4 response (Phase 1): the search endpoint
// returns an array of shows; options expose `link` (there is no `videoLink` in v4);
// `price` is {amount, currency, formatted}; Tubi/free titles come back as type "free".

export interface Env {
  STREAMING_API_KEY: string;
  CACHE: KVNamespace;
}

const UPSTREAM_BASE = "https://api.movieofthenight.com/v4";
const COUNTRY = "us";
const CACHE_TTL_SECONDS = 43200; // ~12h; data refreshes ~daily, so this is safe.

function cacheKeyFor(title: string): string {
  return `search:${COUNTRY}:${title.trim().toLowerCase()}`;
}

// imageSet.verticalPoster is an object of width-keyed URLs (w240, w360, ...).
// Pick a card-sized one with sensible fallbacks.
function pickPoster(verticalPoster: any): string | undefined {
  if (!verticalPoster) return undefined;
  return (
    verticalPoster.w360 ??
    verticalPoster.w480 ??
    verticalPoster.w240 ??
    verticalPoster.w600 ??
    verticalPoster.w720 ??
    undefined
  );
}

function trimOption(o: any) {
  return {
    service: { id: o?.service?.id, name: o?.service?.name },
    type: o?.type,
    link: o?.link,
    price: o?.price
      ? {
          amount: o.price.amount,
          currency: o.price.currency,
          formatted: o.price.formatted,
        }
      : undefined,
    addon: o?.addon ? { id: o.addon.id, name: o.addon.name } : undefined,
    expiresSoon: o?.expiresSoon,
  };
}

function trimShow(show: any) {
  const us = show?.streamingOptions?.[COUNTRY];
  return {
    id: show?.id,
    showType: show?.showType,
    title: show?.title,
    releaseYear: show?.releaseYear,
    posterUrl: pickPoster(show?.imageSet?.verticalPoster),
    streamingOptions: Array.isArray(us) ? us.map(trimOption) : [],
  };
}

function json(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }
    if (url.pathname !== "/api/search") {
      return json({ error: "Not found" }, 404);
    }

    const title = (url.searchParams.get("title") ?? "").trim();
    if (!title) {
      return json({ error: "Missing 'title' query parameter" }, 400);
    }

    const key = cacheKeyFor(title);

    const hit = await env.CACHE.get(key);
    if (hit !== null) {
      return new Response(hit, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
          "X-Cache": "HIT",
        },
      });
    }

    const upstream = new URL(UPSTREAM_BASE + "/shows/search/title");
    upstream.searchParams.set("title", title);
    upstream.searchParams.set("country", COUNTRY);

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(upstream.toString(), {
        headers: { "X-API-Key": env.STREAMING_API_KEY },
      });
    } catch {
      return json({ error: "Upstream request failed" }, 502);
    }

    if (upstreamRes.status === 429) {
      return json({ error: "Rate limited by data provider, please try again later" }, 429);
    }
    if (!upstreamRes.ok) {
      return json({ error: `Data provider error (${upstreamRes.status})` }, 502);
    }

    let data: any;
    try {
      data = await upstreamRes.json();
    } catch {
      return json({ error: "Invalid upstream response" }, 502);
    }

    // The search-by-title endpoint returns an array of show objects.
    const shows = Array.isArray(data) ? data : [];
    const body = JSON.stringify(shows.map(trimShow));

    ctx.waitUntil(env.CACHE.put(key, body, { expirationTtl: CACHE_TTL_SECONDS }));

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
        "X-Cache": "MISS",
      },
    });
  },
};
