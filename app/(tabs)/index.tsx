import React from 'react';
import { StyleSheet, Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button title="Add Customer" onPress={() => router.push('screen/addCustomerScreen')} />
      <Button title="Add Delivery" onPress={() => router.push('screen/addDeliveryScreen')} />
      <Button
        title="View Monthly Summaries"
        onPress={() => router.push('screen/monthlySummariesScreen')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
