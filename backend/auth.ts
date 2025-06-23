import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { auth } from "./firebase";
import { createUser, getUserById } from "./users";

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = await getUserById(userCredential.user.uid);

    if (!user) {
      throw new Error("User not found. Please create an account first.");
    }

    return user;
  } catch (error: any) {
    let errorMessage = "Login failed. Please try again.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
    }

    throw new Error(errorMessage);
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userData = {
      userId: userCredential.user.uid,
      email: userCredential.user.email || "",
      name,
      createdAt: serverTimestamp(),
    };

    await createUser(userCredential.user.uid, userData);
    return userData;
  } catch (error: any) {
    let errorMessage = "Account creation failed. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already in use.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters.";
        break;
    }

    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  return await signOut(auth);
};
