import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
  iconColor?: string;
}

interface StatsGridProps {
  stats: StatItemProps[];
}

export const StatItem: React.FC<StatItemProps> = ({
  icon,
  value,
  label,
  iconColor = Colors.primary,
}) => {
  return (
    <View style={styles.statItem}>
      <MaterialIcons name={icon} size={24} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <StatItem
          key={index}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          iconColor={stat.iconColor}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray500,
  },
});
