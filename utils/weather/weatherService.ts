import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Location from "expo-location";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  weatherDescription: string;
  location: string;
  timestamp: Date;
}

export interface WeatherRiskAssessment {
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High" | "Severe";
  triggers: string[];
  recommendations: string[];
}

// Constants
const API_KEY =
  Constants.expoConfig?.extra?.openWeatherApiKey ||
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Get current weather conditions
 */
export async function getCurrentWeather(lat: number, lon: number) {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing");
  }

  const cacheKey = `weather_current_${lat}_${lon}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    console.error(`Weather API error: ${response.status} - ${error}`);
    throw new Error(`Weather API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  const weatherData = {
    temperature: Math.round(data.main.temp),
    windSpeed: Math.round(data.wind.speed),
    weatherDescription: data.weather[0].description,
    location: `${data.name}, ${data.sys.country}`,
    timestamp: new Date(),
  };

  await cacheData(cacheKey, weatherData);
  return weatherData;
}

export function calculateWeatherRisk(current: WeatherData) {
  let riskScore = 0;
  const triggers: string[] = [];
  const recommendations: string[] = [];

  // Cold weather risk
  if (current.temperature < 10) {
    riskScore += 6;
    triggers.push("Very cold weather (<10°C)");
    recommendations.push("Stay indoors, use heating, warm clothing");
  } else if (current.temperature < 15) {
    riskScore += 4;
    triggers.push("Cold weather (10-15°C)");
    recommendations.push("Dress warmly, limit outdoor exposure");
  } else if (current.temperature < 20) {
    riskScore += 2;
    triggers.push("Cool weather (15-20°C)");
    recommendations.push("Dress warmly, avoid prolonged outdoor exposure");
  }

  if (current.windSpeed > 25) {
    riskScore += 1;
    triggers.push("High winds/storm conditions");
    recommendations.push("Stay indoors, avoid outdoor activities");
  }

  if (
    current.weatherDescription.includes("storm") ||
    current.weatherDescription.includes("thunderstorm")
  ) {
    riskScore += 1;
    triggers.push("Storm system present");
    recommendations.push("Stay indoors until weather improves");
  }

  let riskLevel: "Low" | "Moderate" | "High" | "Severe";
  if (riskScore >= 7) {
    riskLevel = "Severe";
    recommendations.unshift("Extreme weather conditions expected");
  } else if (riskScore >= 5) {
    riskLevel = "High";
    recommendations.unshift("Take extra precautions today");
  } else if (riskScore >= 3) {
    riskLevel = "Moderate";
    recommendations.unshift("Be cautious with outdoor activities");
  } else {
    riskLevel = "Low";
    if (recommendations.length === 0) {
      recommendations.push("Weather conditions are favorable");
    }
  }

  return {
    riskScore: Math.min(10, riskScore),
    riskLevel,
    triggers,
    recommendations,
  };
}

export async function getWeatherRisk(
  latitude: number,
  longitude: number
): Promise<WeatherRiskAssessment> {
  try {
    const currentWeather = await getCurrentWeather(latitude, longitude);
    return calculateWeatherRisk(currentWeather);
  } catch (error) {
    console.error("Weather API error:", error);
    return {
      riskScore: 3,
      riskLevel: "Moderate",
      triggers: ["Weather data unavailable"],
      recommendations: ["Monitor local weather conditions manually"],
    };
  }
}

export async function cacheData(key: string, data: WeatherData) {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheObject));
  } catch (error) {
    console.warn("Failed to cache weather data:", error);
  }
}

export async function getCachedData(key: string) {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const cacheObject = JSON.parse(cached);
    const age = Date.now() - cacheObject.timestamp;

    if (age < CACHE_DURATION) {
      return cacheObject.data;
    }

    await AsyncStorage.removeItem(key);
    return null;
  } catch (error) {
    console.warn("Failed to read cached weather data:", error);
    return null;
  }
}

export async function getUserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync();
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Failed to get user location:", error);
    return null;
  }
}

export const weatherService = {
  getWeatherRisk,
  getCurrentWeather,
  getUserLocation,
};
