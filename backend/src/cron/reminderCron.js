const cron = require('node-cron');
const { db, admin } = require('../firebase');
const messageService = require('../services/messageService');

// Check for reminders every day at 6:00 AM
const start = () => {
  // Run every day at 6:00 AM
  // Note: node-cron uses server time. If we want 6 AM in the specific timezone,
  // we might need to adjust the cron expression or use a library that supports timezone in cron.
  // For now, we keep the schedule but ensure the "tomorrow" calculation is correct relative to the configured timezone.
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily reminder job...');
    
    const TIMEZONE = process.env.TIMEZONE || 'UTC';
    const { toZonedTime, fromZonedTime } = require('date-fns-tz');
    const { addDays, startOfDay, endOfDay } = require('date-fns');

    try {
      const now = new Date();
      const nowZoned = toZonedTime(now, TIMEZONE);
      const tomorrowZoned = addDays(nowZoned, 1);
      
      // Get start and end of tomorrow in the target timezone
      const startOfTomorrowZoned = startOfDay(tomorrowZoned);
      const endOfTomorrowZoned = endOfDay(tomorrowZoned);

      // Convert back to UTC for database queries
      const startOfTomorrow = fromZonedTime(startOfTomorrowZoned, TIMEZONE);
      const endOfTomorrow = fromZonedTime(endOfTomorrowZoned, TIMEZONE);

      console.log(`Checking for reminders for date: ${startOfTomorrowZoned.toDateString()} (${TIMEZONE})`);
      console.log(`Query range (UTC): ${startOfTomorrow.toISOString()} - ${endOfTomorrow.toISOString()}`);

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
        // We want to display the date in the customer's context (or at least the business's timezone context)
        // For simplicity, we'll use the date string from the database object which usually defaults to UTC or server time,
        // but since we are sending a text, a simple date string is usually fine.
        // To be precise, we could format it in the timezone.
        const dateUtc = type === 'pickup' ? customer.pickupDate.toDate() : customer.fittingDate.toDate();
        // Format date for the message in the business timezone
        const dateZoned = toZonedTime(dateUtc, TIMEZONE);
        const dateString = dateZoned.toDateString(); 

        const message = `Hello ${customer.name}, this is a reminder for your ${type} scheduled on ${dateString}.`;

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
