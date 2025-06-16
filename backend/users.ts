import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "users";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export const createUser = async (
  userId: string,
  userData: Omit<User, "id">
) => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(userRef, userData);
};

export const getUserById = async (userId: string) => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists()
    ? ({ id: userSnap.id, ...userSnap.data() } as User)
    : null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(userRef, updates);
};
