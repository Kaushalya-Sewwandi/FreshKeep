
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
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
          <Text style={styles.welcomeTitle}>
            Manage your food smarter!
          </Text>
          <Text style={styles.welcomeText}>
            Keep track of your food and reduce waste.
          </Text>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Food Overview</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🥗</Text>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🍎</Text>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Fresh Items</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚠️</Text>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Expired Items</Text>
          </View>
        </View>

        {/* Recent Items */}
        <Text style={styles.sectionTitle}>Recent Food Items</Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No food items yet</Text>
          <Text style={styles.emptyText}>
            Start adding your food items to FreshKeep!
          </Text>
        </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#71816D',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#245C36',
  },
  profile: {
    fontSize: 30,
    backgroundColor: '#E3F0E3',
    padding: 10,
    borderRadius: 30,
  },
  welcomeCard: {
    backgroundColor: '#286B40',
    margin: 20,
    marginTop: 5,
    padding: 25,
    borderRadius: 18,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#E4F1E4',
    fontSize: 14,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#245C36',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  statIcon: {
    fontSize: 27,
  },
  statNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#286B40',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#71816D',
    marginTop: 5,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#245C36',
    marginTop: 10,
  },
  emptyText: {
    color: '#71816D',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
});
