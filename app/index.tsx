import { StyleSheet, Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Streams Free</Text>
      <Text style={styles.subtitle}>
        Search a movie or show to see if it&apos;s free to you.
      </Text>
      <Text style={styles.hint}>Search arrives in Phase 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
  },
  hint: {
    fontSize: 13,
    color: "#999",
    marginTop: 12,
  },
});
