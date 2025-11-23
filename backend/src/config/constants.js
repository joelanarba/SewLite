/**
 * Application-wide constants
 * Single source of truth for collection names, status values, and other magic strings
 */

// Firestore collection names
const COLLECTIONS = {
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications',
};

// Order status values
const ORDER_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  PICKED_UP: 'Picked Up',
};

// Get all order statuses as an array (for validation)
const ORDER_STATUSES = Object.values(ORDER_STATUS);

// Notification types
const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  ORDER_STATUS: 'order_status',
};

module.exports = {
  COLLECTIONS,
  ORDER_STATUS,
  ORDER_STATUSES,
  NOTIFICATION_TYPES,
};
