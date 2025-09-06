import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "./Button";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  actions?: {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
    loading?: boolean;
    disabled?: boolean;
  }[];
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  actions,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={() => {}}
        >
          {(title || showCloseButton) && (
            <View style={styles.modalHeader}>
              {title && <Text style={styles.modalTitle}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={Colors.gray600}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {children && <View style={styles.modalBody}>{children}</View>}

          {actions && actions.length > 0 && (
            <View style={styles.modalActions}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  title={action.title}
                  onPress={action.onPress}
                  variant={action.variant || "primary"}
                  loading={action.loading}
                  disabled={action.disabled}
                  style={[
                    styles.actionButton,
                    actions.length === 1 && styles.singleActionButton,
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    maxWidth: 400,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  singleActionButton: {
    flex: 0,
    minWidth: 100,
    alignSelf: "center",
  },
});

export default CustomModal;
