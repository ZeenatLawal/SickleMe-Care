import { AuthProvider } from "@/utils/context/AuthProvider";
import { NotificationProvider } from "@/utils/context/NotificationProvider";
import { OnboardingProvider } from "@/utils/context/OnboardingProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <AuthProvider>
          <NotificationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </NotificationProvider>
        </AuthProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
