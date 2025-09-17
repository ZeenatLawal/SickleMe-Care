import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sicklemecare_";

export async function cacheData(
  key: string,
  data: any,
  expireTime: number = 24
) {
  try {
    const cacheItem = {
      data,
      expiresAt: Date.now() + expireTime * 60 * 60 * 1000,
    };
    await AsyncStorage.setItem(STORAGE_KEY + key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error("Cache save failed:", error);
  }
}

export async function getCachedData(key: string) {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY + key);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);

    if (Date.now() > cacheItem.expiresAt) {
      await AsyncStorage.removeItem(STORAGE_KEY + key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error("Cache read failed:", error);
    return null;
  }
}

export async function clearCache(key: string) {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY + key);
  } catch (error) {
    console.error("Cache clear failed:", error);
  }
}

export const dailyCache = {
  save: (userId: string, date: string, data: any) =>
    cacheData(`daily_${userId}_${date}`, data),

  get: (userId: string, date: string) =>
    getCachedData(`daily_${userId}_${date}`),
};

export const medicationCache = {
  save: (userId: string, date: string, data: any) =>
    cacheData(`meds_${userId}_${date}`, data),

  get: (userId: string, date: string) =>
    getCachedData(`meds_${userId}_${date}`),
};
