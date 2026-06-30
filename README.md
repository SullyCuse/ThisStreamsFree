# This Streams Free

Android app: type a movie or TV show title, pick the match, and get a clear
**"Free to you" / "Not free for you"** verdict — based on which paid services you
own — plus the reasons and a deep link into the right streaming app.

Built with **Expo (React Native) + TypeScript**, **expo-router**, and a
**Cloudflare Worker** proxy in front of the Streaming Availability API (v4).
Region is hard-coded to **US** for v1.

## Repo layout

```
.                         # the Expo app (deployed via EAS Build)
  app/                    # expo-router screens
    _layout.tsx           # root Stack
    index.tsx             # Search (placeholder for now)
    subscriptions.tsx     # My Subscriptions (Phase 4)
    about.tsx             # About + attribution (Phase 5)
  components/             # VerdictCard, VerdictBadge, SearchBar (Phase 3)
  lib/
    types.ts              # TypeScript data model
    api.ts                # fetch wrapper -> Worker proxy (Phase 1/3)
    verdict.ts            # resolveVerdict() (Phase 2)
    services.ts           # curated US service list (Phase 2)
    storage.ts            # AsyncStorage helpers (Phase 4)
  app.json               # Expo config (Android package id, deep-link scheme)
worker/                  # Cloudflare Worker proxy (added in Phase 1; deployed via wrangler)
```

The app and the Worker are **two separate deploys living in one repo**: the app
builds with EAS, the Worker deploys with `wrangler deploy` from `worker/`.

## Prerequisites

- Node.js (project built with v24)
- The **Expo Go** app on an Android device, or an Android emulator
- (Phase 1+) A Cloudflare account + Wrangler CLI (`npm i -g wrangler`)
- (Phase 1+) A Streaming Availability API key (developers.movieofthenight.com)

## Run the app (dev)

```sh
npm install
npx expo start
```

Then scan the QR code with Expo Go (Android), or press `a` for an emulator.

## Key config

- **Android package id:** `com.thisstreamsfree.app`
- **Deep-link scheme:** `thisstreamsfree`
- **Typed routes:** enabled (`experiments.typedRoutes`)

## Proxy (Cloudflare Worker)

Lives in `worker/`, deployed separately from the app.

- **Live URL:** `https://thisstreamsfree-proxy.thisstreamsfree.workers.dev`
- **Endpoint:** `GET /api/search?title={query}` → array of trimmed shows (US only)
- **Caching:** responses are cached in **Workers KV** (binding `CACHE`, ~12h TTL),
  keyed by normalized title. KV is used instead of the Cache API because the
  Cache API does not function on `*.workers.dev` subdomains.
- **Secret:** the API key is stored as the Wrangler secret `STREAMING_API_KEY`
  (never in code or the app bundle).

Deploy / configure from `worker/`:

```sh
cd worker
npm install
wrangler kv namespace create CACHE        # one-time; put the id in wrangler.toml
wrangler deploy
wrangler secret put STREAMING_API_KEY      # paste the key at the prompt
```

## Running on a device & building

**Expo Go cannot run this app** — it targets Expo SDK 56, which is newer than
the public Expo Go supports. Use an EAS **development build** instead.

```sh
# one-time: a custom dev client (install the resulting APK on your phone)
eas build -p android --profile development
npx expo start --dev-client        # then open the dev client and connect

# shareable standalone APK (sideload / send to testers)
eas build -p android --profile preview

# Play Store bundle (.aab)
eas build -p android --profile production
```

Profiles live in `eas.json`. JS-only changes don't need a rebuild — just restart
`expo start`. A rebuild is only required when a **native module** is added (e.g.
`@react-native-async-storage/async-storage`). `.npmrc` sets `legacy-peer-deps`
so the EAS cloud install resolves the expo-router web peer conflict.

## Tests

```sh
npm test          # Vitest — pure logic (verdict, api, storage, linking)
```

## Attribution

Streaming availability data is provided by the **Streaming Availability API by
Movie of the Night** (https://www.movieofthenight.com/about/api). Required
attribution is shown on the in-app About screen.
