import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteFoodItem,
  getFoodItems,
  markFoodAsConsumed,
} from "../../storage/foodStorage";

import { getExpiryStatus } from "../../utils/expiryUtils";

// Food category icons
const categoryIcons = {
  Fruits: "🍎",
  Vegetables: "🥕",
  Dairy: "🥛",
  Bakery: "🍞",
  Meat: "🍗",
  Other: "🥗",
};

// Available categories
const categories = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Meat",
  "Other",
];

// Colors for each expiry status
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
    background: "#E1F1FF",
    text: "#205B88",
  },
};

export default function InventoryScreen() {
  const router = useRouter();

  // Inventory states
  const [foodItems, setFoodItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete confirmation states
  const [selectedFood, setSelectedFood] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [consumingId, setConsumingId] = useState(null);

  // Reload items when returning to Inventory
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

  // Mark the selected food item as consumed and refresh the list
  const handleMarkConsumed = async (item) => {
    if (consumingId !== null || item.status === "Consumed") return;

    try {
      setConsumingId(item.id);
      setError("");
      const updatedItems = await markFoodAsConsumed(item.id);
      setFoodItems(updatedItems);
    } catch (err) {
      console.error("Error marking food as consumed:", err);
      setError("Unable to mark food as consumed. Please try again.");
    } finally {
      setConsumingId(null);
    }
  };

  // Format date for display
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

  // Open delete confirmation popup
  const handleDeletePress = (item) => {
    setSelectedFood(item);
    setDeleteModalVisible(true);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    if (deleting) return;

    setDeleteModalVisible(false);
    setSelectedFood(null);
  };

  // Delete food from AsyncStorage
  const handleConfirmDelete = async () => {
    if (!selectedFood || deleting) return;

    try {
      setDeleting(true);
      setError("");

      const updatedItems = await deleteFoodItem(selectedFood.id);

      setFoodItems(updatedItems);
      setDeleteModalVisible(false);
      setSelectedFood(null);
    } catch (err) {
      console.error("Error deleting food:", err);
      setError("Unable to delete food. Please try again.");
      setDeleteModalVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backButtonText}>← Back </Text>
          </Pressable>
          <Text style={styles.title}>Food Inventory 🥬</Text>

          <Text style={styles.subtitle}>
            Manage all your food items in one place.
          </Text>
        </View>

        {/* Add New Food Button */}
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

        {/* Category Filter */}
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

        {/* Loading State */}
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
          // Display saved food items
          filteredItems.map((item) => {
            const isConsumed = item.status === "Consumed";
            const status = isConsumed
              ? "Consumed"
              : getExpiryStatus(item.expiryDate);
            const colors = statusColors[status] || statusColors.Unknown;

            return (
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

                  {/* Expiry Status Badge */}
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

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                  {/* Edit Button */}
                  <Pressable
                    style={styles.editButton}
                    onPress={() =>
                      router.push({
                        pathname: "/edit-food",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.editButtonText}>✏️ Edit</Text>
                  </Pressable>

                  {/* Delete Button */}
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeletePress(item)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </Pressable>

                  {/* Mark as Consumed Button */}
                  <Pressable
                    style={[
                      styles.consumeButton,
                      (isConsumed || consumingId !== null) &&
                        styles.disabledButton,
                    ]}
                    onPress={() => handleMarkConsumed(item)}
                    disabled={isConsumed || consumingId !== null}
                  >
                    <Text style={styles.consumeButtonText}>
                      {isConsumed
                        ? "✓ Consumed"
                        : consumingId === item.id
                          ? "Saving..."
                          : "✓ Mark Consumed"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          // Empty State
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🗑️</Text>

            <Text style={styles.modalTitle}>Delete Food Item?</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to delete{" "}
              <Text style={styles.modalFoodName}>{selectedFood?.name}</Text>?
            </Text>

            <Text style={styles.modalWarning}>
              This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              {/* Cancel Button */}
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelDelete}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              {/* Confirm Delete Button */}
              <Pressable
                style={[
                  styles.confirmDeleteButton,
                  deleting && { opacity: 0.6 },
                ]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

  // Expiry status badge
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

  actionContainer: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 8,
  },

  editButton: {
    backgroundColor: "#E3F0E3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  editButtonText: {
    color: "#245C36",
    fontSize: 12,
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#FDE8E8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#B42318",
    fontSize: 12,
    fontWeight: "bold",
  },

  consumeButton: {
    backgroundColor: "#DCECFB",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  consumeButtonText: {
    color: "#205B88",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.55,
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

  // Delete confirmation modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 380,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  modalIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#245C36",
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: 14,
    color: "#526052",
    textAlign: "center",
    lineHeight: 22,
  },

  modalFoodName: {
    fontWeight: "bold",
    color: "#245C36",
  },

  modalWarning: {
    fontSize: 12,
    color: "#B42318",
    marginTop: 10,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 25,
    width: "100%",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#EDF1EA",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#526052",
    fontWeight: "bold",
  },

  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#C93636",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
    paddingVertical: 8,
  },

  backButtonText: {
    color: "#286B40",
    fontSize: 15,
    fontWeight: "bold",
  },
});
