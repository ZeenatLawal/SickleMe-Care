import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Switch,
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
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  style?: any;
}

interface FormSwitchProps {
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

interface FormListItemProps {
  value: string;
  onChangeText?: (text: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  editable?: boolean;
}

interface FormListProps {
  label: string;
  items: string[];
  onUpdateItem?: (index: number, value: string) => void;
  onRemoveItem?: (index: number) => void;
  onAddItem?: () => void;
  placeholder?: string;
  editable?: boolean;
  emptyText?: string;
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
            name={leftIcon}
            size={20}
            color={Colors.gray500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            !editable && styles.inputDisabled,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
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
            <MaterialIcons name={rightIcon} size={20} color={Colors.gray500} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.gray400}
        disabled={disabled}
      />
    </View>
  );
};

export const FormListItem: React.FC<FormListItemProps> = ({
  value,
  onChangeText,
  onRemove,
  placeholder,
  editable = true,
}) => {
  return (
    <View style={styles.listItem}>
      <TextInput
        style={[
          styles.input,
          styles.listInput,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
      />
      {editable && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <MaterialIcons name="remove" size={20} color={Colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const FormList: React.FC<FormListProps> = ({
  label,
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  placeholder,
  editable = true,
  emptyText = "No items added",
}) => {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.listHeader}>
        <Text style={styles.label}>{label}</Text>
        {editable && onAddItem && (
          <TouchableOpacity onPress={onAddItem} style={styles.addButton}>
            <MaterialIcons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {items.map((item, index) => (
        <FormListItem
          key={index}
          value={item}
          onChangeText={(text) => onUpdateItem?.(index, text)}
          onRemove={() => onRemoveItem?.(index)}
          placeholder={placeholder}
          editable={editable}
        />
      ))}
      {items.length === 0 && <Text style={styles.emptyText}>{emptyText}</Text>}
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
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  listInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    color: Colors.gray400,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
});
