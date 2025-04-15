import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { addCustomer } from '../../src/db/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // ✅ Import useRouter()

const AddCustomerScreen = () => {
  const router = useRouter(); // ✅ Initialize router

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');

  const handleAddCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Address is required.');
      return;
    }

    if (!contact.trim()) {
      Alert.alert('Error', 'Contact number is required.');
      return;
    }

    try {
      const customerId = await addCustomer(name.trim(), address.trim(), contact.trim());

      if (!customerId) {
        throw new Error('Customer ID is undefined.');
      }

      Alert.alert('Success', 'Customer added successfully!');

      // ✅ Navigate to Home Screen after success
      router.push('/');

      // ✅ Reset form fields for next customer
      setName('');
      setAddress('');
      setContact('');
    } catch (error) {
      console.error('Error adding customer:', error);
      Alert.alert('Error', 'Could not add customer. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.heading}>Add New Customer</Text>

      <TextInput style={styles.input} placeholder="Customer Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Contact Number" value={contact} onChangeText={setContact} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.button} onPress={handleAddCustomer}>
        <Ionicons name="person-add" size={24} color="white" />
        <Text style={styles.buttonText}>Add Customer</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: '#fff', fontSize: 16 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007BFF', padding: 15, borderRadius: 8, justifyContent: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default AddCustomerScreen;
