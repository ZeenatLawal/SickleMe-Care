import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const data = [
  {
    id: "scd-basics",
    title: "Understanding SCD",
    description: "Learn the basics of sickle cell disease",
    color: Colors.primary,
  },
  {
    id: "pain-management",
    title: "Managing Pain",
    description: "Tips for handling pain crises",
    color: Colors.error,
  },
  {
    id: "healthy-living",
    title: "Healthy Living",
    description: "Exercise and lifestyle tips",
    color: Colors.success,
  },
  {
    id: "hydration",
    title: "Stay Hydrated",
    description: "Why hydration is important",
    color: Colors.hydration,
  },
];

export const EducationCards = () => {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.educationItem}
          onPress={() => router.push("/education")}
        >
          <View style={styles.educationContent}>
            <View
              style={[styles.educationDot, { backgroundColor: item.color }]}
            />
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.educationTitle}>{item.title}</Text>
              <Text style={styles.educationDescription}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.learnMoreButton}
        onPress={() => router.push("/education")}
      >
        <Text style={styles.learnMoreText}>View All Educational Resources</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  educationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  educationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  educationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  educationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  educationDescription: {
    fontSize: 12,
    color: Colors.gray600,
    lineHeight: 16,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginRight: 6,
  },
});
