const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken && fromNumber) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials missing. SMS notifications will be logged to console only.');
}

exports.sendSMS = async (to, body) => {
  if (!client) {
    console.log(`[MOCK SMS] To: ${to}, Body: ${body}`);
    return;
  }

  try {
    await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

exports.sendOrderStatusUpdate = async (customerPhone, customerName, orderItem, newStatus) => {
  let message = `Hi ${customerName}, the status of your order (${orderItem}) has been updated to: ${newStatus}.`;
  
  if (newStatus === 'Ready') {
    message += ' It is now ready for pickup!';
  }

  await exports.sendSMS(customerPhone, message);
};
