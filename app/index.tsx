import Logo from "@/components/ui/Logo";
import { useAuth } from "@/utils/context/AuthProvider";
import { useOnboarding } from "@/utils/context/OnboardingProvider";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function IndexScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } =
    useOnboarding();

  useEffect(() => {
    if (!authLoading && !onboardingLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else if (!hasCompletedOnboarding) {
        router.replace("/(auth)/onboarding");
      } else {
        router.replace("/(auth)/welcome");
      }
    }
  }, [user, authLoading, hasCompletedOnboarding, onboardingLoading]);

  const isLoading = authLoading || onboardingLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Logo />
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>
          {isLoading ? "Loading..." : "Redirecting..."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
