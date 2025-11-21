import axios from 'axios';

const BASE_URL = 'http://10.241.97.112:3000'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCustomers = async () => {
  const response = await api.get('/customers');
  return response.data;
};

export const fetchCustomer = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// Order API
export const fetchOrders = async (customerId) => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const updateOrder = async (id, orderData) => {
  const response = await api.put(`/orders/${id}`, orderData);
  return response.data;
};

export const trackOrder = async (phone) => {
  const response = await api.post('/orders/track', { phone });
  return response.data;
};

export default api;
