import React, { useState, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import CustomerCard from '../components/CustomerCard';
import Screen from '../components/Screen';
import Header from '../components/Header';
import { SearchInput } from '../components/presets/Inputs';

const CustomerListScreen = () => {
  const { customers } = useData();
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const renderItem = useCallback(({ item }) => (
    <CustomerCard customer={item} />
  ), []);

  return (
    <Screen>
      <Header title="Clientele" />
      
      <View className="mb-6">
        <SearchInput
          placeholder="Search by name or phone..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
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
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
      />
    </Screen>
  );
};

export default CustomerListScreen;
