import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { createTables, verifyTables } from '../src/db/database';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...');
        await createTables(); // Ensure tables are created

        const tables = await verifyTables(); // Verify existing tables
        if (!tables || tables.length === 0) {
          console.warn('No tables found in the database. Ensure createTables executed properly.');
        } else {
          console.log('Verified tables:', tables);
        }
      } catch (error) {
        console.error('Error during database initialization:', error);
      } finally {
        SplashScreen.hideAsync(); // Ensure the splash screen always hides
      }
    };

    if (loaded) {
      initializeDatabase(); // Call database initialization logic
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Main Tab Navigation (manages all screens) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Not-found screen */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
