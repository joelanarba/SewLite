import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  className = '',
  textClassName = '',
  icon
}) {
  const baseStyles = "py-4 px-8 rounded-2xl flex-row justify-center items-center shadow-md";
  
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    outline: "bg-transparent border-2 border-primary",
    ghost: "bg-transparent shadow-none",
  };

  const textBaseStyles = "font-bold text-center text-base uppercase tracking-wider";
  
  const textVariants = {
    primary: "text-white",
    secondary: "text-primary",
    accent: "text-primary",
    outline: "text-primary",
    ghost: "text-primary",
  };

  const disabledStyles = "opacity-50";

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
      activeOpacity={0.8}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text className={`${textBaseStyles} ${textVariants[variant]} ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
