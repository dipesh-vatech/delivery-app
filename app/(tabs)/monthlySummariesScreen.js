import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllCustomers, getCustomerDeliveries, getDeliveriesByDate } from '../../src/db/database';

const MonthlySummariesScreen = () => {
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0); // ✅ Added state for total quantity
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCustomers = async () => {
        try {
//          console.log("Fetching updated customer list for MonthlySummariesScreen...");
          const customerList = await getAllCustomers();
          setCustomers(customerList);
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch customers.');
        }
      };

      fetchCustomers();
    }, [])
  );

  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      try {
        const result = selectedCustomerId
          ? await getCustomerDeliveries(selectedCustomerId, month, year)
          : await getDeliveriesByDate(month, year);
        setSummaries(result);

        // ✅ Calculate total quantity delivered
        const totalDelivered = result.reduce((sum, item) => sum + item.total_quantity, 0);
        setTotalQuantity(totalDelivered); // Store total quantity
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch summaries.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, [selectedCustomerId, month, year]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Monthly Summaries</Text>

      <Picker selectedValue={selectedCustomerId} onValueChange={setSelectedCustomerId} style={styles.picker}>
        <Picker.Item label="View All Customers" value="" />
        {customers.map((customer) => (
          <Picker.Item key={customer.id} label={customer.name} value={customer.id} />
        ))}
      </Picker>

      <Picker selectedValue={month} onValueChange={setMonth} style={styles.picker}>
        {Array.from({ length: 12 }, (_, index) => (
          <Picker.Item key={index + 1} label={`Month ${index + 1}`} value={(index + 1).toString().padStart(2, '0')} />
        ))}
      </Picker>

      <Picker selectedValue={year} onValueChange={setYear} style={styles.picker}>
        {Array.from({ length: 5 }, (_, index) => (
          <Picker.Item key={index} label={`Year ${new Date().getFullYear() - index}`} value={(new Date().getFullYear() - index).toString()} />
        ))}
      </Picker>

      {selectedCustomerId && (
        <Text style={styles.totalQuantity}>Total Delivered: {totalQuantity} units</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item) => `${item.customer_id}-${item.date}`}
          renderItem={({ item }) => (
            <View style={styles.summaryItem}>
              <Text style={styles.deliveryDate}>Date: {item.date}</Text>
              <Text style={styles.deliveryQuantity}>Quantity: {item.total_quantity}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No data available.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  picker: { marginBottom: 10, backgroundColor: '#fff' },
  totalQuantity: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#007BFF', marginBottom: 10 },
  summaryItem: { padding: 10, backgroundColor: '#e3e3e3', marginVertical: 5, borderRadius: 5 },
  deliveryDate: { fontSize: 16, fontWeight: 'bold' },
  deliveryQuantity: { fontSize: 14 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
});

export default MonthlySummariesScreen;
