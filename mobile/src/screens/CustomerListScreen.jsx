import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCustomers } from '../services/api';
import CustomerCard from '../components/CustomerCard';
import Screen from '../components/Screen';
import Header from '../components/Header';

const CustomerListScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadCustomers();
    }
  }, [isFocused]);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <Screen>
      <Header title="Clientele" />
      
      <View className="mb-6">
        <View className="bg-white border-2 border-border rounded-2xl px-5 py-4 shadow-md flex-row items-center">
          <Ionicons name="search" size={22} color="#3C4EB0" />
          <TextInput
            className="flex-1 ml-3 text-text-primary text-base font-medium"
            placeholder="Search by name or phone..."
            placeholderTextColor="#999999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <View className="bg-secondary/30 rounded-full p-8 mb-4">
              <Ionicons name="people-outline" size={56} color="#3C4EB0" />
            </View>
            <Text className="text-text-secondary text-base font-medium">No clients found.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  );
};

export default CustomerListScreen;
