import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function OfflineIndicator({ isOffline }: { isOffline?: boolean }) {
  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <MaterialIcons name="cloud-off" size={16} color={Colors.warning} />
      <Text style={styles.offlineText}>
        You&apos;re offline. Changes will sync when you&apos;re back online.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FF980020",
    marginBottom: 8,
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
});
