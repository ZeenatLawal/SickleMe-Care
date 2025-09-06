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
import { getTodayDateString } from "../utils/dateUtils";
import { db } from "./firebase";

const COLLECTION_NAME = "hydration_entries";

export const createHydrationEntry = async (
  userId: string,
  amount: number,
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
      amount,
      updatedAt: serverTimestamp(),
    });

    return existingDoc.id;
  } else {
    const hydrationData: Omit<HydrationEntry, "hydrationId"> = {
      userId,
      amount,
      createdAt: serverTimestamp(),
      date: entryDate,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), hydrationData);
    await updateDoc(docRef, { hydrationId: docRef.id });
    return docRef.id;
  }
};

export const getHydrationTotal = async (userId: string, date: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("date", "==", date)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return { total: 0 };
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return { total: data.amount };
};
