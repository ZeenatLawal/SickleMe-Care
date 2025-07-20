import { Button, CardWithTitle, ScreenWrapper } from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
}

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Hydroxyurea",
      dosage: "500mg",
      frequency: "Daily",
      time: "08:00",
      taken: false,
    },
    {
      id: "2",
      name: "Folic Acid",
      dosage: "5mg",
      frequency: "Daily",
      time: "08:00",
      taken: true,
    },
    {
      id: "3",
      name: "Pain Relief",
      dosage: "400mg",
      frequency: "As needed",
      time: "12:00",
      taken: false,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: "",
  });

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      Alert.alert("Error", "Please fill in medication name and dosage");
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || "Daily",
      time: newMedication.time || "08:00",
      taken: false,
    };

    setMedications((prev) => [...prev, medication]);
    setNewMedication({ name: "", dosage: "", frequency: "", time: "" });
    setModalVisible(false);
  };

  const deleteMedication = (id: string) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setMedications((prev) => prev.filter((med) => med.id !== id)),
        },
      ]
    );
  };

  const takenToday = medications.filter((med) => med.taken).length;
  const totalMedications = medications.length;

  return (
    <>
      <ScreenWrapper>
        <View style={styles.header}>
          <Text style={styles.title}>Medications</Text>
          <Text style={styles.subtitle}>Manage your daily medications</Text>
        </View>

        <CardWithTitle title="Today's Progress">
          <Text style={styles.progressText}>
            {takenToday}/{totalMedications} taken
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    totalMedications > 0
                      ? (takenToday / totalMedications) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </CardWithTitle>

        <Button
          title="Add Medication"
          onPress={() => setModalVisible(true)}
          variant="primary"
          icon="add"
          style={styles.addButton}
        />

        <View style={styles.medicationsContainer}>
          {medications.map((medication) => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>
                    {medication.dosage} • {medication.frequency}
                  </Text>
                  <Text style={styles.medicationTime}>
                    ⏰ {medication.time}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteMedication(medication.id)}
                >
                  <MaterialIcons name="delete" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.takeButton,
                  medication.taken
                    ? styles.takeButtonTaken
                    : styles.takeButtonPending,
                ]}
                onPress={() => toggleMedication(medication.id)}
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
                  {medication.taken ? "Taken" : "Take Now"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="medication" size={48} color={Colors.gray400} />
            <Text style={styles.emptyStateText}>No medications added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the button to add your first medication
            </Text>
          </View>
        )}
      </ScreenWrapper>

      {/* Add Medication Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medication</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                value={newMedication.name}
                onChangeText={(text) =>
                  setNewMedication((prev) => ({ ...prev, name: text }))
                }
                placeholder="e.g., Hydroxyurea"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dosage *</Text>
              <TextInput
                style={styles.input}
                value={newMedication.dosage}
                onChangeText={(text) =>
                  setNewMedication((prev) => ({ ...prev, dosage: text }))
                }
                placeholder="e.g., 500mg"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <TextInput
                style={styles.input}
                value={newMedication.frequency}
                onChangeText={(text) =>
                  setNewMedication((prev) => ({ ...prev, frequency: text }))
                }
                placeholder="e.g., Daily, Twice daily"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={newMedication.time}
                onChangeText={(text) =>
                  setNewMedication((prev) => ({ ...prev, time: text }))
                }
                placeholder="e.g., 08:00"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={addMedication}
            >
              <Text style={styles.modalSaveButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
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
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  medicationsContainer: {
    marginBottom: 30,
  },
  medicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  modalSaveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
