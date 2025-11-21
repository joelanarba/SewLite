import React from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';

export default function Screen({ children, className = '' }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />
      <View className={`flex-1 px-5 pt-2 ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
