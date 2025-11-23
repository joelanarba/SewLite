import React from 'react';
import { View, TextInput as RNTextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../Input';

export const TextInput = (props) => (
  <Input {...props} />
);

export const TextArea = (props) => (
  <Input multiline numberOfLines={3} {...props} />
);

export const PhoneInput = (props) => (
  <Input keyboardType="phone-pad" placeholder="+1234567890" {...props} />
);

export const NumberInput = (props) => (
  <Input keyboardType="numeric" placeholder="0" {...props} />
);

export const SearchInput = ({ value, onChangeText, placeholder, className = '', ...props }) => (
  <View className={`bg-white border-2 border-border rounded-2xl px-5 py-4 shadow-md flex-row items-center ${className}`}>
    <Ionicons name="search" size={22} color="#3C4EB0" />
    <RNTextInput
      className="flex-1 ml-3 text-text-primary text-base font-medium"
      placeholder={placeholder}
      placeholderTextColor="#999999"
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);
