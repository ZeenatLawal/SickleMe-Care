/**
 * Simple Random Forest Crisis Prediction for Sickle Cell Disease
 */

export interface SimplifiedPatientData {
  // Core factors
  medicationAdherence: number; // 0-100% - Weight: 0.35
  avgPainLevel: number; // 0-10 scale - Weight: 0.25
  hydrationLevel: number; // 0-100% of goal - Weight: 0.20

  // Environmental factors
  weatherRisk: number; // 0-10 scale - Weight: 0.10
  stressLevel: number; // 0-10 scale - Weight: 0.10

  daysSinceLastCrisis: number;
  userId: string;
}

export interface CrisisPrediction {
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  topFactors: {
    factor: string;
    importance: number;
    value: string;
    recommendation: string;
  }[];
}

const FEATURE_WEIGHTS = {
  medicationAdherence: 0.35,
  avgPainLevel: 0.25,
  hydrationLevel: 0.2,
  weatherRisk: 0.1,
  stressLevel: 0.1,
};

export function predictCrisisRisk(
  data: SimplifiedPatientData
): CrisisPrediction {
  const treePredictions: number[] = [];
  for (let i = 0; i < 10; i++) {
    const tree = createDecisionTree(3);
    treePredictions.push(tree.predict(data));
  }

  const averageRisk =
    treePredictions.reduce((sum, pred) => sum + pred, 0) /
    treePredictions.length;

  // Identify most important factors
  const topFactors = getTopRiskFactors(data);

  return {
    riskScore: Math.round(averageRisk),
    riskLevel: getRiskLevel(averageRisk),
    topFactors,
  };
}

/**
 * Determine risk level
 */
function getRiskLevel(score: number) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

/**
 * Identify top risk factors with importance scores
 */
function getTopRiskFactors(data: SimplifiedPatientData) {
  const factors = [
    {
      factor: "Medication Adherence",
      importance: FEATURE_WEIGHTS.medicationAdherence,
      value: `${data.medicationAdherence}%`,
      recommendation:
        data.medicationAdherence < 80
          ? "Improve medication schedule - set daily reminders"
          : "Continue excellent medication adherence",
    },
    {
      factor: "Pain Level",
      importance: FEATURE_WEIGHTS.avgPainLevel,
      value: `${data.avgPainLevel}/10`,
      recommendation:
        data.avgPainLevel > 6
          ? "Monitor pain closely - contact healthcare provider if worsening"
          : "Pain levels are well controlled",
    },
    {
      factor: "Hydration",
      importance: FEATURE_WEIGHTS.hydrationLevel,
      value: `${data.hydrationLevel}% of goal`,
      recommendation:
        data.hydrationLevel < 70
          ? "Increase water intake to at least 2.5L daily"
          : "Maintain current hydration levels",
    },
    {
      factor: "Weather Conditions",
      importance: FEATURE_WEIGHTS.weatherRisk,
      value: data.weatherRisk > 6 ? "High risk weather" : "Stable weather",
      recommendation:
        data.weatherRisk > 6
          ? "Stay warm, avoid temperature extremes"
          : "Weather conditions are favorable",
    },
    {
      factor: "Stress Level",
      importance: FEATURE_WEIGHTS.stressLevel,
      value: `${data.stressLevel}/10`,
      recommendation:
        data.stressLevel > 6
          ? "Practice stress management - deep breathing, meditation"
          : "Stress levels are manageable",
    },
  ];

  return factors.sort((a, b) => b.importance - a.importance).slice(0, 3);
}

function createDecisionTree(featureCount: number) {
  const allFeatures = [
    "medicationAdherence",
    "avgPainLevel",
    "hydrationLevel",
    "weatherRisk",
    "stressLevel",
  ];
  const featureSubset = selectRandomFeatures(allFeatures, featureCount);

  return {
    predict: (data: SimplifiedPatientData): number => {
      let risk = 25;

      if (featureSubset.includes("medicationAdherence")) {
        if (data.medicationAdherence < 50) {
          risk += 35;
        } else if (data.medicationAdherence < 80) {
          risk += 15;
        }
      }

      if (featureSubset.includes("avgPainLevel")) {
        if (data.avgPainLevel > 7) {
          risk += 25;
        } else if (data.avgPainLevel > 4) {
          risk += 10;
        }
      }

      if (featureSubset.includes("hydrationLevel")) {
        if (data.hydrationLevel < 50) {
          risk += 20;
        } else if (data.hydrationLevel < 70) {
          risk += 10;
        }
      }

      if (featureSubset.includes("weatherRisk")) {
        if (data.weatherRisk > 7) {
          risk += 15;
        } else if (data.weatherRisk > 5) {
          risk += 5;
        }
      }

      if (featureSubset.includes("stressLevel")) {
        if (data.stressLevel > 7) {
          risk += 10;
        } else if (data.stressLevel > 5) {
          risk += 5;
        }
      }

      if (data.daysSinceLastCrisis < 30) {
        risk += 10;
      }

      return Math.min(100, Math.max(0, risk));
    },
  };
}

function selectRandomFeatures(features: string[], count: number) {
  const shuffled = [...features].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const randomForestPredictor = {
  predictCrisisRisk,
};
