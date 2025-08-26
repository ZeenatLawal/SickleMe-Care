import { BaseCard } from "@/components/shared";
import { Colors } from "@/constants/Colors";
import educationalData from "@/data/educationalResources.json";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EducationalResource {
  id: string;
  title: string;
  description: string;
  category: "basics" | "management" | "crisis" | "lifestyle" | "support";
  type: "article" | "video" | "external";
  content?: string;
  url?: string;
  icon: string;
}

export default function EducationScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const educationalResources = Object.entries(educationalData).map(
    ([id, resource]) => ({
      id,
      ...resource,
    })
  ) as EducationalResource[];

  const filteredResources =
    selectedCategory === "all"
      ? educationalResources
      : educationalResources.filter(
          (resource) => resource.category === selectedCategory
        );

  const handleResource = async (resource: EducationalResource) => {
    if (
      (resource.type === "external" || resource.type === "video") &&
      resource.url
    ) {
      try {
        const supported = await Linking.canOpenURL(resource.url);
        if (supported) {
          await Linking.openURL(resource.url);
        } else {
          Alert.alert("Error", "Cannot open this link");
        }
      } catch {
        Alert.alert("Error", "Failed to open link");
      }
    } else if (resource.content) {
      router.push({
        pathname: "/education/article",
        params: {
          title: resource.title,
          content: resource.content,
        },
      });
    }
  };

  const categories = [
    { key: "all", label: "All", color: Colors.gray500 },
    { key: "basics", label: "Basics", color: Colors.primary },
    { key: "management", label: "Management", color: Colors.secondaryLight },
    { key: "crisis", label: "Crisis Care", color: Colors.error },
    { key: "lifestyle", label: "Lifestyle", color: Colors.success },
    { key: "support", label: "Support", color: Colors.info },
  ];

  const getCategoryColor = (categoryKey: string) => {
    return (
      categories.find((cat) => cat.key === categoryKey)?.color || Colors.gray500
    );
  };

  const getCategoryLabel = (categoryKey: string) => {
    return (
      categories.find((cat) => cat.key === categoryKey)?.label || categoryKey
    );
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
        <Text style={styles.title}>Sickle Cell Disease</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Disclaimer",
              "This information is for educational purposes only. Always consult with your healthcare provider for personalized medical advice."
            );
          }}
          style={{
            padding: 5,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={Colors.gray600}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && {
                  backgroundColor: category.color,
                },
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.key &&
                    styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredResources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              onPress={() => handleResource(resource)}
              activeOpacity={1}
            >
              <BaseCard
                style={{
                  marginBottom: 12,
                  padding: 16,
                }}
              >
                <View style={styles.resourceHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: getCategoryColor(resource.category) },
                    ]}
                  >
                    <Ionicons
                      name={resource.icon as any}
                      size={24}
                      color={Colors.white}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceDescription}>
                      {resource.description}
                    </Text>
                    <Text
                      style={[
                        styles.categoryTag,
                        { color: getCategoryColor(resource.category) },
                      ]}
                    >
                      {getCategoryLabel(resource.category)}
                    </Text>
                  </View>
                  <View
                    style={{
                      padding: 4,
                    }}
                  >
                    <Ionicons
                      name={
                        resource.type === "external"
                          ? "open-outline"
                          : resource.type === "video"
                          ? "play-circle"
                          : "chevron-forward"
                      }
                      size={20}
                      color={Colors.gray400}
                    />
                  </View>
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  categoryContainer: {
    maxHeight: 60,
    paddingVertical: 10,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resourceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 6,
    lineHeight: 20,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
