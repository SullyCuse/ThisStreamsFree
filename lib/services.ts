// Phase 2: curated list of common US *paid subscription* services
// (service.id -> display name), matching the Streaming Availability API's ids.
//
// IDs and display names were verified against live v4 responses (Phase 2), not
// the brief. This list defines what a user can "own" in My Subscriptions
// (Phase 4) and therefore what resolveVerdict() treats as a subscription the
// user might have.
//
// Ad-supported services (Tubi, Pluto TV, The Roku Channel) are intentionally
// excluded: they're free to everyone, so the verdict treats any `type: "free"`
// option as free regardless of what the user owns.

import type { Service } from "./types";

// Ordered roughly by US popularity (drives the My Subscriptions picker order).
export const SERVICES: Service[] = [
  { id: "netflix", name: "Netflix" },
  { id: "prime", name: "Prime Video" },
  { id: "disney", name: "Disney+" },
  { id: "hulu", name: "Hulu" },
  { id: "hbo", name: "HBO Max" },
  { id: "apple", name: "Apple TV+" },
  { id: "paramount", name: "Paramount+" },
  { id: "peacock", name: "Peacock" },
  { id: "starz", name: "Starz" },
  { id: "amc", name: "AMC+" },
  { id: "discovery", name: "Discovery+" },
  { id: "britbox", name: "BritBox" },
  { id: "criterion", name: "The Criterion Channel" },
];

export const OWNABLE_SERVICE_IDS: ReadonlySet<string> = new Set(
  SERVICES.map((s) => s.id)
);
