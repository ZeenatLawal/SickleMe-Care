import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";

export default function ArticleScreen() {
  const { title, content } = useLocalSearchParams<{
    title: string;
    content: string;
  }>();

  const formatContent = (text: string) => {
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Header
      if (paragraph.trim().endsWith(":") && paragraph.length < 50) {
        return (
          <Text key={index} style={styles.sectionHeader}>
            {paragraph.trim()}
          </Text>
        );
      }

      // Bullet point list
      if (paragraph.includes("•")) {
        const lines = paragraph.split("\n");
        return (
          <View key={index} style={styles.listContainer}>
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith("•")) {
                return (
                  <View key={lineIndex} style={styles.listPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>
                      {line.replace("•", "").trim()}
                    </Text>
                  </View>
                );
              } else if (line.trim()) {
                return (
                  <Text key={lineIndex} style={styles.listHeader}>
                    {line.trim()}
                  </Text>
                );
              }
              return null;
            })}
          </View>
        );
      }

      // Numbered list
      if (paragraph.match(/^\d+\./m)) {
        const lines = paragraph.split("\n");
        return (
          <View key={index} style={styles.listContainer}>
            {lines.map((line, lineIndex) => {
              if (line.trim().match(/^\d+\./)) {
                return (
                  <View key={lineIndex} style={styles.listPoint}>
                    <Text style={styles.number}>
                      {line.trim().split(".")[0]}.
                    </Text>
                    <Text style={styles.listText}>
                      {line.replace(/^\d+\./, "").trim()}
                    </Text>
                  </View>
                );
              } else if (line.trim()) {
                return (
                  <Text key={lineIndex} style={styles.listHeader}>
                    {line.trim()}
                  </Text>
                );
              }
              return null;
            })}
          </View>
        );
      }

      // Paragraph
      return (
        <Text key={index} style={styles.paragraph}>
          {paragraph.trim()}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 5,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        <ScrollView
          style={{
            flex: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{title}</Text>
          <View style={styles.contentContainer}>
            {content && formatContent(content)}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  placeholder: {
    width: 34,
  },
  listPoint: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 10,
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    padding: 20,
    paddingBottom: 10,
    lineHeight: 32,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  listContainer: {
    marginBottom: 16,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
    fontWeight: "bold",
  },
  number: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
    fontWeight: "bold",
    minWidth: 20,
  },
});
