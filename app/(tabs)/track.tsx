import { Button, CardWithTitle, ScreenWrapper } from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TrackScreen() {
  const [painLevel, setPainLevel] = useState(0);
  const [hydrationCount, setHydrationCount] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const symptoms = [
    { id: "fatigue", label: "Fatigue", icon: "bed" },
    { id: "shortness", label: "Shortness of Breath", icon: "air" },
    { id: "headache", label: "Headache", icon: "psychology" },
    { id: "dizziness", label: "Dizziness", icon: "blur-on" },
    { id: "nausea", label: "Nausea", icon: "sick" },
    { id: "fever", label: "Fever", icon: "device-thermostat" },
  ];

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const saveTracking = () => {
    // TODO: Implement saveTracking function
    Alert.alert(
      "Tracking Saved",
      "Your symptoms have been recorded successfully.",
      [{ text: "OK" }]
    );
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return Colors.secondaryLight;
    if (level <= 6) return Colors.painMedium;
    return Colors.primary;
  };

  const getPainDescription = (level: number) => {
    if (level === 0) return "No Pain";
    if (level <= 3) return "Mild Pain";
    if (level <= 6) return "Moderate Pain";
    if (level <= 8) return "Severe Pain";
    return "Very Severe Pain";
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Health</Text>
        <Text style={styles.subtitle}>
          Record your daily symptoms and activities
        </Text>
      </View>

      <CardWithTitle title="Pain Level">
        <View style={styles.painContainer}>
          <View
            style={[
              styles.painIndicator,
              { backgroundColor: getPainColor(painLevel) },
            ]}
          >
            <Text style={styles.painValue}>{Math.round(painLevel)}</Text>
          </View>
          <Text style={styles.painDescription}>
            {getPainDescription(painLevel)}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={painLevel}
          onValueChange={setPainLevel}
          minimumTrackTintColor={getPainColor(painLevel)}
          maximumTrackTintColor={Colors.gray300}
          thumbTintColor={getPainColor(painLevel)}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0 - No Pain</Text>
          <Text style={styles.sliderLabel}>10 - Worst Pain</Text>
        </View>
      </CardWithTitle>

      <CardWithTitle title="Hydration">
        <View style={styles.hydrationContainer}>
          <View style={styles.hydrationCounter}>
            <MaterialIcons
              name="water-drop"
              size={32}
              color={Colors.hydration}
            />
            <Text style={styles.hydrationCount}>{hydrationCount} glasses</Text>
          </View>
          <View style={styles.hydrationButtons}>
            <TouchableOpacity
              style={styles.hydrationButton}
              onPress={() => setHydrationCount(Math.max(0, hydrationCount - 1))}
            >
              <MaterialIcons name="remove" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hydrationButton}
              onPress={() => setHydrationCount(hydrationCount + 1)}
            >
              <MaterialIcons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.hydrationGoal}>Goal: 8 glasses per day</Text>
      </CardWithTitle>

      <CardWithTitle title="Symptoms">
        <Text style={styles.cardSubtitle}>
          Select any symptoms you&apos;re experiencing
        </Text>
        <View style={styles.symptomsGrid}>
          {symptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={[
                styles.symptomButton,
                selectedSymptoms.includes(symptom.id) &&
                  styles.symptomButtonSelected,
              ]}
              onPress={() => toggleSymptom(symptom.id)}
            >
              <MaterialIcons
                name={symptom.icon as any}
                size={24}
                color={
                  selectedSymptoms.includes(symptom.id)
                    ? Colors.white
                    : Colors.primary
                }
              />
              <Text
                style={[
                  styles.symptomText,
                  selectedSymptoms.includes(symptom.id) &&
                    styles.symptomTextSelected,
                ]}
              >
                {symptom.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </CardWithTitle>

      <Button
        title="Save Tracking"
        onPress={saveTracking}
        variant="primary"
        style={styles.saveButton}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray500,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 16,
  },
  painContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  painIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  painValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
  },
  painDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 12,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.gray500,
  },
  hydrationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  hydrationCounter: {
    flexDirection: "row",
    alignItems: "center",
  },
  hydrationCount: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 12,
  },
  hydrationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  hydrationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.hydration,
    alignItems: "center",
    justifyContent: "center",
  },
  hydrationGoal: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: "center",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  symptomButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  symptomButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  symptomText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 8,
  },
  symptomTextSelected: {
    color: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
