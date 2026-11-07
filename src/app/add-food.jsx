import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addFoodItem } from "../storage/foodStorage";

const categories = ["Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Other"];

export default function AddFoodScreen() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  // Validation and loading states
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Check if date is valid
  const isValidDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const date = new Date(`${value}T00:00:00`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === Number(value.slice(0, 4)) &&
      date.getMonth() + 1 === Number(value.slice(5, 7)) &&
      date.getDate() === Number(value.slice(8, 10))
    );
  };

  // Save food to AsyncStorage
  const handleAddFood = async () => {
    if (isSaving) return;

    setMessage("");
    setMessageType("");

    // Check required fields
    if (
      !name.trim() ||
      !quantity.trim() ||
      !purchaseDate.trim() ||
      !expiryDate.trim()
    ) {
      setMessage("Please fill all required fields.");
      setMessageType("error");
      return;
    }

    // Check valid dates
    if (!isValidDate(purchaseDate.trim()) || !isValidDate(expiryDate.trim())) {
      setMessage("Please enter valid dates in YYYY-MM-DD format.");
      setMessageType("error");
      return;
    }

    // Expiry date should not be before purchase date
    if (expiryDate.trim() < purchaseDate.trim()) {
      setMessage("Expiry date cannot be before purchase date.");
      setMessageType("error");
      return;
    }

    // Create new food object
    const newFood = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      category: category,
      quantity: quantity.trim(),
      purchaseDate: purchaseDate.trim(),
      expiryDate: expiryDate.trim(),
      notes: notes.trim(),
      status: "Active",
    };

    try {
      setIsSaving(true);

      // Save food item
      await addFoodItem(newFood);

      setMessage("Food item saved successfully!");
      setMessageType("success");

      // Navigate to Inventory
      router.replace("/inventory");
    } catch (error) {
      console.error("Error adding food:", error);

      setMessage("Unable to save food. Please try again.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        {/* Header */}
        <Text style={styles.title}>Add New Food 🥬</Text>
        <Text style={styles.subtitle}>
          Keep your kitchen organized and fresh.
        </Text>

        {/* Food Name */}
        <Text style={styles.label}>Food Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Fresh Apples"
          placeholderTextColor="#899589"
          value={name}
          onChangeText={setName}
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                category === item && styles.activeCategory,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Quantity */}
        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5 pieces, 1 litre"
          placeholderTextColor="#899589"
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* Purchase Date */}
        <Text style={styles.label}>Purchase Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#899589"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
        />

        {/* Expiry Date */}
        <Text style={styles.label}>Expiry Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#899589"
          value={expiryDate}
          onChangeText={setExpiryDate}
        />

        {/* Notes */}
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Additional information..."
          placeholderTextColor="#899589"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Validation Message */}
        {message !== "" && (
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor:
                  messageType === "error" ? "#FDE8E8" : "#E3F3E5",
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: messageType === "error" ? "#B42318" : "#245C36",
                },
              ]}
            >
              {message}
            </Text>
          </View>
        )}

        {/* Add Food Button */}
        <Pressable
          style={[styles.addButton, isSaving && styles.disabledButton]}
          onPress={handleAddFood}
          disabled={isSaving}
        >
          <Text style={styles.addButtonText}>
            {isSaving ? "Saving..." : "+ Add Food"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F2",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    fontSize: 16,
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
    marginTop: 6,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#245C36",
    marginTop: 15,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#245C36",
    borderWidth: 1,
    borderColor: "#E1E8DD",
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  categoryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E8DD",
  },

  activeCategory: {
    backgroundColor: "#286B40",
    borderColor: "#286B40",
  },

  categoryText: {
    color: "#71816D",
  },

  activeCategoryText: {
    color: "#FFFFFF",
  },

  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },

  messageBox: {
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },

  messageText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  addButton: {
    backgroundColor: "#286B40",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.6,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
