import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './presets/Buttons';
import Screen from './Screen';

const ErrorFallback = ({ error, resetError }) => {
  return (
    <Screen className="justify-center items-center px-6">
      <View className="bg-red-50 rounded-full p-6 mb-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
      </View>
      
      <Text className="text-2xl font-bold text-primary mb-2 text-center">
        Oops! Something went wrong.
      </Text>
      
      <Text className="text-text-secondary text-center mb-8">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </Text>
      
      <PrimaryButton 
        title="Try Again" 
        onPress={resetError} 
        className="w-full"
      />
    </Screen>
  );
};

export default ErrorFallback;
