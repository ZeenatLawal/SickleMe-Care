import { Colors } from "@/constants/Colors";
import type { WeatherRiskAssessment } from "@/utils/weather/weatherService";
import { weatherService } from "@/utils/weather/weatherService";
import { getRiskColor, getWeatherRiskIcon } from "@/utils/weather/weatherUtils";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BaseCard } from "./Card";

export function WeatherRiskCard() {
  const [weatherRisk, setWeatherRisk] = useState<WeatherRiskAssessment>({
    riskScore: 3,
    riskLevel: "Moderate",
    triggers: ["Weather data unavailable"],
    recommendations: ["Monitor local weather conditions manually"],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherRisk();
  }, []);

  const loadWeatherRisk = async () => {
    try {
      setLoading(true);
      setError(null);

      const location = await weatherService.getUserLocation();
      if (!location) {
        throw new Error("Unable to get location for weather data");
      }

      const risk = await weatherService.getWeatherRisk(
        location.latitude,
        location.longitude
      );

      setWeatherRisk(risk);
    } catch (err) {
      console.error("Failed to load weather risk:", err);
      setError("Unable to load weather data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseCard style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading weather conditions...</Text>
        </View>
      </BaseCard>
    );
  }

  if (error || !weatherRisk) {
    return (
      <BaseCard style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={24} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadWeatherRisk}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </BaseCard>
    );
  }

  return (
    <BaseCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons
            name={getWeatherRiskIcon(weatherRisk.riskLevel) as any}
            size={24}
            color={getRiskColor(weatherRisk.riskLevel)}
          />
          <Text style={styles.title}>Weather Risk</Text>
        </View>
        <TouchableOpacity
          onPress={loadWeatherRisk}
          style={styles.refreshButton}
        >
          <MaterialIcons name="refresh" size={20} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      <View style={styles.riskContainer}>
        <View style={styles.riskScore}>
          <Text style={styles.scoreNumber}>{weatherRisk.riskScore}</Text>
          <Text style={styles.scoreScale}>/10</Text>
        </View>
        <View style={styles.riskInfo}>
          <Text
            style={[
              styles.riskLevel,
              { color: getRiskColor(weatherRisk.riskLevel) },
            ]}
          >
            {weatherRisk.riskLevel} Risk
          </Text>
          <Text style={styles.riskDescription}>
            Environmental crisis triggers
          </Text>
        </View>
      </View>

      {weatherRisk.triggers.length > 0 && (
        <View style={styles.triggersContainer}>
          <Text style={styles.sectionTitle}>Active Triggers:</Text>
          {weatherRisk.triggers.map((trigger, index) => (
            <View key={index} style={styles.triggerItem}>
              <MaterialIcons name="warning" size={16} color={Colors.warning} />
              <Text style={styles.triggerText}>{trigger}</Text>
            </View>
          ))}
        </View>
      )}

      {weatherRisk.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommendations:</Text>
          {weatherRisk.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <MaterialIcons name="lightbulb" size={16} color={Colors.info} />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.gray600,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  refreshButton: {
    padding: 4,
  },
  riskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  riskScore: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  scoreScale: {
    fontSize: 16,
    color: Colors.gray600,
    marginLeft: 2,
  },
  riskInfo: {
    flex: 1,
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  riskDescription: {
    fontSize: 12,
    color: Colors.gray600,
  },
  triggersContainer: {
    marginBottom: 16,
  },
  recommendationsContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  triggerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  triggerText: {
    fontSize: 13,
    color: Colors.gray700,
    marginLeft: 8,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.gray700,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
