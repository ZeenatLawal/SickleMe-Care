/**
 * Get today's date
 */
export const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

export const getPastDateString = (daysAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};
