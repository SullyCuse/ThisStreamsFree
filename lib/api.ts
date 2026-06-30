// Phase 1/3: fetch wrapper that talks ONLY to the Cloudflare Worker proxy.
// The Streaming Availability API key never lives here — it stays a Worker secret.
//
// The proxy exposes GET /api/search?title=... and returns an array of trimmed
// Show objects (see lib/types.ts), or a JSON { error } body with a non-200
// status. This module maps failures to a friendly ApiError; it holds no state.

import type { Show } from "./types";

export const PROXY_BASE =
  "https://thisstreamsfree-proxy.thisstreamsfree.workers.dev";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function searchShows(title: string): Promise<Show[]> {
  const query = title.trim();
  if (!query) return [];

  const url = `${PROXY_BASE}/api/search?title=${encodeURIComponent(query)}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new ApiError("Network error — check your connection and try again.");
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new ApiError(
        "Too many searches right now. Please try again in a moment.",
        429
      );
    }
    throw new ApiError("Something went wrong. Please try again.", res.status);
  }

  const data = await res.json();
  return Array.isArray(data) ? (data as Show[]) : [];
}
