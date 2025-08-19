/**
 * Data Collection for Random Forest ML
 */

import {
  getTodayHydrationTotal,
  getTodayMoodEntry,
  getTodayPainEntry,
} from "@/backend";
import { weatherService } from "@/utils/weather/weatherService";
import type { SimplifiedPatientData } from "./randomForestPredictor";

/**
 * Collect data for Random Forest prediction
 */
export async function collectMLData(
  userId: string
): Promise<SimplifiedPatientData> {
  try {
    const [
      medicationAdherence,
      todaysPain,
      todaysHydration,
      weatherRisk,
      todaysMood,
    ] = await Promise.all([
      estimateMedicationAdherence(userId),
      getTodaysPainLevel(userId),
      getTodaysHydrationLevel(userId),
      getCurrentWeatherRisk(),
      getTodaysStressLevel(userId),
    ]);

    return {
      medicationAdherence,
      avgPainLevel: todaysPain,
      hydrationLevel: todaysHydration,
      weatherRisk,
      stressLevel: todaysMood,
      daysSinceLastCrisis: estimateDaysSinceLastCrisis(todaysPain),
      userId,
    };
  } catch (error) {
    console.error("Error collecting ML data:", error);
    return {
      medicationAdherence: 75,
      avgPainLevel: 3,
      hydrationLevel: 70,
      weatherRisk: 5,
      stressLevel: 5,
      daysSinceLastCrisis: 60,
      userId,
    };
  }
}

/**
 * TODO: Implement medication adherence tracking
 */
async function estimateMedicationAdherence(userId: string) {
  // Ceck medication logs
  return 80; // Assume good adherence
}

async function getTodaysPainLevel(userId: string) {
  try {
    const painEntry = await getTodayPainEntry(userId);
    return painEntry?.painLevel || 3;
  } catch (error) {
    console.warn("Pain data unavailable:", error);
    return 3;
  }
}

async function getTodaysHydrationLevel(userId: string) {
  try {
    const hydrationData = await getTodayHydrationTotal(userId);
    const dailyGoal = 2.0;

    const percentage = Math.round((hydrationData.total / dailyGoal) * 100);
    return Math.min(150, percentage);
  } catch (error) {
    console.warn("Hydration data unavailable:", error);
    return 70;
  }
}

async function getCurrentWeatherRisk() {
  try {
    const location = await weatherService.getUserLocation();

    if (!location) {
      return 5;
    }

    const weatherRisk = await weatherService.getWeatherRisk(
      location.latitude,
      location.longitude
    );

    return weatherRisk.riskScore;
  } catch (error) {
    console.warn("Weather data unavailable:", error);
    return 5;
  }
}

async function getTodaysStressLevel(userId: string) {
  try {
    const moodEntry = await getTodayMoodEntry(userId);

    if (!moodEntry) {
      return 5;
    }

    const moodToStress: Record<string, number> = {
      great: 1, // Low stress
      okay: 5, // Moderate stress
      "not-good": 9, // Very high stress
    };

    return moodToStress[moodEntry.mood] || 5;
  } catch (error) {
    console.warn("Mood data unavailable:", error);
    return 5;
  }
}

function estimateDaysSinceLastCrisis(currentPain: number) {
  if (currentPain >= 8) {
    return 1; // Very recent crisis
  } else if (currentPain >= 6) {
    return 7;
  } else if (currentPain >= 4) {
    return 30;
  } else {
    return 90;
  }
}
