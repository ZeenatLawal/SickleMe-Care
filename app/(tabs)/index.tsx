import {
  ActionGrid,
  CardWithTitle,
  MoodSelector,
  ScreenWrapper,
  StatsGrid,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DashboardScreen() {
  const [selectedMood, setSelectedMood] = useState<string>("");

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mood options
  const moodOptions = [
    {
      emoji: "😊",
      label: "Great",
      color: Colors.secondaryLight,
      value: "great",
    },
    {
      emoji: "😐",
      label: "Okay",
      color: Colors.painMedium,
      value: "okay",
    },
    {
      emoji: "😔",
      label: "Not Good",
      color: Colors.primary,
      value: "not-good",
    },
  ];

  // Today's stats
  const todayStats = [
    {
      icon: "water-drop" as const,
      value: "6/8",
      label: "Glasses",
      iconColor: Colors.hydration,
    },
    {
      icon: "medication" as const,
      value: "2/3",
      label: "Medications",
      iconColor: Colors.primary,
    },
    {
      icon: "favorite" as const,
      value: "3/10",
      label: "Pain Level",
      iconColor: Colors.primary,
    },
  ];

  // Quick actions
  const quickActions = [
    {
      icon: "trending-up" as const,
      label: "Log Pain",
      iconColor: Colors.primary,
    },
    {
      icon: "water-drop" as const,
      label: "Add Water",
      iconColor: Colors.hydration,
    },
    {
      icon: "medication" as const,
      label: "Take Medication",
      iconColor: Colors.primary,
    },
    {
      icon: "emergency" as const,
      label: "Emergency",
      iconColor: Colors.error,
      // onPress: () => router.push("/(tabs)/emergency"),
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>

      <CardWithTitle title="How are you feeling today?">
        <MoodSelector
          moods={moodOptions}
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
        />
      </CardWithTitle>

      <CardWithTitle title="Today's Overview">
        <StatsGrid stats={todayStats} />
      </CardWithTitle>

      <CardWithTitle title="Quick Actions">
        <ActionGrid actions={quickActions} />
      </CardWithTitle>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: Colors.gray500,
  },
});
