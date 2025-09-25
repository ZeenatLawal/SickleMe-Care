import { predictCrisisRisk } from "@/utils/ml/randomForestPredictor";

describe("Crisis Prediction Algorithm - Risk Score Calculation", () => {
  it('should return "Low" risk for optimal health data', () => {
    const healthyPatient = {
      medicationAdherence: 95,
      avgPainLevel: 1,
      hydrationLevel: 90,
      weatherRisk: 2,
      stressLevel: 2,
      daysSinceLastCrisis: 90,
      userId: "test-user-1",
    };

    const prediction = predictCrisisRisk(healthyPatient);

    expect(prediction.riskLevel).toBe("Low");
    expect(prediction.riskScore).toBeLessThan(35);
    expect(prediction.topFactors).toHaveLength(3);
    expect(prediction.topFactors[0]).toHaveProperty("factor");
    expect(prediction.topFactors[0]).toHaveProperty("recommendation");
  });

  it('should return "Moderate" risk for some risk factors', () => {
    const moderatePatient = {
      medicationAdherence: 70,
      avgPainLevel: 4,
      hydrationLevel: 65,
      weatherRisk: 4,
      stressLevel: 5,
      daysSinceLastCrisis: 45,
      userId: "test-user-2",
    };

    const prediction = predictCrisisRisk(moderatePatient);

    expect(prediction.riskLevel).toBe("Moderate");
    expect(prediction.riskScore).toBeGreaterThanOrEqual(35);
    expect(prediction.riskScore).toBeLessThan(60);
  });

  it('should return "High" risk for multiple risk factors', () => {
    const highRiskPatient = {
      medicationAdherence: 60,
      avgPainLevel: 6,
      hydrationLevel: 60,
      weatherRisk: 6,
      stressLevel: 6,
      daysSinceLastCrisis: 25,
      userId: "test-user-3",
    };

    const prediction = predictCrisisRisk(highRiskPatient);

    expect(prediction.riskLevel).toBe("High");
    expect(prediction.riskScore).toBeGreaterThanOrEqual(60);
    expect(prediction.riskScore).toBeLessThan(80);
  });

  it('should return "Critical" risk for severe indicators', () => {
    const criticalPatient = {
      medicationAdherence: 25,
      avgPainLevel: 9,
      hydrationLevel: 30,
      weatherRisk: 8,
      stressLevel: 9,
      daysSinceLastCrisis: 5,
      userId: "test-user-4",
    };

    const prediction = predictCrisisRisk(criticalPatient);

    expect(prediction.riskLevel).toBe("Critical");
    expect(prediction.riskScore).toBeGreaterThanOrEqual(80);
    expect(prediction.riskScore).toBeLessThanOrEqual(100);
  });

  it("should handle edge cases with boundary values", () => {
    const boundaryPatient = {
      medicationAdherence: 50,
      avgPainLevel: 5,
      hydrationLevel: 50,
      weatherRisk: 5,
      stressLevel: 5,
      daysSinceLastCrisis: 30,
      userId: "test-user-5",
    };

    const prediction = predictCrisisRisk(boundaryPatient);

    expect(prediction.riskScore).toBeGreaterThanOrEqual(0);
    expect(prediction.riskScore).toBeLessThanOrEqual(100);
    expect(["Low", "Moderate", "High", "Critical"]).toContain(
      prediction.riskLevel
    );
    expect(prediction.topFactors).toHaveLength(3);
  });
});
