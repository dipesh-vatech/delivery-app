import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native'; // React Native's built-in hook
import { addDelivery, getAllCustomers } from '../../src/db/database';

const AddDeliveryScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [date, setDate] = useState(new Date());
  const [quantity, setQuantity] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const colorScheme = useColorScheme(); // Detect light or dark mode
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerList = await getAllCustomers();
        setCustomers(customerList);
      } catch (error) {
        console.error('Error fetching customers:', error);
        Alert.alert('Error', 'Failed to fetch customers. Please try again later.');
      }
    };

    fetchCustomers();
  }, []);

  const handleAddDelivery = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Error', 'Please select a customer.');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'Please select a date.');
      return;
    }
    if (parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Quantity must be greater than zero.');
      return;
    }

    try {
      await addDelivery(selectedCustomerId, date.toISOString().split('T')[0], parseFloat(quantity));
      Alert.alert('Success', 'Delivery added successfully!');
      setSelectedCustomerId('');
      setDate(new Date());
      setQuantity('');
    } catch (error) {
      console.error('Error adding delivery:', error);
      Alert.alert('Error', 'Failed to add delivery. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
    } else {
      console.log('Date selection cancelled');
    }
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      {customers.length === 0 ? (
        <Text style={[styles.noCustomersText, isDarkMode && styles.noCustomersTextDark]}>
          No customers available. Please add customers first.
        </Text>
      ) : (
        <Picker
          selectedValue={selectedCustomerId}
          onValueChange={(itemValue) => setSelectedCustomerId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Customer" value="" />
          {customers.map((customer) => (
            <Picker.Item key={customer.id} label={customer.name} value={customer.id} />
          ))}
        </Picker>
      )}

      <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={[styles.dateText, isDarkMode && styles.dateTextDark]}>
        Selected Date: {date.toDateString()}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Button title="Add Delivery" onPress={handleAddDelivery} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#000', // Default for light mode
  },
  dateTextDark: {
    color: '#fff', // Color for dark mode
  },
  noCustomersText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noCustomersTextDark: {
    color: 'orange', // Adjust color for better visibility in dark mode
  },
});

export default AddDeliveryScreen;
