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
import { db } from "./firebase";

const COLLECTION_NAME = "pain_entries";

/**
 * Create or update pain entry for today
 */
export const createPainEntry = async (
  userId: string,
  painLevel: number,
  location: PainLocation[],
  description?: string
) => {
  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", today)
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
      date: today,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), painData);
    await updateDoc(docRef, { painId: docRef.id });
    return docRef.id;
  }
};

/**
 * Get today's pain entry
 */
export const getTodayPainEntry = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", today)
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
