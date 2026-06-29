// Data model for This Streams Free (see brief §11).
// Validated against a live Streaming Availability API v4 response in Phase 1:
// the proxy returns an array of trimmed shows; options use `link` (v4 has no
// `videoLink`); `type` is one of subscription | free | rent | buy | addon, and
// ad-supported services (Tubi, Pluto, etc.) come back as `type: "free"`.

export type ShowType = "movie" | "series";

export type OfferType = "subscription" | "free" | "rent" | "buy" | "addon";

export interface Service {
  id: string;
  name: string;
}

export interface Price {
  amount: string;
  currency: string;
  formatted: string;
}

export interface StreamingOption {
  service: Service;
  type: OfferType;
  link: string; // deep link to the title on the service (v4 has no separate videoLink)
  price?: Price;
  addon?: { id: string; name: string };
  expiresSoon?: boolean;
}

export interface Show {
  id: string;
  showType: ShowType;
  title: string;
  releaseYear?: number;
  posterUrl?: string; // from imageSet.verticalPoster
  streamingOptions: StreamingOption[]; // already filtered to "us" by the proxy
}
