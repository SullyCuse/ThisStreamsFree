// Phase 3: the title search input. Submits on the keyboard "search" action
// or the button. Controlled by the parent so it can drive the search.

import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Props {
  onSearch: (title: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const submit = () => {
    const q = value.trim();
    if (q) onSearch(q);
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Search a movie or show…"
        placeholderTextColor="#999"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        onSubmitEditing={submit}
      />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#111",
  },
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1f6feb",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
