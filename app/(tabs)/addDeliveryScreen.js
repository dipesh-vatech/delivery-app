import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDelivery, getAllCustomers } from '../../src/db/database';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const AddDeliveryScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [date, setDate] = useState(new Date());
  const [quantity, setQuantity] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerList = await getAllCustomers();
        setCustomers(customerList);
      } catch (error) {
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
      Alert.alert('Error', 'Failed to add delivery. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      setDate(selectedDate || date);
    }
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Text style={[styles.heading, isDarkMode && styles.headingDark]}>Add New Delivery</Text>

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

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={24} color="white" />
        <Text style={styles.dateButtonText}>Select Date</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
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

      <TouchableOpacity style={styles.button} onPress={handleAddDelivery}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.buttonText}>Add Delivery</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#222',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  headingDark: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  dateTextDark: {
    color: '#fff',
  },
  noCustomersText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noCustomersTextDark: {
    color: 'orange',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AddDeliveryScreen;
