// Phase 2: resolveVerdict() — turns a Show + the user's owned services into a
// "Free to you / Not free for you" verdict with reasons and the options to act
// on (brief §6). Pure logic: no React Native / Expo imports, fully unit-tested.
//
// Matching rules, grounded in live v4 data (Phase 2):
//   - type "free"          -> free to everyone (ad-supported: Tubi, Pluto, ...)
//   - type "subscription"  -> free if the user owns service.id
//   - type "addon"         -> free if the user owns addon.id  (NOT service.id):
//       live data surfaces e.g. Peacock as an add-on carried by The Roku
//       Channel — service.id "roku", addon.id "peacock" — so ownership must
//       match the add-on, not the carrier.
//   - type "rent" | "buy"  -> never free; offered as a paid fallback.
//
// Each bucket is collapsed to one row per service for display (Phase 3): the
// API returns many options for the same service (different seasons/episodes or
// quality tiers), and a verdict only cares "it's on Paramount+", once.

import type { Show, StreamingOption } from "./types";

export interface VerdictReason {
  option: StreamingOption;
  label: string; // human-readable, e.g. "Included with your Netflix"
}

export interface Verdict {
  free: boolean;
  // Ways the title is free to THIS user (>= 1 entry exactly when free === true).
  freeReasons: VerdictReason[];
  // Subscriptions / add-ons it's on that the user does NOT own (one per service).
  unownedSubscriptions: StreamingOption[];
  // Rent / buy fallbacks (one per service per type, cheapest kept).
  paidOptions: StreamingOption[];
}

// For add-ons the meaningful name is the add-on, not the carrier service.
function displayName(o: StreamingOption): string {
  return o.addon?.name ?? o.service.name;
}

// Numeric price for "keep the cheapest" comparisons; missing prices sort last.
// Compared in whatever unit the API uses — display still uses price.formatted.
function priceAmount(o: StreamingOption): number {
  const n = o.price ? parseFloat(o.price.amount) : NaN;
  return Number.isFinite(n) ? n : Infinity;
}

export function resolveVerdict(
  show: Show,
  ownedServiceIds: ReadonlySet<string> | readonly string[]
): Verdict {
  const owned =
    ownedServiceIds instanceof Set
      ? ownedServiceIds
      : new Set(ownedServiceIds as readonly string[]);

  const freeReasons: VerdictReason[] = [];
  const unownedSubscriptions: StreamingOption[] = [];
  const paidByKey = new Map<string, StreamingOption>(); // `${type}|${name}`
  const seenReason = new Set<string>(); // dedup free reasons by label
  const seenUnowned = new Set<string>(); // dedup unowned by service name

  const addReason = (option: StreamingOption, label: string) => {
    if (seenReason.has(label)) return;
    seenReason.add(label);
    freeReasons.push({ option, label });
  };

  for (const option of show.streamingOptions ?? []) {
    const name = displayName(option);

    switch (option.type) {
      case "free":
        addReason(option, `Free with ads on ${option.service.name}`);
        break;

      case "subscription":
      case "addon": {
        const isOwned =
          option.type === "subscription"
            ? owned.has(option.service.id)
            : !!option.addon && owned.has(option.addon.id);
        if (isOwned) {
          addReason(option, `Included with your ${name}`);
        } else if (!seenUnowned.has(name)) {
          seenUnowned.add(name);
          unownedSubscriptions.push(option);
        }
        break;
      }

      case "rent":
      case "buy": {
        const key = `${option.type}|${name}`;
        const existing = paidByKey.get(key);
        if (!existing || priceAmount(option) < priceAmount(existing)) {
          paidByKey.set(key, option);
        }
        break;
      }
    }
  }

  return {
    free: freeReasons.length > 0,
    freeReasons,
    unownedSubscriptions,
    paidOptions: [...paidByKey.values()],
  };
}
