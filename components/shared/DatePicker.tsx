import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 30);

  const selectedDateObj = new Date(selectedDate);

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      onDateSelect(dateStr);
    }
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.dateButtonContent}>
          <MaterialIcons
            name="calendar-month"
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.dateButtonText}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={20}
            color={Colors.primary}
          />
        </View>
      </TouchableOpacity>

      {isOpen && (
        <DateTimePicker
          value={selectedDateObj}
          mode="date"
          onChange={handleDateChange}
          maximumDate={today}
          minimumDate={minDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    padding: 16,
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
    marginLeft: 12,
  },
});
