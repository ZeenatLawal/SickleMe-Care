import {
  createHydrationEntry,
  createPainEntry,
  getHydrationTotal,
  getPainEntry,
} from "@/backend";
import {
  Button,
  CardWithTitle,
  DatePicker,
  OfflineIndicator,
  ScreenWrapper,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { PainLocation } from "@/types";
import { useAuth } from "@/utils/context/AuthProvider";
import { getTodayDateString } from "@/utils/dateUtils";
import { dailyCache } from "@/utils/offlineManager";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TrackScreen() {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [painLevel, setPainLevel] = useState(0);
  const [hydrationAmount, setHydrationAmount] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedPainLocations, setSelectedPainLocations] = useState<string[]>(
    []
  );
  const [customPainLocation, setCustomPainLocation] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    if (!userProfile?.userId) return;

    try {
      setIsOffline(false);

      setPainLevel(0);
      setHydrationAmount(0);
      setSelectedSymptoms([]);
      setSelectedPainLocations([]);
      setCustomPainLocation("");
      setCustomSymptom("");

      const cachedData = await dailyCache.get(userProfile.userId, selectedDate);
      if (cachedData) {
        if ((cachedData as any).hydrationTotal?.total > 0) {
          setHydrationAmount((cachedData as any).hydrationTotal.total);
        }
        if ((cachedData as any).painEntry) {
          const painData = (cachedData as any).painEntry;
          setPainLevel(painData.painLevel || 0);
          if (Array.isArray(painData.location)) {
            setSelectedPainLocations(painData.location);
          } else if (painData.location) {
            setSelectedPainLocations([painData.location]);
          }

          if (
            painData.description &&
            painData.description.includes("Symptoms:")
          ) {
            const symptomsText = painData.description.split("Symptoms: ")[1];
            if (symptomsText && symptomsText !== "No additional symptoms") {
              const symptoms = symptomsText.split(", ");
              setSelectedSymptoms(symptoms);
            }
          }
        }
      }

      try {
        const [hydrationData, painData] = await Promise.all([
          getHydrationTotal(userProfile.userId, selectedDate),
          getPainEntry(userProfile.userId, selectedDate),
        ]);

        if (hydrationData.total > 0) {
          setHydrationAmount(hydrationData.total);
        }

        if (painData) {
          setPainLevel(painData.painLevel);
          if (Array.isArray(painData.location)) {
            setSelectedPainLocations(painData.location);
          } else if (painData.location) {
            setSelectedPainLocations([painData.location]);
          }

          if (
            painData.description &&
            painData.description.includes("Symptoms:")
          ) {
            const symptomsText = painData.description.split("Symptoms: ")[1];
            if (symptomsText && symptomsText !== "No additional symptoms") {
              const symptoms = symptomsText.split(", ");
              setSelectedSymptoms(symptoms);
            }
          }
        }

        await dailyCache.save(userProfile.userId, selectedDate, {
          hydrationTotal: hydrationData,
          painEntry: painData,
        });
      } catch (onlineError) {
        if (cachedData) {
          setIsOffline(true);
          console.log("Network failed, using cached tracking data");
        } else {
          console.error("Error loading tracking data:", onlineError);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [userProfile?.userId, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const symptoms = [
    { id: "fatigue", label: "Fatigue", icon: "bed" },
    { id: "shortness", label: "Shortness of Breath", icon: "air" },
    { id: "headache", label: "Headache", icon: "psychology" },
    { id: "dizziness", label: "Dizziness", icon: "blur-on" },
    { id: "nausea", label: "Nausea", icon: "sick" },
    { id: "fever", label: "Fever", icon: "device-thermostat" },
    { id: "other", label: "Other", icon: "more-horiz" },
  ];

  const painLocations = [
    { id: "chest", label: "Chest", icon: "favorite" },
    { id: "back", label: "Back", icon: "back-hand" },
    { id: "arms", label: "Arms", icon: "pan-tool" },
    { id: "legs", label: "Legs", icon: "directions-walk" },
    { id: "abdomen", label: "Abdomen", icon: "circle" },
    { id: "joints", label: "Joints", icon: "join-inner" },
    { id: "head", label: "Head", icon: "psychology" },
    { id: "other", label: "Other", icon: "more-horiz" },
  ];

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      const newSymptoms = prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId];

      if (symptomId === "other" && !newSymptoms.includes("other")) {
        setCustomSymptom("");
      }

      return newSymptoms;
    });
  };

  const togglePainLocation = (locationId: string) => {
    setSelectedPainLocations((prev) => {
      const newLocations = prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId];

      if (locationId === "other" && !newLocations.includes("other")) {
        setCustomPainLocation("");
      }

      return newLocations;
    });
  };

  const saveTracking = async () => {
    if (!userProfile?.userId) {
      Alert.alert("Error", "Please log in to save your tracking data");
      return;
    }

    setIsLoading(true);

    try {
      const finalPainLocations =
        selectedPainLocations.length > 0
          ? selectedPainLocations.map((loc) => {
              if (loc === "other" && customPainLocation.trim()) {
                return customPainLocation.trim();
              }
              return loc;
            })
          : ["other"];

      const finalSymptoms =
        selectedSymptoms.length > 0
          ? selectedSymptoms.map((symptom) => {
              if (symptom === "other" && customSymptom.trim()) {
                return customSymptom.trim();
              }
              return symptom;
            })
          : [];

      await createPainEntry(
        userProfile.userId,
        Math.round(painLevel),
        finalPainLocations as PainLocation[],
        finalSymptoms.length > 0
          ? `Pain level: ${Math.round(
              painLevel
            )}, Symptoms: ${finalSymptoms.join(", ")}`
          : `Pain level: ${Math.round(painLevel)}, No additional symptoms`,
        selectedDate
      );

      if (hydrationAmount > 0) {
        await createHydrationEntry(
          userProfile.userId,
          hydrationAmount,
          selectedDate
        );
      }

      Alert.alert(
        "Tracking Saved",
        "Your symptoms and health data have been recorded successfully."
      );
    } catch (error) {
      console.error("Error saving tracking data:", error);
      Alert.alert("Error", "Failed to save tracking data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addWater = () => {
    setHydrationAmount((prev) => Number((prev + 0.25).toFixed(2)));
  };

  const removeWater = () => {
    setHydrationAmount((prev) => Math.max(0, Number((prev - 0.25).toFixed(2))));
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return Colors.secondaryLight;
    if (level <= 6) return Colors.warning;
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
      <OfflineIndicator isOffline={isOffline} />
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Health</Text>
        <Text style={styles.subtitle}>
          Record your daily symptoms and hydration levels
        </Text>
      </View>

      <DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      <CardWithTitle title="Hydration">
        <View style={styles.hydrationContainer}>
          <View style={styles.hydrationCounter}>
            <MaterialIcons
              name="water-drop"
              size={32}
              color={Colors.hydration}
            />
            <Text style={styles.hydrationCount}>{hydrationAmount}L</Text>
          </View>
          <View style={styles.hydrationButtons}>
            <TouchableOpacity
              style={styles.hydrationButton}
              onPress={removeWater}
            >
              <MaterialIcons name="remove" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hydrationButton} onPress={addWater}>
              <MaterialIcons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.hydrationGoal}>Goal: 2L per day</Text>
      </CardWithTitle>

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

      <CardWithTitle title="Pain Location">
        <Text style={styles.cardSubtitle}>
          Where are you experiencing pain? (Select all that apply)
        </Text>
        <View style={styles.symptomsGrid}>
          {painLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.symptomButton,
                selectedPainLocations.includes(location.id) &&
                  styles.symptomButtonSelected,
              ]}
              onPress={() => togglePainLocation(location.id)}
            >
              <MaterialIcons
                name={location.icon as any}
                size={24}
                color={
                  selectedPainLocations.includes(location.id)
                    ? Colors.white
                    : Colors.primary
                }
              />
              <Text
                style={[
                  styles.symptomText,
                  selectedPainLocations.includes(location.id) &&
                    styles.symptomTextSelected,
                ]}
              >
                {location.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedPainLocations.includes("other") && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>
              Specify other pain location:
            </Text>
            <TextInput
              style={styles.customInput}
              value={customPainLocation}
              onChangeText={setCustomPainLocation}
              placeholder="e.g., Lower back, Shoulder..."
              placeholderTextColor={Colors.gray400}
            />
          </View>
        )}
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
        {selectedSymptoms.includes("other") && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>Specify other symptom:</Text>
            <TextInput
              style={styles.customInput}
              value={customSymptom}
              onChangeText={setCustomSymptom}
              placeholder="e.g., Joint stiffness, Swelling..."
              placeholderTextColor={Colors.gray400}
            />
          </View>
        )}
      </CardWithTitle>

      <Button
        title={isLoading ? "Saving..." : "Track"}
        onPress={saveTracking}
        disabled={isLoading}
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
  customInputContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  customInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
});
