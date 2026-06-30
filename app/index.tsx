// Phase 3: Search screen. Type a title, see matching shows, tap one to get the
// verdict. Owned subscriptions (which personalize the verdict) arrive in Phase 4.

import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SearchBar } from "../components/SearchBar";
import { ApiError, searchShows } from "../lib/api";
import { rememberShows } from "../lib/showCache";
import type { Show } from "../lib/types";

type Status = "idle" | "loading" | "done" | "error";

export default function SearchScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Show[]>([]);
  const [error, setError] = useState<string>("");

  async function runSearch(title: string) {
    setStatus("loading");
    setError("");
    try {
      const shows = await searchShows(title);
      rememberShows(shows);
      setResults(shows);
      setStatus("done");
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  }

  return (
    <View style={styles.container}>
      <SearchBar onSearch={runSearch} autoFocus />

      {status === "idle" && (
        <Text style={styles.hint}>
          Search a movie or show to see if it&apos;s free to you.
        </Text>
      )}

      {status === "loading" && (
        <ActivityIndicator style={styles.spinner} size="large" color="#1f6feb" />
      )}

      {status === "error" && <Text style={styles.error}>{error}</Text>}

      {status === "done" && results.length === 0 && (
        <Text style={styles.hint}>No matches. Try a different title.</Text>
      )}

      {status === "done" && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() =>
                router.push({ pathname: "/show/[id]", params: { id: item.id } })
              }
              accessibilityRole="button"
            >
              {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterEmpty]} />
              )}
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.showType === "movie" ? "Movie" : "Series"}
                  {item.releaseYear ? ` · ${item.releaseYear}` : ""}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  hint: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 24 },
  error: { fontSize: 15, color: "#b3261e", textAlign: "center", marginTop: 24 },
  spinner: { marginTop: 32 },
  list: { gap: 12, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  rowPressed: { backgroundColor: "#eee" },
  poster: { width: 56, height: 84, borderRadius: 6, backgroundColor: "#e6e6e6" },
  posterEmpty: { borderWidth: 1, borderColor: "#ddd" },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 17, fontWeight: "600", color: "#111" },
  rowMeta: { fontSize: 14, color: "#777" },
});
