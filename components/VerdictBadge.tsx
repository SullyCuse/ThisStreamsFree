// Phase 3: the headline verdict pill — green "Free to you" or neutral
// "Not free for you".

import { StyleSheet, Text, View } from "react-native";

export function VerdictBadge({ free }: { free: boolean }) {
  return (
    <View style={[styles.badge, free ? styles.free : styles.notFree]}>
      <Text style={[styles.text, free ? styles.freeText : styles.notFreeText]}>
        {free ? "Free to you" : "Not free for you"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  free: { backgroundColor: "#e7f6ec" },
  notFree: { backgroundColor: "#f0f0f0" },
  text: { fontSize: 16, fontWeight: "700" },
  freeText: { color: "#1a7f37" },
  notFreeText: { color: "#555" },
});
