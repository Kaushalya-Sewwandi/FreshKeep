import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getFoodItems } from "../storage/foodStorage";
import { getExpiryStatus } from "../utils/expiryUtils";

const categories = ["Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Other"];

const categoryIcons = {
  Fruits: "🍎",
  Vegetables: "🥕",
  Dairy: "🥛",
  Bakery: "🍞",
  Meat: "🍗",
  Other: "🥗",
};

export default function ReportsScreen() {
  const router = useRouter();

  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved food items when screen is opened
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadReports = async () => {
        try {
          setLoading(true);
          setError("");

          const savedItems = await getFoodItems();

          if (active) {
            setFoodItems(savedItems);
          }
        } catch (err) {
          console.error("Error loading reports:", err);

          if (active) {
            setError("Unable to load reports.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadReports();

      return () => {
        active = false;
      };
    }, []),
  );

  // Separate active and consumed items
  const activeItems = foodItems.filter((item) => item.status !== "Consumed");

  const consumedItems = foodItems.filter((item) => item.status === "Consumed");

  // Calculate statistics
  const totalAdded = foodItems.length;
  const activeCount = activeItems.length;
  const consumedCount = consumedItems.length;

  const expiredCount = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Expired",
  ).length;

  const freshCount = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Fresh",
  ).length;

  const expiringCount = activeItems.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);

    return status === "Expiring Soon" || status === "Expires Today";
  }).length;

  // Percentages for food status distribution
  const getPercentage = (count) => {
    if (totalAdded === 0) return 0;

    return Math.round((count / totalAdded) * 100);
  };

  const availableCount = activeCount - expiredCount;

  // Category breakdown
  const categoryData = categories.map((category) => ({
    name: category,
    icon: categoryIcons[category],
    count: activeItems.filter((item) => item.category === category).length,
  }));

  // Latest consumed items first
  const recentConsumed = [...consumedItems].sort(
    (a, b) =>
      new Date(b.consumedDate || 0).getTime() -
      new Date(a.consumedDate || 0).getTime(),
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatCard = (icon, value, label) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderProgressBar = (label, count, color) => (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>

        <Text style={styles.progressValue}>{getPercentage(count)}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${getPercentage(count)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text style={styles.progressCount}>{count} items</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.replace("/")}>
            <Text style={styles.backButton}>← Back to Dashboard</Text>
          </Pressable>

          <Text style={styles.title}>Reports & Insights 📊</Text>

          <Text style={styles.subtitle}>
            Understand your food inventory better.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#286B40"
            style={styles.loader}
          />
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Overview Statistics */}
            <Text style={styles.sectionTitle}>Inventory Overview</Text>

            <View style={styles.statsRow}>
              {renderStatCard("🥗", totalAdded, "Total Added")}
              {renderStatCard("🍎", activeCount, "Active Items")}
            </View>

            <View style={styles.statsRow}>
              {renderStatCard("✅", consumedCount, "Consumed")}
              {renderStatCard("⚠️", expiredCount, "Expired")}
            </View>

            {/* Food Status Distribution */}
            <Text style={styles.sectionTitle}>Food Status Distribution</Text>

            <View style={styles.whiteCard}>
              {renderProgressBar(
                "Available (Not Expired)",
                availableCount,
                "#286B40",
              )}

              {renderProgressBar("Consumed", consumedCount, "#E3A43B")}

              {renderProgressBar("Expired", expiredCount, "#C93636")}
            </View>

            {/* Additional Insights */}
            <Text style={styles.sectionTitle}>Quick Insights</Text>

            <View style={styles.whiteCard}>
              <Text style={styles.insightText}>
                🍎 Fresh Items: {freshCount}
              </Text>

              <Text style={styles.insightText}>
                ⏰ Expiring Soon: {expiringCount}
              </Text>

              <Text style={styles.insightText}>
                ⚠️ Expired Items: {expiredCount}
              </Text>

              <Text style={styles.insightText}>
                ✅ Consumed Items: {consumedCount}
              </Text>
            </View>

            {/* Category Breakdown */}
            <Text style={styles.sectionTitle}>Category Breakdown</Text>

            <View style={styles.whiteCard}>
              {categoryData.map((category) => (
                <View key={category.name} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>
                    {category.icon} {category.name}
                  </Text>

                  <Text style={styles.categoryCount}>{category.count}</Text>
                </View>
              ))}
            </View>

            {/* Consumed History */}
            <Text style={styles.sectionTitle}>Consumed Food History</Text>

            {recentConsumed.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛒</Text>

                <Text style={styles.emptyTitle}>No consumed items yet</Text>

                <Text style={styles.emptyText}>
                  Consumed food items will appear here.
                </Text>
              </View>
            ) : (
              recentConsumed.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <Text style={styles.historyIcon}>
                    {categoryIcons[item.category] || "🥗"}
                  </Text>

                  <View style={styles.historyDetails}>
                    <Text style={styles.historyName}>{item.name}</Text>

                    <Text style={styles.historyInfo}>
                      {item.category} • {item.quantity}
                    </Text>

                    <Text style={styles.historyDate}>
                      Consumed: {formatDate(item.consumedDate)}
                    </Text>
                  </View>

                  <Text style={styles.consumedCheck}>✓</Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F2",
  },

  header: {
    padding: 20,
    paddingBottom: 5,
  },

  backButton: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#286B40",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#245C36",
  },

  subtitle: {
    fontSize: 14,
    color: "#71816D",
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#245C36",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },

  statIcon: {
    fontSize: 27,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#286B40",
    marginTop: 8,
  },

  statLabel: {
    fontSize: 12,
    color: "#71816D",
    marginTop: 5,
    textAlign: "center",
  },

  whiteCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
  },

  progressSection: {
    marginBottom: 18,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 14,
    color: "#526052",
    fontWeight: "600",
  },

  progressValue: {
    fontSize: 14,
    color: "#245C36",
    fontWeight: "bold",
  },

  progressTrack: {
    height: 10,
    backgroundColor: "#EDF1EA",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  progressCount: {
    fontSize: 12,
    color: "#71816D",
    marginTop: 5,
  },

  insightText: {
    fontSize: 14,
    color: "#526052",
    marginBottom: 12,
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1EA",
  },

  categoryName: {
    fontSize: 14,
    color: "#526052",
  },

  categoryCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#286B40",
  },

  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  historyIcon: {
    fontSize: 28,
    marginRight: 14,
  },

  historyDetails: {
    flex: 1,
  },

  historyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#245C36",
  },

  historyInfo: {
    fontSize: 12,
    color: "#71816D",
    marginTop: 4,
  },

  historyDate: {
    fontSize: 12,
    color: "#D18A32",
    marginTop: 5,
  },

  consumedCheck: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#286B40",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#245C36",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 13,
    color: "#71816D",
    marginTop: 5,
    textAlign: "center",
  },

  loader: {
    marginTop: 40,
  },

  errorText: {
    color: "#B42318",
    fontSize: 14,
    textAlign: "center",
  },
});
