import { logout } from "@/backend/auth";
import { router } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function TabTwoScreen() {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel" },
            {
              text: "Logout",
              onPress: async () => {
                try {
                  await logout();
                  router.replace("/(auth)/welcome");
                } catch (error: any) {
                  Alert.alert("Error", error.message);
                }
              },
            },
          ]);
        }}
        style={{
          backgroundColor: "#0D9488",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
