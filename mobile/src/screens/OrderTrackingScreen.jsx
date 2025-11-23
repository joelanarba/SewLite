import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Header from '../components/Header';
import { StandardCard, BorderedCard } from '../components/presets/Cards';
import { PrimaryButton } from '../components/presets/Buttons';
import { PhoneInput } from '../components/presets/Inputs';
import api from '../services/api';
import socket from '../services/socket';
import { formatDate } from '../utils/date';

const OrderTrackingScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Listen for real-time updates
    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prevOrders => {
        const index = prevOrders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          const newOrders = [...prevOrders];
          newOrders[index] = updatedOrder;
          return newOrders;
        }
        // If it's a new order for this phone number, we might want to add it
        // But we need to check if it matches the searched phone number
        if (updatedOrder.customerPhone === phone) {
            return [updatedOrder, ...prevOrders];
        }
        return prevOrders;
      });
    });

    return () => {
      socket.off('orderUpdated');
    };
  }, [phone]);

  const handleTrack = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/orders/track', { phone });
      setOrders(response.data);
      setSearched(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to track orders. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-accent-600';
      case 'In Progress': return 'text-primary';
      case 'Ready': return 'text-green-600';
      case 'Picked Up': return 'text-gray-600';
      default: return 'text-primary';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Pending': return 'bg-accent/20';
      case 'In Progress': return 'bg-primary/10';
      case 'Ready': return 'bg-secondary';
      case 'Picked Up': return 'bg-gray-100';
      default: return 'bg-background';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'time-outline';
      case 'In Progress': return 'construct-outline';
      case 'Ready': return 'checkmark-circle-outline';
      case 'Picked Up': return 'cube-outline';
      default: return 'help-circle-outline';
    }
  };

  return (
    <Screen>
      <Header title="Track Order" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <StandardCard className="mb-6">
            <Text className="text-xs text-text-secondary uppercase tracking-widest mb-3 font-semibold">Enter Phone Number</Text>
            <View className="flex-row items-center space-x-3">
              <View className="flex-1">
                <PhoneInput
                  value={phone}
                  onChangeText={setPhone}
                  className="mb-0" // Override default margin
                />
              </View>
              <PrimaryButton 
                title="Track" 
                onPress={handleTrack}
                loading={loading}
                className="px-8 py-4"
                textClassName="text-sm"
              />
            </View>
          </StandardCard>

          {searched && orders.length === 0 && (
            <View className="items-center py-12">
              <View className="bg-secondary/30 rounded-full p-8 mb-4">
                <Ionicons name="search-outline" size={56} color="#3C4EB0" />
              </View>
              <Text className="text-text-secondary mt-2 text-center font-medium">No active orders found for this number.</Text>
            </View>
          )}

          {orders.map(order => (
            <BorderedCard key={order.id} className="mb-4 border-l-[6px]">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-xl font-bold text-primary">{order.item}</Text>
                  <Text className="text-xs text-text-secondary mt-1">Order #{order.id.slice(-6).toUpperCase()}</Text>
                </View>
                <View className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${getStatusBg(order.status)}`}>
                  <Ionicons name={getStatusIcon(order.status)} size={14} color={getStatusColor(order.status).replace('text-', '')} />
                  <Text className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View className="h-[1px] bg-border/50 my-4" />

              <View className="flex-row justify-between mb-5">
                <View>
                   <Text className="text-xs text-text-light uppercase tracking-widest mb-2 font-semibold">Pickup</Text>
                   <Text className="text-primary font-semibold text-base">{formatDate(order.pickupDate)}</Text>
                </View>
                <View>
                   <Text className="text-xs text-text-light uppercase tracking-widest mb-2 text-right font-semibold">Balance</Text>
                   <Text className="text-red-500 font-bold text-right text-base">${order.balance}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-4">
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden flex-row">
                    <View className={`h-full ${['Pending', 'In Progress', 'Ready', 'Picked Up'].indexOf(order.status) >= 0 ? 'bg-primary' : 'bg-transparent'} w-1/4`} />
                    <View className={`h-full ${['In Progress', 'Ready', 'Picked Up'].indexOf(order.status) >= 0 ? 'bg-primary' : 'bg-transparent'} w-1/4`} />
                    <View className={`h-full ${['Ready', 'Picked Up'].indexOf(order.status) >= 0 ? 'bg-primary' : 'bg-transparent'} w-1/4`} />
                    <View className={`h-full ${['Picked Up'].indexOf(order.status) >= 0 ? 'bg-primary' : 'bg-transparent'} w-1/4`} />
                </View>
                <View className="flex-row justify-between mt-1">
                    <Text className="text-[10px] text-text-light">Pending</Text>
                    <Text className="text-[10px] text-text-light">In Progress</Text>
                    <Text className="text-[10px] text-text-light">Ready</Text>
                    <Text className="text-[10px] text-text-light">Picked Up</Text>
                </View>
              </View>

              {order.notes ? (
                <View className="bg-background p-3 rounded-lg">
                  <Text className="text-xs text-text-secondary italic">"{order.notes}"</Text>
                </View>
              ) : null}
            </BorderedCard>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default OrderTrackingScreen;
