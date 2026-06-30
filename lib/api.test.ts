import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiError, searchShows } from "./api";

function mockFetch(impl: () => Promise<Response> | Response) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchShows", () => {
  it("returns the array of shows on success", async () => {
    const shows = [{ id: "1", showType: "movie", title: "X", streamingOptions: [] }];
    mockFetch(() => jsonResponse(shows));
    await expect(searchShows("x")).resolves.toEqual(shows);
  });

  it("short-circuits a blank query without calling fetch", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    await expect(searchShows("   ")).resolves.toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("url-encodes the title", async () => {
    const spy = vi.fn(() => jsonResponse([]));
    vi.stubGlobal("fetch", spy);
    await searchShows("the office");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("title=the%20office"));
  });

  it("maps a 429 to a friendly rate-limit ApiError", async () => {
    mockFetch(() => jsonResponse({ error: "rate limited" }, 429));
    await expect(searchShows("x")).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
    });
  });

  it("maps other non-200 responses to an ApiError", async () => {
    mockFetch(() => jsonResponse({ error: "upstream" }, 502));
    await expect(searchShows("x")).rejects.toBeInstanceOf(ApiError);
  });

  it("maps a network failure to an ApiError", async () => {
    mockFetch(() => {
      throw new TypeError("network down");
    });
    await expect(searchShows("x")).rejects.toBeInstanceOf(ApiError);
  });

  it("tolerates a non-array success body", async () => {
    mockFetch(() => jsonResponse({ not: "an array" }));
    await expect(searchShows("x")).resolves.toEqual([]);
  });
});
