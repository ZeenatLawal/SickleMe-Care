import { useAuth } from "@/utils/context/AuthProvider";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading]);

  return (
    <View>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text>Loading... {isLoading ? "Checking auth" : "Redirecting"}</Text>
    </View>
  );
}
