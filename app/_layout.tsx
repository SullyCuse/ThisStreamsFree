import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "This Streams Free" }} />
        <Stack.Screen name="subscriptions" options={{ title: "My Subscriptions" }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
