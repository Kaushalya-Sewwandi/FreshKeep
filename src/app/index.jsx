import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Link, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getFoodItems } from "../storage/foodStorage";
import { getExpiryStatus } from "../utils/expiryUtils";

// Food category icons
const categoryIcons = {
  Fruits: "🍎",
  Vegetables: "🥕",
  Dairy: "🥛",
  Bakery: "🍞",
  Meat: "🍗",
  Other: "🥗",
};

// Status colors
const statusColors = {
  Fresh: {
    background: "#E3F3E5",
    text: "#286B40",
  },
  "Expiring Soon": {
    background: "#FFF1D6",
    text: "#A66A00",
  },
  "Expires Today": {
    background: "#FFE7CC",
    text: "#B65F00",
  },
  Expired: {
    background: "#FDE8E8",
    text: "#B42318",
  },
  Unknown: {
    background: "#ECECEC",
    text: "#666666",
  },
  Consumed: {
    background: "#E8EAF6",
    text: "#3949AB",
  },
};

export default function HomeScreen() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load food items whenever Dashboard gets focus
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDashboard = async () => {
        try {
          setLoading(true);
          setError("");

          const savedItems = await getFoodItems();

          if (active) {
            setFoodItems(savedItems);
          }
        } catch (err) {
          console.error("Dashboard loading error:", err);

          if (active) {
            setError("Unable to load dashboard data.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadDashboard();

      return () => {
        active = false;
      };
    }, []),
  );

  // Exclude consumed items from active inventory statistics
  const activeItems = foodItems.filter((item) => item.status !== "Consumed");
  const totalItems = activeItems.length;
  const consumedItems = foodItems.filter(
    (item) => item.status === "Consumed",
  ).length;

  const freshItems = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Fresh",
  ).length;

  const expiringSoonItems = activeItems.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);
    return status === "Expiring Soon" || status === "Expires Today";
  }).length;

  const expiredItems = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Expired",
  ).length;

  // Show latest 5 added items
  const recentItems = [...foodItems].reverse().slice(0, 5);

  // Format expiry date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello there 👋</Text>
            <Text style={styles.title}>FreshKeep 🥬</Text>
          </View>

          <Text style={styles.profile}>👤</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Manage your food smarter!</Text>

          <Text style={styles.welcomeText}>
            Keep track of your food and reduce waste.
          </Text>
        </View>

        {/* Inventory Navigation */}
        <Link href="/inventory" asChild>
          <Pressable style={styles.inventoryButton}>
            <Text style={styles.inventoryButtonText}>
              View Food Inventory →
            </Text>
          </Pressable>
        </Link>

        {/* Reports & Insights Navigation */}
        <Link href="/reports" asChild>
          <Pressable style={styles.reportsButton}>
            <Text style={styles.reportsButtonText}>
              📊 View Reports & Insights →
            </Text>
          </Pressable>
        </Link>

        {/* Expiry Alerts Navigation */}
        <Link href="/expiry-alerts" asChild>
          <Pressable style={styles.alertButton}>
            <Text style={styles.alertButtonText}>🔔 View Expiry Alerts →</Text>
          </Pressable>
        </Link>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Food Overview</Text>

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
            {/* First Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🥗</Text>
                <Text style={styles.statNumber}>{totalItems}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⏰</Text>
                <Text style={styles.statNumber}>{expiringSoonItems}</Text>
                <Text style={styles.statLabel}>Expiring Soon</Text>
              </View>
            </View>

            {/* Second Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🍎</Text>
                <Text style={styles.statNumber}>{freshItems}</Text>
                <Text style={styles.statLabel}>Fresh Items</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⚠️</Text>
                <Text style={styles.statNumber}>{expiredItems}</Text>
                <Text style={styles.statLabel}>Expired Items</Text>
              </View>
            </View>

            {/* Third Row: Consumed count */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={styles.statNumber}>{consumedItems}</Text>
                <Text style={styles.statLabel}>Consumed Items</Text>
              </View>
            </View>

            {/* Recent Food Items */}
            <Text style={styles.sectionTitle}>Recent Food Items</Text>

            {recentItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛒</Text>

                <Text style={styles.emptyTitle}>No food items yet</Text>

                <Text style={styles.emptyText}>
                  Start adding your food items to FreshKeep!
                </Text>
              </View>
            ) : (
              recentItems.map((item) => {
                const status =
                  item.status === "Consumed"
                    ? "Consumed"
                    : getExpiryStatus(item.expiryDate);
                const colors = statusColors[status] || statusColors.Unknown;

                return (
                  <View key={item.id} style={styles.recentCard}>
                    {/* Food Icon */}
                    <View style={styles.foodIcon}>
                      <Text style={styles.foodEmoji}>
                        {categoryIcons[item.category] || "🥗"}
                      </Text>
                    </View>

                    {/* Food Details */}
                    <View style={styles.foodDetails}>
                      <Text style={styles.foodName}>{item.name}</Text>

                      <Text style={styles.foodInfo}>
                        {item.category} • {item.quantity}
                      </Text>

                      <Text style={styles.expiryText}>
                        Expiry: {formatDate(item.expiryDate)}
                      </Text>

                      {/* Expiry Status */}
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: colors.text }]}
                        >
                          {status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  greeting: {
    fontSize: 14,
    color: "#71816D",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#245C36",
  },

  profile: {
    fontSize: 30,
    backgroundColor: "#E3F0E3",
    padding: 10,
    borderRadius: 30,
  },

  welcomeCard: {
    backgroundColor: "#286B40",
    margin: 20,
    marginTop: 5,
    padding: 25,
    borderRadius: 18,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
  },

  welcomeText: {
    color: "#E4F1E4",
    fontSize: 14,
    marginTop: 10,
  },

  inventoryButton: {
    backgroundColor: "#286B40",
    marginHorizontal: 20,
    marginTop: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  inventoryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#245C36",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 12,
  },

  statsContainer: {
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

  loader: {
    marginTop: 35,
  },

  // Recent food item cards
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  foodIcon: {
    width: 55,
    height: 55,
    backgroundColor: "#EAF3E8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  foodEmoji: {
    fontSize: 28,
  },

  foodDetails: {
    flex: 1,
    marginLeft: 14,
  },

  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#245C36",
  },

  foodInfo: {
    fontSize: 12,
    color: "#71816D",
    marginTop: 4,
  },

  expiryText: {
    fontSize: 12,
    color: "#D18A32",
    marginTop: 5,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#245C36",
    marginTop: 10,
  },

  emptyText: {
    color: "#71816D",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  errorText: {
    color: "#B42318",
    fontSize: 14,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#FFF1D6",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  alertButtonText: {
    color: "#A66A00",
    fontSize: 16,
    fontWeight: "bold",
  },

  reportsButton: {
    backgroundColor: "#E3F0E3",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  reportsButtonText: {
    color: "#245C36",
    fontSize: 16,
    fontWeight: "bold",
  },
});
