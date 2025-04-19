import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMilkPrice, setMilkPrice } from '../../src/db/database'; // ✅ Import price management functions

const MilkPriceUpdateScreen = () => { // ✅ Changed "export default function" to just function definition
  const router = useRouter();

  // ✅ Milk Price States
  const [buffaloPrice, setBuffaloPriceState] = useState('');
  const [cowPrice, setCowPriceState] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const buffalo = await getMilkPrice('buffalo');
        const cow = await getMilkPrice('cow');
        setBuffaloPriceState(buffalo.toString());
        setCowPriceState(cow.toString());
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch milk prices.');
      }
    };
    fetchPrices();
  }, []);

  const handleUpdatePrices = async () => {
    try {
      await setMilkPrice('buffalo', parseFloat(buffaloPrice));
      await setMilkPrice('cow', parseFloat(cowPrice));
      Alert.alert('Success', 'Milk prices updated successfully!');
      router.push('/'); // ✅ Navigate back to Home after saving
    } catch (error) {
      Alert.alert('Error', 'Failed to update prices.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Update Milk Prices</Text>

      <Text style={styles.label}>Buffalo Milk Price (INR per liter):</Text>
      <TextInput
        style={styles.input}
        placeholder="Buffalo Milk Price"
        value={buffaloPrice}
        onChangeText={setBuffaloPriceState}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Cow Milk Price (INR per liter):</Text>
      <TextInput
        style={styles.input}
        placeholder="Cow Milk Price"
        value={cowPrice}
        onChangeText={setCowPriceState}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdatePrices}>
        <Ionicons name="save-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Save Prices</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: '#fff', fontSize: 16, width: '80%', textAlign: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#28a745', padding: 15, width: '80%', borderRadius: 10, justifyContent: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default MilkPriceUpdateScreen; // ✅ Keep only one default export
