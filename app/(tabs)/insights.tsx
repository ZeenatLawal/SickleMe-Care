import {
  BaseCard,
  CardWithTitle,
  ScreenWrapper,
  WeatherRiskCard,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/utils/context/AuthProvider";
import { collectMLData } from "@/utils/ml/dataCollector";
import type { CrisisPrediction } from "@/utils/ml/randomForestPredictor";
import { randomForestPredictor } from "@/utils/ml/randomForestPredictor";
import { getRiskColor, getRiskIcon } from "@/utils/weatherUtils";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InsightsScreen() {
  const [prediction, setPrediction] = useState<CrisisPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCrisisPrediction = useCallback(async () => {
    try {
      setLoading(true);

      const mlData = await collectMLData(user!.uid);

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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCrisisPrediction();
    }
  }, [user, loadCrisisPrediction]);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Health Insights</Text>
          <Text style={styles.subtitle}>AI-powered health monitoring</Text>
        </View>
        <TouchableOpacity onPress={loadCrisisPrediction} disabled={loading}>
          <MaterialIcons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

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
            <Text style={styles.scoreSubtext}>risk in next 7 days</Text>
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
                <Text style={styles.triggerImportance}>
                  {Math.round(value.importance * 100)}%
                </Text>
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
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
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
  scoreSubtext: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 5,
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
