import { updateUser } from "@/backend/users";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  cancelAllNotifications,
  getNotificationPermissions,
  getPushNotificationToken,
  NotificationPermissions,
  requestNotificationPermissions,
  scheduleDailyHealthReminders,
} from "@/utils/notifications";
import { router } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthProvider";

interface NotificationContextType {
  permissions: NotificationPermissions | null;
  isLoading: boolean;
  pushToken: string | null;
  requestPermissions: () => Promise<boolean>;
  updateNotificationSettings: (enabled: boolean) => Promise<void>;
  scheduleDailyReminders: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  permissions: null,
  isLoading: true,
  pushToken: null,
  requestPermissions: async () => false,
  updateNotificationSettings: async () => {},
  scheduleDailyReminders: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile } = useAuth();
  const [permissions, setPermissions] =
    useState<NotificationPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  const updateUserPushToken = useCallback(async () => {
    if (!userProfile?.userId || !pushToken) return;

    try {
      await updateUser(userProfile.userId, {
        pushToken,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating push token:", error);
    }
  }, [userProfile?.userId, pushToken]);

  // Check initial permissions
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Update push token
  useEffect(() => {
    if (userProfile && pushToken && userProfile.pushToken !== pushToken) {
      updateUserPushToken();
    }
  }, [userProfile, pushToken, updateUserPushToken]);

  const initializeNotifications = async () => {
    try {
      setIsLoading(true);

      const currentPermissions = await getNotificationPermissions();
      setPermissions(currentPermissions);

      if (currentPermissions.granted) {
        const token = await getPushNotificationToken();
        setPushToken(token);
      }
    } catch (error) {
      console.error("Error initializing notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setIsLoading(true);

      const result = await requestNotificationPermissions();
      setPermissions(result);

      if (result.granted) {
        const token = await getPushNotificationToken();
        setPushToken(token);

        if (userProfile?.notifications !== false) {
          await scheduleDailyHealthReminders();
        }
        return true;
      }

      if (!result.canAskAgain) {
        Alert.alert(
          "Notifications Disabled",
          "To enable notifications, please go to Settings > Notifications and allow notifications for this app."
        );
      }

      return false;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request notification permissions");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSettings = async (enabled: boolean) => {
    if (!userProfile?.userId) return;

    try {
      await updateUser(userProfile.userId, {
        notifications: enabled,
        updatedAt: serverTimestamp(),
      });

      if (enabled) {
        // Schedule daily reminders when notifications are enabled
        await scheduleDailyHealthReminders();
      } else {
        // Cancel all notifications when disabled
        await cancelAllNotifications();
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const scheduleDailyReminders = async () => {
    try {
      const result = await scheduleDailyHealthReminders();
      if (result) {
        console.log("Daily health reminders scheduled successfully");
      }
    } catch (error) {
      console.error("Error scheduling daily reminders:", error);
      Alert.alert("Error", "Failed to schedule daily reminders");
    }
  };

  // Notification listeners
  useEffect(() => {
    const receivedSubscription = addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);

        const data = notification.request.content.data;

        if (data?.type === "medication_reminder") {
          Alert.alert(
            "Medication Reminder",
            notification.request.content.body || "Time to take your medication",
            [
              { text: "Dismiss", style: "cancel" },
              {
                text: "View Medications",
                onPress: () => router.push("/(tabs)/medications"),
              },
            ]
          );
        }
      }
    );

    const responseSubscription = addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "medication_reminder") {
          router.push("/(tabs)/medications");
        } else if (data?.type === "daily_health_reminder") {
          router.push("/(tabs)/track");
        } else if (data?.type === "health_update") {
          router.push("/(tabs)/insights");
        } else {
          router.push("/(tabs)");
        }
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        permissions,
        isLoading,
        pushToken,
        requestPermissions,
        updateNotificationSettings,
        scheduleDailyReminders,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
