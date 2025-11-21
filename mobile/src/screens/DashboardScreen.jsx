import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCustomers } from '../services/api';
import { isDateToday } from '../utils/date';
import CustomerCard from '../components/CustomerCard';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const upcomingPickups = customers
    .filter(c => c.pickupDate && new Date(c.pickupDate) > new Date())
    .slice(0, 3);

  const todaysReminders = customers.filter(c => 
    isDateToday(c.pickupDate) || isDateToday(c.fittingDate)
  );

  return (
    <Screen>
      <Header title="Dashboard" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#3C4EB0" 
          />
        }
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-text-secondary text-sm uppercase tracking-widest font-semibold">
            Overview
          </Text>
          <Button 
            title="Track" 
            variant="outline" 
            onPress={() => navigation.navigate('OrderTracking')}
            className="px-6"
            textClassName="text-sm"
          />
        </View>

        <View className="flex-row justify-between mb-8">
          <Card className="w-[48%] bg-primary">
            <View className="items-center py-3">
              <Ionicons name="people" size={32} color="#F2C76E" />
              <Text className="text-4xl font-bold text-white mt-3">
                {customers.length}
              </Text>
              <Text className="text-xs text-accent/80 uppercase tracking-widest mt-2 font-semibold">
                Total Clients
              </Text>
            </View>
          </Card>
          <Card className="w-[48%] bg-secondary">
            <View className="items-center py-3">
              <Ionicons name="notifications" size={32} color="#3C4EB0" />
              <Text className="text-4xl font-bold text-primary mt-3">
                {todaysReminders.length}
              </Text>
              <Text className="text-xs text-primary uppercase tracking-widest mt-2 font-semibold">
                Today's Actions
              </Text>
            </View>
          </Card>
        </View>

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-primary uppercase tracking-tight">
              Upcoming Pickups
            </Text>
            <Ionicons name="calendar" size={22} color="#F2C76E" />
          </View>
          {upcomingPickups.length > 0 ? (
            upcomingPickups.map(c => <CustomerCard key={c.id} customer={c} />)
          ) : (
            <Card className="bg-background/50">
              <Text className="text-text-secondary italic text-center py-6">
                No upcoming pickups scheduled.
              </Text>
            </Card>
          )}
        </View>

        <View className="mb-24">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-primary uppercase tracking-tight">
              Recent Clients
            </Text>
            <Ionicons name="time" size={22} color="#3C4EB0" />
          </View>
          {customers.slice(0, 5).map(c => <CustomerCard key={c.id} customer={c} />)}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default DashboardScreen;
