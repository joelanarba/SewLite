import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createCustomer } from '../services/api';
import CustomerForm from '../components/CustomerForm';
import Screen from '../components/Screen';
import Header from '../components/Header';

const CustomerAddScreen = () => {
  const navigation = useNavigation();

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        phone: values.phone,
        item: values.item,
        pickupDate: values.pickupDate || null,
        fittingDate: values.fittingDate || null,
        balance: values.balance,
        notes: values.notes,
        measurements: {
          chest: values.chest,
          waist: values.waist,
          hips: values.hips,
          length: values.length,
        }
      };

      await createCustomer(payload);
      Alert.alert('Success', 'Customer created successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create customer');
    }
  };

  const initialValues = {
    name: '', phone: '', item: '', pickupDate: '', fittingDate: '', 
    balance: '', notes: '', chest: '', waist: '', hips: '', length: ''
  };

  return (
    <Screen>
      <Header title="New Client" showBack />
      <CustomerForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Add Client" />
    </Screen>
  );
};

export default CustomerAddScreen;
