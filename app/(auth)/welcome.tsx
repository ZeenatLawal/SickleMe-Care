import Logo from "@/components/ui/Logo";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
        <Text style={styles.subtitle}>
          Track. Predict. Support. {"\n"}Smarter Care for Sickle Cell Disease
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  signUpButton: {
    backgroundColor: "#8B4B8C",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#8B4B8C",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#8B4B8C",
    fontSize: 18,
    fontWeight: "bold",
  },
});
