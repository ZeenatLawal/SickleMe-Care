import { updateUser } from "@/backend";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-notifications";
import { router } from "expo-router";
import { serverTimestamp } from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  areDailyNotificationsScheduled,
  cancelDailyNotifications,
  registerForPushNotifications,
  renewDailyNotificationsIfNeeded,
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
  refreshPushToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  pushToken: null,
  notification: null,
  error: null,
  dailyNotificationsEnabled: false,
  enableDailyNotifications: async () => false,
  disableDailyNotifications: async () => false,
  refreshPushToken: async () => {},
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

  const refreshPushToken = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.userId) {
      console.log("User not authenticated");
      return;
    }

    try {
      console.log("Refreshing push token...");
      const newToken = await registerForPushNotifications();

      if (newToken && newToken !== pushToken) {
        console.log("Updating new push token...");
        setPushToken(newToken);

        await updateUser(userProfile.userId, {
          pushToken: newToken,
          updatedAt: serverTimestamp(),
        });

        console.log("Push token refreshed and updated successfully");
      } else if (newToken === pushToken) {
        console.log("Push token not updated");
      }
    } catch (error) {
      console.error("Error refreshing push token:", error);
      setError(
        error instanceof Error ? error : new Error("Token refresh failed")
      );
    }
  }, [isAuthenticated, userProfile?.userId, pushToken]);

  useEffect(() => {
    registerForPushNotifications().then(
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
      areDailyNotificationsScheduled().then((enabled) => {
        setDailyNotificationsEnabled(enabled);

        if (!enabled) {
          enableDailyNotifications();
        } else {
          renewDailyNotificationsIfNeeded();
        }
      });
    }
  }, [isAuthenticated, userProfile]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isAuthenticated) {
        console.log("App became active, refreshing push token...");
        refreshPushToken();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, refreshPushToken]);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notification,
        error,
        dailyNotificationsEnabled,
        enableDailyNotifications,
        disableDailyNotifications,
        refreshPushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
