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

export async function registerForPushNotifications() {
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

      console.log("Push token retrieved");
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
    await cancelNotifications("daily-");

    const now = new Date();
    const notifications: any[] = [];

    for (let i = 0; i < 14; i++) {
      const morningTime = new Date(now);
      morningTime.setDate(now.getDate() + i);
      morningTime.setHours(8, 0, 0, 0);

      if (morningTime > now) {
        notifications.push({
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
        notifications.push({
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

    if (notifications.length > 0) {
      await Promise.all(
        notifications.map((notification) =>
          Notifications.scheduleNotificationAsync(notification)
        )
      );

      console.log(`Daily notifications scheduled successfully`);
      return true;
    } else {
      console.log("No daily notifications to schedule");
      return false;
    }
  } catch (error) {
    console.error("Error scheduling daily notifications:", error);
    return false;
  }
}

const HYDRATION_MESSAGES = [
  {
    title: "Hydration Check! 💧",
    body: "Time for a refreshing glass of water. Your cells will thank you!",
  },
  {
    title: "Stay Hydrated 🌊",
    body: "Drinking water helps prevent sickling. Keep that H2O flowing!",
  },
  {
    title: "Water Break! 💦",
    body: "Proper hydration reduces pain crisis risk. Take a sip now!",
  },
  {
    title: "Thirst Reminder 🥤",
    body: "Your body needs water to function optimally. Drink up!",
  },
  {
    title: "Hydration Alert! ⚡",
    body: "Dehydration can trigger complications. Stay ahead of it!",
  },
];

export async function scheduleHydrationNotifications() {
  try {
    await cancelNotifications("hydration-");

    const now = new Date();
    let scheduledCount = 0;
    const notifications: any[] = [];
    const times = [9, 11, 13, 15, 17, 19]; // 9am, 11am, 1pm, 3pm, 5pm, 7pm

    for (let day = 0; day < 7; day++) {
      for (let timeIndex = 0; timeIndex < times.length; timeIndex++) {
        const hour = times[timeIndex];
        const notificationTime = new Date(now);
        notificationTime.setDate(now.getDate() + day);
        notificationTime.setHours(hour, 0, 0, 0);

        if (notificationTime > now) {
          const message =
            HYDRATION_MESSAGES[scheduledCount % HYDRATION_MESSAGES.length];

          notifications.push({
            identifier: `hydration-d${day}-h${hour}`,
            content: {
              title: message.title,
              body: message.body,
              data: {
                type: "hydration-reminder",
                hour,
                day,
                messageIndex: scheduledCount % HYDRATION_MESSAGES.length,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationTime,
            },
          });

          scheduledCount++;
        }
      }
    }

    if (notifications.length > 0) {
      await Promise.all(
        notifications.map((notification) =>
          Notifications.scheduleNotificationAsync(notification)
        )
      );

      console.log(`Hydration notifications scheduled successfully`);
      return true;
    } else {
      console.log("No hydration notifications to schedule");
      return false;
    }
  } catch (error) {
    console.error("Error scheduling hydration notifications:", error);
    return false;
  }
}

export async function scheduleMedicationNotifications() {
  try {
    await cancelNotifications("medication-");

    const now = new Date();
    const notifications: any[] = [];
    const medicationTimes = [8, 14, 20]; // 8am, 2pm, 8pm

    for (let i = 0; i < 7; i++) {
      for (const hour of medicationTimes) {
        const notificationTime = new Date(now);
        notificationTime.setDate(now.getDate() + i);
        notificationTime.setHours(hour, 0, 0, 0);

        if (notificationTime > now) {
          notifications.push({
            identifier: `medication-${hour}h-day${i}`,
            content: {
              title: "Medication Reminder 💊",
              body: "Time to take your medications. Consistency helps manage your condition.",
              data: { type: "medication-reminder", hour },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationTime,
            },
          });
        }
      }
    }

    if (notifications.length > 0) {
      await Promise.all(
        notifications.map((notification) =>
          Notifications.scheduleNotificationAsync(notification)
        )
      );

      console.log(`Medication notifications scheduled successfully`);
      return true;
    } else {
      console.log("No medication notifications to schedule");
      return false;
    }
  } catch (error) {
    console.error("Error scheduling medication notifications:", error);
    return false;
  }
}

/**
 * Notification functions
 */
export const NotificationHandlers = {
  daily: {
    schedule: scheduleDailyNotifications,
    cancel: () => cancelNotifications("daily-"),
    check: () => areNotificationsScheduled("daily-"),
  },
  hydration: {
    schedule: scheduleHydrationNotifications,
    cancel: () => cancelNotifications("hydration-"),
    check: () => areNotificationsScheduled("hydration-"),
  },
  medication: {
    schedule: scheduleMedicationNotifications,
    cancel: () => cancelNotifications("medication-"),
    check: () => areNotificationsScheduled("medication-"),
  },
  insights: {
    schedule: async () => {
      console.log("Insights notifications not yet implemented");
      return false;
    },
    cancel: () => cancelNotifications("insights-"),
    check: () => areNotificationsScheduled("insights-"),
  },
} as const;

export async function cancelNotifications(prefix: string) {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const targetNotifications = scheduledNotifications.filter((notification) =>
      notification.identifier.startsWith(prefix)
    );

    if (targetNotifications.length > 0) {
      await Promise.all(
        targetNotifications.map((notification) =>
          Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          )
        )
      );
    }

    console.log(`${prefix} notifications cancelled`);
    return true;
  } catch (error) {
    console.error(`Error cancelling ${prefix} notifications:`, error);
    return false;
  }
}

export async function areNotificationsScheduled(prefix: string) {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const targetNotifications = scheduledNotifications.filter((notification) =>
      notification.identifier.startsWith(prefix)
    );

    return targetNotifications.length > 0;
  } catch (error) {
    console.error(`Error checking ${prefix} notifications:`, error);
    return false;
  }
}
