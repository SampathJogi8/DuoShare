const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// Minimal valid 1-page PDF base64 string
const pdfBase64 = 'JVBERi0xLjMKJSDlzPT0CiAxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYXdlcyAyIDAgUj4+CmVuZG9iagogMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAyMDAgMjAwXS9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAyMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDA0MDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxOTEKJSVFT0Y=';

// Minimal valid PNG base64 string
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function testRealAttachments() {
  console.log(`Sending email with real attached PDF and PNG files to ${targetEmail}...`);
  
  const res = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Tallyin Expense Alert [#TX-7711]: Supermarket & Bill (With Attachments)',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #1A3827;">Tallyin Expense Alert</h2>
          <p>Expense logged with <strong>2 receipt attachments</strong> (PDF + PNG).</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-top: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: #1A3827; text-transform: uppercase;">ATTACHED RECEIPT PROOF (2 FILES)</div>
            <p style="font-size: 13px; color: #64748B;">Please find the attached PDF document and receipt image file included with this email.</p>
          </div>
        </div>
      `,
      textBody: 'Tallyin Expense Alert: Supermarket & Bill of ₹1,500. [2 Receipt Files Attached]',
      attachments: [
        {
          filename: 'Receipt_Bill_Invoice.pdf',
          mimeType: 'application/pdf',
          base64: pdfBase64
        },
        {
          filename: 'Receipt_Photo.png',
          mimeType: 'image/png',
          base64: pngBase64
        }
      ]
    })
  });

  console.log('Status:', res.status);
  console.log('Result:', await res.text());
}

testRealAttachments().catch(console.error);
