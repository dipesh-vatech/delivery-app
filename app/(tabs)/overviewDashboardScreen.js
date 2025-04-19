import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getTotalDeliveriesForMonth, getTotalQuantityForMonth, getTotalCustomers, searchDeliveries, getCustomerNames } from '../../src/db/database';
import { Ionicons } from '@expo/vector-icons';

const OverviewDashboardScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [customerNames, setCustomerNames] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [buffaloQuantity, setBuffaloQuantity] = useState(0);  // ✅ Separate Buffalo milk quantity
  const [cowQuantity, setCowQuantity] = useState(0);  // ✅ Separate Cow milk quantity
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchOverviewData = async () => {
        setLoading(true);
        try {
          const deliveriesCount = await getTotalDeliveriesForMonth(selectedMonth.toString().padStart(2, '0'), selectedYear);
          const { buffaloMilk, cowMilk } = await getTotalQuantityForMonth(selectedMonth.toString().padStart(2, '0'), selectedYear);
          const customersCount = await getTotalCustomers();
          const names = await getCustomerNames();

          setTotalDeliveries(deliveriesCount);
          setBuffaloQuantity(buffaloMilk);  // ✅ Set Buffalo quantity
          setCowQuantity(cowMilk);  // ✅ Set Cow quantity
          setTotalCustomers(customersCount);
          setCustomerNames(names);
        } catch (error) {
          console.error('Error fetching overview data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOverviewData();
    }, [selectedMonth, selectedYear])
  );

  const handleSearch = async (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setSearchResults([]);
    setSearchLoading(true);

    try {
      if (newSearchTerm.trim() === '') {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      const results = await searchDeliveries(newSearchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching deliveries:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredSuggestions = customerNames.filter(name =>
    name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Dashboard Overview</Text>

      <Picker selectedValue={selectedMonth} onValueChange={setSelectedMonth} style={styles.picker}>
        {Array.from({ length: 12 }, (_, index) => (
          <Picker.Item key={index + 1} label={`Month ${index + 1}`} value={index + 1} />
        ))}
      </Picker>

      <Picker selectedValue={selectedYear} onValueChange={setSelectedYear} style={styles.picker}>
        {Array.from({ length: 5 }, (_, index) => (
          <Picker.Item key={index} label={`Year ${new Date().getFullYear() - index}`} value={(new Date().getFullYear() - index).toString()} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <View>
          <Text style={styles.metric}>
            <Ionicons name="people-outline" size={24} color="#ff9800" /> Total Customers: {totalCustomers}
          </Text>
          <Text style={styles.metric}>
            <Ionicons name="cart-outline" size={24} color="#007BFF" /> Total Deliveries: {totalDeliveries}
          </Text>
          {/* ✅ Separated Buffalo and Cow Milk Totals */}
          <Text style={styles.metric}>
            <Ionicons name="cube-outline" size={24} color="#007BFF" /> 🐃 Buffalo Milk: {buffaloQuantity} L
          </Text>
          <Text style={styles.metric}>
            <Ionicons name="cube-outline" size={24} color="#28a745" /> 🐄 Cow Milk: {cowQuantity} L
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Search by Date (YYYY-MM-DD) or Name"
        value={searchTerm}
        onChangeText={handleSearch}
      />

      {searchTerm.length > 0 && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSearch(item)}>
              <Text style={styles.suggestion}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {searchLoading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.customer_name}-${item.date}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.deliveryItem}>
              <Text>Date: {item.date}</Text>
              <Text>Customer: {item.customer_name}</Text>
              <Text>Quantity: {item.quantity}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  picker: { marginBottom: 10, backgroundColor: '#fff' },
  input: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#ccc', marginBottom: 10 },
  suggestion: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  metric: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  deliveryItem: { padding: 10, backgroundColor: '#e3e3e3', marginVertical: 5, borderRadius: 5 },
});

export default OverviewDashboardScreen;
