import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("health-reminders", {
      name: "Health Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error(
        "Permission not granted to get push token for push notification!"
      );
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      throw new Error("Project ID not found");
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`${e}`);
    }
  } else {
    throw new Error("Must use physical device for push notifications");
  }
}

export async function scheduleDailyNotifications() {
  try {
    await cancelDailyNotifications();

    const now = new Date();

    for (let i = 0; i < 14; i++) {
      const morningTime = new Date(now);
      morningTime.setDate(now.getDate() + i);
      morningTime.setHours(8, 0, 0, 0);

      if (morningTime > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `daily-8am-${i}`,
          content: {
            title: "Good Morning! 🌅",
            body: "Time to check in with your health. How are you feeling today?",
            data: { type: "daily-checkup", time: "morning" },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: morningTime,
          },
        });
      }

      const eveningTime = new Date(now);
      eveningTime.setDate(now.getDate() + i);
      eveningTime.setHours(20, 0, 0, 0);

      if (eveningTime > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `daily-8pm-${i}`,
          content: {
            title: "Evening Check-in 🌙",
            body: "Don't forget to log your medications and track your symptoms.",
            data: { type: "daily-checkup", time: "evening" },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: eveningTime,
          },
        });
      }
    }

    console.log("Daily notifications scheduled successfully");
    return true;
  } catch (error) {
    console.error("Error scheduling daily notifications:", error);
    return false;
  }
}

export async function cancelDailyNotifications() {
  try {
    for (let i = 0; i < 14; i++) {
      await Notifications.cancelScheduledNotificationAsync(`daily-8am-${i}`);
      await Notifications.cancelScheduledNotificationAsync(`daily-8pm-${i}`);
    }
    console.log("Daily notifications cancelled");
    return true;
  } catch (error) {
    console.error("Error cancelling daily notifications:", error);
    return false;
  }
}

export async function renewDailyNotificationsIfNeeded() {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const dailyNotifications = scheduledNotifications.filter(
      (notification) =>
        notification.identifier.startsWith("daily-8am-") ||
        notification.identifier.startsWith("daily-8pm-")
    );

    if (dailyNotifications.length < 12) {
      // Renew
      await scheduleDailyNotifications();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error renewing daily notifications:", error);
    return false;
  }
}

export async function areDailyNotificationsScheduled() {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const hasMorning = scheduledNotifications.some((notification) =>
      notification.identifier.startsWith("daily-8am-")
    );
    const hasEvening = scheduledNotifications.some((notification) =>
      notification.identifier.startsWith("daily-8pm-")
    );
    return hasMorning && hasEvening;
  } catch (error) {
    console.error("Error checking daily notifications:", error);
    return false;
  }
}
