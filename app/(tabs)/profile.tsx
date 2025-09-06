import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteUserAccount } from "@/backend/auth";
import { deleteUserData, updateUser } from "@/backend/users";
import {
  Button,
  CardWithTitle,
  CustomModal,
  FormInput,
  ScreenWrapper,
} from "@/components/shared";
import Logo from "@/components/ui/Logo";
import { Colors } from "@/constants/Colors";
import { BloodType, SickleCellType } from "@/types";
import { NotificationType } from "@/types/user";
import { useAuth } from "@/utils/context/AuthProvider";
import { useNotifications } from "@/utils/context/NotificationProvider";
import { useOnboarding } from "@/utils/context/OnboardingProvider";

export default function ProfileScreen() {
  const { userProfile, logout } = useAuth();
  const { toggleNotification, isNotificationEnabled } = useNotifications();
  const { resetOnboarding } = useOnboarding();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const [notificationSettings, setNotificationSettings] = useState({
    daily: isNotificationEnabled("daily"),
    medication: isNotificationEnabled("medication"),
    hydration: isNotificationEnabled("hydration"),
    insights: isNotificationEnabled("insights"),
  });

  useEffect(() => {
    setNotificationSettings({
      daily: isNotificationEnabled("daily"),
      medication: isNotificationEnabled("medication"),
      hydration: isNotificationEnabled("hydration"),
      insights: isNotificationEnabled("insights"),
    });
  }, [userProfile, isNotificationEnabled]);

  const bloodTypes: BloodType[] = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ];
  const sickleCellTypes: SickleCellType[] = ["SS", "SC", "SB+", "SB0", "other"];

  const [profileData, setProfileData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    dateOfBirth: userProfile?.profile?.dateOfBirth || "",
    phoneNumber: userProfile?.profile?.phoneNumber || "",
    bloodType: userProfile?.profile?.bloodType || "",
    sickleCellType: userProfile?.profile?.sickleCellType || "",
    emergencyContactName: userProfile?.profile?.emergencyContact?.name || "",
    emergencyContactPhone:
      userProfile?.profile?.emergencyContact?.phoneNumber || "",
    emergencyContactRelationship:
      userProfile?.profile?.emergencyContact?.relationship || "",
  });

  const handleNotificationToggle = async (
    type: NotificationType,
    value: boolean
  ) => {
    const newSettings = { ...notificationSettings, [type]: value };
    setNotificationSettings(newSettings);

    try {
      const success = await toggleNotification(type, value);

      if (success) {
        Alert.alert(
          "Settings Updated",
          `${type} notifications ${value ? "enabled" : "disabled"}`
        );
      } else {
        setNotificationSettings(notificationSettings);
        Alert.alert(
          "Error",
          `Failed to ${
            value ? "enable" : "disable"
          } ${type} notifications. Please try again.`
        );
      }
    } catch (error) {
      console.error(`Error toggling ${type} notifications:`, error);
      setNotificationSettings(notificationSettings);
      Alert.alert(
        "Error",
        `Failed to update ${type} notification settings. Please try again.`
      );
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
          phoneNumber: profileData.phoneNumber || null,
          bloodType: (profileData.bloodType as BloodType) || null,
          sickleCellType:
            (profileData.sickleCellType as SickleCellType) || null,
          emergencyContact: {
            name: profileData.emergencyContactName,
            phoneNumber: profileData.emergencyContactPhone,
            relationship: profileData.emergencyContactRelationship,
          },
        },
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
    if (confirmationText !== "DELETE") {
      Alert.alert("Error", "Please type 'DELETE' to confirm");
      return;
    }

    if (!userProfile?.userId) return;

    try {
      setIsLoading(true);

      await deleteUserAccount();

      await deleteUserData(userProfile.userId);

      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: () => {
              closeDeleteModal();
              router.replace("/(auth)/welcome");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Delete account error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to delete account. Please try again."
      );
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

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setConfirmationText("");
  };

  const handleFeedback = async () => {
    const feedbackUrl =
      "https://app.onlinesurveys.jisc.ac.uk/s/northampton/sickleme-care-post-study";

    try {
      const supported = await Linking.canOpenURL(feedbackUrl);
      if (supported) {
        await Linking.openURL(feedbackUrl);
      } else {
        Alert.alert(
          "Cannot Open Link",
          "Unable to open the feedback survey automatically. Would you like to copy the link?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Copy Link",
              onPress: async () => {
                try {
                  Clipboard.setString(feedbackUrl);
                  Alert.alert(
                    "Link Copied",
                    "The feedback survey link has been copied to your clipboard. You can now paste it in your browser."
                  );
                } catch {
                  Alert.alert(
                    "Copy Failed",
                    "Unable to copy the link. Please manually copy this URL:\n\n" +
                      feedbackUrl
                  );
                }
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert(
        "Error",
        "Failed to open feedback survey. Please try again later."
      );
    }
  };

  const handleViewOnboarding = async () => {
    await resetOnboarding();
    router.push("/(auth)/onboarding");
  };

  return (
    <>
      <ScreenWrapper>
        <View style={styles.header}>
          <Logo size={80} />
          <View style={styles.titleContainer}>
            <View>
              <Text style={styles.title}>My Profile</Text>
              <Text style={styles.subtitle}>
                Manage your health information
              </Text>
            </View>
            <TouchableOpacity
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              style={styles.editIcon}
              disabled={isLoading}
            >
              <MaterialIcons
                name={isEditing ? "save" : "edit"}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

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

          <FormInput
            label="Phone Number"
            value={profileData.phoneNumber}
            onChangeText={(text) =>
              setProfileData({ ...profileData, phoneNumber: text })
            }
            editable={isEditing}
            placeholder="Your phone number"
            keyboardType="phone-pad"
          />
        </CardWithTitle>

        <CardWithTitle title="Medical Information">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Blood Type</Text>
            {isEditing ? (
              <View style={styles.dropdownContainer}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      profileData.bloodType === type &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() =>
                      setProfileData({ ...profileData, bloodType: type })
                    }
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        profileData.bloodType === type &&
                          styles.dropdownTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.displayValue}>
                {profileData.bloodType || "Not specified"}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sickle Cell Type</Text>
            {isEditing ? (
              <View style={styles.dropdownContainer}>
                {sickleCellTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      profileData.sickleCellType === type &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() =>
                      setProfileData({ ...profileData, sickleCellType: type })
                    }
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        profileData.sickleCellType === type &&
                          styles.dropdownTextSelected,
                      ]}
                    >
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.displayValue}>
                {profileData.sickleCellType?.toUpperCase() || "Not specified"}
              </Text>
            )}
          </View>
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
                Get reminded to track your health daily
              </Text>
            </View>
            <Switch
              value={notificationSettings.daily}
              onValueChange={(value) =>
                handleNotificationToggle("daily", value)
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notificationSettings.daily ? Colors.primary : Colors.gray400
              }
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Medication Reminders</Text>
              <Text style={styles.switchDescription}>
                Get notified when it&apos;s time to take your medications
              </Text>
            </View>
            <Switch
              value={notificationSettings.medication}
              onValueChange={(value) =>
                handleNotificationToggle("medication", value)
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notificationSettings.medication
                  ? Colors.primary
                  : Colors.gray400
              }
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Hydration Reminders</Text>
              <Text style={styles.switchDescription}>
                Get reminded to stay hydrated throughout the day
              </Text>
            </View>
            <Switch
              value={notificationSettings.hydration}
              onValueChange={(value) =>
                handleNotificationToggle("hydration", value)
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notificationSettings.hydration ? Colors.primary : Colors.gray400
              }
            />
          </View>

          {/* <View style={styles.switchContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Insights & Recommendations</Text>
              <Text style={styles.switchDescription}>
                Receive personalized health insights and tips
              </Text>
            </View>
            <Switch
              value={notificationSettings.insights}
              onValueChange={(value) =>
                handleNotificationToggle("insights", value)
              }
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={
                notificationSettings.insights ? Colors.primary : Colors.gray400
              }
              disabled={true} // TODO: Implement insights notifications
            />
          </View> */}
        </CardWithTitle>

        <Button
          title="Share Feedback"
          onPress={handleFeedback}
          variant="secondary"
          icon="feedback"
          style={{ marginBottom: 10 }}
        />

        <Button
          title="View App Onboarding"
          onPress={handleViewOnboarding}
          variant="secondary"
          icon="help"
          style={{ marginBottom: 10 }}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          icon="logout"
          style={{ marginBottom: 10 }}
        />

        <CardWithTitle title="Danger Zone">
          <Button
            title="Delete Account"
            onPress={() => setShowDeleteModal(true)}
            variant="danger"
            icon="delete"
          />
        </CardWithTitle>
      </ScreenWrapper>

      <CustomModal
        visible={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Account"
        showCloseButton={false}
        actions={[
          {
            title: "Cancel",
            onPress: closeDeleteModal,
            variant: "secondary",
          },
          {
            title: "Delete",
            onPress: handleDeleteAccount,
            variant: "danger",
            loading: isLoading,
          },
        ]}
      >
        <Text style={styles.modalText}>
          This action cannot be undone. All your data will be permanently
          deleted.
        </Text>
        <Text style={styles.modalText}>
          Type &ldquo;DELETE&rdquo; to confirm:
        </Text>
        <TextInput
          style={styles.modalInput}
          value={confirmationText}
          onChangeText={setConfirmationText}
          placeholder="Type here..."
          autoCapitalize="none"
        />
      </CustomModal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  editIcon: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    marginTop: 5,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  dropdownContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  dropdownTextSelected: {
    color: Colors.white,
  },
  displayValue: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
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
