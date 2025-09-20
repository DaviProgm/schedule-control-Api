const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const from = process.env.TWILIO_PHONE_NUMBER;

/**
 * Sends an SMS message using Twilio.
 * @param {string} to The recipient's phone number (e.g., '+5511999999999').
 * @param {string} body The text of the message.
 */
async function sendSms(to, body) {
  try {
    await client.messages.create({
      body: body,
      from: from,
      to: to, // No 'whatsapp:' prefix needed for SMS
    });
    console.log(`SMS reminder sent to ${to}`);
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
  }
}

module.exports = {
  sendSms,
};