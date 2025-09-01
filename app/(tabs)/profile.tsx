import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { updateUser } from "@/backend/users";
import {
  Button,
  CardWithTitle,
  FormInput,
  ScreenWrapper,
} from "@/components/shared";
import Logo from "@/components/ui/Logo";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/utils/context/AuthProvider";
import { useNotifications } from "@/utils/context/NotificationProvider";

export default function ProfileScreen() {
  const { userProfile, logout } = useAuth();
  const {
    dailyNotificationsEnabled,
    enableDailyNotifications,
    disableDailyNotifications,
  } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const [profileData, setProfileData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    dateOfBirth: userProfile?.profile?.dateOfBirth || "",
    emergencyContactName: userProfile?.profile?.emergencyContact?.name || "",
    emergencyContactPhone:
      userProfile?.profile?.emergencyContact?.phoneNumber || "",
    emergencyContactRelationship:
      userProfile?.profile?.emergencyContact?.relationship || "",
    notifications: userProfile?.notifications ?? true,
  });

  const handleNotificationToggle = async (value: boolean) => {
    setProfileData({ ...profileData, notifications: value });

    try {
      if (value) {
        const success = await enableDailyNotifications();
        if (success) {
          if (userProfile?.userId) {
            await updateUser(userProfile.userId, { notifications: true });
          }
          Alert.alert(
            "Notifications Enabled",
            "You will receive daily reminders at 8 AM and 8 PM to help you track your health."
          );
        } else {
          Alert.alert(
            "Error",
            "Failed to enable notifications. Please try again."
          );
          setProfileData({ ...profileData, notifications: false });
        }
      } else {
        const success = await disableDailyNotifications();
        if (success) {
          if (userProfile?.userId) {
            await updateUser(userProfile.userId, { notifications: false });
          }
          Alert.alert(
            "Notifications Disabled",
            "Daily health reminders have been turned off."
          );
        } else {
          Alert.alert(
            "Error",
            "Failed to disable notifications. Please try again."
          );
          setProfileData({ ...profileData, notifications: true });
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating notification settings."
      );
      setProfileData({ ...profileData, notifications: !value });
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile?.userId) return;

    setIsLoading(true);
    try {
      const updates = {
        name: profileData.name,
        profile: {
          ...userProfile.profile,
          dateOfBirth: profileData.dateOfBirth,
          emergencyContact: {
            name: profileData.emergencyContactName,
            phoneNumber: profileData.emergencyContactPhone,
            relationship: profileData.emergencyContactRelationship,
          },
        },
        notifications: profileData.notifications,
      };

      await updateUser(userProfile.userId, updates);

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText.toLowerCase() !== "delete my account") {
      Alert.alert("Error", "Please type 'Delete my account' to confirm");
      return;
    }

    if (!userProfile?.userId) return;

    try {
      setIsLoading(true);
      // TODO: Implement deleteUserAccount function
      setShowDeleteModal(false);
      router.replace("/(auth)/welcome");
    } catch {
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await logout();
            router.replace("/(auth)/welcome");
          } catch {
            Alert.alert("Error", "Failed to logout. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <>
      <ScreenWrapper>
        <View style={styles.header}>
          <Logo size={80} />
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your health information</Text>
        </View>

        <Button
          title={isEditing ? "Save Changes" : "Edit Profile"}
          onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          variant="primary"
          icon={isEditing ? "save" : "edit"}
          loading={isLoading}
          style={styles.editButton}
        />

        <CardWithTitle title="Basic Information">
          <FormInput
            label="Full Name"
            value={profileData.name}
            onChangeText={(text) =>
              setProfileData({ ...profileData, name: text })
            }
            editable={isEditing}
            placeholder="Enter your full name"
          />

          <FormInput
            label="Email"
            value={profileData.email}
            editable={false}
            placeholder="Email cannot be changed"
          />

          <FormInput
            label="Date of Birth"
            value={profileData.dateOfBirth}
            onChangeText={(text) =>
              setProfileData({ ...profileData, dateOfBirth: text })
            }
            editable={isEditing}
            placeholder="YYYY-MM-DD"
          />
        </CardWithTitle>

        <CardWithTitle title="Emergency Contact">
          <FormInput
            label="Contact Name"
            value={profileData.emergencyContactName}
            onChangeText={(text) =>
              setProfileData({ ...profileData, emergencyContactName: text })
            }
            editable={isEditing}
            placeholder="Emergency contact name"
          />

          <FormInput
            label="Phone Number"
            value={profileData.emergencyContactPhone}
            onChangeText={(text) =>
              setProfileData({ ...profileData, emergencyContactPhone: text })
            }
            editable={isEditing}
            placeholder="Emergency contact phone"
            keyboardType="phone-pad"
          />

          <FormInput
            label="Relationship"
            value={profileData.emergencyContactRelationship}
            onChangeText={(text) =>
              setProfileData({
                ...profileData,
                emergencyContactRelationship: text,
              })
            }
            editable={isEditing}
            placeholder="Relationship (e.g., Parent, Spouse)"
          />
        </CardWithTitle>

        <CardWithTitle title="Notification Settings">
          <View style={styles.switchContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Daily Health Reminders</Text>
              <Text style={styles.switchDescription}>
                Get reminded to track your health at 8 AM and 8 PM daily
              </Text>
            </View>
            <Switch
              value={dailyNotificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                dailyNotificationsEnabled ? Colors.primary : Colors.gray400
              }
            />
          </View>
        </CardWithTitle>

        <CardWithTitle title="Danger Zone">
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            icon="logout"
            style={{ marginBottom: 10 }}
          />
          <Button
            title="Delete Account"
            onPress={() => setShowDeleteModal(true)}
            variant="danger"
            icon="delete"
          />
        </CardWithTitle>
      </ScreenWrapper>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All your data will be permanently
              deleted.
            </Text>
            <Text style={styles.modalText}>
              Type &ldquo;Delete my account&rdquo; to confirm:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="Type here..."
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowDeleteModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Delete"
                onPress={handleDeleteAccount}
                variant="danger"
                loading={isLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    marginTop: 5,
  },
  editButton: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  switchDescription: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
  },
  permissionText: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 5,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 10,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    marginVertical: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
});
