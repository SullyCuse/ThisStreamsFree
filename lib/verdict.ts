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

import type { Show, StreamingOption } from "./types";

export interface VerdictReason {
  option: StreamingOption;
  label: string; // human-readable, e.g. "Included with your Netflix"
}

export interface Verdict {
  free: boolean;
  // Ways the title is free to THIS user (>= 1 entry exactly when free === true).
  freeReasons: VerdictReason[];
  // Subscriptions / add-ons it's on that the user does NOT own (deduped).
  unownedSubscriptions: StreamingOption[];
  // Rent / buy fallbacks (deduped).
  paidOptions: StreamingOption[];
}

// Dedup key: live responses contain exact-duplicate options for the same title.
function optionKey(o: StreamingOption): string {
  return [o.type, o.service?.id, o.addon?.id ?? "", o.link ?? ""].join("|");
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
  const paidOptions: StreamingOption[] = [];
  const seen = new Set<string>();

  for (const option of show.streamingOptions ?? []) {
    const key = optionKey(option);
    if (seen.has(key)) continue;
    seen.add(key);

    switch (option.type) {
      case "free":
        freeReasons.push({
          option,
          label: `Free with ads on ${option.service.name}`,
        });
        break;

      case "subscription":
        if (owned.has(option.service.id)) {
          freeReasons.push({
            option,
            label: `Included with your ${option.service.name}`,
          });
        } else {
          unownedSubscriptions.push(option);
        }
        break;

      case "addon":
        // Ownership matches the add-on, not the carrier service (see header).
        if (option.addon && owned.has(option.addon.id)) {
          freeReasons.push({
            option,
            label: `Included with your ${option.addon.name}`,
          });
        } else {
          unownedSubscriptions.push(option);
        }
        break;

      case "rent":
      case "buy":
        paidOptions.push(option);
        break;
    }
  }

  return {
    free: freeReasons.length > 0,
    freeReasons,
    unownedSubscriptions,
    paidOptions,
  };
}
