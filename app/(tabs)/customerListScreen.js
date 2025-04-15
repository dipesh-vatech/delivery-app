import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllCustomers } from '../../src/db/database';
import { useRouter, useLocalSearchParams } from 'expo-router';

const CustomerListScreen = () => {
  const router = useRouter();
  const { customerId } = useLocalSearchParams(); // ✅ Get customerId passed from AddCustomerScreen
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || ''); // ✅ Default selection to new customer

  useFocusEffect(
    React.useCallback(() => {
      const fetchCustomers = async () => {
        try {
//          console.log("Fetching updated customer list for CustomerListScreen...");
          const customerList = await getAllCustomers();
          setCustomers(customerList);

          // ✅ Auto-select newly added customer if available
          if (customerId) {
            setSelectedCustomerId(customerId);
            router.push({ pathname: 'customerProfileScreen', params: { customerId } });
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch customers.');
        }
      };

      fetchCustomers();
    }, [customerId]) // ✅ Dependency ensures update after new customer is added
  );

  const handleSelectCustomer = (customerId) => {
    if (customerId) {
      router.push({ pathname: 'customerProfileScreen', params: { customerId } });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select a Customer</Text>

      <Picker
        selectedValue={selectedCustomerId}
        onValueChange={(itemValue) => {
          setSelectedCustomerId(itemValue);
          handleSelectCustomer(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Choose a Customer" value="" />
        {customers.map((customer) => (
          <Picker.Item key={customer.id} label={customer.name} value={customer.id} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
});

export default CustomerListScreen;
