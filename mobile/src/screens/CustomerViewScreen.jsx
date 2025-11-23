import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/date';
import Screen from '../components/Screen';
import Header from '../components/Header';
import { StandardCard, BorderedCard, GhostCard } from '../components/presets/Cards';
import { PrimaryButton, GhostButton, OutlineButton } from '../components/presets/Buttons';
import { TextInput, NumberInput, TextArea } from '../components/presets/Inputs';
import DatePickerInput from '../components/DatePickerInput';

const CustomerViewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { customers, getCustomerOrders, addOrder, updateOrder, deleteCustomer } = useData();
  
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    item: '',
    price: '',
    deposit: '',
    pickupDate: new Date().toISOString().split('T')[0],
    fittingDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const foundCustomer = customers.find(c => c.id === id);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      loadOrders();
    } else {
      // If not found in context (e.g. deep link), maybe fetch or go back
      // For now, assume it's in the list or we go back
      navigation.goBack();
    }
  }, [id, customers]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await getCustomerOrders(id);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.item || !newOrder.price) {
      Alert.alert('Error', 'Item and Price are required');
      return;
    }

    setCreating(true);
    try {
      await addOrder({
        customerId: id,
        customerName: customer.name,
        customerPhone: customer.phone,
        ...newOrder,
        // Dates are already strings YYYY-MM-DD from DatePickerInput or init
        pickupDate: newOrder.pickupDate, 
        fittingDate: newOrder.fittingDate,
      });
      setShowCreateModal(false);
      setNewOrder({
        item: '',
        price: '',
        deposit: '',
        pickupDate: new Date().toISOString().split('T')[0],
        fittingDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadOrders(); // Reload to see new order
      Alert.alert('Success', 'Order created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const statuses = ['Pending', 'In Progress', 'Ready', 'Picked Up'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    // Optimistic update - update UI immediately
    const previousOrders = orders;
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

    try {
      await updateOrder(orderId, { status: nextStatus });
    } catch (error) {
      // Revert on error
      setOrders(previousOrders);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this customer?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteCustomer(id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete customer');
          }
        }
      }
    ]);
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

  if (loading) return (
    <Screen className="justify-center items-center">
      <ActivityIndicator size="large" color="#3C4EB0" />
    </Screen>
  );
  
  if (!customer) return null;

  return (
    <Screen>
      <Header 
        title="Client Profile" 
        showBack 
        rightAction={() => navigation.navigate('CustomerEdit', { customer })}
        rightIcon="create-outline"
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <BorderedCard className="mb-6 border-t-[6px] border-t-accent">
          <View className="items-center py-5">
            <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-accent">
              <Text className="text-4xl font-bold text-primary">
                {customer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-primary mb-2 text-center">{customer.name}</Text>
            <Text className="text-base text-text-secondary mb-5 tracking-wide font-medium">{customer.phone}</Text>
            
            <View className="w-full border-t border-border/50 pt-5 flex-row justify-between px-6">
               <View className="items-center">
                 <Text className="text-xs text-text-light uppercase tracking-widest mb-2 font-semibold">Balance</Text>
                 <Text className="text-xl font-bold text-red-500">${customer.balance || '0'}</Text>
               </View>
               <View className="items-center">
                 <Text className="text-xs text-text-light uppercase tracking-widest mb-2 font-semibold">Status</Text>
                 <Text className="text-xl font-bold text-primary">{customer.item ? 'Active' : 'Inactive'}</Text>
               </View>
            </View>
          </View>
        </BorderedCard>

        <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-primary uppercase tracking-tight">Orders</Text>
            <OutlineButton 
                title="New Order" 
                onPress={() => setShowCreateModal(true)}
                className="px-6"
                textClassName="text-sm"
            />
        </View>

        {error ? (
            <GhostCard className="mb-4 border-l-4 border-l-red-500">
                <View className="items-center py-4">
                    <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
                    <Text className="text-red-500 font-medium mt-2 mb-4 text-center">{error}</Text>
                    <PrimaryButton 
                        title="Retry" 
                        onPress={loadOrders} 
                        className="px-6 h-10"
                        textClassName="text-sm"
                    />
                </View>
            </GhostCard>
        ) : (
            <>
                {orders.map(order => (
                    <StandardCard key={order.id} className="mb-4">
                        <View className="flex-row justify-between items-start mb-3">
                            <View>
                                <Text className="text-xl font-bold text-primary">{order.item}</Text>
                                <Text className="text-xs text-text-secondary mt-1">#{order.id.slice(-6).toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleUpdateStatus(order.id, order.status)}>
                                <View className={`px-4 py-2 rounded-full ${getStatusBg(order.status)}`}>
                                    <Text className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row justify-between mt-3 pt-3 border-t border-border/50">
                            <Text className="text-text-secondary font-medium">Pickup: <Text className="text-primary font-semibold">{formatDate(order.pickupDate)}</Text></Text>
                            <Text className="font-bold text-red-500">Balance: ${order.balance}</Text>
                        </View>
                    </StandardCard>
                ))}

                {orders.length === 0 && (
                    <GhostCard>
                        <Text className="text-text-secondary italic text-center py-6">No active orders.</Text>
                    </GhostCard>
                )}
            </>
        )}

        <Text className="text-2xl font-bold text-primary uppercase tracking-tight mb-4 mt-6">Measurements</Text>
        <StandardCard className="mb-8">
          <View className="flex-row flex-wrap">
            {Object.entries(customer.measurements || {}).map(([key, val]) => (
              <View key={key} className="w-[50%] mb-4 pr-2">
                <Text className="text-xs text-text-light uppercase tracking-wider mb-1">{key}</Text>
                <Text className="text-lg font-bold text-primary">{val || '-'}</Text>
              </View>
            ))}
            {(!customer.measurements || Object.keys(customer.measurements).length === 0) && (
               <Text className="text-text-secondary italic">No measurements recorded.</Text>
            )}
          </View>
        </StandardCard>

        <GhostButton 
          title="Delete Client" 
          onPress={handleDelete}
          textClassName="text-red-500"
          className="mb-10"
        />
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <View className="flex-1 bg-background p-6">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-bold text-primary uppercase">New Order</Text>
                    <TouchableOpacity onPress={() => setShowCreateModal(false)} className="p-2 bg-primary/10 rounded-full">
                        <Ionicons name="close" size={30} color="#3C4EB0" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <TextInput
                        label="Item Name"
                        placeholder="e.g. 3-Piece Suit"
                        value={newOrder.item}
                        onChangeText={(text) => setNewOrder({...newOrder, item: text})}
                    />

                    <View className="flex-row justify-between mb-4">
                        <View className="w-[48%]">
                            <NumberInput
                                label="Price ($)"
                                placeholder="0.00"
                                value={newOrder.price}
                                onChangeText={(text) => setNewOrder({...newOrder, price: text})}
                            />
                        </View>
                        <View className="w-[48%]">
                            <NumberInput
                                label="Deposit ($)"
                                placeholder="0.00"
                                value={newOrder.deposit}
                                onChangeText={(text) => setNewOrder({...newOrder, deposit: text})}
                            />
                        </View>
                    </View>

                    <View className="mb-4">
                        <DatePickerInput
                            label="Pickup Date"
                            value={newOrder.pickupDate}
                            onChange={(date) => setNewOrder({...newOrder, pickupDate: date})}
                        />
                    </View>

                    <View className="mb-4">
                        <DatePickerInput
                            label="Fitting Date"
                            value={newOrder.fittingDate}
                            onChange={(date) => setNewOrder({...newOrder, fittingDate: date})}
                        />
                    </View>

                    <TextArea
                        label="Notes"
                        placeholder="Add details..."
                        value={newOrder.notes}
                        onChangeText={(text) => setNewOrder({...newOrder, notes: text})}
                    />

                    <PrimaryButton 
                        title="Create Order" 
                        onPress={handleCreateOrder}
                        loading={creating}
                        className="mt-6 mb-10"
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
};

export default CustomerViewScreen;
