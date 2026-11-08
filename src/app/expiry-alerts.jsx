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

const categoryIcons = {
  Fruits: "🍎",
  Vegetables: "🥕",
  Dairy: "🥛",
  Bakery: "🍞",
  Meat: "🍗",
  Other: "🥗",
};

const alertColors = {
  "Expires Today": {
    background: "#FFE7CC",
    text: "#B65F00",
  },
  "Expiring Soon": {
    background: "#FFF1D6",
    text: "#A66A00",
  },
  Expired: {
    background: "#FDE8E8",
    text: "#B42318",
  },
};

export default function ExpiryAlertsScreen() {
  const router = useRouter();

  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadAlerts = async () => {
        try {
          setLoading(true);
          setError("");

          const savedItems = await getFoodItems();

          if (active) {
            setFoodItems(savedItems);
          }
        } catch (err) {
          console.error("Error loading expiry alerts:", err);

          if (active) {
            setError("Unable to load expiry alerts.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadAlerts();

      return () => {
        active = false;
      };
    }, []),
  );

  // Exclude consumed items from expiry alerts
  const activeItems = foodItems.filter((item) => item.status !== "Consumed");

  const expiredItems = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Expired",
  );

  const todayItems = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Expires Today",
  );

  const expiringSoonItems = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Expiring Soon",
  );

  const totalAlerts =
    expiredItems.length + todayItems.length + expiringSoonItems.length;

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

  const renderAlertSection = (title, items, status) => {
    if (items.length === 0) return null;

    const colors = alertColors[status];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {title} ({items.length})
        </Text>

        {items.map((item) => (
          <View key={item.id} style={styles.foodCard}>
            <View style={styles.foodIcon}>
              <Text style={styles.foodEmoji}>
                {categoryIcons[item.category] || "🥗"}
              </Text>
            </View>

            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{item.name}</Text>

              <Text style={styles.foodInfo}>
                {item.category} • {item.quantity}
              </Text>

              <Text style={styles.expiryText}>
                Expiry: {formatDate(item.expiryDate)}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>

          <Text style={styles.title}>Expiry Alerts 🔔</Text>

          <Text style={styles.subtitle}>
            Stay informed and reduce food waste.
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
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>🔔</Text>

              <Text style={styles.summaryNumber}>{totalAlerts}</Text>

              <Text style={styles.summaryLabel}>Food Items Need Attention</Text>
            </View>

            {totalAlerts === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>✅</Text>

                <Text style={styles.emptyTitle}>No Expiry Alerts!</Text>

                <Text style={styles.emptyText}>
                  Great! No active food items are expiring soon or expired.
                </Text>
              </View>
            ) : (
              <>
                {renderAlertSection(
                  "⚠️ Expired Items",
                  expiredItems,
                  "Expired",
                )}

                {renderAlertSection(
                  "📅 Expires Today",
                  todayItems,
                  "Expires Today",
                )}

                {renderAlertSection(
                  "⏰ Expiring Soon",
                  expiringSoonItems,
                  "Expiring Soon",
                )}
              </>
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
  },

  backButton: {
    fontSize: 15,
    color: "#286B40",
    fontWeight: "bold",
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#245C36",
  },

  subtitle: {
    fontSize: 14,
    color: "#71816D",
    marginTop: 7,
  },

  summaryCard: {
    backgroundColor: "#286B40",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 25,
    borderRadius: 18,
    alignItems: "center",
  },

  summaryIcon: {
    fontSize: 35,
  },

  summaryNumber: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#E4F1E4",
    marginTop: 5,
    textAlign: "center",
  },

  section: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#245C36",
    marginHorizontal: 20,
    marginBottom: 12,
  },

  foodCard: {
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

  loader: {
    marginTop: 40,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#245C36",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 13,
    color: "#71816D",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  errorText: {
    color: "#B42318",
    textAlign: "center",
  },
});
