import type { WeatherData } from "@/utils/weather/weatherService";
import { weatherService } from "@/utils/weather/weatherService";
import { getWeatherIcon } from "@/utils/weather/weatherUtils";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const location = await weatherService.getUserLocation();
      if (location) {
        const weatherData = await weatherService.getCurrentWeather(
          location.latitude,
          location.longitude
        );
        setWeather(weatherData);
      }
    } catch (error) {
      console.warn("Failed to load weather:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.weatherText}>--°</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.weatherText}>
        {weather.temperature}° {getWeatherIcon(weather.weatherDescription)}
      </Text>
      <Text style={styles.conditionText}>
        {weather.weatherDescription.charAt(0).toUpperCase() +
          weather.weatherDescription.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
  },
  weatherText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  conditionText: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
  },
});
