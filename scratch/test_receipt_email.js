const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

const sampleReceiptImg = 'https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png';

const txIdFormatted = '#TX-8842';
const txTitle = 'Supermarket Groceries & Supplies';
const formattedAmount = '₹2,450';
const txCategory = 'Groceries';
const txPaidBy = 'Sampath Jogi';
const roomDisplayName = 'ROOM-702';
const txDateTime = '25 Jul 2026 • 12:27 PM';
const txSplit = 'Split equally (50/50)';
const actionBadge = 'ACTIVITY ALERT';
const actionTitle = 'New Expense Added';
const introText = `A new roommate transaction (ID: <strong>${txIdFormatted}</strong>) has been logged in room <strong>${roomDisplayName}</strong>. Here are the full details of the entry:`;

const splitRowsHtml = `
  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; margin-bottom: 28px;">
    <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">ROOMMATE SHARE BREAKDOWN</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">Sampath Jogi</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #1A3827;">₹1,225</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">Roommate Partner</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #1A3827;">₹1,225</td>
      </tr>
    </table>
  </div>
`;

const receiptRowsHtml = `
  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; margin-bottom: 28px;">
    <div style="font-size: 10px; font-weight: 800; color: #1A3827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
      ATTACHED RECEIPT PROOF (1 FILE)
    </div>
    <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">The following receipt document(s) were attached to this transaction:</div>
    <div style="margin-top: 12px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px; text-align: center; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="font-size: 10px; font-weight: 800; color: #64748B; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Receipt Proof Image #1</div>
      <a href="${sampleReceiptImg}" target="_blank" style="display: block; text-decoration: none;">
        <img src="${sampleReceiptImg}" alt="Receipt Proof Image #1" style="max-width: 100%; max-height: 380px; border-radius: 10px; object-fit: contain; display: block; margin: 0 auto; border: 1px solid #F1F5F9;" />
      </a>
    </div>
  </div>
`;

const htmlBody = `
  <div style="background-color: #F1F5F9; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
      
      <!-- Top MNC Banner -->
      <div style="background-color: #1A3827; padding: 32px 36px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <table style="border-collapse: collapse;">
                <tr>
                  <td style="padding-right: 12px; vertical-align: middle;">
                    <img src="https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png" alt="T" width="40" height="40" style="display: block; border-radius: 12px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">Tallyin</span>
                    <span style="display: block; font-size: 10px; color: #A3E635; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">ROOMMATE EXPENSE SYNC</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="background-color: rgba(163, 230, 53, 0.2); color: #A3E635; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 7px 14px; border-radius: 20px; display: inline-block;">${actionBadge}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Main Body -->
      <div style="padding: 36px 36px 28px 36px;">
        <h2 style="color: #0F172A; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${actionTitle}</h2>
        <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 24px 0;">
          Hello Roommate,
        </p>
        <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin: 0 0 24px 0;">
          ${introText}
        </p>

        <!-- Prominent Amount Highlight Card -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 5px solid #1A3827; padding: 20px 24px; border-radius: 16px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <span style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">TOTAL AMOUNT</span>
                <span style="font-size: 28px; font-weight: 900; color: #1A3827; letter-spacing: -0.5px;">${formattedAmount}</span>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">CATEGORY</span>
                <span style="background-color: #E2E8F0; color: #0F172A; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 20px; display: inline-block;">${txCategory}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Detailed Grid Info Cards -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <tr>
            <td style="width: 50%; padding-right: 8px; padding-bottom: 16px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">TRANSACTION ID</span>
                <span style="font-size: 13px; font-weight: 800; color: #1A3827; font-family: monospace;">${txIdFormatted}</span>
              </div>
            </td>
            <td style="width: 50%; padding-left: 8px; padding-bottom: 16px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">DESCRIPTION / TITLE</span>
                <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txTitle}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="width: 50%; padding-right: 8px; padding-bottom: 16px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">PAID BY</span>
                <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txPaidBy}</span>
              </div>
            </td>
            <td style="width: 50%; padding-left: 8px; padding-bottom: 16px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">DATE & TIMESTAMP</span>
                <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txDateTime}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="width: 50%; padding-right: 8px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">ROOM CODE</span>
                <span style="font-size: 13px; font-weight: 800; color: #1A3827; font-family: monospace;">${roomDisplayName}</span>
              </div>
            </td>
            <td style="width: 50%; padding-left: 8px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">SPLIT METHOD</span>
                <span style="font-size: 13px; font-weight: 700; color: #0F172A;">${txSplit}</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Roommate Share Breakdown -->
        ${splitRowsHtml}

        <!-- Attached Receipt Proofs -->
        ${receiptRowsHtml}

        <!-- CTA -->
        <div style="text-align: center; margin-top: 32px;">
          <a href="https://tallyin.vercel.app" style="background-color: #1A3827; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(26, 56, 39, 0.2);">Open Tallyin Room Ledger</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #F8FAFC; padding: 24px 36px; border-top: 1px solid #E2E8F0; text-align: center;">
        <p style="font-size: 11px; color: #64748B; line-height: 1.5; margin: 0 0 6px 0;">
          Automated expense alert from Tallyin Roommate Sync Engine for room <strong>${roomDisplayName}</strong>.
        </p>
        <p style="font-size: 10px; color: #94A3B8; margin: 0;">
          © 2026 Tallyin Corporation. All rights reserved.
        </p>
      </div>
    </div>
  </div>
`;

const subjectText = `Tallyin Expense [${txIdFormatted}]: ${txTitle} (${formattedAmount})`;
const messageText = `Tallyin Alert [${actionTitle}] (ID: ${txIdFormatted}): "${txTitle}" of ${formattedAmount} by ${txPaidBy} in Room ${roomDisplayName} on ${txDateTime}. Category: ${txCategory}, Split: ${txSplit}. [Receipt Attached: 1 file(s)]`;

async function sendTest() {
  console.log(`Sending test email with receipt preview to ${targetEmail}...`);
  const response = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: subjectText,
      htmlBody: htmlBody,
      textBody: messageText
    })
  });
  console.log('Response Status:', response.status);
  const result = await response.text();
  console.log('Response Body:', result);
}

sendTest().catch(console.error);
