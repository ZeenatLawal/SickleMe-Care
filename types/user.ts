import { FieldValue, Timestamp } from "firebase/firestore";

export type SickleCellType = "SS" | "SC" | "SB+" | "SB0" | "AS" | "other";
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface EmergencyContact {
  name: string | null;
  phoneNumber: string | null;
  relationship: string | null;
}

export interface UserProfile {
  dateOfBirth: string | null;
  bloodType: BloodType | null;
  sickleCellType: SickleCellType | null;
  phoneNumber: string | null;
  emergencyContact: EmergencyContact;
}

// Main User interface
export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  profile: UserProfile;
  notifications: boolean;
}
