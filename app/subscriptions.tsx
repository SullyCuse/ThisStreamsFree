// Phase 4: pick which paid services you own. Selections persist and feed the
// "Free to you" verdict on every title.

import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SERVICES } from "../lib/services";
import { useSubscriptions } from "../lib/subscriptions";

export default function SubscriptionsScreen() {
  const { ownedIds, toggle } = useSubscriptions();

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        Tap the services you pay for. We&apos;ll use them to tell you what&apos;s
        already free to you.
      </Text>
      <FlatList
        data={SERVICES}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const owned = ownedIds.has(item.id);
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: owned }}
              accessibilityLabel={item.name}
            >
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.check, owned && styles.checkOn]}>
                {owned && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  intro: { fontSize: 15, color: "#555", marginBottom: 12 },
  list: { gap: 8, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  rowPressed: { backgroundColor: "#eee" },
  name: { fontSize: 17, color: "#111" },
  check: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: "#1a7f37", borderColor: "#1a7f37" },
  checkMark: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
