import { StyleSheet, Text, View } from "react-native";

export default function SubscriptionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Subscriptions — coming in Phase 4.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { fontSize: 15, color: "#666" },
});
