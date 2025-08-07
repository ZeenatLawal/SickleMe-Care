import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { User } from "../types/user";
import { db } from "./firebase";

const COLLECTION_NAME = "users";

export const createUser = async (userId: string, userData: User) => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(userRef, userData);
};

export const getUserById = async (userId: string) => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? ({ ...userSnap.data() } as User) : null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(userRef, updates);
};
