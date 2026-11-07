import AsyncStorage from "@react-native-async-storage/async-storage";

const FOOD_STORAGE_KEY = "@freshkeep_food_items";

// Get all saved food items
export const getFoodItems = async () => {
  try {
    const storedItems = await AsyncStorage.getItem(FOOD_STORAGE_KEY);

    return storedItems ? JSON.parse(storedItems) : [];
  } catch (error) {
    console.error("Error loading food items:", error);
    throw error;
  }
};

// Save a new food item
export const addFoodItem = async (newFood) => {
  try {
    const existingItems = await getFoodItems();

    const updatedItems = [...existingItems, newFood];

    await AsyncStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(updatedItems));

    return updatedItems;
  } catch (error) {
    console.error("Error saving food item:", error);
    throw error;
  }
};
