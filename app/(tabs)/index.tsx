import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Icons for better UI

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Milk Delivery App</Text>

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    width: '80%',
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
