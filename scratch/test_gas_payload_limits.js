const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// Clean valid 1x1 PNG base64
const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function testSize(sizeKb) {
  console.log(`Testing payload size: ~${sizeKb} KB...`);
  // Padding string to reach exact size
  const padding = 'A'.repeat(sizeKb * 1024);
  
  try {
    const res = await fetch(activeScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        to: targetEmail,
        subject: `Test Size: ${sizeKb} KB`,
        htmlBody: `<h1>Test ${sizeKb} KB</h1>`,
        textBody: `Test ${sizeKb} KB`,
        attachments: [
          {
            filename: 'receipt.png',
            mimeType: 'image/png',
            base64: tinyPngBase64
          }
        ],
        extraPadding: padding
      })
    });
    console.log(`Size ${sizeKb} KB -> Status: ${res.status}, Body: ${await res.text()}`);
  } catch (err) {
    console.error(`Size ${sizeKb} KB -> Failed: ${err.message}`);
  }
}

async function runTests() {
  await testSize(100);   // 100 KB
  await testSize(300);   // 300 KB
  await testSize(600);   // 600 KB
  await testSize(1000);  // 1 MB
  await testSize(2500);  // 2.5 MB
}

runTests().catch(console.error);
