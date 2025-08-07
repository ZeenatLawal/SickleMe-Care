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
import { HydrationEntry } from "../types/health";
import { db } from "./firebase";

const COLLECTION_NAME = "hydration_entries";

export const createHydrationEntry = async (userId: string, amount: number) => {
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
      amount,
      updatedAt: serverTimestamp(),
    });

    return existingDoc.id;
  } else {
    const hydrationData: Omit<HydrationEntry, "hydrationId"> = {
      userId,
      amount,
      createdAt: serverTimestamp(),
      date: today,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), hydrationData);
    await updateDoc(docRef, { hydrationId: docRef.id });
    return docRef.id;
  }
};

export const getTodayHydrationTotal = async (userId: string) => {
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
    return { total: Math.round(data.amount * 100) / 100 };
  }

  return { total: 0 };
};
