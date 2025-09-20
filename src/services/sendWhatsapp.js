const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const from = process.env.TWILIO_PHONE_NUMBER;

/**
 * Sends an SMS message using Twilio.
 * @param {string} to The recipient's phone number.
 * @param {string} body The text of the message.
 */
async function sendSms(to, body) {
  try {
    // Sanitize the number and ensure it's in E.164 format
    let formattedTo = to.replace(/[^0-9+]/g, '');

    if (!formattedTo.startsWith('+')) {
      // Assuming Brazilian numbers, add the +55 country code
      formattedTo = `+55${formattedTo}`;
    }

    await client.messages.create({
      body: body,
      from: from,
      to: formattedTo,
    });
    console.log(`SMS reminder sent to ${formattedTo}`);
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
    throw error; // Re-throw the error to allow the caller to handle it if needed
  }
}

module.exports = {
  sendSms,
};
