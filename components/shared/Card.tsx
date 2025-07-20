import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

interface BaseCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardWithTitleProps extends BaseCardProps {
  title: string;
  titleStyle?: TextStyle;
}

export const BaseCard: React.FC<BaseCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

export const CardWithTitle: React.FC<CardWithTitleProps> = ({
  children,
  title,
  style,
  titleStyle,
}) => {
  return (
    <BaseCard style={style}>
      <Text style={[styles.cardTitle, titleStyle]}>{title}</Text>
      {children}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
});
