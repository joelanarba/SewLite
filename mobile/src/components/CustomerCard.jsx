import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { formatDate } from '../utils/date';

const CustomerCard = ({ customer }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      onPress={() => {
        console.log('Navigating to CustomerView with ID:', customer.id);
        navigation.navigate('CustomerView', { id: customer.id });
      }}
      activeOpacity={0.9}
      className="mb-4"
    >
      <Card className="border-l-4 border-l-accent">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-xl font-bold text-primary tracking-tight mb-1">
              {customer.name}
            </Text>
            <Text className="text-sm text-text-secondary font-medium">
              {customer.phone}
            </Text>
          </View>
          <View className="bg-accent/20 px-4 py-2 rounded-full">
             <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {customer.item || 'No Item'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row space-x-4 mt-3 pt-3 border-t border-border/50">
          {customer.pickupDate && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#F2C76E" />
              <Text className="text-xs text-text-secondary ml-2 font-medium">
                Pickup: <Text className="text-primary font-semibold">{formatDate(customer.pickupDate)}</Text>
              </Text>
            </View>
          )}
          {customer.fittingDate && (
            <View className="flex-row items-center ml-4">
              <Ionicons name="cut-outline" size={16} color="#3C4EB0" />
              <Text className="text-xs text-text-secondary ml-2 font-medium">
                Fitting: <Text className="text-primary font-semibold">{formatDate(customer.fittingDate)}</Text>
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default CustomerCard;
