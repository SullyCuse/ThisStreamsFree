// Phase 3: renders a resolved Verdict — the badge, the reasons it's free, and
// (when it isn't) where it streams and what it costs.
//
// The streaming options are shown as text only. Tapping them to open the right
// app / deep link is Phase 5.

import { StyleSheet, Text, View } from "react-native";
import type { StreamingOption } from "../lib/types";
import type { Verdict } from "../lib/verdict";
import { VerdictBadge } from "./VerdictBadge";

// For add-ons the meaningful name is the add-on, not the carrier service.
function optionName(o: StreamingOption): string {
  return o.addon?.name ?? o.service.name;
}

function priceSuffix(o: StreamingOption): string {
  return o.price?.formatted ? ` · ${o.price.formatted}` : "";
}

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const { free, freeReasons, unownedSubscriptions, paidOptions } = verdict;

  return (
    <View style={styles.card}>
      <VerdictBadge free={free} />

      {free && (
        <View style={styles.section}>
          {freeReasons.map((r, i) => (
            <Text key={i} style={styles.reason}>
              ✓ {r.label}
            </Text>
          ))}
        </View>
      )}

      {!free && unownedSubscriptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaming on (you don&apos;t have it)</Text>
          {unownedSubscriptions.map((o, i) => (
            <Text key={i} style={styles.option}>
              {optionName(o)}
            </Text>
          ))}
        </View>
      )}

      {paidOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rent or buy</Text>
          {paidOptions.map((o, i) => (
            <Text key={i} style={styles.option}>
              {o.type === "rent" ? "Rent" : "Buy"} on {optionName(o)}
              {priceSuffix(o)}
            </Text>
          ))}
        </View>
      )}

      {!free &&
        unownedSubscriptions.length === 0 &&
        paidOptions.length === 0 && (
          <Text style={styles.empty}>
            We couldn&apos;t find anywhere to stream this right now.
          </Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  section: { gap: 6 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reason: { fontSize: 16, color: "#1a7f37" },
  option: { fontSize: 16, color: "#222" },
  empty: { fontSize: 15, color: "#666" },
});
