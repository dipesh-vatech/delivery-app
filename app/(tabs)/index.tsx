import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getMilkPrice } from '../../src/db/database'; // ✅ Import milk price fetch function

export default function HomeScreen() {
  const router = useRouter();
  const [buffaloPrice, setBuffaloPrice] = useState(0);
  const [cowPrice, setCowPrice] = useState(0);

  // ✅ Fetch milk prices when screen is loaded
  useFocusEffect(
    React.useCallback(() => {
      const fetchPrices = async () => {
        try {
          const buffaloPrice = await getMilkPrice("buffalo");
          const cowPrice = await getMilkPrice("cow");

          setBuffaloPrice(buffaloPrice);
          setCowPrice(cowPrice);
        } catch (error) {
          console.error("Failed to fetch milk prices:", error);
        }
      };

      fetchPrices();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Milk Delivery App</Text>

      {/* ✅ Display Milk Prices at the Top */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>🐃 Buffalo Milk: ₹{buffaloPrice} per liter</Text>
        <Text style={styles.priceText}>🐄 Cow Milk: ₹{cowPrice} per liter</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('addCustomerScreen')}>
        <Ionicons name="person-add" size={24} color="white" />
        <Text style={styles.buttonText}>Add Customer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('addDeliveryScreen')}>
        <Ionicons name="cube-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Add Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('monthlySummariesScreen')}>
        <Ionicons name="calendar-outline" size={24} color="white" />
        <Text style={styles.buttonText}>View Monthly Summaries</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  /* ✅ Styled Milk Prices Display */
  priceContainer: { padding: 16, backgroundColor: '#f0f0f0', borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007BFF', padding: 15, width: '80%', borderRadius: 10, marginBottom: 15, justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default HomeScreen;
