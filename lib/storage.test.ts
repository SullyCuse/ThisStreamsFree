import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory mock of the native AsyncStorage module.
const store = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (k: string) => store.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadOwnedServiceIds, saveOwnedServiceIds } from "./storage";

const KEY = "freestream.ownedSubscriptions";

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe("storage", () => {
  it("returns [] when nothing is stored", async () => {
    await expect(loadOwnedServiceIds()).resolves.toEqual([]);
  });

  it("round-trips a save then load", async () => {
    await saveOwnedServiceIds(["netflix", "paramount"]);
    await expect(loadOwnedServiceIds()).resolves.toEqual(["netflix", "paramount"]);
  });

  it("persists under the expected key as a JSON array", async () => {
    await saveOwnedServiceIds(["hulu"]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEY, JSON.stringify(["hulu"]));
  });

  it("returns [] on corrupt JSON", async () => {
    store.set(KEY, "{not json");
    await expect(loadOwnedServiceIds()).resolves.toEqual([]);
  });

  it("returns [] when the stored value is not an array", async () => {
    store.set(KEY, JSON.stringify({ netflix: true }));
    await expect(loadOwnedServiceIds()).resolves.toEqual([]);
  });

  it("filters out non-string entries", async () => {
    store.set(KEY, JSON.stringify(["netflix", 42, null, "hulu"]));
    await expect(loadOwnedServiceIds()).resolves.toEqual(["netflix", "hulu"]);
  });

  it("returns [] when AsyncStorage throws", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error("disk error"));
    await expect(loadOwnedServiceIds()).resolves.toEqual([]);
  });
});
