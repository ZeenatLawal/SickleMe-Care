import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions() {
  try {
    if (!Device.isDevice) {
      return {
        granted: false,
        canAskAgain: false,
        status: Notifications.PermissionStatus.DENIED,
      };
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return {
        granted: false,
        canAskAgain: finalStatus === "undetermined",
        status: finalStatus,
      };
    }

    // Configure notification for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("health-reminders", {
        name: "Health Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0D9488",
        sound: "default",
        description:
          "Notifications for medication reminders and health tracking",
      });

      await Notifications.setNotificationChannelAsync("health-updates", {
        name: "Health Updates",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0D9488",
        sound: "default",
        description: "General health updates and insights",
      });
    }

    return {
      granted: true,
      canAskAgain: true,
      status: finalStatus,
    };
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return {
      granted: false,
      canAskAgain: false,
      status: Notifications.PermissionStatus.DENIED,
    };
  }
}

/**
 * Get current notification permission status
 */
export async function getNotificationPermissions() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return {
      granted: status === "granted",
      canAskAgain: status === "undetermined",
      status,
    };
  } catch (error) {
    console.error("Error getting notification permissions:", error);
    return {
      granted: false,
      canAskAgain: false,
      status: Notifications.PermissionStatus.DENIED,
    };
  }
}

/**
 * Get push notification token
 */
export async function getPushNotificationToken() {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger?: Notifications.NotificationTriggerInput,
  data?: Record<string, any>
) {
  try {
    const permissions = await getNotificationPermissions();
    if (!permissions.granted) {
      console.warn("Notification permissions not granted");
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: trigger || null,
    });

    return id;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

/**
 * Schedule daily health reminders for 8am and 8pm
 */
export async function scheduleDailyHealthReminders() {
  try {
    // Cancel existing reminders first
    await cancelAllNotifications();

    // Morning reminder - 8:00 AM
    const morningTrigger = {
      hour: 8,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput;

    const morningId = await scheduleLocalNotification(
      "Good Morning! 🌅",
      "Time for your morning health check. Don't forget to track your symptoms and take your medications!",
      morningTrigger,
      {
        type: "daily_health_reminder",
        time: "morning",
      }
    );

    // Evening reminder - 8:00 PM
    const eveningTrigger = {
      hour: 20,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput;

    const eveningId = await scheduleLocalNotification(
      "Evening Check-in 🌙",
      "Time for your evening health review. How are you feeling today?",
      eveningTrigger,
      {
        type: "daily_health_reminder",
        time: "evening",
      }
    );

    console.log("Daily reminders scheduled:", { morningId, eveningId });
    return { morningId, eveningId };
  } catch (error) {
    console.error("Error scheduling daily reminders:", error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}
