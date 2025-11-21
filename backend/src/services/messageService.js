const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials missing. Message service will not send real messages.');
}

exports.sendSMS = async (to, body) => {
  if (!client) {
    console.log(`[MOCK SMS] To: ${to}, Body: ${body}`);
    return { sid: 'mock-sid', status: 'sent' };
  }

  try {
    const message = await client.messages.create({
      body: body,
      from: fromNumber,
      to: to
    });
    console.log(`SMS sent: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// For WhatsApp, Twilio requires a specific format 'whatsapp:+1234567890'
exports.sendWhatsApp = async (to, body) => {
    if (!client) {
      console.log(`[MOCK WHATSAPP] To: ${to}, Body: ${body}`);
      return { sid: 'mock-sid', status: 'sent' };
    }
  
    try {
      const message = await client.messages.create({
        body: body,
        from: `whatsapp:${fromNumber}`, // Ensure env var has the whatsapp prefix if needed, or add it here
        to: `whatsapp:${to}`
      });
      console.log(`WhatsApp sent: ${message.sid}`);
      return message;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  };
