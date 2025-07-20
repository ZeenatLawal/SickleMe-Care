import { ScreenWrapper } from "@/components/shared";
import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text } from "react-native";

export default function InsightsScreen() {
  return (
    <ScreenWrapper>
      <Text style={styles.title}>Insights</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
});
