import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Medication,
  MedicationFrequency,
  MedicationIntake,
} from "../types/health";
import { db } from "./firebase";

const MEDICATIONS_COLLECTION = "medications";
const MEDICATION_INTAKES_COLLECTION = "medication_intakes";

/**
 * Create a new medication
 */
export const createMedication = async (
  userId: string,
  name: string,
  dosage: string,
  frequency: MedicationFrequency,
  instructions?: string
) => {
  const medicationData: Omit<Medication, "medicationId"> = {
    userId,
    name,
    dosage,
    frequency,
    timeSlots: [], // TODO: Add time slots logic
    instructions,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, MEDICATIONS_COLLECTION),
    medicationData
  );

  await updateDoc(docRef, { medicationId: docRef.id });
  return docRef.id;
};

/**
 * Get all medications for a user
 */
export const getUserMedications = async (userId: string) => {
  const q = query(
    collection(db, MEDICATIONS_COLLECTION),
    where("userId", "==", userId),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const medications: Medication[] = [];

  querySnapshot.forEach((doc) => {
    medications.push({ ...doc.data() } as Medication);
  });

  return medications;
};

export const deleteMedication = async (medicationId: string) => {
  const docRef = doc(db, MEDICATIONS_COLLECTION, medicationId);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Record medication intake
 */
export const recordMedicationIntake = async (
  userId: string,
  medicationId: string
) => {
  const today = new Date().toISOString().split("T")[0];

  const intakeData: Omit<MedicationIntake, "intakeId"> = {
    userId,
    medicationId,
    takenAt: serverTimestamp(),
    date: today,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, MEDICATION_INTAKES_COLLECTION),
    intakeData
  );

  await updateDoc(docRef, { intakeId: docRef.id });
  return docRef.id;
};

export const getMedicationIntakes = async (userId: string, date: string) => {
  const q = query(
    collection(db, MEDICATION_INTAKES_COLLECTION),
    where("userId", "==", userId),
    where("date", "==", date),
    orderBy("takenAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const intakes: MedicationIntake[] = [];

  querySnapshot.forEach((doc) => {
    intakes.push({ ...doc.data() } as MedicationIntake);
  });

  return intakes;
};
