import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header({ title, showBack = false, rightAction, rightIcon }) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-between py-5 mb-2">
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2">
            <Ionicons name="arrow-back" size={26} color="#3C4EB0" />
          </TouchableOpacity>
        )}
        <Text className="text-[28px] font-bold text-primary tracking-tight uppercase">
          {title}
        </Text>
      </View>
      {rightAction && rightIcon && (
        <TouchableOpacity onPress={rightAction} className="p-3 bg-accent/20 rounded-full">
          <Ionicons name={rightIcon} size={22} color="#3C4EB0" />
        </TouchableOpacity>
      )}
    </View>
  );
}
