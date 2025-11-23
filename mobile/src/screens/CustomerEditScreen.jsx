import React from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import CustomerForm from '../components/CustomerForm';
import Screen from '../components/Screen';
import Header from '../components/Header';

const CustomerEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { customer } = route.params;
  const { updateCustomer } = useData();

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

      await updateCustomer(customer.id, payload);
      Alert.alert('Success', 'Customer updated successfully');
      navigation.navigate('CustomerView', { id: customer.id }); 
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update customer');
    }
  };

  const initialValues = {
    name: customer.name,
    phone: customer.phone,
    item: customer.item,
    pickupDate: customer.pickupDate ? customer.pickupDate.split('T')[0] : '',
    fittingDate: customer.fittingDate ? customer.fittingDate.split('T')[0] : '',
    balance: String(customer.balance || ''),
    notes: customer.notes,
    chest: customer.measurements?.chest || '',
    waist: customer.measurements?.waist || '',
    hips: customer.measurements?.hips || '',
    length: customer.measurements?.length || '',
  };

  return (
    <Screen>
      <Header title="Edit Client" showBack />
      <CustomerForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update Client" />
    </Screen>
  );
};

export default CustomerEditScreen;
