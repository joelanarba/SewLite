import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import CustomerListScreen from './src/screens/CustomerListScreen';
import CustomerAddScreen from './src/screens/CustomerAddScreen';
import CustomerViewScreen from './src/screens/CustomerViewScreen';
import CustomerEditScreen from './src/screens/CustomerEditScreen';

import OrderTrackingScreen from './src/screens/OrderTrackingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3C4EB0',
        tabBarInactiveTintColor: '#9CA3AF',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Customers" component={CustomerListScreen} />
      <Tab.Screen name="Add" component={CustomerAddScreen} options={{ title: 'New Customer' }} />
    </Tab.Navigator>
  );
}

import { AppProviders } from './src/context/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen name="CustomerView" component={CustomerViewScreen} options={{ title: 'Customer Details' }} />
          <Stack.Screen name="CustomerEdit" component={CustomerEditScreen} options={{ title: 'Edit Customer' }} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track Order' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProviders>
  );
}
