import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress?: () => void;
  iconColor?: string;
  backgroundColor?: string;
}

interface ActionGridProps {
  actions: ActionButtonProps[];
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  iconColor = Colors.primary,
  backgroundColor = Colors.primarySoft,
}) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor }]}
      onPress={onPress}
    >
      <MaterialIcons name={icon as any} size={32} color={iconColor} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
};

export const ActionGrid: React.FC<ActionGridProps> = ({ actions }) => {
  return (
    <View style={styles.actionGrid}>
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          iconColor={action.iconColor}
          backgroundColor={action.backgroundColor}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.primarySoft,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 8,
  },
});
