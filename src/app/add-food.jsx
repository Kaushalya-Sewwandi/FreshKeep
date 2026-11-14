import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
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

const units = ["pieces", "kg", "g", "litres", "ml", "packs"];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function AddFoodScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddFood = async () => {
    if (isSaving) return;

    setMessage("");
    setMessageType("");

    if (!name.trim() || !quantity.trim()) {
      setMessage("Please fill all required fields.");
      setMessageType("error");
      return;
    }

    const quantityNumber = Number(quantity);

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setMessage("Please enter a valid quantity greater than zero.");
      setMessageType("error");
      return;
    }

    const purchase = formatDate(purchaseDate);
    const expiry = formatDate(expiryDate);

    if (expiry < purchase) {
      setMessage("Expiry date cannot be before purchase date.");
      setMessageType("error");
      return;
    }

    const newFood = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      category,
      quantity: `${quantityNumber} ${unit}`,
      purchaseDate: purchase,
      expiryDate: expiry,
      notes: notes.trim(),
      status: "Active",
    };

    try {
      setIsSaving(true);

      await addFoodItem(newFood);

      setMessage("Food item saved successfully!");
      setMessageType("success");

      router.replace("/inventory");
    } catch (error) {
      console.error("Error adding food:", error);
      setMessage("Unable to save food. Please try again.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (type, event, selectedDate) => {
    if (Platform.OS === "android") {
      if (type === "purchase") {
        setShowPurchasePicker(false);
      } else {
        setShowExpiryPicker(false);
      }
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    if (type === "purchase") {
      setPurchaseDate(selectedDate);
    } else {
      setExpiryDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

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
            placeholder="YYYY-MM-DD"
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
            placeholder="YYYY-MM-DD"
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

        {/* Add Button */}
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
