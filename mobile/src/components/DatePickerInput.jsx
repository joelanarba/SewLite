import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDateForBackend } from '../utils/date';

export default function DatePickerInput({ 
  label, 
  value, 
  onChange, 
  error,
  placeholder = "Select Date",
  minimumDate
}) {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(formatDateForBackend(selectedDate));
    }
  };

  return (
    <View className="mb-5">
      {label && (
        <Text className="text-text-secondary text-xs uppercase tracking-widest mb-2 font-semibold">
          {label}
        </Text>
      )}
      
      <TouchableOpacity 
        onPress={() => setShow(true)}
        className={`bg-white border-2 ${error ? 'border-red-500' : 'border-border'} rounded-2xl px-5 py-4 shadow-sm flex-row justify-between items-center`}
      >
        <Text className={`text-base font-medium ${value ? 'text-text-primary' : 'text-gray-400'}`}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={22} color="#3C4EB0" />
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs mt-2 font-medium">{error}</Text>
      )}

      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          textColor="#2C2C2C"
          accentColor="#3C4EB0"
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}
