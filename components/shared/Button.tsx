import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "small" | "medium" | "large";
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = () => {
    const styles_array = [];

    // Variants
    switch (variant) {
      case "secondary":
        styles_array.push(styles.buttonSecondary);
        break;
      case "danger":
        styles_array.push(styles.buttonDanger);
        break;
      case "outline":
        styles_array.push(styles.buttonOutline);
        break;
      default:
        styles_array.push(styles.buttonPrimary);
    }

    // Sizes
    switch (size) {
      case "small":
        styles_array.push(styles.buttonSmall);
        break;
      case "large":
        styles_array.push(styles.buttonLarge);
        break;
      default:
        styles_array.push(styles.buttonMedium);
    }

    if (disabled || loading) {
      styles_array.push(styles.buttonDisabled);
    }

    return styles_array;
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return [styles.buttonText, styles.buttonTextOutline];
      default:
        return [styles.buttonText, styles.buttonTextDefault];
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "outline":
        return Colors.primary;
      default:
        return Colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {icon && (
        <MaterialIcons name={icon as any} size={20} color={getIconColor()} />
      )}
      <Text style={getTextStyle()}>{loading ? "Loading..." : title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonDanger: {
    backgroundColor: Colors.error,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDefault: {
    color: Colors.white,
  },
  buttonTextOutline: {
    color: Colors.primary,
  },
});
