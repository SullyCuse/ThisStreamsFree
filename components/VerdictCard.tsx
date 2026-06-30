// Phase 3/5: renders a resolved Verdict — the badge, the reasons it's free, and
// (when it isn't) where it streams and what it costs.
//
// Phase 5: each option row is tappable and opens the service via its link.
// Free-reason rows are the primary "watch now" action.

import { Pressable, StyleSheet, Text, View } from "react-native";
import { openExternal } from "../lib/linking";
import type { StreamingOption } from "../lib/types";
import type { Verdict, VerdictReason } from "../lib/verdict";
import { VerdictBadge } from "./VerdictBadge";

// For add-ons the meaningful name is the add-on, not the carrier service.
function optionName(o: StreamingOption): string {
  return o.addon?.name ?? o.service.name;
}

function priceSuffix(o: StreamingOption): string {
  return o.price?.formatted ? ` · ${o.price.formatted}` : "";
}

function OptionRow({
  link,
  text,
  textStyle,
}: {
  link: string;
  text: string;
  textStyle: object;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => openExternal(link)}
      accessibilityRole="link"
      accessibilityLabel={text}
    >
      <Text style={[styles.rowText, textStyle]}>{text}</Text>
      <Text style={styles.openHint}>↗</Text>
    </Pressable>
  );
}

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const { free, freeReasons, unownedSubscriptions, paidOptions } = verdict;

  return (
    <View style={styles.card}>
      <VerdictBadge free={free} />

      {free && (
        <View style={styles.section}>
          {freeReasons.map((r: VerdictReason, i) => (
            <OptionRow
              key={i}
              link={r.option.link}
              text={`✓ ${r.label}`}
              textStyle={styles.reason}
            />
          ))}
        </View>
      )}

      {!free && unownedSubscriptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaming on (you don&apos;t have it)</Text>
          {unownedSubscriptions.map((o, i) => (
            <OptionRow
              key={i}
              link={o.link}
              text={optionName(o)}
              textStyle={styles.option}
            />
          ))}
        </View>
      )}

      {paidOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rent or buy</Text>
          {paidOptions.map((o, i) => (
            <OptionRow
              key={i}
              link={o.link}
              text={`${o.type === "rent" ? "Rent" : "Buy"} on ${optionName(o)}${priceSuffix(o)}`}
              textStyle={styles.option}
            />
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowPressed: { opacity: 0.5 },
  rowText: { fontSize: 16, flexShrink: 1 },
  reason: { color: "#1a7f37" },
  option: { color: "#1f6feb" },
  openHint: { fontSize: 15, color: "#bbb", marginLeft: 12 },
  empty: { fontSize: 15, color: "#666" },
});
