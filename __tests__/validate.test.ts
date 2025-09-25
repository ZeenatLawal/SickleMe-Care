import { validateEmail, validatePassword } from "@/utils/validate";

describe("Validation Utils", () => {
  describe("validatePassword", () => {
    it("should return valid for a strong password", () => {
      const result = validatePassword("StrongPass123!");
      expect(result.isValid).toBe(true);
    });

    it("should return invalid for password less than 8 characters", () => {
      const result = validatePassword("Pass1!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("at least 8 characters");
    });

    it("should return invalid for password without uppercase", () => {
      const result = validatePassword("password123!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("uppercase letter");
    });

    it("should return invalid for password without lowercase", () => {
      const result = validatePassword("PASSWORD123!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("lowercase letter");
    });

    it("should return invalid for empty password", () => {
      const result = validatePassword("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Password is required");
    });
  });

  describe("validateEmail", () => {
    it("should return valid for correct email format", () => {
      const result = validateEmail("test@example.com");
      expect(result.isValid).toBe(true);
    });

    it("should return invalid for email without @ symbol", () => {
      const result = validateEmail("testexample.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("valid email");
    });

    it("should return invalid for empty email", () => {
      const result = validateEmail("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required");
    });

    it("should return invalid for email without domain", () => {
      const result = validateEmail("test@");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("valid email");
    });

    it("should return invalid for email with spaces", () => {
      const result = validateEmail("test @example.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("valid email");
    });
  });
});
