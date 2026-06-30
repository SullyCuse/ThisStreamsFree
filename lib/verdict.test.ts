import { describe, it, expect } from "vitest";
import { resolveVerdict } from "./verdict";
import type { Show, StreamingOption, OfferType } from "./types";

// --- builders -------------------------------------------------------------

function opt(
  type: OfferType,
  serviceId: string,
  serviceName: string,
  extra: Partial<StreamingOption> = {}
): StreamingOption {
  return {
    service: { id: serviceId, name: serviceName },
    type,
    link: `https://example.com/${serviceId}`,
    ...extra,
  };
}

function show(streamingOptions: StreamingOption[]): Show {
  return {
    id: "1",
    showType: "series",
    title: "Test Show",
    streamingOptions,
  };
}

// --- tests ----------------------------------------------------------------

describe("resolveVerdict", () => {
  it("is free when on a subscription the user owns", () => {
    const v = resolveVerdict(show([opt("subscription", "netflix", "Netflix")]), [
      "netflix",
    ]);
    expect(v.free).toBe(true);
    expect(v.freeReasons).toHaveLength(1);
    expect(v.freeReasons[0].label).toContain("Netflix");
    expect(v.unownedSubscriptions).toHaveLength(0);
  });

  it("is not free when on a subscription the user does NOT own", () => {
    const v = resolveVerdict(show([opt("subscription", "netflix", "Netflix")]), [
      "hulu",
    ]);
    expect(v.free).toBe(false);
    expect(v.freeReasons).toHaveLength(0);
    expect(v.unownedSubscriptions).toHaveLength(1);
    expect(v.unownedSubscriptions[0].service.id).toBe("netflix");
  });

  it("is free on an ad-supported service regardless of what the user owns", () => {
    const v = resolveVerdict(show([opt("free", "tubi", "Tubi")]), []);
    expect(v.free).toBe(true);
    expect(v.freeReasons[0].label).toContain("ads");
    expect(v.freeReasons[0].label).toContain("Tubi");
  });

  it("matches add-ons on addon.id, not the carrier service.id", () => {
    // Live shape: Peacock surfaced as an add-on carried by The Roku Channel.
    const peacockViaRoku = opt("addon", "roku", "The Roku Channel", {
      addon: { id: "peacock", name: "Peacock" },
    });
    const owned = resolveVerdict(show([peacockViaRoku]), ["peacock"]);
    expect(owned.free).toBe(true);
    expect(owned.freeReasons[0].label).toContain("Peacock");

    // Owning the carrier ("roku") must NOT make the add-on free.
    const carrierOnly = resolveVerdict(show([peacockViaRoku]), ["roku"]);
    expect(carrierOnly.free).toBe(false);
    expect(carrierOnly.unownedSubscriptions).toHaveLength(1);
  });

  it("is not free when only rent/buy options exist", () => {
    const v = resolveVerdict(
      show([
        opt("rent", "apple", "Apple TV"),
        opt("buy", "apple", "Apple TV", { link: "https://example.com/apple-buy" }),
      ]),
      ["netflix"]
    );
    expect(v.free).toBe(false);
    expect(v.paidOptions).toHaveLength(2);
  });

  it("is not free when there are no streaming options", () => {
    const v = resolveVerdict(show([]), ["netflix"]);
    expect(v.free).toBe(false);
    expect(v.freeReasons).toHaveLength(0);
    expect(v.unownedSubscriptions).toHaveLength(0);
    expect(v.paidOptions).toHaveLength(0);
  });

  it("dedupes exact-duplicate options", () => {
    // Live responses repeat identical options (e.g. Apple 'buy' twice).
    const dup = opt("buy", "apple", "Apple TV");
    const v = resolveVerdict(show([dup, { ...dup }]), []);
    expect(v.paidOptions).toHaveLength(1);
  });

  it("accepts a Set as well as an array of owned ids", () => {
    const v = resolveVerdict(
      show([opt("subscription", "netflix", "Netflix")]),
      new Set(["netflix"])
    );
    expect(v.free).toBe(true);
  });

  it("splits a mixed set of options into the right buckets", () => {
    const v = resolveVerdict(
      show([
        opt("subscription", "netflix", "Netflix"), // owned -> free
        opt("subscription", "hbo", "HBO Max"), // unowned
        opt("free", "tubi", "Tubi"), // free to all
        opt("rent", "apple", "Apple TV"), // paid
      ]),
      ["netflix"]
    );
    expect(v.free).toBe(true);
    expect(v.freeReasons).toHaveLength(2); // Netflix + Tubi
    expect(v.unownedSubscriptions.map((o) => o.service.id)).toEqual(["hbo"]);
    expect(v.paidOptions).toHaveLength(1);
  });
});
