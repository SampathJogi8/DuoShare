const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// PNG base64
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// JPEG base64
const sampleJpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

// PDF base64
const samplePdfBase64 = 'JVBERi0xLjMKJSDlzPT0CiAxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYXdlcyAyIDAgUj4+CmVuZG9iagogMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAyMDAgMjAwXS9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAyMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDA0MDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxOTEKJSVFT0Y=';

async function testAllTypes() {
  console.log('Sending email with PNG, JPG, and PDF attachments...');

  const attachments = [
    {
      filename: 'receipt_photo_1.png',
      mimeType: 'image/png',
      base64: samplePngBase64
    },
    {
      filename: 'receipt_photo_2.jpg',
      mimeType: 'image/jpeg',
      base64: sampleJpgBase64
    },
    {
      filename: 'receipt_document.pdf',
      mimeType: 'application/pdf',
      base64: samplePdfBase64
    }
  ];

  const payload = {
    to: targetEmail,
    subject: 'Tallyin Test: PNG + JPG + PDF Attachments Verification',
    htmlBody: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #F1F5F9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 16px;">
          <h2 style="color: #1A3827;">Tallyin Attachment Diagnostic Test</h2>
          <p style="color: #475569;">Testing attachment delivery for PNG images, JPG images, and PDF documents.</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-top: 16px;">
            <strong style="color: #0F172A;">Attached Files in this email:</strong>
            <ul style="color: #64748B; font-size: 13px; margin-top: 8px;">
              <li>receipt_photo_1.png (PNG Image)</li>
              <li>receipt_photo_2.jpg (JPG Image)</li>
              <li>receipt_document.pdf (PDF Document)</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    textBody: 'Tallyin Diagnostic Test: PNG + JPG + PDF attachments included.',
    attachments: attachments
  };

  const response = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });

  console.log('Response Status:', response.status);
  console.log('Response Body:', await response.text());
}

testAllTypes().catch(console.error);
