import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { MoodEntry, MoodType } from "../types/health";
import { db } from "./firebase";

const COLLECTION_NAME = "moods";

export const createMoodEntry = async (userId: string, mood: MoodType) => {
  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", today),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docToUpdate = querySnapshot.docs[0];

    await updateDoc(docToUpdate.ref, { mood, updatedAt: serverTimestamp() });

    return docToUpdate.id;
  } else {
    const moodData: Omit<MoodEntry, "moodId"> = {
      userId,
      mood,
      createdAt: serverTimestamp(),
      date: today,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), moodData);

    await updateDoc(docRef, { moodId: docRef.id });
    return docRef.id;
  }
};

/**
 * Get today's mood entry for user
 */
export const getTodayMoodEntry = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", today),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { ...doc.data() } as MoodEntry;
  }

  return null;
};

/**
 * Delete a mood entry
 */
export const deleteMoodEntry = async (entryId: string) => {
  const docRef = doc(db, COLLECTION_NAME, entryId);
  await deleteDoc(docRef);
};
