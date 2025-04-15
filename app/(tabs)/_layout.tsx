import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? Colors.dark.tint : Colors.light.tint,
        tabBarInactiveTintColor: isDarkMode ? '#bbb' : '#888',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#222' : '#fff',
          borderTopColor: isDarkMode ? '#444' : '#ccc',
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="addCustomerScreen"
        options={{
          title: 'Add Customer',
          tabBarIcon: ({ color }) => <Ionicons name="person-add-outline" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="addDeliveryScreen"
        options={{
          title: 'Add Delivery',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="monthlySummariesScreen"
        options={{
          title: 'Summaries',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
              name="overviewDashboardScreen"
              options={{
                title: 'Dashboard',
                tabBarIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={28} color={color} />,
              }}
            />

      <Tabs.Screen
        name="customerListScreen"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => <Ionicons name="people-circle" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="customerProfileScreen"
        options={{ title: 'Profile', href: null }} // ✅ Hide it from tabs since it needs a customer ID
      />

    </Tabs>
  );
}
