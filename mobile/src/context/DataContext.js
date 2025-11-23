import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  fetchCustomers, 
  createCustomer as apiCreateCustomer, 
  updateCustomer as apiUpdateCustomer, 
  deleteCustomer as apiDeleteCustomer,
  fetchOrders as apiFetchOrders,
  createOrder as apiCreateOrder,
  updateOrder as apiUpdateOrder
} from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    await loadData();
  };

  const addCustomer = async (customerData) => {
    try {
      const newCustomer = await apiCreateCustomer(customerData);
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      throw err;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const updatedCustomer = await apiUpdateCustomer(id, customerData);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await apiDeleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  // Order actions - these might need to update customer balance/status in the list
  // For now, we'll just provide wrappers that also trigger a refresh of the specific customer if needed
  // Ideally, we'd have a more normalized state, but for this refactor we'll keep it simple
  
  const getCustomerOrders = async (customerId) => {
    return await apiFetchOrders(customerId);
  };

  const addOrder = async (orderData) => {
    try {
      const newOrder = await apiCreateOrder(orderData);
      // Refresh customers to update balance/status if needed
      // In a more complex app, we'd optimistically update the specific customer in the list
      await loadData(); 
      return newOrder;
    } catch (err) {
      throw err;
    }
  };

  const updateOrder = async (id, orderData) => {
    try {
      const updatedOrder = await apiUpdateOrder(id, orderData);
      // Refresh customers to update balance/status if needed
      await loadData();
      return updatedOrder;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    customers,
    loading,
    error,
    refreshData,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerOrders,
    addOrder,
    updateOrder
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
