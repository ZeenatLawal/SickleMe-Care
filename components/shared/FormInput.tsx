import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormInputProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: any;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = "default",
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
}) => {
  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, style]}>
        {leftIcon && (
          <MaterialIcons
            name={leftIcon as any}
            size={20}
            color={Colors.gray500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            !editable && styles.inputDisabled,
            (leftIcon || rightIcon) && { paddingLeft: 48 },
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <MaterialIcons
              name={rightIcon as any}
              size={20}
              color={Colors.gray500}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  leftIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  inputDisabled: {
    backgroundColor: Colors.gray100,
    color: Colors.gray500,
  },
});
