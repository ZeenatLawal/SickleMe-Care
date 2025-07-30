import { FieldValue, Timestamp } from "firebase/firestore";

// Mood tracking types
export type MoodType = "great" | "good" | "okay" | "not-good" | "terrible";

export interface MoodEntry {
  moodId: string;
  userId: string;
  mood: MoodType;
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  date: string;
}

// Pain tracking types
export type PainLocation =
  | "chest"
  | "back"
  | "arms"
  | "legs"
  | "abdomen"
  | "joints"
  | "head"
  | "other";

export interface PainEntry {
  painId: string;
  userId: string;
  painLevel: number;
  location: PainLocation[];
  description?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  date: string;
}

// Medication tracking types
export type MedicationFrequency =
  | "daily"
  | "twice-daily"
  | "three-times-daily"
  | "weekly"
  | "as-needed";

export interface Medication {
  medicationId: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  timeSlots: string[];
  instructions?: string;
  isActive: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// Medication intake tracking types
export interface MedicationIntake {
  intakeId: string;
  userId: string;
  medicationId: string;
  takenAt: Timestamp | FieldValue;
  date: string;
  createdAt: Timestamp | FieldValue;
}

// Hydration tracking types
export interface HydrationEntry {
  hydrationId: string;
  userId: string;
  amount: number;
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  date: string;
}
