import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SubscriptionsProvider } from "../lib/subscriptions";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SubscriptionsProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "This Streams Free",
              headerRight: () => (
                <Link href="/subscriptions" style={styles.headerLink}>
                  My subs
                </Link>
              ),
            }}
          />
          <Stack.Screen name="show/[id]" options={{ title: "" }} />
          <Stack.Screen name="subscriptions" options={{ title: "My Subscriptions" }} />
          <Stack.Screen name="about" options={{ title: "About" }} />
        </Stack>
      </SubscriptionsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerLink: { color: "#1f6feb", fontSize: 16, fontWeight: "600" },
});
