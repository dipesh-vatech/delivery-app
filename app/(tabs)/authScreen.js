import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const AUTH_PASSWORD = "bharat321";  // ✅ Replace with your actual password

const AuthScreen = () => {
  const [password, setPassword] = useState('');
  const router = useRouter();

  // ✅ Clears password every time screen is revisited
  useFocusEffect(
    React.useCallback(() => {
      setPassword("");
    }, [])
  );

  const handleLogin = () => {
    if (password.trim().toLowerCase() === AUTH_PASSWORD.trim().toLowerCase()) {
      setPassword("");  // ✅ Clears password immediately after login
      router.push('/milkPriceUpdateScreen');
    } else {
      Alert.alert("Access Denied", "Incorrect password. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter Password to Update Milk Prices</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="none"  // ✅ Prevents autofill suggestion
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, width: '80%', textAlign: 'center' },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18 },
});

export default AuthScreen;
