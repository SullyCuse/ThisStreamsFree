import { describe, it, expect, vi, beforeEach } from "vitest";

const openURL = vi.fn(async (_url: string) => true);
vi.mock("expo-linking", () => ({ openURL: (url: string) => openURL(url) }));

import { openExternal } from "./linking";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("openExternal", () => {
  it("opens a valid url", async () => {
    await openExternal("https://example.com/x");
    expect(openURL).toHaveBeenCalledWith("https://example.com/x");
  });

  it("does nothing for an empty or undefined url", async () => {
    await openExternal("");
    await openExternal(undefined);
    expect(openURL).not.toHaveBeenCalled();
  });

  it("swallows errors from openURL", async () => {
    openURL.mockRejectedValueOnce(new Error("no handler"));
    await expect(openExternal("https://example.com")).resolves.toBeUndefined();
  });
});
