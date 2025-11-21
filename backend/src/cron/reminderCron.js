const cron = require('node-cron');
const { db, admin } = require('../firebase');
const messageService = require('../services/messageService');

// Check for reminders every day at 6:00 AM
const start = () => {
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily reminder job...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Define start and end of "tomorrow" to find dates falling within that day
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    try {
      const customersRef = db.collection('customers');
      
      // Query for pickups tomorrow
      const pickupQuery = await customersRef
        .where('pickupDate', '>=', startOfTomorrow)
        .where('pickupDate', '<=', endOfTomorrow)
        .get();

      // Query for fittings tomorrow
      const fittingQuery = await customersRef
        .where('fittingDate', '>=', startOfTomorrow)
        .where('fittingDate', '<=', endOfTomorrow)
        .get();

      const processReminder = async (doc, type) => {
        const customer = doc.data();
        const date = type === 'pickup' ? customer.pickupDate.toDate() : customer.fittingDate.toDate();
        const message = `Hello ${customer.name}, this is a reminder for your ${type} scheduled on ${date.toDateString()}.`;

        try {
          // Send SMS (or WhatsApp)
          await messageService.sendSMS(customer.phone, message);

          // Log notification
          await db.collection('customers').doc(doc.id).collection('notifications').add({
            type: 'reminder',
            subType: type,
            message: message,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
          });
          
          console.log(`Reminder sent to ${customer.name} for ${type}`);
        } catch (err) {
          console.error(`Failed to send reminder to ${customer.name}:`, err);
        }
      };

      pickupQuery.forEach(doc => processReminder(doc, 'pickup'));
      fittingQuery.forEach(doc => processReminder(doc, 'fitting'));

    } catch (error) {
      console.error('Error in reminder cron job:', error);
    }
  });
};

module.exports = { start };
