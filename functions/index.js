const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

admin.initializeApp();

// Nodemailer SMTP Transporter configuration
// Replace config values with firebase env variables or secure credentials
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NOTIFICATION_EMAIL_USER || "duoroom.notifications@gmail.com",
    pass: process.env.NOTIFICATION_EMAIL_PASS || "sample-app-password",
  },
});

// Twilio Client configuration
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token";
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

/**
 * Cloud Function to trigger notifications on new expense additions.
 * Path: rooms/{roomId}/transactions/{transactionId}
 */
exports.onNewExpenseAdded = functions.firestore
  .document("rooms/{roomId}/transactions/{transactionId}")
  .onCreate(async (snapshot, context) => {
    const transaction = snapshot.data();
    const roomId = context.params.roomId;

    if (!transaction) return null;

    const { title, amount, paidBy, isShared } = transaction;
    const formattedAmount = `₹${amount.toLocaleString("en-IN")}`;

    // Notification Message Body
    const messageText = `Duo Room Alert: A new expense "${title}" of ${formattedAmount} was added by ${paidBy} in Room ${roomId}.`;
    
    // In a production app, we would query the database to get emails and phone numbers of all roommates in the room
    const roommates = [
      { email: "sampath.jogi@example.com", phone: "+919876543210" },
      { email: "roommate.sam@example.com", phone: "+919876543211" }
    ];

    // 1. Send Email Notifications
    const emailPromises = roommates.map((rm) => {
      const mailOptions = {
        from: '"Duo Room Sync" <duoroom.notifications@gmail.com>',
        to: rm.email,
        subject: `New Room Expense: ${title} (${formattedAmount})`,
        text: messageText,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #F6F8F6; color: #1A3827; border-radius: 12px; border: 1px solid #E3E8E3;">
            <h2 style="color: #1A3827; margin-bottom: 5px;">Duo Room Expense Tracker</h2>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #5C6E5C; margin-top: 0;">Shared Notification</p>
            <hr style="border: 0; border-top: 1px solid #E3E8E3; margin: 15px 0;" />
            <p style="font-size: 14px; font-weight: bold;">Hi Roommate,</p>
            <p style="font-size: 14px; line-height: 1.6;">
              A new shared bill was logged in your room:
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #E3E8E3; margin: 15px 0;">
              <p style="margin: 5px 0; font-size: 13px;"><strong>Merchant/Item:</strong> ${title}</p>
              <p style="margin: 5px 0; font-size: 13px;"><strong>Amount:</strong> ${formattedAmount}</p>
              <p style="margin: 5px 0; font-size: 13px;"><strong>Paid by:</strong> ${paidBy}</p>
              <p style="margin: 5px 0; font-size: 13px;"><strong>Split details:</strong> ${isShared ? "Split equally (50/50)" : "Personal Expense"}</p>
            </div>
            <p style="font-size: 12px; color: #5C6E5C;">You can view the ledger, settle balances, and upload receipts at any time in your browser.</p>
          </div>
        `,
      };
      return mailTransporter.sendMail(mailOptions);
    });

    // 2. Send SMS Notifications (Twilio)
    const smsPromises = roommates.map((rm) => {
      return twilioClient.messages.create({
        body: messageText,
        to: rm.phone,
        from: process.env.TWILIO_PHONE_NUMBER || "+12345678901",
      });
    });

    try {
      await Promise.all([...emailPromises, ...smsPromises]);
      console.log(`Successfully dispatched email and SMS notifications for transaction ${context.params.transactionId}`);
    } catch (err) {
      console.error("Notification dispatch failed: ", err);
    }

    return null;
  });
