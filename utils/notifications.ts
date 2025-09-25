import { getUserMedications } from "@/backend";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Show banner for incoming notifications
    shouldPlaySound: true, // Play sound for incoming notifications
    shouldSetBadge: true, // Set badge for incoming notifications
    shouldShowList: true, // Show in notification list
  }),
});

// Register device for push notifications
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

    // Request permissions if not granted
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
      // Generate push token
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

// Schedule daily health check-in notifications (morning & evening)
export async function scheduleDailyNotifications() {
  try {
    await cancelNotifications("daily-");

    const now = new Date();
    const notifications: any[] = [];

    // Schedule for next 14 days (8 AM and 8 PM)
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

// Motivational hydration messages
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

// Schedule hydration reminders throughout the day
export async function scheduleHydrationNotifications() {
  try {
    await cancelNotifications("hydration-");

    const now = new Date();
    let scheduledCount = 0;
    const notifications: any[] = [];
    const times = [9, 11, 13, 15, 17, 19]; // 9am, 11am, 1pm, 3pm, 5pm, 7pm

    // Schedule for next 7 days
    for (let day = 0; day < 7; day++) {
      for (let timeIndex = 0; timeIndex < times.length; timeIndex++) {
        const hour = times[timeIndex];
        const notificationTime = new Date(now);
        notificationTime.setDate(now.getDate() + day);
        notificationTime.setHours(hour, 0, 0, 0);

        if (notificationTime > now) {
          // Rotate through different messages
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

// Get notification times based on medication frequency
const getNotificationTimes = (frequency: string) => {
  switch (frequency) {
    case "daily":
      return [{ hour: 8, minute: 30 }];
    case "twice-daily":
      return [
        { hour: 8, minute: 30 },
        { hour: 20, minute: 30 },
      ];
    case "three-times-daily":
      return [
        { hour: 8, minute: 30 },
        { hour: 14, minute: 30 },
        { hour: 20, minute: 30 },
      ];
    default:
      return [];
  }
};

// Schedule medication reminders based on user's medications
export async function scheduleMedicationNotifications(userId: string) {
  try {
    const medications = await getUserMedications(userId);

    await cancelNotifications("medication-");

    if (medications.length === 0) {
      console.log("No medications found for user");
      return false;
    }

    const now = new Date();
    const notifications: any[] = [];

    // Get unique frequencies from all medications
    const frequencies = [...new Set(medications.map((med) => med.frequency))];

    const uniqueTimes = new Set<string>();

    // Schedule for next 7 days
    for (let i = 0; i < 7; i++) {
      for (const frequency of frequencies) {
        const times = getNotificationTimes(frequency);

        for (const time of times) {
          const timeKey = `${time.hour}${time.minute}`;

          if (uniqueTimes.has(timeKey)) continue;
          uniqueTimes.add(timeKey);

          const notificationTime = new Date(now);
          notificationTime.setDate(now.getDate() + i);
          notificationTime.setHours(time.hour, time.minute, 0, 0);

          if (notificationTime > now) {
            notifications.push({
              identifier: `medication-${time.hour}${time.minute}-day${i}`,
              content: {
                title: "Medication Reminder 💊",
                body: "Time to take your medications. Consistency helps manage your condition.",
                data: {
                  type: "medication-reminder",
                  hour: time.hour,
                  minute: time.minute,
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: notificationTime,
              },
            });
          }
        }
      }
      uniqueTimes.clear();
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

// Notification management handlers for each type
export const NotificationHandlers = {
  daily: {
    schedule: (userId?: string) => scheduleDailyNotifications(),
    cancel: () => cancelNotifications("daily-"),
    check: () => areNotificationsScheduled("daily-"),
  },
  hydration: {
    schedule: (userId?: string) => scheduleHydrationNotifications(),
    cancel: () => cancelNotifications("hydration-"),
    check: () => areNotificationsScheduled("hydration-"),
  },
  medication: {
    schedule: (userId?: string) =>
      scheduleMedicationNotifications(userId || ""),
    cancel: () => cancelNotifications("medication-"),
    check: () => areNotificationsScheduled("medication-"),
  },
  insights: {
    schedule: async (userId?: string) => {
      console.log("Insights notifications not yet implemented");
      return false;
    },
    cancel: () => cancelNotifications("insights-"),
    check: () => areNotificationsScheduled("insights-"),
  },
} as const;

// Cancel notifications
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
