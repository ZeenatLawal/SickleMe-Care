import { getPastDateString, getTodayDateString } from "@/utils/dateUtils";

describe("dateUtils", () => {
  it("should return today's date in ISO format (YYYY-MM-DD)", () => {
    const today = getTodayDateString();
    const expectedDate = new Date().toISOString().split("T")[0];

    expect(today).toBe(expectedDate);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should return today's date when no parameter is passed to getPastDateString", () => {
    const result = getPastDateString();
    const expectedDate = new Date().toISOString().split("T")[0];

    expect(result).toBe(expectedDate);
  });

  it("should return yesterday's date when 1 is passed", () => {
    const result = getPastDateString(1);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 1);
    const expected = expectedDate.toISOString().split("T")[0];

    expect(result).toBe(expected);
  });

  it("should return date from 7 days ago when 7 is passed", () => {
    const result = getPastDateString(7);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 7);
    const expected = expectedDate.toISOString().split("T")[0];

    expect(result).toBe(expected);
  });

  it("should handle negative numbers by returning future dates", () => {
    const result = getPastDateString(-1);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 1);
    const expected = expectedDate.toISOString().split("T")[0];

    expect(result).toBe(expected);
  });
});
