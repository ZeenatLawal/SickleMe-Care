import { getHydrationTotal, getMoodEntry, getPainEntry } from "@/backend";
import { calculateMedicationAdherence } from "@/utils/medicationUtils";
import { weatherService } from "@/utils/weather/weatherService";
import { getPastDateString } from "../dateUtils";
import type { SimplifiedPatientData } from "./randomForestPredictor";

export type TimePeriod = "week" | "month" | "quarter";

export const timePeriods = [
  { id: "week", label: "7 Days" },
  { id: "month", label: "30 Days" },
  { id: "quarter", label: "90 Days" },
];

export function getAvailableTimePeriods(userCreatedAt: any) {
  const availablePeriods = [];

  const daysSinceJoined = Math.floor(
    (new Date().getTime() - userCreatedAt.toDate().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceJoined >= 1) {
    availablePeriods.push(timePeriods[0]);
  }

  if (daysSinceJoined >= 7) {
    availablePeriods.push(timePeriods[1]);
  }

  if (daysSinceJoined >= 30) {
    availablePeriods.push(timePeriods[2]);
  }
  return availablePeriods.length > 0 ? availablePeriods : [timePeriods[0]];
}

function getTimePeriodDays(timePeriod: TimePeriod) {
  switch (timePeriod) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
    default:
      return 7;
  }
}

/**
 * Collect data for crisis prediction
 */
export async function collectMLData(
  userId: string,
  timePeriod: TimePeriod = "week"
): Promise<SimplifiedPatientData> {
  try {
    const [
      medicationAdherence,
      avgPainLevel,
      hydrationLevel,
      weatherRisk,
      stressLevel,
    ] = await Promise.all([
      getAdherenceRate(userId, timePeriod),
      getAvgPainLevel(userId, timePeriod),
      getAvgHydrationLevel(userId, timePeriod),
      getCurrentWeatherRisk(),
      getAvgStressLevel(userId, timePeriod),
    ]);

    return {
      medicationAdherence,
      avgPainLevel,
      hydrationLevel,
      weatherRisk,
      stressLevel,
      daysSinceLastCrisis: estimateDaysSinceLastCrisis(avgPainLevel),
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
 * Calculate medication adherence
 */
async function getAdherenceRate(
  userId: string,
  timePeriod: TimePeriod = "week"
) {
  try {
    const dates = Array.from(
      { length: getTimePeriodDays(timePeriod) },
      (_, i) => getPastDateString(i)
    );

    const adherencePercentage = await calculateMedicationAdherence(
      userId,
      dates
    );

    return adherencePercentage;
  } catch (error) {
    console.error("Error calculating medication adherence:", error);
    return 80;
  }
}

async function getAvgPainLevel(
  userId: string,
  timePeriod: TimePeriod = "week"
) {
  try {
    const daysToCheck = getTimePeriodDays(timePeriod);
    let totalPain = 0;
    let daysWithData = 0;

    for (let i = 0; i < daysToCheck; i++) {
      const painEntry = await getPainEntry(userId, getPastDateString(i));
      if (painEntry?.painLevel !== undefined) {
        totalPain += painEntry.painLevel;
        daysWithData++;
      }
    }

    return daysWithData === 0 ? 3 : Math.round(totalPain / daysWithData);
  } catch (error) {
    console.warn("Pain data unavailable:", error);
    return 3;
  }
}

async function getAvgHydrationLevel(
  userId: string,
  timePeriod: TimePeriod = "week"
) {
  try {
    const daysToCheck = getTimePeriodDays(timePeriod);
    let totalHydrationPercentage = 0;
    let daysWithData = 0;
    const dailyGoal = 2.0;

    for (let i = 0; i < daysToCheck; i++) {
      const hydrationData = await getHydrationTotal(
        userId,
        getPastDateString(i)
      );
      if (hydrationData?.total > 0) {
        totalHydrationPercentage += (hydrationData.total / dailyGoal) * 100;
        daysWithData++;
      }
    }

    if (daysWithData === 0) return 70;

    return Math.min(150, Math.round(totalHydrationPercentage / daysWithData));
  } catch (error) {
    console.warn("Hydration data unavailable:", error);
    return 70;
  }
}

async function getCurrentWeatherRisk() {
  try {
    const location = await weatherService.getUserLocation();
    if (!location) return 5;

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

async function getAvgStressLevel(
  userId: string,
  timePeriod: TimePeriod = "week"
) {
  try {
    const daysToCheck = getTimePeriodDays(timePeriod);
    let totalStress = 0;
    let daysWithData = 0;

    const moodToStress: Record<string, number> = {
      great: 1,
      okay: 5,
      "not-good": 9,
    };

    for (let i = 0; i < daysToCheck; i++) {
      const moodEntry = await getMoodEntry(userId, getPastDateString(i));
      if (moodEntry?.mood) {
        totalStress += moodToStress[moodEntry.mood] || 5;
        daysWithData++;
      }
    }

    return daysWithData === 0 ? 5 : Math.round(totalStress / daysWithData);
  } catch (error) {
    console.warn("Mood data unavailable:", error);
    return 5;
  }
}

function estimateDaysSinceLastCrisis(currentPain: number) {
  if (currentPain >= 8) return 1;
  if (currentPain >= 6) return 7;
  if (currentPain >= 4) return 30;
  return 90;
}
