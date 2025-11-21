import React from 'react';
import { View } from 'react-native';

export default function Card({ children, className = '' }) {
  return (
    <View className={`bg-surface rounded-[20px] p-5 shadow-lg ${className}`}>
      {children}
    </View>
  );
}
