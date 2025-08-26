import {
  createMoodEntry,
  getTodayHydrationTotal,
  getTodayMoodEntry,
  getTodayPainEntry,
} from "@/backend";
import {
  ActionGrid,
  CardWithTitle,
  EducationCards,
  MoodSelector,
  ScreenWrapper,
  StatsGrid,
  WeatherDisplay,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { MoodType } from "@/types";
import { useAuth } from "@/utils/context/AuthProvider";
import { loadMedicationProgress } from "@/utils/medicationUtils";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function DashboardScreen() {
  const { userProfile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [hydrationTotal, setHydrationTotal] = useState(0);
  const [hydrationGoal] = useState(2);
  const [medicationsTaken, setMedicationsTaken] = useState(0);
  const [medicationsTotal, setMedicationsTotal] = useState(0);
  const [avgPainLevel, setAvgPainLevel] = useState(0);

  const loadDashboardData = useCallback(async () => {
    if (!userProfile?.userId) return;

    try {
      const todayMood = await getTodayMoodEntry(userProfile.userId);
      if (todayMood) {
        setSelectedMood(todayMood.mood);
      }

      const hydration = await getTodayHydrationTotal(userProfile.userId);
      setHydrationTotal(hydration.total);

      const medicationProgress = await loadMedicationProgress(
        userProfile.userId
      );
      setMedicationsTotal(medicationProgress.totalMedications);
      setMedicationsTaken(medicationProgress.completedMedications);

      const todayPain = await getTodayPainEntry(userProfile.userId);
      if (todayPain) {
        setAvgPainLevel(todayPain.painLevel);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, [userProfile?.userId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);

    if (!userProfile?.userId) {
      Alert.alert("Error", "Please log in to save your mood");
      return;
    }

    try {
      await createMoodEntry(userProfile.userId, mood as MoodType);
      Alert.alert("Success", "Mood saved successfully!");
    } catch (error) {
      console.error("Error saving mood:", error);
      Alert.alert("Error", "Failed to save mood. Please try again.");
    }
  };

  const handleQuickAction = async (actionType: string) => {
    if (!userProfile?.userId) {
      Alert.alert("Error", "Please log in to use this feature");
      return;
    }

    try {
      switch (actionType) {
        case "water":
          router.push("/(tabs)/track");
          break;
        case "pain":
          router.push("/(tabs)/track");
          break;
        case "medication":
          router.push("/(tabs)/medications");
          break;
        case "education":
          router.push("/education");
          break;
      }
    } catch (error) {
      console.error("Error with quick action:", error);
      Alert.alert("Error", "Action failed. Please try again.");
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const todayStats = [
    {
      icon: "water-drop",
      value: `${hydrationTotal}L/${hydrationGoal}L`,
      label: "Hydration",
      iconColor: Colors.hydration,
    },
    {
      icon: "medication",
      value: `${medicationsTaken}/${medicationsTotal}`,
      label: "Medications",
      iconColor: Colors.primary,
    },
    {
      icon: "favorite",
      value: avgPainLevel > 0 ? `${avgPainLevel}/10` : "No data",
      label: "Pain Level",
      iconColor:
        avgPainLevel > 7
          ? Colors.error
          : avgPainLevel > 4
          ? Colors.painMedium
          : Colors.primary,
    },
  ];

  const quickActions = [
    {
      icon: "trending-up",
      label: "Log Pain",
      iconColor: Colors.primary,
      onPress: () => handleQuickAction("pain"),
    },
    {
      icon: "water-drop",
      label: "Add Water",
      iconColor: Colors.hydration,
      onPress: () => handleQuickAction("water"),
    },
    {
      icon: "medication",
      label: "Take Medication",
      iconColor: Colors.primary,
      onPress: () => handleQuickAction("medication"),
    },
    {
      icon: "book",
      label: "Learn",
      iconColor: Colors.secondary,
      onPress: () => handleQuickAction("education"),
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
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <WeatherDisplay />
      </View>

      <CardWithTitle title="How are you feeling today?">
        <MoodSelector
          moods={moodOptions}
          selectedMood={selectedMood}
          onMoodSelect={handleMoodSelect}
        />
      </CardWithTitle>

      <CardWithTitle title="Today's Overview">
        <StatsGrid stats={todayStats} />
      </CardWithTitle>

      <CardWithTitle title="Quick Actions">
        <ActionGrid actions={quickActions} />
      </CardWithTitle>

      <CardWithTitle title="Learn About SCD">
        <EducationCards />
      </CardWithTitle>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
