import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/shared";
import Logo from "@/components/ui/Logo";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/utils/context/AuthProvider";
import { useOnboarding } from "@/utils/context/OnboardingProvider";

const onboardingData = [
  {
    title: "Welcome to SickleMe Care+",
    subtitle: "Your Health Companion",
    description:
      "SickleMe Care+ is designed specifically for people living with Sickle Cell Disease. Track your health, predict crises, and access educational resources all in one place.",
    color: Colors.primary,
  },
  {
    title: "Smart Health Tracking",
    subtitle: "Monitor Your Daily Wellness",
    description:
      "Track your mood, pain levels, hydration, and medications. Our system helps you identify patterns and potential triggers for better health management.",
    icon: "analytics",
    color: Colors.secondary,
  },
  {
    title: "Crisis Prediction",
    subtitle: "Early Warning System",
    description:
      "Our prediction system analyzes your health data and environmental factors to predict potential pain crises, helping you take preventive action early.",
    icon: "warning",
    color: Colors.warning,
  },
  {
    title: "Educational Resources",
    subtitle: "Learn & Stay Informed",
    description:
      "Access educational content about Sickle Cell Disease, including management tips and lifestyle advice.",
    icon: "library",
    color: Colors.gray400,
  },
  {
    title: "Medication Management",
    subtitle: "Never Miss a Dose",
    description:
      "Keep track of your medications, and monitor adherence. Stay on top of your treatment with medication reminders.",
    icon: "medical",
    color: Colors.success,
  },
  {
    title: "Weather Alerts",
    subtitle: "Environmental Awareness",
    description:
      "Get personalized weather alerts based on conditions that might trigger symptoms. Stay prepared for weather changes that could affect your health.",
    icon: "partly-sunny",
    color: Colors.hydration,
  },
  {
    title: "Ready to Start?",
    subtitle: "Your Health Journey Begins Now",
    description:
      "You're all set! Create your account or sign in to start tracking your health, accessing educational resources, and taking control of your Sickle Cell Disease management.",
    icon: "rocket",
    color: Colors.primary,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useOnboarding();
  const { user } = useAuth();

  const nextSlide = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/welcome");
      }
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContainer}>
        <View style={styles.slide}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {currentIndex === 0 ? (
                <Logo size={120} />
              ) : (
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.bgCircle,
                      { backgroundColor: `${currentSlide.color}20` },
                    ]}
                  />

                  <View
                    style={[
                      styles.ionIconContainer,
                      { backgroundColor: currentSlide.color },
                    ]}
                  >
                    <Ionicons
                      name={currentSlide.icon as any}
                      size={60}
                      color={Colors.white}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{currentSlide.title}</Text>
              <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
              <Text style={styles.description}>{currentSlide.description}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && {
                backgroundColor: Colors.primary,
                width: 20,
              },
            ]}
            onPress={() => setCurrentIndex(index)}
          />
        ))}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={prevSlide}
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentIndex === 0 ? Colors.gray300 : Colors.gray600}
          />
        </TouchableOpacity>

        <Button
          title={
            currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"
          }
          onPress={nextSlide}
          style={styles.nextButton}
        />

        <TouchableOpacity
          onPress={nextSlide}
          style={[
            styles.navButton,
            currentIndex === onboardingData.length - 1 &&
              styles.navButtonDisabled,
          ]}
          disabled={currentIndex === onboardingData.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={
              currentIndex === onboardingData.length - 1
                ? Colors.gray300
                : Colors.gray600
            }
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.gray500,
    fontWeight: "600",
  },
  slideContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 320,
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bgCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 80,
  },
  ionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: Colors.primary,
  },
  description: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray300,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
