// Phase 4: AsyncStorage helpers for the owned-subscriptions set.
//
// Persisted as a JSON array of service.id strings under a single key. All
// AsyncStorage access is isolated here so the rest of the app deals only in
// string[] and so this is the one place to mock in tests. Reads never throw:
// a missing key, bad JSON, or a storage error all resolve to an empty list.

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "freestream.ownedSubscriptions";

export async function loadOwnedServiceIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export async function saveOwnedServiceIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
