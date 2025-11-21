import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import DatePickerInput from './DatePickerInput';

const CustomerSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  phone: Yup.string().required('Required'),
  item: Yup.string(),
  pickupDate: Yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format'),
  fittingDate: Yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format'),
  balance: Yup.number(),
  notes: Yup.string(),
  // Measurements
  chest: Yup.string(),
  waist: Yup.string(),
  hips: Yup.string(),
  length: Yup.string(),
});

const CustomerForm = ({ initialValues, onSubmit, submitLabel = "Save" }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CustomerSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card className="mb-6">
            <Text className="text-xl font-bold text-primary mb-5 uppercase tracking-tight">Client Details</Text>
            <Input
              label="Name *"
              value={values.name}
              onChangeText={handleChange('name')}
              placeholder="John Doe"
              error={touched.name && errors.name}
            />
            <Input
              label="Phone *"
              value={values.phone}
              onChangeText={handleChange('phone')}
              placeholder="+1234567890"
              keyboardType="phone-pad"
              error={touched.phone && errors.phone}
            />
            <Input
              label="Item Description"
              value={values.item}
              onChangeText={handleChange('item')}
              placeholder="Blue Suit"
            />
          </Card>

          <Card className="mb-6">
            <Text className="text-xl font-bold text-primary mb-5 uppercase tracking-tight">Schedule</Text>
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <DatePickerInput
                  label="Pickup Date"
                  value={values.pickupDate}
                  onChange={(date) => handleChange('pickupDate')(date)}
                  error={touched.pickupDate && errors.pickupDate}
                  minimumDate={new Date()}
                />
              </View>
              <View className="w-[48%]">
                <DatePickerInput
                  label="Fitting Date"
                  value={values.fittingDate}
                  onChange={(date) => handleChange('fittingDate')(date)}
                  error={touched.fittingDate && errors.fittingDate}
                  minimumDate={new Date()}
                />
              </View>
            </View>
          </Card>

          <Card className="mb-6">
            <Text className="text-xl font-bold text-primary mb-5 uppercase tracking-tight">Measurements</Text>
            <View className="flex-row flex-wrap justify-between">
               {['chest', 'waist', 'hips', 'length'].map((m) => (
                 <View key={m} className="w-[48%]">
                   <Input
                     label={m}
                     value={values[m]}
                     onChangeText={handleChange(m)}
                     placeholder="0"
                     keyboardType="numeric"
                   />
                 </View>
               ))}
            </View>
          </Card>

          <Card className="mb-8">
            <Text className="text-xl font-bold text-primary mb-5 uppercase tracking-tight">Additional Info</Text>
            <Input
              label="Balance Due"
              value={values.balance}
              onChangeText={handleChange('balance')}
              placeholder="0.00"
              keyboardType="numeric"
            />
            <Input
              label="Notes"
              value={values.notes}
              onChangeText={handleChange('notes')}
              placeholder="Additional details..."
              multiline
              numberOfLines={3}
            />
          </Card>

          <Button 
            title={submitLabel} 
            onPress={handleSubmit}
            className="mb-10"
          />
        </ScrollView>
      )}
    </Formik>
  );
};

export default CustomerForm;
