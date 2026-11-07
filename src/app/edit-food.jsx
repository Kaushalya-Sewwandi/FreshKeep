import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

import { getFoodItems, updateFoodItem } from "../storage/foodStorage";

const categories = ["Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Other"];

// Validate a real calendar date
const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8, 10))
  );
};

export default function EditFoodScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [food, setFood] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // Load selected food item
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadFood = async () => {
        try {
          setLoading(true);
          setMessage("");

          const items = await getFoodItems();
          const selected = items.find((item) => item.id === id);

          if (!active) return;

          if (!selected) {
            setFood(null);
            setMessage("Food item not found.");
            return;
          }

          setFood(selected);
          setName(selected.name);
          setCategory(selected.category);
          setQuantity(selected.quantity);
          setPurchaseDate(selected.purchaseDate);
          setExpiryDate(selected.expiryDate);
          setNotes(selected.notes || "");
        } catch (error) {
          if (active) {
            setMessage("Unable to load food item.");
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      loadFood();

      return () => {
        active = false;
      };
    }, [id]),
  );

  const handleSave = async () => {
    if (saving || !food) return;

    setMessage("");

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

    if (!isValidDate(purchaseDate.trim()) || !isValidDate(expiryDate.trim())) {
      setMessage("Please enter valid dates in YYYY-MM-DD format.");
      setMessageType("error");
      return;
    }

    if (expiryDate.trim() < purchaseDate.trim()) {
      setMessage("Expiry date cannot be before purchase date.");
      setMessageType("error");
      return;
    }

    const updatedFood = {
      ...food,
      name: name.trim(),
      category,
      quantity: quantity.trim(),
      purchaseDate: purchaseDate.trim(),
      expiryDate: expiryDate.trim(),
      notes: notes.trim(),
    };

    try {
      setSaving(true);
      await updateFoodItem(updatedFood);
      router.replace("/inventory");
    } catch (error) {
      setMessage("Unable to update food. Please try again.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#286B40"
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  if (!food) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>
            {message || "Food item not found."}
          </Text>
          <Pressable onPress={() => router.replace("/inventory")}>
            <Text style={styles.back}>← Back to Inventory</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Edit Food ✏️</Text>
        <Text style={styles.subtitle}>Update your food item information.</Text>

        <Text style={styles.label}>Food Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

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

        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Purchase Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
        />

        <Text style={styles.label}>Expiry Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={expiryDate}
          onChangeText={setExpiryDate}
        />

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

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
            <Text style={styles.errorText}>{message}</Text>
          </View>
        )}

        <Pressable
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
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
  errorText: {
    color: "#B42318",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#286B40",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
