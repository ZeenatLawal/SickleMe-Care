import {
  deleteUserAccount,
  loginWithEmail,
  logout,
  registerUser,
  sendPasswordReset,
} from "@/backend/auth";
import { auth } from "@/backend/firebase";
import { createUser, getUserById } from "@/backend/users";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Mock Firebase modules
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("@/backend/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock("@/backend/users", () => ({
  createUser: jest.fn(),
  getUserById: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  serverTimestamp: jest.fn(() => new Date()),
}));

describe("Authentication Backend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginWithEmail", () => {
    it("should successfully authenticate user with valid credentials", async () => {
      const mockUser = {
        userId: "test-uid",
        email: "test@example.com",
        name: "Test User",
      };

      const mockUserCredential = {
        user: {
          uid: "test-uid",
          email: "test@example.com",
        },
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(
        mockUserCredential
      );
      (getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await loginWithEmail("test@example.com", "password123");

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "test@example.com",
        "password123"
      );
      expect(getUserById).toHaveBeenCalledWith("test-uid");
      expect(result).toEqual(mockUser);
    });

    it("should throw error for user-not-found", async () => {
      const error = { code: "auth/user-not-found" };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      await expect(
        loginWithEmail("notfound@example.com", "password123")
      ).rejects.toThrow("No account found with this email address.");
    });

    it("should throw error for wrong-password", async () => {
      const error = { code: "auth/wrong-password" };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      await expect(
        loginWithEmail("test@example.com", "wrongpassword")
      ).rejects.toThrow("Incorrect password. Please try again.");
    });

    it("should throw error for invalid-email", async () => {
      const error = { code: "auth/invalid-email" };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      await expect(
        loginWithEmail("invalid-email", "password123")
      ).rejects.toThrow("Please enter a valid email address.");
    });
  });

  describe("registerUser", () => {
    it("should successfully create new user account", async () => {
      const mockUserCredential = {
        user: {
          uid: "new-uid",
          email: "newuser@example.com",
        },
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(
        mockUserCredential
      );
      (createUser as jest.Mock).mockResolvedValue(undefined);

      const result = await registerUser(
        "newuser@example.com",
        "password123",
        "New User"
      );

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "newuser@example.com",
        "password123"
      );

      expect(createUser).toHaveBeenCalledWith(
        "new-uid",
        expect.objectContaining({
          userId: "new-uid",
          email: "newuser@example.com",
          name: "New User",
          profile: expect.any(Object),
          notificationSettings: expect.any(Object),
        })
      );

      expect(result.userId).toBe("new-uid");
      expect(result.email).toBe("newuser@example.com");
      expect(result.name).toBe("New User");
    });

    it("should throw error for email-already-in-use", async () => {
      const error = { code: "auth/email-already-in-use" };
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      await expect(
        registerUser("existing@example.com", "password123", "User")
      ).rejects.toThrow("This email is already in use.");
    });

    it("should throw error for invalid-email", async () => {
      const error = { code: "auth/invalid-email" };
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      await expect(
        registerUser("invalid-email", "password123", "User")
      ).rejects.toThrow("Please enter a valid email address.");
    });
  });

  describe("logout", () => {
    it("should successfully sign out user", async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await logout();

      expect(signOut).toHaveBeenCalledWith(auth);
    });
  });

  describe("sendPasswordReset", () => {
    it("should successfully send password reset email", async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await sendPasswordReset("test@example.com");

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        auth,
        "test@example.com"
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error for user-not-found", async () => {
      const error = { code: "auth/user-not-found" };
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      await expect(sendPasswordReset("notfound@example.com")).rejects.toThrow(
        "No account found with this email address."
      );
    });
  });

  describe("deleteUserAccount", () => {
    it("should successfully delete user account", async () => {
      const mockUser = { uid: "test-uid" };
      (auth as any).currentUser = mockUser;
      (deleteUser as jest.Mock).mockResolvedValue(undefined);

      const result = await deleteUserAccount();

      expect(deleteUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ success: true });
    });
  });
});
