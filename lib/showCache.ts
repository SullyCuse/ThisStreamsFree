// Phase 3: a tiny in-memory cache of shows from the last search(es).
//
// The proxy only searches by title, so the detail route (app/show/[id].tsx)
// can't re-fetch a single show by id. The search screen stores its results
// here and the detail screen reads the picked show back out by id. This is
// process-lifetime only; persistence is out of scope (you always reach the
// detail screen by tapping a fresh search result).

import type { Show } from "./types";

const cache = new Map<string, Show>();

export function rememberShows(shows: Show[]): void {
  for (const show of shows) {
    if (show?.id) cache.set(show.id, show);
  }
}

export function getShow(id: string): Show | undefined {
  return cache.get(id);
}
