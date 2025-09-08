import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { PainEntry, PainLocation } from "../types/health";
import { getTodayDateString } from "../utils/dateUtils";
import { db } from "./firebase";

const COLLECTION_NAME = "pain_entries";

/**
 * Create or update pain entry
 */
export const createPainEntry = async (
  userId: string,
  painLevel: number,
  location: PainLocation[],
  description?: string,
  date?: string
) => {
  const entryDate = date || getTodayDateString();

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", entryDate)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const existingDoc = querySnapshot.docs[0];

    await updateDoc(doc(db, COLLECTION_NAME, existingDoc.id), {
      painLevel,
      location,
      description,
      updatedAt: serverTimestamp(),
    });

    return existingDoc.id;
  } else {
    const painData: Omit<PainEntry, "painId"> = {
      userId,
      painLevel,
      location,
      description,
      createdAt: serverTimestamp(),
      date: entryDate,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), painData);
    await updateDoc(docRef, { painId: docRef.id });
    return docRef.id;
  }
};

/**
 * Get pain entry for a specific date
 */
export const getPainEntry = async (userId: string, date: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", date)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      painLevel: data.painLevel,
      location: data.location,
      description: data.description,
    };
  }

  return null;
};
