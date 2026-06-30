// Search screen. Type a title, see matching shows, tap one to get the verdict
// (personalized by the user's subscriptions). Links to My Subscriptions and About.

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
import { Link, useRouter } from "expo-router";
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
  const [lastQuery, setLastQuery] = useState<string>("");

  async function runSearch(title: string) {
    setLastQuery(title);
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

      <View style={styles.content}>
      {status === "idle" && (
        <View style={styles.idle}>
          <Text style={styles.hint}>
            Search a movie or show to see if it&apos;s free to you.
          </Text>
          <Link href="/subscriptions" style={styles.idleLink}>
            Set your subscriptions to personalize results →
          </Link>
        </View>
      )}

      {status === "loading" && (
        <ActivityIndicator style={styles.spinner} size="large" color="#1f6feb" />
      )}

      {status === "error" && (
        <View style={styles.idle}>
          <Text style={styles.error}>{error}</Text>
          {lastQuery !== "" && (
            <Pressable
              style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
              onPress={() => runSearch(lastQuery)}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          )}
        </View>
      )}

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

      <Link href="/about" style={styles.footerLink}>
        About
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  content: { flex: 1 },
  footerLink: {
    fontSize: 14,
    color: "#1f6feb",
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 8,
  },
  idle: { alignItems: "center", marginTop: 24, gap: 14 },
  hint: { fontSize: 15, color: "#666", textAlign: "center" },
  idleLink: { fontSize: 15, color: "#1f6feb", fontWeight: "600", textAlign: "center" },
  error: { fontSize: 15, color: "#b3261e", textAlign: "center", marginTop: 24 },
  retry: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1f6feb",
  },
  retryPressed: { opacity: 0.7 },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
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
