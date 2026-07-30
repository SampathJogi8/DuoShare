const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// Clean base64 string without data: URI prefix
const cleanBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function testFormats() {
  console.log('Testing Format 1: attachments array with clean base64 string...');
  const res1 = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Tallyin Attachment Test 1 (Clean Base64)',
      htmlBody: '<h1>Test 1</h1><p>Clean base64 attachment test</p>',
      textBody: 'Test 1',
      attachments: [
        {
          name: 'receipt.png',
          filename: 'receipt.png',
          mimeType: 'image/png',
          base64: cleanBase64Png,
          data: cleanBase64Png
        }
      ]
    })
  });
  console.log('Res 1 Status:', res1.status, 'Body:', await res1.text());

  console.log('Testing Format 2: files array...');
  const res2 = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Tallyin Attachment Test 2 (Files array)',
      htmlBody: '<h1>Test 2</h1><p>Files array test</p>',
      textBody: 'Test 2',
      files: [
        {
          name: 'receipt.png',
          type: 'image/png',
          base64: cleanBase64Png
        }
      ]
    })
  });
  console.log('Res 2 Status:', res2.status, 'Body:', await res2.text());
}

testFormats().catch(console.error);
