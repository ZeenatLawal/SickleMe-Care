import { createMedication } from "@/backend";
import { Colors } from "@/constants/Colors";
import { MedicationFrequency } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "./Button";

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onMedicationAdded: () => void;
  userId: string;
}

export function AddMedicationModal({
  visible,
  onClose,
  onMedicationAdded,
  userId,
}: AddMedicationModalProps) {
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    timeSlots: ["08:00"],
    instructions: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "daily",
      timeSlots: ["08:00"],
      instructions: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addMedication = async () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      Alert.alert("Error", "Please fill in medication name and dosage");
      return;
    }

    try {
      setIsLoading(true);
      await createMedication(
        userId,
        newMedication.name.trim(),
        newMedication.dosage.trim(),
        newMedication.frequency as MedicationFrequency,
        newMedication.instructions
      );

      Alert.alert("Success", "Medication added successfully!");
      resetForm();
      onClose();
      onMedicationAdded();
    } catch (error) {
      console.error("Error adding medication:", error);
      Alert.alert("Error", "Failed to add medication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medication Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newMedication.name}
                onChangeText={(text) =>
                  setNewMedication({ ...newMedication, name: text })
                }
                placeholder="e.g., Hydroxyurea"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dosage *</Text>
              <TextInput
                style={styles.textInput}
                value={newMedication.dosage}
                onChangeText={(text) =>
                  setNewMedication({ ...newMedication, dosage: text })
                }
                placeholder="e.g., 500mg"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={styles.frequencyButtons}>
                {["daily", "twice-daily", "three-times-daily", "as-needed"].map(
                  (freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyButton,
                        newMedication.frequency === freq &&
                          styles.frequencyButtonActive,
                      ]}
                      onPress={() =>
                        setNewMedication({
                          ...newMedication,
                          frequency: freq,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          newMedication.frequency === freq &&
                            styles.frequencyButtonTextActive,
                        ]}
                      >
                        {freq
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instructions (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newMedication.instructions}
                onChangeText={(text) =>
                  setNewMedication({ ...newMedication, instructions: text })
                }
                placeholder="e.g., Take with food"
                placeholderTextColor={Colors.gray400}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={isLoading ? "Adding..." : "Add"}
              onPress={addMedication}
              variant="primary"
              style={styles.modalButton}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
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
  textInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  frequencyButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary,
  },
  frequencyButtonText: {
    fontSize: 14,
    color: Colors.primary,
  },
  frequencyButtonTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  modalButton: {
    flex: 1,
  },
});
