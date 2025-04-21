import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, Text, Alert, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { exportToExcel } from '../../scripts/exportToExcel';
import { getAllCustomers, getCustomerDeliveries, getDeliveriesByDate, getCustomerTotalAmount, getMilkPrice } from '../../src/db/database';

const MonthlySummariesScreen = () => {
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerDeliveries, setCustomerDeliveries] = useState([]);
//  const [summaries, setSummaries] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState({ buffalo: 0, cow: 0 });
  const [totalAmount, setTotalAmount] = useState({ buffalo: 0, cow: 0 });
  const [loading, setLoading] = useState(true);
  const [grandTotalPayment, setGrandTotalPayment] = useState(0);
  const [buffaloRate, setBuffaloRate] = useState(0);
  const [cowRate, setCowRate] = useState(0);
  const [deliveries, setDeliveries] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCustomers = async () => {
        try {
          const customerList = await getAllCustomers();
          setCustomers(customerList);
        } catch (error) {
          Alert.alert("Error", "Failed to fetch customers.");
        }
      };

      const fetchSummaries = async () => {
        setLoading(true);
        try {
          const result = await getDeliveriesByDate(month, year);

          let buffaloTotalQty = 0;
          let cowTotalQty = 0;
          let buffaloTotalAmount = 0;
          let cowTotalAmount = 0;

          const buffaloPrice = await getMilkPrice("buffalo") || 0;
          const cowPrice = await getMilkPrice("cow") || 0;

          setBuffaloRate(buffaloPrice);
          setCowRate(cowPrice);

          const filteredDeliveries = selectedCustomerId
            ? result.filter((delivery) => delivery.customer_id === selectedCustomerId)
            : result;

          filteredDeliveries.forEach(({ milk_details }) => {
            if (!milk_details) {
              console.warn("⚠ Missing milk_details in delivery data!");
              return;
            }

            const milkEntries = milk_details ? milk_details.split(", ") : [];
            milkEntries.forEach((entry) => {
              const [milkType, qty] = entry.split(" - ");
              const quantity = parseFloat(qty);

              if (milkType.toLowerCase() === "buffalo") {
                buffaloTotalQty += quantity;
                buffaloTotalAmount += quantity * buffaloPrice;
              } else if (milkType.toLowerCase() === "cow") {
                cowTotalQty += quantity;
                cowTotalAmount += quantity * cowPrice;
              }
            });
          });

          setTotalQuantity({ buffalo: buffaloTotalQty, cow: cowTotalQty });
          setTotalAmount({ buffalo: buffaloTotalAmount, cow: cowTotalAmount });
          setGrandTotalPayment(buffaloTotalAmount + cowTotalAmount);
          setDeliveries(filteredDeliveries);
        } catch (error) {
          console.error("Error processing milk quantities:", error);
          Alert.alert("Error", "Failed to process milk quantities.");
        } finally {
          setLoading(false);
        }
      };

      const fetchCustomerDeliveries = async () => {
        try {
          const result = await getDeliveriesByDate(month, year);
          setCustomerDeliveries(result); // ✅ Ensures ALL customer data is stored for exporting
        } catch (error) {
          console.error("Error fetching deliveries:", error);
        }
      };

      fetchCustomers();
      fetchSummaries(); // ✅ Ensures summaries refresh when the screen gains focus
      fetchCustomerDeliveries(); // ✅ Ensures customer deliveries refresh immediately too
    }, [selectedCustomerId, month, year])
  );

    const prepareExportData = () => {
      let groupedData = {};

      deliveries.forEach(({ customer_id, customerName, milk_details, total_quantity }) => {
        if (!groupedData[customer_id]) {
          groupedData[customer_id] = {
            customer_name: customerName,
            buffaloMilk: 0,
            buffaloRate: buffaloRate || 0,
            buffaloTotal: 0,
            cowMilk: 0,
            cowRate: cowRate || 0,
            cowTotal: 0,
            grandTotal: 0
          };
        }

        const milkEntries = milk_details ? milk_details.split(", ") : [];
        milkEntries.forEach(entry => {
          const [milkType, qty] = entry.split(" - ");
          const quantity = parseFloat(qty);

          if (milkType.toLowerCase() === "buffalo") {
            groupedData[customer_id].buffaloMilk += quantity;
            groupedData[customer_id].buffaloTotal += quantity * buffaloRate;
          } else if (milkType.toLowerCase() === "cow") {
            groupedData[customer_id].cowMilk += quantity;
            groupedData[customer_id].cowTotal += quantity * cowRate;
          }
        });

        groupedData[customer_id].grandTotal = groupedData[customer_id].buffaloTotal + groupedData[customer_id].cowTotal;
      });

      return Object.values(groupedData);
    };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Monthly Summaries</Text>
        <Button title="📤 Export Excel" onPress={() => exportToExcel(prepareExportData(), month, year)} color="#007BFF" />
      </View>

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

      {/* 🔹 Show Metrics for Selected Customers OR All Customers */}
      {(selectedCustomerId || selectedCustomerId === "") && (
        <View>
          <Text style={styles.totalQuantity}>🐃 Buffalo Milk Delivered: {totalQuantity.buffalo} L</Text>
          <Text style={styles.totalQuantity}>🐄 Cow Milk Delivered: {totalQuantity.cow} L</Text>

          {/* ✅ Buffalo Milk Calculation */}
          <Text style={styles.totalRate}>
            Buffalo Milk Rate: ₹{buffaloRate.toFixed(2)} per liter
          </Text>
          <Text style={styles.totalAmount}>
            🐃 Buffalo Milk: {totalQuantity.buffalo} × ₹{buffaloRate.toFixed(2)} = ₹{totalAmount.buffalo.toFixed(2)}
          </Text>

          {/* ✅ Cow Milk Calculation */}
          <Text style={styles.totalRate}>
            Cow Milk Rate: ₹{cowRate.toFixed(2)} per liter
          </Text>
          <Text style={styles.totalAmount}>
            🐄 Cow Milk: {totalQuantity.cow} × ₹{cowRate.toFixed(2)} = ₹{totalAmount.cow.toFixed(2)}
          </Text>

          <Text style={styles.grandTotal}>
            💰 Grand Total: ₹{grandTotalPayment.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f2f5' }, /* Soft background */
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },

  picker: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, padding: 5, elevation: 3 },

  grandTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#28a745',
    backgroundColor: '#f1f8f5',
    padding: 12,
    borderRadius: 10,
    marginVertical: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5
  },

  /* ✅ Enhanced total section */
  totalQuantity: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#007BFF', marginBottom: 8 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#28a745', marginBottom: 16 },

  /* ✅ Modernized delivery item styling */
  deliveryQuantity: { fontSize: 14, marginTop: 4 },

  /* ✅ Buffalo Milk - Blue Highlight */
  buffaloMilk: { backgroundColor: '#dbeafe', color: '#007BFF', fontSize: 16, fontWeight: 'bold' },

  totalRate: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ff9800', marginBottom: 8 },

  /* ✅ Cow Milk - Green Highlight */
  cowMilk: { backgroundColor: '#d1f7c4', color: '#28a745', fontSize: 16, fontWeight: 'bold' },

  /* ✅ Styled empty state */
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', fontStyle: 'italic', marginTop: 20 },
});

export default MonthlySummariesScreen;
