const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// Clean PNG base64
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function testLightweightHtmlBody() {
  console.log('Sending lightweight htmlBody email with attachment to Google Apps Script...');

  const payload = {
    to: targetEmail,
    subject: 'Tallyin Test: Lightweight htmlBody with Real Attachment',
    htmlBody: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #F1F5F9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 16px;">
          <h2 style="color: #1A3827;">New Expense Added</h2>
          <p style="color: #475569;">Transaction test of ₹500 with receipt file attached.</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-top: 16px;">
            <strong style="color: #0F172A;">Attached Receipt Files (1)</strong>
            <div style="color: #64748B; font-size: 12px; margin-top: 8px;">📷 receipt_1.png (See attached files in your email client)</div>
          </div>
        </div>
      </div>
    `,
    textBody: 'Tallyin Test: Lightweight htmlBody with Real Attachment',
    attachments: [
      {
        filename: 'receipt_1.png',
        mimeType: 'image/png',
        base64: samplePngBase64
      }
    ]
  };

  const response = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });

  console.log('Status:', response.status);
  console.log('Response:', await response.text());
}

testLightweightHtmlBody().catch(console.error);
