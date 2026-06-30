// Phase 3: Verdict detail for a picked show. Reads the show from the in-memory
// cache (populated by the search), resolves the verdict, and renders it.

import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { VerdictCard } from "../../components/VerdictCard";
import { getShow } from "../../lib/showCache";
import { useSubscriptions } from "../../lib/subscriptions";
import { resolveVerdict } from "../../lib/verdict";

export default function ShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ownedIds, ready } = useSubscriptions();
  const show = id ? getShow(id) : undefined;

  if (!show) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: "Not found" }} />
        <Text style={styles.missingText}>
          That title is no longer loaded. Search again to see its verdict.
        </Text>
      </View>
    );
  }

  // Wait for saved subscriptions to load so the verdict doesn't flash the wrong
  // result (e.g. "Not free for you" → "Free to you") on a cold start.
  const verdict = ready ? resolveVerdict(show, ownedIds) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: show.title }} />

      <View style={styles.header}>
        {show.posterUrl ? (
          <Image source={{ uri: show.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterEmpty]} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{show.title}</Text>
          <Text style={styles.meta}>
            {show.showType === "movie" ? "Movie" : "Series"}
            {show.releaseYear ? ` · ${show.releaseYear}` : ""}
          </Text>
        </View>
      </View>

      {verdict ? (
        <VerdictCard verdict={verdict} />
      ) : (
        <ActivityIndicator size="large" color="#1f6feb" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 20 },
  header: { flexDirection: "row", gap: 14 },
  poster: { width: 92, height: 138, borderRadius: 8, backgroundColor: "#e6e6e6" },
  posterEmpty: { borderWidth: 1, borderColor: "#ddd" },
  headerText: { flex: 1, gap: 6, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },
  meta: { fontSize: 15, color: "#777" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  missingText: { fontSize: 15, color: "#666", textAlign: "center" },
});
