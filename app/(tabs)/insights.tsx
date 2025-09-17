import {
  BaseCard,
  CardWithTitle,
  ScreenWrapper,
  WeatherRiskCard,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/utils/context/AuthProvider";
import {
  collectMLData,
  getAvailableTimePeriods,
  TimePeriod,
} from "@/utils/ml/dataCollector";
import type { CrisisPrediction } from "@/utils/ml/randomForestPredictor";
import { randomForestPredictor } from "@/utils/ml/randomForestPredictor";
import { getRiskColor, getRiskIcon } from "@/utils/weather/weatherUtils";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InsightsScreen() {
  const [prediction, setPrediction] = useState<CrisisPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");
  const [availablePeriods, setAvailablePeriods] = useState<
    {
      id: string;
      label: string;
    }[]
  >([]);
  const { userProfile } = useAuth();

  const showMedicalDisclaimer = () => {
    Alert.alert(
      "Medical Disclaimer",
      "This prediction system is designed to support your health management and does not replace professional medical advice.\n\n" +
        "• Always consult your healthcare provider for medical decisions\n" +
        "• Seek immediate medical attention for severe symptoms\n" +
        "• This tool provides risk estimates based on your tracked data\n" +
        "• Predictions are not a substitute for regular medical check-ups\n\n" +
        "For medical emergencies, call your local emergency services immediately"
    );
  };

  const loadCrisisPrediction = useCallback(async () => {
    try {
      setLoading(true);

      const mlData = await collectMLData(userProfile!.userId, selectedPeriod);

      const riskPrediction = randomForestPredictor.predictCrisisRisk(mlData);

      setPrediction(riskPrediction);
    } catch (error) {
      console.error("Error loading ML risk prediction:", error);
      setPrediction({
        riskScore: 30,
        riskLevel: "Moderate",
        topFactors: [
          {
            factor: "General Health",
            importance: 1.0,
            value: "Unknown",
            recommendation: "Check app connectivity and try again",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, userProfile]);

  useEffect(() => {
    if (userProfile) {
      const periods = getAvailableTimePeriods(userProfile.createdAt);
      setAvailablePeriods(periods);

      if (periods.length > 0) {
        setSelectedPeriod(periods[0].id as TimePeriod);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && availablePeriods.length > 0) {
      loadCrisisPrediction();
    }
  }, [userProfile, selectedPeriod, availablePeriods, loadCrisisPrediction]);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Health Insights</Text>
              <TouchableOpacity onPress={showMedicalDisclaimer}>
                <MaterialIcons
                  name="info-outline"
                  size={22}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Crisis risk prediction & analysis
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={loadCrisisPrediction} disabled={loading}>
          <MaterialIcons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <CardWithTitle title="Time Range">
        <Text style={styles.description}>
          {availablePeriods.length === 1
            ? "Data analysis for available period"
            : "Choose the range for health data analysis"}
        </Text>
        <View style={styles.periodButtons}>
          {availablePeriods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.selectedButton,
                loading && styles.disabledButton,
              ]}
              onPress={() => setSelectedPeriod(period.id as TimePeriod)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.id && styles.selectedText,
                  loading && styles.disabledText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </CardWithTitle>

      {loading && (
        <BaseCard>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Analyzing health data...</Text>
          </View>
        </BaseCard>
      )}

      {!loading && prediction && (
        <BaseCard>
          <View style={styles.riskHeader}>
            <MaterialIcons
              name={getRiskIcon(prediction?.riskLevel || "Low") as any}
              size={24}
              color={getRiskColor(prediction?.riskLevel || "Low")}
            />
            <Text style={styles.riskTitle}>
              Crisis Risk: {prediction.riskLevel}
            </Text>
          </View>
          <View style={styles.riskScore}>
            <Text
              style={[
                styles.scoreText,
                { color: getRiskColor(prediction.riskLevel) },
              ]}
            >
              {prediction.riskScore}%
            </Text>
          </View>
          <View style={styles.analysisInfo}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={Colors.gray500}
            />
            <Text style={styles.analysisText}>
              Analysis period:{" "}
              {selectedPeriod === "week"
                ? "Last 7 Days"
                : selectedPeriod === "month"
                ? "Last 30 Days"
                : "Last 90 Days"}
            </Text>
          </View>
        </BaseCard>
      )}

      <WeatherRiskCard />

      {!loading && prediction && prediction.topFactors.length > 0 && (
        <CardWithTitle title="Active Risk Factors">
          {prediction.topFactors.slice(0, 3).map((value, index) => (
            <View key={index} style={styles.triggerItem}>
              <View style={styles.triggerHeader}>
                <MaterialIcons
                  name={
                    value.factor.toLowerCase().includes("medication")
                      ? "medication"
                      : value.factor.toLowerCase().includes("hydration")
                      ? "water-drop"
                      : value.factor.toLowerCase().includes("stress")
                      ? "psychology"
                      : value.factor.toLowerCase().includes("weather")
                      ? "cloud"
                      : "info"
                  }
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.triggerName}>{value.factor}</Text>
                <Text style={styles.triggerImportance}>{value.value}</Text>
              </View>
              <Text style={styles.triggerRecommendation}>
                {value.recommendation}
              </Text>
            </View>
          ))}
        </CardWithTitle>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.gray600,
    fontSize: 16,
  },
  riskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 10,
  },
  riskScore: {
    alignItems: "center",
    paddingBottom: 10,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  analysisInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  analysisText: {
    fontSize: 12,
    color: Colors.gray500,
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 16,
    lineHeight: 20,
  },
  periodButtons: {
    flexDirection: "row",
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray600,
  },
  selectedText: {
    color: Colors.white,
    fontWeight: "600",
  },
  disabledText: {
    color: Colors.gray400,
  },
  triggerItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  triggerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  triggerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    marginLeft: 10,
  },
  triggerImportance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  triggerRecommendation: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 20,
    marginLeft: 30,
  },
});
