import { deleteMedication, recordMedicationIntake } from "@/backend";
import {
  AddMedicationModal,
  BaseCard,
  CardWithTitle,
  DatePicker,
  ScreenWrapper,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/utils/context/AuthProvider";
import { useNotifications } from "@/utils/context/NotificationProvider";
import { getTodayDateString } from "@/utils/dateUtils";
import { loadMedicationProgress, UIMedication } from "@/utils/medicationUtils";
import { scheduleMedicationNotifications } from "@/utils/notifications";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MedicationsScreen() {
  const { userProfile } = useAuth();
  const { isNotificationEnabled } = useNotifications();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [medications, setMedications] = useState<UIMedication[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMedications = useCallback(async () => {
    if (!userProfile?.userId) return;

    try {
      setIsLoading(true);
      const medicationProgress = await loadMedicationProgress(
        userProfile.userId,
        selectedDate
      );
      setMedications(medicationProgress.medications);
    } catch (error) {
      console.error("Error loading medications:", error);
      Alert.alert("Error", "Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.userId, selectedDate]);

  const rescheduleNotifications = useCallback(async () => {
    if (!userProfile?.userId) return;

    if (isNotificationEnabled("medication")) {
      try {
        await scheduleMedicationNotifications(userProfile.userId);
      } catch (error) {
        console.error("Error rescheduling medication notifications:", error);
      }
    }
  }, [userProfile?.userId, isNotificationEnabled]);

  const handleMeds = useCallback(async () => {
    await loadMedications();
    await rescheduleNotifications();
  }, [loadMedications, rescheduleNotifications]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const toggleMedication = async (id?: string) => {
    if (!id || !userProfile?.userId) return;

    const medication = medications.find((med) => med.medicationId === id);
    if (!medication) return;

    try {
      if (medication.dosesToday < medication.requiredDoses) {
        await recordMedicationIntake(userProfile.userId, id, selectedDate);

        setMedications((prev) =>
          prev.map((med) => {
            if (med.medicationId === id) {
              const newDosesToday = med.dosesToday + 1;
              return {
                ...med,
                dosesToday: newDosesToday,
                taken: newDosesToday >= med.requiredDoses,
              };
            }
            return med;
          })
        );

        const newDosesToday = medication.dosesToday + 1;
        if (newDosesToday >= medication.requiredDoses) {
          Alert.alert("Success", "All daily doses completed!");
        } else {
          Alert.alert(
            "Success",
            `Dose ${newDosesToday}/${medication.requiredDoses} taken!`
          );
        }
      } else {
        Alert.alert("Info", "All required doses taken for today");
      }
    } catch (error) {
      console.error("Error recording medication intake:", error);
      Alert.alert("Error", "Failed to record medication intake");
    }
  };

  const handleDeleteMedication = async (id: string) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(id);
              await deleteMedication(id);
              await handleMeds();
              Alert.alert("Success", "Medication deleted successfully!");
            } catch (error) {
              console.error("Error deleting medication:", error);
              Alert.alert("Error", "Failed to delete medication");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const totalDosesTakenToday = medications.reduce(
    (sum, med) => sum + med.dosesToday,
    0
  );
  const totalRequiredDoses = medications.reduce(
    (sum, med) => sum + med.requiredDoses,
    0
  );

  const fullyCompleteMedications = medications.filter(
    (med) => med.taken
  ).length;
  const totalMedications = medications.length;

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading medications...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <>
      <ScreenWrapper>
        <View style={styles.header}>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
            }}
          >
            <Text style={styles.title}>Medications</Text>
            <Text style={styles.subtitle}>Manage your daily medications</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <DatePicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <CardWithTitle
          title={
            selectedDate === getTodayDateString()
              ? "Today's Progress"
              : `Progress for ${new Date(selectedDate).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )}`
          }
        >
          <Text style={styles.progressText}>
            {totalDosesTakenToday}/{totalRequiredDoses} doses taken
          </Text>
          <Text style={styles.progressSubText}>
            {fullyCompleteMedications}/{totalMedications} medications completed
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    totalRequiredDoses > 0
                      ? (totalDosesTakenToday / totalRequiredDoses) * 100
                      : 0
                  )}%`,
                },
              ]}
            />
          </View>
        </CardWithTitle>

        <View style={styles.medicationsContainer}>
          {medications.map((medication) => (
            <BaseCard
              key={medication.medicationId}
              style={styles.medicationCard}
            >
              <View style={styles.medicationHeader}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>
                    {medication.dosage} ({medication.frequency})
                  </Text>
                  {medication.requiredDoses > 1 && (
                    <Text style={styles.doseProgress}>
                      {medication.dosesToday}/{medication.requiredDoses} doses
                      today
                    </Text>
                  )}
                  <Text style={styles.medicationTime}>
                    {medication.instructions || "No specific instructions"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    if (medication.medicationId) {
                      handleDeleteMedication(medication.medicationId);
                    }
                  }}
                  disabled={deletingId === medication.medicationId}
                >
                  {deletingId === medication.medicationId ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <MaterialIcons
                      name="delete"
                      size={16}
                      color={Colors.error}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.takeButton,
                  medication.taken
                    ? styles.takeButtonTaken
                    : styles.takeButtonPending,
                ]}
                onPress={() => toggleMedication(medication.medicationId)}
              >
                <MaterialIcons
                  name={
                    medication.taken ? "check-circle" : "radio-button-unchecked"
                  }
                  size={20}
                  color={medication.taken ? Colors.white : Colors.primary}
                />
                <Text
                  style={[
                    styles.takeButtonText,
                    medication.taken
                      ? styles.takeButtonTextTaken
                      : styles.takeButtonTextPending,
                  ]}
                >
                  {medication.taken
                    ? medication.requiredDoses > 1
                      ? "All Doses Taken"
                      : "Taken"
                    : medication.requiredDoses > 1 && medication.dosesToday > 0
                    ? `Take Dose ${medication.dosesToday + 1}`
                    : "Take Now"}
                </Text>
              </TouchableOpacity>
            </BaseCard>
          ))}
        </View>

        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <MaterialIcons
                name="medication"
                size={48}
                color={Colors.gray400}
              />
            </TouchableOpacity>
            <Text style={styles.emptyStateText}>No medications added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the button to add your first medication
            </Text>
          </View>
        )}
      </ScreenWrapper>

      <AddMedicationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onMedicationAdded={handleMeds}
        userId={userProfile?.userId || ""}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray500,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  progressSubText: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  medicationsContainer: {
    marginBottom: 30,
  },
  medicationCard: {
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 4,
  },
  doseProgress: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 14,
    color: Colors.gray500,
  },
  deleteButton: {
    padding: 8,
  },
  takeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
  },
  takeButtonPending: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  takeButtonTaken: {
    backgroundColor: Colors.primary,
  },
  takeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  takeButtonTextPending: {
    color: Colors.primary,
  },
  takeButtonTextTaken: {
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray500,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: "center",
  },
});
