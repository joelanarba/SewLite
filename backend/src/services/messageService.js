const twilio = require('twilio');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  logger.warn('Twilio credentials missing. Message service will not send real messages.');
}

exports.sendSMS = async (to, body) => {
  if (!client) {
    logger.debug('Mock SMS (Twilio not configured)', { to, body });
    return { sid: 'mock-sid', status: 'sent' };
  }

  try {
    const message = await client.messages.create({
      body: body,
      from: fromNumber,
      to: to
    });
    logger.info('SMS sent successfully', { to, sid: message.sid, status: message.status });
    return message;
  } catch (error) {
    logger.error('Failed to send SMS', { to, error: error.message });
    throw error;
  }
};

// For WhatsApp, Twilio requires a specific format 'whatsapp:+1234567890'
exports.sendWhatsApp = async (to, body) => {
    if (!client) {
      logger.debug('Mock WhatsApp (Twilio not configured)', { to, body });
      return { sid: 'mock-sid', status: 'sent' };
    }
  
    try {
      const message = await client.messages.create({
        body: body,
        from: `whatsapp:${fromNumber}`, // Ensure env var has the whatsapp prefix if needed, or add it here
        to: `whatsapp:${to}`
      });
      logger.info('WhatsApp sent successfully', { to, sid: message.sid, status: message.status });
      return message;
    } catch (error) {
      logger.error('Failed to send WhatsApp message', { to, error: error.message });
      throw error;
    }
  };
