
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const foodItems = [
  {
    id: '1',
    name: 'Fresh Apples',
    category: 'Fruits',
    quantity: '5 pieces',
    expiry: 'Nov 10, 2026',
    icon: '🍎',
  },
  {
    id: '2',
    name: 'Fresh Milk',
    category: 'Dairy',
    quantity: '1 litre',
    expiry: 'Nov 8, 2026',
    icon: '🥛',
  },
  {
    id: '3',
    name: 'Carrots',
    category: 'Vegetables',
    quantity: '500 g',
    expiry: 'Nov 15, 2026',
    icon: '🥕',
  },
  {
    id: '4',
    name: 'Bread',
    category: 'Bakery',
    quantity: '1 pack',
    expiry: 'Nov 9, 2026',
    icon: '🍞',
  },
  {
    id: '5',
    name: 'Bananas',
    category: 'Fruits',
    quantity: '6 pieces',
    expiry: 'Nov 12, 2026',
    icon: '🍌',
  },
];

const categories = [
  'All',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
];

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Food Inventory 🥬</Text>
          <Text style={styles.subtitle}>
            Manage all your food items in one place.
          </Text>
        </View>

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
                selectedCategory === category &&
                  styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category &&
                    styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>All Food Items</Text>
          <Text style={styles.itemCount}>
            {filteredItems.length} items
          </Text>
        </View>

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.foodCard}>
              <View style={styles.foodIcon}>
                <Text style={styles.foodEmoji}>{item.icon}</Text>
              </View>

              <View style={styles.foodDetails}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCategory}>
                  {item.category}
                </Text>
                <Text style={styles.foodInfo}>
                  Quantity: {item.quantity}
                </Text>
                <Text style={styles.expiryText}>
                  Expiry: {item.expiry}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>
              No food items found
            </Text>
            <Text style={styles.emptyText}>
              Try another search or category.
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
    backgroundColor: '#F5F8F2',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#245C36',
  },
  subtitle: {
    fontSize: 14,
    color: '#71816D',
    marginTop: 7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#245C36',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#245C36',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#286B40',
  },
  categoryText: {
    color: '#71816D',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 20,
  },
  itemCount: {
    color: '#71816D',
    fontSize: 13,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  foodIcon: {
    width: 55,
    height: 55,
    backgroundColor: '#EAF3E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: 'bold',
    color: '#245C36',
  },
  foodCategory: {
    fontSize: 12,
    color: '#71816D',
    marginTop: 3,
  },
  foodInfo: {
    fontSize: 12,
    color: '#526052',
    marginTop: 5,
  },
  expiryText: {
    fontSize: 12,
    color: '#D18A32',
    marginTop: 3,
  },
  arrow: {
    fontSize: 28,
    color: '#71816D',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 35,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#245C36',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#71816D',
    marginTop: 5,
  },
});
