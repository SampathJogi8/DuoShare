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
      const rmName = rm.nickname || rm.name || rm.displayName || "Roommate";
      const greeting = rmName && rmName !== "Roommate" ? `Hello ${rmName},` : "Hello Roommate,";
      const mailOptions = {
        from: '"Duo Room Sync" <duoroom.notifications@gmail.com>',
        to: rm.email,
        subject: `New Room Expense: ${title} (${formattedAmount})`,
        text: `${greeting}\n\n${messageText}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #F6F8F6; color: #1A3827; border-radius: 12px; border: 1px solid #E3E8E3;">
            <h2 style="color: #1A3827; margin-bottom: 5px;">Duo Room Expense Tracker</h2>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #5C6E5C; margin-top: 0;">Shared Notification</p>
            <hr style="border: 0; border-top: 1px solid #E3E8E3; margin: 15px 0;" />
            <p style="font-size: 14px; font-weight: bold;">${greeting}</p>
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

/**
 * Cloud Function Scheduled Cron Job:
 * Triggers automatically on the 1st of every month at 10:00 AM.
 * Ensures monthly financial statements (for the completed previous month)
 * are generated and emailed to all room members regardless of whether users
 * are logged in or active in the web application.
 */
exports.sendMonthlyStatementsCron = functions.pubsub
  .schedule("0 10 1 * *")
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    console.log("[Tallyin Scheduler] Starting automated 10:00 AM monthly statement dispatch for 1st of the month...");

    // 1. Determine completed target month (e.g. July when triggered on Aug 1st)
    const now = new Date();
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const targetYear = prevDate.getFullYear();
    const targetMonthNum = String(prevDate.getMonth() + 1).padStart(2, "0");
    const targetMonthStr = `${targetYear}-${targetMonthNum}`;

    console.log(`[Tallyin Scheduler] Target statement period: ${targetMonthStr}`);

    const activeScriptUrl = "https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec";

    try {
      // 2. Fetch all rooms and room members from database
      const db = admin.firestore();
      const roomsSnapshot = await db.collection("rooms").get();

      if (roomsSnapshot.empty) {
        console.log("[Tallyin Scheduler] No rooms found for monthly statement dispatch.");
        return null;
      }

      for (const roomDoc of roomsSnapshot.docs) {
        const roomId = roomDoc.id;
        const roomData = roomDoc.data();
        const roomName = roomData.name || `Room ${roomId}`;

        // Fetch room members
        const membersSnapshot = await db.collection(`rooms/${roomId}/members`).get();
        const members = membersSnapshot.docs.map((d) => d.data());
        const allEmails = members.map((m) => m.email).filter((e) => e && e.includes("@"));

        if (allEmails.length === 0) continue;

        // Fetch room transactions for target month
        const txsSnapshot = await db.collection(`rooms/${roomId}/transactions`).get();
        const allTxs = txsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        const roomTxs = allTxs.filter((t) => {
          if (["__FUND_INIT__", "__FUND_SPEND__", "__SHOPPING__", "__BILL__", "__CHORE__", "__DELETE_PROPOSAL__", "Payment"].includes(t.category)) {
            return false;
          }
          return t.isShared && t.date && t.date.startsWith(targetMonthStr);
        });

        // If transactions exist for the previous month, trigger statement email delivery via Apps Script
        if (roomTxs.length > 0) {
          const csvHeaders = ["Transaction ID", "Date", "Time", "Description", "Amount (INR)", "Category", "Paid By", "Split Type"];
          const csvRows = roomTxs.map((t) => [
            t.id ? t.id.slice(0, 8) : "N/A",
            t.date || "",
            t.time || "",
            t.title || "",
            t.amount || 0,
            t.category || "",
            t.paidBy || "",
            t.isShared ? "Equal (50/50)" : "Personal"
          ]);
          const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
          const toBase64 = (str) => Buffer.from(str, "utf-8").toString("base64");

          const attachments = [
            {
              name: `tallyin_${targetMonthStr}_room_statement.csv`,
              mimeType: "text/csv",
              base64: toBase64(csvContent)
            }
          ];

          for (const recipientEmail of allEmails) {
            const subject = `Tallyin Room Ledger: ${roomName} (${targetMonthStr})`;
            const htmlBody = `
              <div style="font-family: sans-serif; padding: 24px; background-color: #F8FAFC; color: #0F172A;">
                <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #E2E8F0;">
                  <h2 style="color: #1A3827; margin-top: 0;">Monthly Financial Statement</h2>
                  <p>Hello Roommate,</p>
                  <p>Attached is your official monthly statement of account for <strong>${roomName}</strong> (Workspace: ${roomId}) for the period of <strong>${targetMonthStr}</strong>.</p>
                  <p>Generated automatically by Tallyin billing synchronization platform at 10:00 AM on the 1st of the month.</p>
                </div>
              </div>
            `;

            await fetch(activeScriptUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({
                to: recipientEmail,
                subject: subject,
                htmlBody: htmlBody,
                textBody: `Your monthly statement for ${targetMonthStr} in room ${roomName} is attached.`,
                attachments: attachments
              })
            }).catch((err) => console.error(`[Tallyin Scheduler] Apps Script fetch error for ${recipientEmail}:`, err));
          }
        }
      }
      console.log("[Tallyin Scheduler] Completed 10:00 AM monthly statement dispatch successfully.");
    } catch (error) {
      console.error("[Tallyin Scheduler] Failed monthly statement cron execution:", error);
    }
    return null;
  });

