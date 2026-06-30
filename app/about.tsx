// Phase 5: About + the required Movie of the Night attribution for the
// Streaming Availability API.

import Constants from "expo-constants";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { openExternal } from "../lib/linking";

const API_URL = "https://www.movieofthenight.com/about/api";

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>This Streams Free</Text>
      <Text style={styles.body}>
        Search a movie or show and find out whether it&apos;s already free to you
        — based on the streaming services you pay for — with a tap straight into
        the app to watch.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data source</Text>
        <Text style={styles.body}>
          Streaming availability data is provided by the Streaming Availability
          API by Movie of the Night.
        </Text>
        <Pressable onPress={() => openExternal(API_URL)} accessibilityRole="link">
          <Text style={styles.link}>movieofthenight.com →</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>Version {version}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  heading: { fontSize: 24, fontWeight: "700", color: "#111" },
  body: { fontSize: 16, color: "#333", lineHeight: 23 },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  link: { fontSize: 16, color: "#1f6feb", fontWeight: "600" },
  version: { fontSize: 14, color: "#999", marginTop: 8 },
});
