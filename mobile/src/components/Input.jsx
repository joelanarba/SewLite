import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function Input({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error
}) {
  return (
    <View className="mb-5">
      {label && (
        <Text className="text-text-secondary text-xs uppercase tracking-widest mb-2 font-semibold">
          {label}
        </Text>
      )}
      <View className={`bg-white border-2 ${error ? 'border-red-500' : 'border-border'} rounded-2xl px-5 py-4 shadow-sm`}>
        <TextInput
          className={`text-text-primary text-base font-medium ${multiline ? 'min-h-[100px] py-2' : ''}`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-2 font-medium">{error}</Text>
      )}
    </View>
  );
}
