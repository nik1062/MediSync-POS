const { User, Clinic } = require('../models');

/**
 * Stub for sending WhatsApp notifications.
 * Connects to WhatsApp Business API (or Twilio/Gupshup) once credentials are provided.
 */
async function sendNotification(clinicId, userId, type, payload) {
  try {
    const user = await User.findByPk(userId);
    const clinic = await Clinic.findByPk(clinicId);

    if (!user) {
      console.error(`[WhatsApp Notification Failed] User ${userId} not found.`);
      return;
    }

    let messageBody = '';

    switch (type) {
      case 'BOOKING_CONFIRMED':
        messageBody = `Hi ${user.name},\n\nYour consultation at ${clinic?.name || 'our clinic'} is confirmed. Please arrive or join the telehealth link 5 minutes early.`;
        break;
      case 'DOCTOR_ONLINE':
        messageBody = `Hi ${user.name},\n\nYour doctor is now online and ready to start the consultation. Please join the video room.`;
        break;
      case 'PRESCRIPTION_READY':
        messageBody = `Hi ${user.name},\n\nYour prescription from the recent consultation is ready for pickup at ${clinic?.name || 'the clinic pharmacy'}.`;
        break;
      case 'READY_FOR_PICKUP':
        messageBody = `Hi ${user.name},\n\nYour dispensed medication order is packed and ready for pickup at the counter!`;
        break;
      case 'MEDICATION_REMINDER':
        messageBody = `Hi ${user.name},\n\nTime to take your medication: ${payload?.drugName}. This is Day ${payload?.currentDay} of ${payload?.totalDays}. Stay healthy!`;
        break;
      default:
        messageBody = `Hi ${user.name},\n\nYou have a new notification from ${clinic?.name || 'MediSync'}.`;
        break;
    }

    // TODO: Integrate actual WhatsApp Business API or Twilio credentials here
    console.log('==================================================');
    console.log(`[WHATSAPP MESSAGE STUB - Requires Real Credentials]`);
    console.log(`To: ${user.phone || user.email}`);
    console.log(`Type: ${type}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    console.log(`Message Body:\n${messageBody}`);
    console.log('==================================================');

  } catch (error) {
    console.error(`[WhatsApp Notification Error]`, error);
  }
}

module.exports = {
  sendNotification
};
