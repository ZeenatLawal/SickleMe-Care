import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MoodOption {
  emoji: string;
  label: string;
  color: string;
  value: string;
}

interface MoodSelectorProps {
  moods: MoodOption[];
  selectedMood?: string;
  onMoodSelect?: (mood: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  moods,
  selectedMood,
  onMoodSelect,
}) => {
  return (
    <View style={styles.moodButtons}>
      {moods.map((mood, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.moodButton,
            { backgroundColor: mood.color },
            selectedMood === mood.value && styles.selectedMood,
          ]}
          onPress={() => onMoodSelect?.(mood.value)}
        >
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodText}>{mood.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  moodButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  selectedMood: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
});
