import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'; 
const TOKEN_KEY = '@user_token';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach authentication token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (token) {
        // Attach token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to unwrap standardized response
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined) {
      // If the response follows the standard format
      if (response.data.success) {
        // Replace response.data with the actual payload
        response.data = response.data.data;
      } else {
        // If success is false, reject the promise with the message
        return Promise.reject(new Error(response.data.message || 'API Error'));
      }
    }
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear auth data
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem('@user_data');
        // The auth state listener in AuthContext will detect this and redirect to login
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

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
