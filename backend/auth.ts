import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { User } from "../types/user";
import { auth } from "./firebase";
import { createUser, getUserById } from "./users";

/**
 * Authenticates user with email and password
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = await getUserById(userCredential.user.uid);

    if (!user) {
      throw new Error("User profile not found. Please contact support.");
    }

    return user;
  } catch (error: any) {
    let errorMessage = "Login failed. Please try again.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email address.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password. Please try again.";
        break;
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection.";
        break;
      case "auth/invalid-credential":
        errorMessage = "Invalid email or password.";
        break;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Creates a new user account with email and password
 */
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

    // Initialize user profile
    const userData: User = {
      userId: userCredential.user.uid,
      email: userCredential.user.email || "",
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Health profile
      profile: {
        dateOfBirth: null,
        bloodType: null,
        sickleCellType: null,
        phoneNumber: null,
        emergencyContact: {
          name: null,
          phoneNumber: null,
          relationship: null,
        },
      },
      notificationSettings: {
        daily: true,
        medication: false,
        hydration: true,
        insights: false,
      },
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
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters.";
        break;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Signs out the current user from Firebase Auth
 */
export const logout = async () => {
  return await signOut(auth);
};

/**
 * Sends password reset email to user
 */
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    let errorMessage = "Failed to send password reset email.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email address.";
        break;
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many requests. Please try again later.";
        break;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Permanently deletes the current user's account
 */
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found.");
    }

    // Permanently delete the Firebase Auth account
    // TODO: This should also trigger cleanup of user data in Firestore
    await deleteUser(user);

    return { success: true };
  } catch (error: any) {
    console.error("Delete account error:", error);
    throw new Error("Failed to delete account.");
  }
};
