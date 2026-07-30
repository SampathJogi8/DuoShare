const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// 1x1 Red Pixel PNG base64
const sampleBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function sendCompressedReceiptTest() {
  console.log(`Sending compressed receipt photo notification to ${targetEmail}...`);

  const response = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Tallyin Expense Alert [#TX-5DDEE7C0]: testc (With Compressed Receipt Photo)',
      htmlBody: `
        <div style="background-color: #F1F5F9; padding: 40px 16px; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #E2E8F0;">
            <h2 style="color: #0F172A;">New Expense Added</h2>
            <p style="color: #64748B;">A new transaction "testc" of ₹10 was logged by Sampath Jogi Pusala in Room TL-JGJK-4363.</p>

            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin: 24px 0;">
              <div style="font-size: 10px; font-weight: 800; color: #1A3827; text-transform: uppercase;">ATTACHED RECEIPT PROOF (1 FILE)</div>
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 14px; margin-top: 10px;">
                <span style="font-weight: 700; color: #0F172A;">📷 Receipt Photo #1 (Attached)</span>
                <div style="font-size: 11px; color: #64748B;">Receipt image attached to email (see attached files)</div>
              </div>
            </div>
          </div>
        </div>
      `,
      textBody: 'Tallyin Alert [New Expense Added]: "testc" of ₹10. [Receipt Attached: 1 file(s)]',
      attachments: [
        {
          filename: 'receipt_1.jpg',
          mimeType: 'image/jpeg',
          base64: sampleBase64Png
        }
      ]
    })
  });

  console.log('Response Status:', response.status);
  console.log('Response Body:', await response.text());
}

sendCompressedReceiptTest().catch(console.error);
