/**
 * Random Forest Crisis Prediction for Sickle Cell Disease
 * Uses ensemble of decision trees to predict crisis risk
 */

// Patient data input for prediction
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

// Prediction result with risk assessment and recommendations
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

// Main prediction function using Random Forest ensemble
export function predictCrisisRisk(
  data: SimplifiedPatientData
): CrisisPrediction {
  // Decision trees for ensemble prediction
  const treePredictions = [];
  for (let i = 0; i < 10; i++) {
    const tree = createDecisionTree(i, data.userId);
    treePredictions.push(tree.predict(data));
  }

  // Calculate average prediction from all trees
  const averageRisk =
    treePredictions.reduce((sum, pred) => sum + pred, 0) /
    treePredictions.length;

  // Identify most critical risk factors
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

// Top 3 risk factors with recommendations
function getTopRiskFactors(data: SimplifiedPatientData) {
  const riskContributions = calculateRiskContribution(data);

  const factors = [
    {
      factor: "Medication Adherence",
      importance: FEATURE_WEIGHTS.medicationAdherence,
      value: `${data.medicationAdherence}%`,
      riskScore: riskContributions.medicationAdherence,
      recommendation:
        data.medicationAdherence < 50
          ? "Critical: Take medications as prescribed. Set daily reminders and consult your hematologist immediately"
          : data.medicationAdherence < 80
          ? "Set medication reminders, use pill organisers, and track missed doses to prevent crises"
          : "Excellent adherence! Continue current routine and maintain regular check-ups",
    },
    {
      factor: "Pain Level",
      importance: FEATURE_WEIGHTS.avgPainLevel,
      value: `${data.avgPainLevel}/10`,
      riskScore: riskContributions.avgPainLevel,
      recommendation:
        data.avgPainLevel > 8
          ? "Severe pain detected. Contact emergency services or visit ER immediately"
          : data.avgPainLevel > 6
          ? "High pain levels - contact your healthcare provider today and implement pain management plan"
          : data.avgPainLevel > 3
          ? "Monitor pain trends and use prescribed pain relief methods as needed"
          : "Pain well controlled. Continue current management strategies",
    },
    {
      factor: "Hydration",
      importance: FEATURE_WEIGHTS.hydrationLevel,
      value: `${data.hydrationLevel}% of goal`,
      riskScore: riskContributions.hydrationLevel,
      recommendation:
        data.hydrationLevel < 50
          ? "Critically low hydration! Drink 250-350ml water every hour while awake. Avoid caffeine and alcohol"
          : data.hydrationLevel < 70
          ? "Increase daily fluid intake to 3-4 litres. Carry a water bottle and set hourly hydration reminders"
          : data.hydrationLevel < 90
          ? "Good hydration levels. Aim for 2.5-3 litres daily and monitor urine color (should be pale yellow)"
          : "Excellent hydration! Maintain current intake and adjust for hot weather or physical activity",
    },
    {
      factor: "Weather Conditions",
      importance: FEATURE_WEIGHTS.weatherRisk,
      value: data.weatherRisk > 6 ? "High risk weather" : "Stable weather",
      riskScore: riskContributions.weatherRisk,
      recommendation:
        data.weatherRisk > 8
          ? "Extreme weather alert! Stay indoors, dress in layers, use heating/cooling as needed. Consider postponing outdoor activities"
          : data.weatherRisk > 6
          ? "High-risk weather conditions. Wear appropriate clothing, avoid temperature extremes, and stay well-hydrated"
          : data.weatherRisk > 3
          ? "Monitor weather changes and dress appropriately. Keep emergency medications accessible"
          : "Weather conditions are favorable for normal activities",
    },
    {
      factor: "Stress Level",
      importance: FEATURE_WEIGHTS.stressLevel,
      value: `${data.stressLevel}/10`,
      riskScore: riskContributions.stressLevel,
      recommendation:
        data.stressLevel > 8
          ? "Severe stress detected. Practice immediate calming techniques: 4-7-8 breathing, seek counseling support"
          : data.stressLevel > 6
          ? "High stress levels. Try daily meditation (10-15 min), gentle exercise, or speak with a mental health professional"
          : data.stressLevel > 3
          ? "Moderate stress. Maintain regular sleep schedule, practice relaxation techniques, and engage in enjoyable activities"
          : "Stress levels are well managed. Continue current coping strategies and self-care routine",
    },
  ];

  // Sort by weighted risk contribution and return top 3
  return factors
    .sort((a, b) => {
      const aTotal = a.riskScore * a.importance;
      const bTotal = b.riskScore * b.importance;
      return bTotal - aTotal || b.importance - a.importance;
    })
    .slice(0, 3);
}

// Calculate risk scores for each factors
function calculateRiskContribution(data: SimplifiedPatientData) {
  const risks = {
    medicationAdherence: 0,
    avgPainLevel: 0,
    hydrationLevel: 0,
    weatherRisk: 0,
    stressLevel: 0,
  };

  // Medication adherence thresholds
  if (data.medicationAdherence < 50) {
    risks.medicationAdherence = 35; // Critical
  } else if (data.medicationAdherence < 80) {
    risks.medicationAdherence = 15; // Moderate
  }

  // Pain level thresholds
  if (data.avgPainLevel > 7) {
    risks.avgPainLevel = 25; // Severe pain
  } else if (data.avgPainLevel > 4) {
    risks.avgPainLevel = 10; // Moderate pain
  }

  // Hydration level thresholds
  if (data.hydrationLevel < 50) {
    risks.hydrationLevel = 20; // Critical
  } else if (data.hydrationLevel < 70) {
    risks.hydrationLevel = 10; // Poor hydration
  }

  // Weather risk thresholds
  if (data.weatherRisk > 7) {
    risks.weatherRisk = 15; // Extreme weather
  } else if (data.weatherRisk > 5) {
    risks.weatherRisk = 5; // Challenging weather
  }

  // Stress level thresholds
  if (data.stressLevel > 7) {
    risks.stressLevel = 10; // High stress
  } else if (data.stressLevel > 5) {
    risks.stressLevel = 5; // Moderate stress
  }

  return risks;
}

// Create individual decision tree for ensemble
function createDecisionTree(treeIndex: number, patientId: string) {
  // All available features
  const allFeatures = [
    "medicationAdherence",
    "avgPainLevel",
    "hydrationLevel",
    "weatherRisk",
    "stressLevel",
  ];

  // Feature selection
  const hash = patientId.charCodeAt(0) + treeIndex;
  const startIndex = hash % allFeatures.length;

  const featureSubset = [
    allFeatures[startIndex],
    allFeatures[(startIndex + 1) % allFeatures.length],
    allFeatures[(startIndex + 2) % allFeatures.length],
  ];

  return {
    predict: (data: SimplifiedPatientData): number => {
      let risk = 25; // Base risk score
      const riskContributions = calculateRiskContribution(data);

      // Add risk from selected features only
      featureSubset.forEach((feature) => {
        switch (feature) {
          case "medicationAdherence":
            risk += riskContributions.medicationAdherence;
            break;
          case "avgPainLevel":
            risk += riskContributions.avgPainLevel;
            break;
          case "hydrationLevel":
            risk += riskContributions.hydrationLevel;
            break;
          case "weatherRisk":
            risk += riskContributions.weatherRisk;
            break;
          case "stressLevel":
            risk += riskContributions.stressLevel;
            break;
        }
      });

      // Add risk for recent crisis
      if (data.daysSinceLastCrisis < 30) {
        risk += 10;
      }

      return Math.min(100, Math.max(0, risk));
    },
  };
}
