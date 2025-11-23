const admin = require('../firebase');

/**
 * Convert a date string to Firestore Timestamp
 * @param {string} dateStr - Date string in any format parseable by Date constructor
 * @returns {admin.firestore.Timestamp|null} Firestore Timestamp or null if input is empty
 */
const toTimestamp = (dateStr) => {
  if (!dateStr) return null;
  return admin.firestore.Timestamp.fromDate(new Date(dateStr));
};

/**
 * Convert a Firestore Timestamp to JavaScript Date
 * @param {admin.firestore.Timestamp} timestamp - Firestore Timestamp
 * @returns {Date|null} JavaScript Date object or null if input is empty
 */
const fromTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return timestamp.toDate();
};

/**
 * Format a date for display
 * @param {Date|admin.firestore.Timestamp|string} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD')
 * @returns {string|null} Formatted date string or null if input is empty
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  
  let jsDate;
  if (date instanceof admin.firestore.Timestamp) {
    jsDate = date.toDate();
  } else if (typeof date === 'string') {
    jsDate = new Date(date);
  } else {
    jsDate = date;
  }
  
  // Simple ISO date formatting (can be extended with date-fns if needed)
  return jsDate.toISOString().split('T')[0];
};

module.exports = {
  toTimestamp,
  fromTimestamp,
  formatDate
};
