const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// Data URIs exactly like what user uploads in Tallyin via FileReader.readAsDataURL
const base64PdfDataUri = 'data:application/pdf;base64,JVBERi0xLjMKJSDlzPT0CiAxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYXdlcyAyIDAgUj4+CmVuZG9iagogMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAyMDAgMjAwXS9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAyMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDA0MDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxOTEKJSVFT0Y=';
const base64PngDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const userUploadedFiles = [base64PdfDataUri, base64PngDataUri];

// Extract attachments (matching App.jsx logic)
const emailAttachments = [];
userUploadedFiles.forEach((fileData, idx) => {
  if (typeof fileData === 'string' && fileData.startsWith('data:')) {
    try {
      const parts = fileData.split(',');
      if (parts.length === 2) {
        const header = parts[0];
        const base64Data = parts[1];
        const mimeType = header.split(';')[0].replace('data:', '') || 'image/png';
        
        let ext = 'png';
        if (mimeType.includes('pdf')) ext = 'pdf';
        else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) ext = 'xlsx';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
        else if (mimeType.includes('heic')) ext = 'png';

        emailAttachments.push({
          filename: `receipt_${idx + 1}.${ext}`,
          mimeType: mimeType,
          base64: base64Data
        });
      }
    } catch (e) {
      console.warn('Failed to parse base64 receipt attachment:', e);
    }
  }
});

async function testUserAppFlow() {
  console.log(`Simulating user adding transaction with 2 uploaded files to ${targetEmail}...`);
  console.log('Parsed emailAttachments:', emailAttachments.map(a => `${a.filename} (${a.mimeType}, ${a.base64.length} chars)`));
  
  const res = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Tallyin Expense Alert [#TX-7811]: Restaurant Dinner & PDF Bill (With 2 Real Attachments)',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Tallyin Expense Notification</h2>
          <p>Expense added with 2 uploaded receipt files.</p>
        </div>
      `,
      textBody: 'Tallyin Expense Alert: Restaurant Dinner. [Receipt Attached: 2 file(s)]',
      attachments: emailAttachments
    })
  });

  console.log('Response Status:', res.status);
  console.log('Response Body:', await res.text());
}

testUserAppFlow().catch(console.error);
