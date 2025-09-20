const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fromEmail = process.env.SENDGRID_FROM_EMAIL;

/**
 * Sends an email using SendGrid.
 * @param {string} to The recipient's email address.
 * @param {string} subject The subject of the email.
 * @param {string} html The HTML body of the email.
 */
async function sendEmail(to, subject, html) {
  const msg = {
    to: to,
    from: fromEmail,
    subject: subject,
    html: html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error; // Re-throw the error
  }
}

module.exports = {
  sendEmail,
};