import { Colors } from "@/constants/Colors";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = [styles.container, { paddingTop: insets.top }, style];

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 20 },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={containerStyle}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
});
