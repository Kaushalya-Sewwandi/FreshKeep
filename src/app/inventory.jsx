import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getFoodItems } from "../storage/foodStorage";

// Food category icons
const categoryIcons = {
  Fruits: "🍎",
  Vegetables: "🥕",
  Dairy: "🥛",
  Bakery: "🍞",
  Meat: "🍗",
  Other: "🥗",
};

const categories = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Meat",
  "Other",
];

export default function InventoryScreen() {
  const router = useRouter();

  // State variables
  const [foodItems, setFoodItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved food items whenever Inventory is focused
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadFoodItems = async () => {
        try {
          setLoading(true);
          setError("");

          const savedItems = await getFoodItems();

          if (active) {
            setFoodItems(savedItems);
          }
        } catch (err) {
          console.error("Error loading inventory:", err);

          if (active) {
            setError("Unable to load food items.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadFoodItems();

      return () => {
        active = false;
      };
    }, []),
  );

  // Search and category filtering
  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Display expiry date
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
          <Text style={styles.title}>Food Inventory 🥬</Text>
          <Text style={styles.subtitle}>
            Manage all your food items in one place.
          </Text>
        </View>

        {/* Add Food Button */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-food")}
        >
          <Text style={styles.addButtonText}>+ Add New Food</Text>
        </Pressable>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search food items..."
            placeholderTextColor="#899589"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Food List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>All Food Items</Text>

          <Text style={styles.itemCount}>{filteredItems.length} items</Text>
        </View>

        {/* Loading */}
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
        ) : filteredItems.length > 0 ? (
          // Saved Food Items
          filteredItems.map((item) => (
            <View key={item.id} style={styles.foodCard}>
              {/* Food Icon */}
              <View style={styles.foodIcon}>
                <Text style={styles.foodEmoji}>
                  {categoryIcons[item.category] || "🥗"}
                </Text>
              </View>

              {/* Food Details */}
              <View style={styles.foodDetails}>
                <Text style={styles.foodName}>{item.name}</Text>

                <Text style={styles.foodCategory}>{item.category}</Text>

                <Text style={styles.foodInfo}>Quantity: {item.quantity}</Text>

                <Text style={styles.expiryText}>
                  Expiry: {formatDate(item.expiryDate)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🛒</Text>

            <Text style={styles.emptyTitle}>
              {foodItems.length === 0
                ? "No food items yet"
                : "No food items found"}
            </Text>

            <Text style={styles.emptyText}>
              {foodItems.length === 0
                ? "Start adding your food items to FreshKeep!"
                : "Try another search or category."}
            </Text>
          </View>
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
    paddingBottom: 10,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#245C36",
  },

  subtitle: {
    fontSize: 14,
    color: "#71816D",
    marginTop: 7,
  },

  addButton: {
    backgroundColor: "#286B40",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 2,
  },

  searchIcon: {
    fontSize: 18,
  },

  searchInput: {
    flex: 1,
    padding: 15,
    fontSize: 14,
    color: "#245C36",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#245C36",
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },

  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },

  selectedCategory: {
    backgroundColor: "#286B40",
  },

  categoryText: {
    color: "#71816D",
    fontWeight: "600",
  },

  selectedCategoryText: {
    color: "#FFFFFF",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 20,
  },

  itemCount: {
    color: "#71816D",
    fontSize: 13,
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

  foodCategory: {
    fontSize: 12,
    color: "#71816D",
    marginTop: 3,
  },

  foodInfo: {
    fontSize: 12,
    color: "#526052",
    marginTop: 5,
  },

  expiryText: {
    fontSize: 12,
    color: "#D18A32",
    marginTop: 3,
  },

  itemCount: {
    color: "#71816D",
    fontSize: 13,
  },

  loader: {
    marginTop: 40,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 30,
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

  errorText: {
    color: "#B42318",
    fontSize: 14,
  },
});
