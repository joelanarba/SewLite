const twilio = require('twilio');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const { ORDER_STATUS } = require('../config/constants');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken && fromNumber) {
  client = twilio(accountSid, authToken);
} else {
  logger.warn('Twilio credentials missing. SMS notifications will be logged to console only.');
}

exports.sendSMS = async (to, body) => {
  if (!client) {
    logger.debug('Mock SMS notification (Twilio not configured)', { to, body });
    return;
  }

  try {
    await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    logger.info('Notification SMS sent successfully', { to });
  } catch (error) {
    logger.error('Failed to send notification SMS', { to, error: error.message });
  }
};

exports.sendOrderStatusUpdate = async (customerPhone, customerName, orderItem, newStatus) => {
  let message = `Hi ${customerName}, the status of your order (${orderItem}) has been updated to: ${newStatus}.`;
  
  if (newStatus === ORDER_STATUS.READY) {
    message += ' It is now ready for pickup!';
  }

  await exports.sendSMS(customerPhone, message);
};
