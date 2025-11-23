const { db } = require('../firebase');
const { COLLECTIONS } = require('../config/constants');

/**
 * Recalculates and updates the total balance for a customer based on their orders.
 * @param {string} customerId - The ID of the customer.
 * @returns {Promise<number>} - The new calculated balance.
 */
const updateCustomerBalance = async (customerId) => {
  try {
    if (!customerId) return 0;

    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('customerId', '==', customerId)
      .get();

    let totalBalance = 0;
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      totalBalance += (parseFloat(order.balance) || 0);
    });

    // Update customer document
    await db.collection(COLLECTIONS.CUSTOMERS).doc(customerId).update({
      balance: totalBalance
    });

    console.log(`Updated balance for customer ${customerId} to ${totalBalance}`);
    return totalBalance;
  } catch (error) {
    console.error(`Failed to update balance for customer ${customerId}:`, error);
    // We don't throw here to prevent blocking the main order operation, 
    // but in a production system we might want a retry mechanism or alert.
    return 0;
  }
};

module.exports = { updateCustomerBalance };
