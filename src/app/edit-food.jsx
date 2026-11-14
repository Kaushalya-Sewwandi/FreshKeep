import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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

const units = ["pieces", "kg", "g", "litres", "ml", "packs"];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
  if (typeof value !== "string") return new Date();

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return new Date();

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  return !Number.isNaN(date.getTime()) && formatDate(date) === value
    ? date
    : new Date();
};

const parseQuantity = (value) => {
  const text = String(value ?? "").trim();

  const match = /^(\d+(?:\.\d+)?)\s*(.*)$/.exec(text);

  if (!match) {
    return { amount: "", unit: "pieces" };
  }

  const amount = match[1];
  const rawUnit = match[2].toLowerCase();

  const aliases = {
    piece: "pieces",
    pieces: "pieces",
    kg: "kg",
    g: "g",
    litre: "litres",
    litres: "litres",
    liter: "litres",
    liters: "litres",
    l: "litres",
    ml: "ml",
    pack: "packs",
    packs: "packs",
  };

  return {
    amount,
    unit: aliases[rawUnit] || (units.includes(rawUnit) ? rawUnit : "pieces"),
  };
};

export default function EditFoodScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [food, setFood] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load selected food item from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadFood = async () => {
        try {
          setLoading(true);
          setMessage("");

          const items = await getFoodItems();
          const selected = items.find((item) => String(item.id) === String(id));

          if (!active) return;

          if (!selected) {
            setFood(null);
            setMessage("Food item not found.");
            return;
          }

          const parsed = parseQuantity(selected.quantity);

          setFood(selected);
          setName(selected.name || "");
          setCategory(selected.category || "Fruits");
          setQuantity(parsed.amount);
          setUnit(parsed.unit);
          setPurchaseDate(parseDate(selected.purchaseDate));
          setExpiryDate(parseDate(selected.expiryDate));
          setNotes(selected.notes || "");
        } catch (error) {
          if (active) {
            setFood(null);
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

  const handleDateChange = (type, event, selectedDate) => {
    if (Platform.OS === "android") {
      if (type === "purchase") {
        setShowPurchasePicker(false);
      } else {
        setShowExpiryPicker(false);
      }
    }

    if (event.type === "dismissed" || !selectedDate) return;

    if (type === "purchase") {
      setPurchaseDate(selectedDate);
    } else {
      setExpiryDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (saving || !food) return;

    setMessage("");

    if (!name.trim() || !quantity.trim()) {
      setMessage("Please fill all required fields.");
      return;
    }

    const quantityNumber = Number(quantity);

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setMessage("Please enter a valid quantity greater than zero.");
      return;
    }

    const purchase = formatDate(purchaseDate);
    const expiry = formatDate(expiryDate);

    if (expiry < purchase) {
      setMessage("Expiry date cannot be before purchase date.");
      return;
    }

    const updatedFood = {
      ...food,
      name: name.trim(),
      category,
      quantity: `${quantityNumber} ${unit}`,
      purchaseDate: purchase,
      expiryDate: expiry,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      await updateFoodItem(updatedFood);

      router.replace("/inventory");
    } catch (error) {
      console.error("Error updating food:", error);
      setMessage("Unable to update food. Please try again.");
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        {/* Header */}
        <Text style={styles.title}>Edit Food ✏️</Text>
        <Text style={styles.subtitle}>Update your food item information.</Text>

        {/* Food Name */}
        <Text style={styles.label}>Food Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Fresh Apples"
          placeholderTextColor="#899589"
          value={name}
          onChangeText={setName}
        />

        {/* Category Dropdown */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            {categories.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>

        {/* Numeric Quantity */}
        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5"
          placeholderTextColor="#899589"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
        />

        {/* Unit Dropdown */}
        <Text style={styles.label}>Unit *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={unit}
            onValueChange={setUnit}
            style={styles.picker}
          >
            {units.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>

        {/* Purchase Date */}
        <Text style={styles.label}>Purchase Date *</Text>

        {Platform.OS === "web" ? (
          <TextInput
            style={styles.input}
            value={formatDate(purchaseDate)}
            editable={false}
          />
        ) : (
          <>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowPurchasePicker(true)}
            >
              <Text style={styles.dateText}>📅 {formatDate(purchaseDate)}</Text>
            </Pressable>

            {showPurchasePicker && (
              <>
                <DateTimePicker
                  value={purchaseDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, date) =>
                    handleDateChange("purchase", event, date)
                  }
                />

                {Platform.OS === "ios" && (
                  <Pressable onPress={() => setShowPurchasePicker(false)}>
                    <Text style={styles.doneText}>Done</Text>
                  </Pressable>
                )}
              </>
            )}
          </>
        )}

        {/* Expiry Date */}
        <Text style={styles.label}>Expiry Date *</Text>

        {Platform.OS === "web" ? (
          <TextInput
            style={styles.input}
            value={formatDate(expiryDate)}
            editable={false}
          />
        ) : (
          <>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowExpiryPicker(true)}
            >
              <Text style={styles.dateText}>📅 {formatDate(expiryDate)}</Text>
            </Pressable>

            {showExpiryPicker && (
              <>
                <DateTimePicker
                  value={expiryDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange("expiry", event, date)
                  }
                />

                {Platform.OS === "ios" && (
                  <Pressable onPress={() => setShowExpiryPicker(false)}>
                    <Text style={styles.doneText}>Done</Text>
                  </Pressable>
                )}
              </>
            )}
          </>
        )}

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
          <View style={styles.messageBox}>
            <Text style={styles.errorText}>{message}</Text>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.disabledButton]}
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

  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E8DD",
    overflow: "hidden",
  },

  picker: {
    color: "#245C36",
  },

  dateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E1E8DD",
  },

  dateText: {
    fontSize: 14,
    color: "#245C36",
  },

  doneText: {
    color: "#286B40",
    fontWeight: "bold",
    textAlign: "right",
    padding: 10,
  },

  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },

  messageBox: {
    backgroundColor: "#FDE8E8",
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

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
