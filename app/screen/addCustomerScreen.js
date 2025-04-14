import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { addCustomer, verifySchema, verifyTables } from '../../src/db/database';

const AddCustomerScreen = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    // Verify schema on screen load
    const checkSchema = async () => {
      const schema = await verifySchema();
      console.log('Schema details:', schema);
    };

    checkSchema();
  }, []);

  const handleAddCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    try {
      await addCustomer(name.trim(), address.trim(), contact.trim());
      Alert.alert('Success', 'Customer added successfully!');
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
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        onFocus={() => console.log('Name field focused!')}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />
      <Button title="Add Customer" onPress={handleAddCustomer} />
      <Button title="Verify Schema" onPress={verifySchema} />
       <Button title="Verify Table" onPress={verifyTables} />{/* Test the schema */}
    </KeyboardAvoidingView>
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
});

export default AddCustomerScreen;
