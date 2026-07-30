const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// Generate ~500KB fake base64 data URI
const dummyBase64 = 'A'.repeat(500000);
const dataUri = `data:image/png;base64,${dummyBase64}`;

async function testHtmlSizeLimit() {
  console.log('Test 1: Sending email with massive htmlBody (data URI inside img src)...');
  const res1 = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Test 1: Massive HTML Body',
      htmlBody: `<div><h1>Test</h1><img src="${dataUri}" /></div>`,
      textBody: 'Test 1'
    })
  });
  console.log('Test 1 Status:', res1.status, 'Body:', await res1.text());

  console.log('\nTest 2: Sending email with clean lightweight htmlBody + attachments array...');
  const res2 = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Test 2: Clean Lightweight HTML Body with Attachments',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Tallyin Expense Notification</h2>
          <p>Expense added with attached receipt proof.</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-top: 12px;">
            <strong>Attached Receipt Proof (1 File)</strong>
            <p style="font-size: 12px; color: #64748B; margin: 4px 0 0 0;">Receipt image file attached to this email.</p>
          </div>
        </div>
      `,
      textBody: 'Test 2',
      attachments: [
        {
          filename: 'receipt_1.png',
          mimeType: 'image/png',
          base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }
      ]
    })
  });
  console.log('Test 2 Status:', res2.status, 'Body:', await res2.text());
}

testHtmlSizeLimit().catch(console.error);
