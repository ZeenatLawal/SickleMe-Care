import { Colors } from "@/constants/Colors";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical" | "Severe";

export function getRiskColor(riskLevel: RiskLevel | string): string {
  switch (riskLevel) {
    case "Critical":
    case "Severe":
    case "High":
      return Colors.error;
    case "Moderate":
      return Colors.warning;
    case "Low":
      return Colors.success;
    default:
      return Colors.gray500;
  }
}

export function getRiskIcon(riskLevel: RiskLevel | string): string {
  switch (riskLevel) {
    case "Critical":
      return "emergency";
    case "Severe":
      return "warning";
    case "High":
      return "warning";
    case "Moderate":
      return "info";
    case "Low":
      return "check-circle";
    default:
      return "help";
  }
}

export function getWeatherRiskIcon(riskLevel: RiskLevel | string): string {
  switch (riskLevel) {
    case "Low":
      return "wb-sunny";
    case "Moderate":
      return "cloud";
    case "High":
      return "storm";
    case "Severe":
      return "warning";
    default:
      return "help";
  }
}

export function getWeatherIcon(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("rain") || desc.includes("drizzle")) return "🌧️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("clear") || desc.includes("sun")) return "☀️";
  if (desc.includes("storm")) return "⛈️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("fog") || desc.includes("mist")) return "🌫️";
  return "🌤️";
}
