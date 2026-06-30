// Phase 5: open an external streaming link.
//
// The API gives https links (e.g. peacocktv.com, tv.apple.com). On Android,
// openURL routes these into the installed streaming app via App Links when
// possible, otherwise the browser. Errors are swallowed so a bad/unsupported
// link never crashes the verdict screen.

import * as Linking from "expo-linking";

export async function openExternal(url: string | undefined): Promise<void> {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    // Nothing actionable for the user; just don't crash.
  }
}
