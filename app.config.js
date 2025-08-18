import "dotenv/config";

export default {
  expo: {
    name: "SickleMeCare",
    slug: "SickleMeCare",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/smc-plus.png",
    scheme: "sicklemecare",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/smc-plus.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.zeelaw.SickleMeCare",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/smc-plus.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/smc-plus.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
      router: {},
      eas: {
        projectId: "7d80f411-4095-4762-8520-ca9f1679b6f4",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/7d80f411-4095-4762-8520-ca9f1679b6f4",
    },
  },
};
