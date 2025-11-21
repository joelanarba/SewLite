import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCustomer, deleteCustomer, fetchOrders, createOrder, updateOrder } from '../services/api';
import { formatDate } from '../utils/date';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import DatePickerInput from '../components/DatePickerInput';

const CustomerViewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    item: '',
    price: '',
    deposit: '',
    pickupDate: new Date(),
    fittingDate: new Date(),
    notes: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    console.log('CustomerViewScreen mounted for ID:', id);
    loadData();
  }, [id]);

  const loadData = async () => {
    console.log('Fetching data for customer:', id);
    try {
      const [customerData, ordersData] = await Promise.all([
        fetchCustomer(id),
        fetchOrders(id)
      ]);
      console.log('Data fetched successfully');
      setCustomer(customerData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching details:', error);
      Alert.alert('Error', 'Failed to fetch details');
      navigation.goBack();
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
      await createOrder({
        customerId: id,
        customerName: customer.name,
        customerPhone: customer.phone,
        ...newOrder,
        pickupDate: newOrder.pickupDate.toISOString(),
        fittingDate: newOrder.fittingDate.toISOString(),
      });
      setShowCreateModal(false);
      setNewOrder({
        item: '',
        price: '',
        deposit: '',
        pickupDate: new Date(),
        fittingDate: new Date(),
        notes: ''
      });
      loadData(); // Reload to see new order
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

    try {
      await updateOrder(orderId, { status: nextStatus });
      // Optimistic update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    } catch (error) {
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
        <Card className="mb-6 border-t-[6px] border-t-accent">
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
        </Card>

        <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-primary uppercase tracking-tight">Orders</Text>
            <Button 
                title="New Order" 
                onPress={() => setShowCreateModal(true)}
                className="px-6"
                textClassName="text-sm"
            />
        </View>

        {orders.map(order => (
            <Card key={order.id} className="mb-4">
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
            </Card>
        ))}

        {orders.length === 0 && (
            <Card className="bg-background/50">
                <Text className="text-text-secondary italic text-center py-6">No active orders.</Text>
            </Card>
        )}

        <Text className="text-2xl font-bold text-primary uppercase tracking-tight mb-4 mt-6">Measurements</Text>
        <Card className="mb-8">
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
        </Card>

        <Button 
          title="Delete Client" 
          variant="ghost" 
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <View className="flex-1 bg-background p-6">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-bold text-primary uppercase">New Order</Text>
                    <TouchableOpacity onPress={() => setShowCreateModal(false)} className="p-2 bg-primary/10 rounded-full">
                        <Ionicons name="close" size={30} color="#3C4EB0" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="label mb-2">Item Name</Text>
                    <TextInput
                        className="input mb-4"
                        placeholder="e.g. 3-Piece Suit"
                        value={newOrder.item}
                        onChangeText={(text) => setNewOrder({...newOrder, item: text})}
                    />

                    <View className="flex-row justify-between mb-4">
                        <View className="w-[48%]">
                            <Text className="label mb-2">Price ($)</Text>
                            <TextInput
                                className="input"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={newOrder.price}
                                onChangeText={(text) => setNewOrder({...newOrder, price: text})}
                            />
                        </View>
                        <View className="w-[48%]">
                            <Text className="label mb-2">Deposit ($)</Text>
                            <TextInput
                                className="input"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={newOrder.deposit}
                                onChangeText={(text) => setNewOrder({...newOrder, deposit: text})}
                            />
                        </View>
                    </View>

                    <Text className="label mb-2">Pickup Date</Text>
                    <DatePickerInput
                        date={newOrder.pickupDate}
                        onChange={(date) => setNewOrder({...newOrder, pickupDate: date})}
                    />
                    <View className="mb-4" />

                    <Text className="label mb-2">Fitting Date</Text>
                    <DatePickerInput
                        date={newOrder.fittingDate}
                        onChange={(date) => setNewOrder({...newOrder, fittingDate: date})}
                    />
                    <View className="mb-4" />

                    <Text className="label mb-2">Notes</Text>
                    <TextInput
                        className="input h-24 text-top"
                        multiline
                        placeholder="Add details..."
                        value={newOrder.notes}
                        onChangeText={(text) => setNewOrder({...newOrder, notes: text})}
                    />

                    <Button 
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
