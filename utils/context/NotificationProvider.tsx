import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-notifications";
import { router } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  areDailyNotificationsScheduled,
  cancelDailyNotifications,
  registerForPushNotificationsAsync,
  scheduleDailyNotifications,
} from "../notifications";
import { useAuth } from "./AuthProvider";

interface NotificationContextType {
  pushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  dailyNotificationsEnabled: boolean;
  enableDailyNotifications: () => Promise<boolean>;
  disableDailyNotifications: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  pushToken: null,
  notification: null,
  error: null,
  dailyNotificationsEnabled: false,
  enableDailyNotifications: async () => false,
  disableDailyNotifications: async () => false,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, isAuthenticated } = useAuth();
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [dailyNotificationsEnabled, setDailyNotificationsEnabled] =
    useState(false);

  const notificationListener = useRef<EventSubscription>(null);
  const responseListener = useRef<EventSubscription>(null);

  const checkDailyNotificationsStatus = async () => {
    try {
      const enabled = await areDailyNotificationsScheduled();
      setDailyNotificationsEnabled(enabled);
    } catch (error) {
      console.error("Error checking daily notifications status:", error);
    }
  };

  const enableDailyNotifications = async (): Promise<boolean> => {
    try {
      const success = await scheduleDailyNotifications();
      if (success) {
        setDailyNotificationsEnabled(true);
      }
      return success;
    } catch (error) {
      console.error("Error enabling daily notifications:", error);
      return false;
    }
  };

  const disableDailyNotifications = async (): Promise<boolean> => {
    try {
      const success = await cancelDailyNotifications();
      if (success) {
        setDailyNotificationsEnabled(false);
      }
      return success;
    } catch (error) {
      console.error("Error disabling daily notifications:", error);
      return false;
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => setPushToken(token),
      (error) => setError(error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "Notification received while app is running:",
          notification
        );
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        const data = response.notification.request.content.data;

        console.log("data", JSON.stringify(data, null, 2));

        if (data?.type === "daily-checkup") {
          router.push("/(tabs)/track");
        } else {
          router.push("/(tabs)");
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      checkDailyNotificationsStatus();
      areDailyNotificationsScheduled().then((enabled) => {
        if (!enabled) {
          enableDailyNotifications();
        }
      });
    }
  }, [isAuthenticated, userProfile]);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notification,
        error,
        dailyNotificationsEnabled,
        enableDailyNotifications,
        disableDailyNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
