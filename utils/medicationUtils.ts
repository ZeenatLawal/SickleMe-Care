import {
  getMedicationIntakes,
  getUserMedications,
  recordMedicationIntake,
} from "@/backend";
import { Medication } from "@/types";

export type UIMedication = Partial<Medication> & {
  taken: boolean;
  dosesToday: number;
  requiredDoses: number;
};

export type MedicationProgress = {
  medications: UIMedication[];
  completedMedications: number;
  totalMedications: number;
  totalDosesTaken: number;
  totalDosesRequired: number;
};

export const getRequiredDosesPerDay = (frequency: string) => {
  switch (frequency) {
    case "twice-daily":
      return 2;
    case "three-times-daily":
      return 3;
    case "daily":
    case "weekly":
    case "as-needed":
    default:
      return 1;
  }
};

//  Load and calculate medication progress for today
export const loadMedicationProgress = async (userId: string) => {
  const userMeds = await getUserMedications(userId);
  const today = new Date().toISOString().split("T")[0];
  const todayIntakes = await getMedicationIntakes(userId, today);

  // Count doses taken today for each medication
  const dosesCountMap = new Map<string, number>();
  todayIntakes.forEach((intake) => {
    const currentCount = dosesCountMap.get(intake.medicationId) || 0;
    dosesCountMap.set(intake.medicationId, currentCount + 1);
  });

  let completedMedications = 0;
  let totalDosesTaken = 0;
  let totalDosesRequired = 0;

  const medications = userMeds.map((med) => {
    const requiredDoses = getRequiredDosesPerDay(med.frequency || "daily");
    const dosesToday = dosesCountMap.get(med.medicationId || "") || 0;
    const taken = dosesToday >= requiredDoses;

    totalDosesRequired += requiredDoses;
    totalDosesTaken += dosesToday;

    if (taken) {
      completedMedications++;
    }

    return {
      ...med,
      taken,
      dosesToday,
      requiredDoses,
    };
  });

  return {
    medications,
    completedMedications,
    totalMedications: userMeds.length,
    totalDosesTaken,
    totalDosesRequired,
  };
};

export const takeMedication = async (userId: string, medicationId: string) => {
  await recordMedicationIntake(userId, medicationId);
};
