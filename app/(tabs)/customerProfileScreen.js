import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { getCustomerDetails, getCustomerOrderHistory, updateCustomer, deleteCustomer } from '../../src/db/database';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const CustomerProfileScreen = () => {
  const router = useRouter();
  const { customerId } = useLocalSearchParams();
  const isDarkMode = useColorScheme() === 'dark';

  const [customer, setCustomer] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!customerId) {
      Alert.alert('Error', 'Customer ID not found.');
      router.back();
      return;
    }

    const fetchCustomerData = async () => {
      try {
        const customerData = await getCustomerDetails(customerId);
        if (!customerData) {
          Alert.alert('Error', 'Customer not found.');
          router.back();
          return;
        }

        setCustomer(customerData);
        setName(customerData.name);
        setAddress(customerData.address);
        setContact(customerData.contact);

      } catch (error) {
        Alert.alert('Error', 'Failed to load customer details.');
      }
    };

    fetchCustomerData();
  }, [customerId]);

  const handleUpdateCustomer = async () => {
    try {
      await updateCustomer(customerId, name.trim(), address.trim(), contact.trim());
      Alert.alert('Success', 'Customer updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not update customer.');
    }
  };

  const handleDeleteCustomer = async () => {
    if (confirmText !== 'DELETE') {
      Alert.alert('Error', 'You must type "DELETE" to confirm.');
      return;
    }

    try {
      await deleteCustomer(customerId);
      Alert.alert('Deleted', 'Customer removed successfully.');
      setShowModal(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not delete customer.');
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {customer && (
        <>
          <Text style={[styles.heading, isDarkMode && styles.headingDark]}>{customer.name}</Text>
          <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
          <TextInput style={styles.input} placeholder="Contact" value={contact} onChangeText={setContact} keyboardType="phone-pad" />

          {/* ✅ Restored Update Button */}
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateCustomer}>
            <Ionicons name="pencil" size={24} color="white" />
            <Text style={styles.buttonText}>Update Customer</Text>
          </TouchableOpacity>

          {/* ✅ Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={() => setShowModal(true)}>
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.buttonText}>Delete Customer</Text>
          </TouchableOpacity>

          {/* ✅ Modal for Delete Confirmation */}
          <Modal animationType="slide" transparent={true} visible={showModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>Type "DELETE" to confirm</Text>
                <TextInput style={styles.input} placeholder="DELETE" value={confirmText} onChangeText={setConfirmText} />
                <TouchableOpacity style={styles.confirmButton} onPress={handleDeleteCustomer}>
                  <Text style={styles.buttonText}>Confirm Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  darkContainer: { backgroundColor: '#222' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#333' },
  headingDark: { color: '#fff' },
  subHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#444' },
  subHeadingDark: { color: '#bbb' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: '#fff', fontSize: 16, textAlign: 'center' },
  updateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007BFF', padding: 15, borderRadius: 8, justifyContent: 'center', marginBottom: 10 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dc3545', padding: 15, borderRadius: 8, justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  deliveryItem: { padding: 10, backgroundColor: '#e3e3e3', marginVertical: 5, borderRadius: 5 },
  deliveryText: { fontSize: 16, color: '#333' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  confirmButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 8, width: '80%', alignItems: 'center' },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#007BFF', fontWeight: 'bold' },
});

export default CustomerProfileScreen;
