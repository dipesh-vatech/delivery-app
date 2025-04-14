import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllCustomers, getCustomerDeliveries, getDeliveriesByDate } from '../../src/db/database';

const MonthlySummariesScreen = () => {
  const [month, setMonth] = useState('01'); // Default: January
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [summaries, setSummaries] = useState([]);

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

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        if (selectedCustomerId) {
          const result = await getCustomerDeliveries(selectedCustomerId, month, year);
          setSummaries(result);
        } else {
          const result = await getDeliveriesByDate(month, year);
          setSummaries(result);
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
        Alert.alert('Error', 'Failed to fetch summaries. Please try again later.');
      }
    };

    fetchSummaries();
  }, [selectedCustomerId, month, year]);

  const renderItem = ({ item }) => (
    <View style={styles.summaryItem}>
      <Text style={styles.deliveryDetails}>
        Date: {item.date}, Quantity: {item.total_quantity}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Customer Picker */}
      <Picker
        selectedValue={selectedCustomerId}
        onValueChange={(itemValue) => setSelectedCustomerId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="View All Customers" value="" />
        {customers.map((customer) => (
          <Picker.Item key={customer.id} label={customer.name} value={customer.id} />
        ))}
      </Picker>

      {/* Month Picker */}
      <Picker
        selectedValue={month}
        onValueChange={(itemValue) => setMonth(itemValue)}
        style={styles.picker}
      >
        {Array.from({ length: 12 }, (_, index) => {
          const monthValue = (index + 1).toString().padStart(2, '0');
          return <Picker.Item key={monthValue} label={`Month: ${monthValue}`} value={monthValue} />;
        })}
      </Picker>

      {/* Year Picker */}
      <Picker
        selectedValue={year}
        onValueChange={(itemValue) => setYear(itemValue)}
        style={styles.picker}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const yearValue = (new Date().getFullYear() - index).toString();
          return <Picker.Item key={yearValue} label={`Year: ${yearValue}`} value={yearValue} />;
        })}
      </Picker>

      {/* List of Summaries */}
      <FlatList
        data={summaries}
        keyExtractor={(item) => `${item.customer_id}-${item.date}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {selectedCustomerId
              ? 'No deliveries found for the selected customer.'
              : 'No deliveries found for this period.'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  picker: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  summaryItem: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
  },
  deliveryDetails: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default MonthlySummariesScreen;
