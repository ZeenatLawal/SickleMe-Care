import { updateUser } from "@/backend";
import { NotificationType } from "@/types";
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
  NotificationHandlers,
  registerForPushNotifications,
  sendDailyRiskAssessment,
} from "../notifications";
import { useAuth } from "./AuthProvider";

interface NotificationState {
  [key: string]: boolean;
}

interface NotificationContextType {
  pushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  notificationStates: NotificationState;
  toggleNotification: (
    type: NotificationType,
    enabled: boolean
  ) => Promise<boolean>;
  isNotificationEnabled: (type: NotificationType) => boolean;
  refreshPushToken: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  pushToken: null,
  notification: null,
  error: null,
  notificationStates: {},
  toggleNotification: async () => false,
  isNotificationEnabled: () => false,
  refreshPushToken: async () => {},
  requestPermissions: async () => false,
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
  const [notificationStates, setNotificationStates] =
    useState<NotificationState>({
      daily: false,
      hydration: false,
      medication: false,
      insights: false,
    });

  const notificationListener = useRef<EventSubscription>(null);
  const responseListener = useRef<EventSubscription>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setError(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setError(
        error instanceof Error ? error : new Error("Permission request failed")
      );
      return false;
    }
  }, []);

  const toggleNotification = async (
    type: NotificationType,
    enabled: boolean
  ) => {
    if (enabled && !pushToken) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.log("Permission denied, cannot enable notification");
        return false;
      }
    }

    const handler = NotificationHandlers[type];
    if (!handler) {
      console.error(`No handler found for notification type: ${type}`);
      return false;
    }

    try {
      const success = enabled
        ? await handler.schedule(userProfile?.userId)
        : await handler.cancel();

      if (success) {
        setNotificationStates((prev) => ({ ...prev, [type]: enabled }));

        if (userProfile?.userId) {
          await updateUser(userProfile.userId, {
            notificationSettings: {
              ...userProfile.notificationSettings,
              [type]: enabled,
            },
          });
        }
      }

      return success;
    } catch (error) {
      console.error(`Error toggling ${type} notifications:`, error);
      return false;
    }
  };

  const refreshPushToken = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.userId) {
      return;
    }

    try {
      const newToken = await registerForPushNotifications();

      if (newToken) {
        const shouldUpdate =
          newToken !== pushToken ||
          !userProfile.pushToken ||
          userProfile.pushToken !== newToken;

        if (shouldUpdate) {
          setPushToken(newToken);

          await updateUser(userProfile.userId, {
            pushToken: newToken,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing push token:", error);
      setError(
        error instanceof Error ? error : new Error("Token refresh failed")
      );
    }
  }, [isAuthenticated, userProfile?.userId, userProfile?.pushToken, pushToken]);

  const initializeNotifications = useCallback(async () => {
    if (!isAuthenticated || !userProfile) return;

    const newStates: NotificationState = {};

    for (const [type, handler] of Object.entries(NotificationHandlers)) {
      const notificationType = type as NotificationType;
      const isScheduled = await handler.check();
      const isEnabledInSettings =
        userProfile.notificationSettings?.[notificationType] ?? true;

      newStates[notificationType] = isScheduled;

      if (!isScheduled && isEnabledInSettings) {
        const success = await handler.schedule(userProfile?.userId);
        if (success) {
          newStates[notificationType] = true;
        }
      } else if (isScheduled && !isEnabledInSettings) {
        await handler.cancel();
        newStates[notificationType] = false;
      }
    }

    setNotificationStates(newStates);
  }, [isAuthenticated, userProfile]);

  useEffect(() => {
    registerForPushNotifications().then(
      (token) => setPushToken(token),
      (error) => setError(error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;

        // Handle silent background triggers
        if (data?.type === "crisis-daily-trigger" && userProfile?.userId) {
          sendDailyRiskAssessment(userProfile.userId);
          return;
        }

        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        // Handle background trigger when app was closed
        if (data?.type === "crisis-daily-trigger" && userProfile?.userId) {
          console.log("Handling background crisis trigger on app open");
          sendDailyRiskAssessment(userProfile.userId);
          router.push("/(tabs)/insights");
          return;
        }

        // Handle normal notification routing
        if (
          data?.type === "daily-checkup" ||
          data?.type === "hydration-reminder"
        ) {
          router.push("/(tabs)/track");
        } else if (data?.type === "medication-reminder") {
          router.push("/(tabs)/medications");
        } else if (data?.type === "daily-risk-assessment") {
          router.push("/(tabs)/insights");
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
      initializeNotifications();
    }
  }, [isAuthenticated, userProfile, initializeNotifications]);

  useEffect(() => {
    if (isAuthenticated && userProfile && pushToken) {
      if (!userProfile.pushToken) {
        refreshPushToken();
      }
    }
  }, [isAuthenticated, userProfile, pushToken, refreshPushToken]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isAuthenticated) {
        refreshPushToken();

        if (userProfile) {
          initializeNotifications();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, refreshPushToken, userProfile, initializeNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notification,
        error,
        notificationStates,
        toggleNotification,
        isNotificationEnabled: (type: NotificationType) =>
          notificationStates[type] ?? false,
        refreshPushToken,
        requestPermissions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
