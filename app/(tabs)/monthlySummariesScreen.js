import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllCustomers, getCustomerDeliveries, getDeliveriesByDate, getCustomerTotalAmount } from '../../src/db/database';

const MonthlySummariesScreen = () => {
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCustomers = async () => {
        try {
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

        const totalDelivered = result.reduce((sum, item) => sum + item.total_quantity, 0);
        setTotalQuantity(totalDelivered);

        if (selectedCustomerId) {
          const totalCost = await getCustomerTotalAmount(selectedCustomerId, month, year);
          setTotalAmount(totalCost);
        }
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
        <View>
          <Text style={styles.totalQuantity}>Total Delivered: {totalQuantity} L</Text>
          <Text style={styles.totalAmount}>Total Payment: ₹{totalAmount}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item, index) => `${item.milk_type}-${item.date}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.summaryItem}>
              <Text style={styles.deliveryDate}>📅 Date: {item.date}</Text>
              <Text style={styles.totalQuantity}>⚖ Total Quantity: {item.total_quantity} L</Text>
              <Text style={[styles.deliveryMilkDetails, item.milk_details ? (item.milk_details.includes('Buffalo') ? styles.buffaloMilk : styles.cowMilk) : null]}>
                🥛 {item.milk_details || 'No milk details available'}
              </Text>
            </View>
          )}

          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No deliveries found for this customer in {month}/{year}.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f2f5' }, /* Soft background */
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },

  picker: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, padding: 5, elevation: 3 },

  /* ✅ Enhanced total section */
  totalQuantity: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#007BFF', marginBottom: 8 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#28a745', marginBottom: 16 },

  /* ✅ Modernized delivery item styling */
  summaryItem: { padding: 12, backgroundColor: '#ffffff', elevation: 3, marginVertical: 6, borderRadius: 10, shadowColor: '#ccc', shadowOpacity: 0.3, shadowRadius: 5 },
  deliveryDate: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  deliveryQuantity: { fontSize: 14, marginTop: 4 },

  /* ✅ Improved styling for milk details */
  deliveryMilkDetails: { fontSize: 16, fontWeight: 'bold', marginTop: 6, padding: 8, borderRadius: 8, textAlign: 'center' },

  /* ✅ Buffalo Milk - Blue Highlight */
  buffaloMilk: { backgroundColor: '#dbeafe', color: '#007BFF', fontSize: 16, fontWeight: 'bold' },

  /* ✅ Cow Milk - Green Highlight */
  cowMilk: { backgroundColor: '#d1f7c4', color: '#28a745', fontSize: 16, fontWeight: 'bold' },

  /* ✅ Styled empty state */
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', fontStyle: 'italic', marginTop: 20 },
});

export default MonthlySummariesScreen;
