const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const targetEmail = 'sampathjogipusala123@gmail.com';

// 1x1 Red Pixel PNG in base64
const sampleBase64Png = 'iVBORw0KGgoAAAANSUEngineAAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAADUlEQVQIHWP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const sampleDataUrl = `data:image/png;base64,${sampleBase64Png}`;

async function testGasAttachments() {
  console.log('Testing Apps Script attachments with base64 data...');
  
  // Test A: Sending attachments array
  const resA = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: targetEmail,
      subject: 'Tallyin Test: Receipt Attachment Test',
      htmlBody: '<h1>Receipt Attachment Test</h1><p>Checking if Apps Script handles attachments parameter.</p>',
      textBody: 'Receipt Attachment Test',
      attachments: [
        {
          filename: 'receipt_sample.png',
          mimeType: 'image/png',
          base64: sampleBase64Png
        }
      ]
    })
  });
  
  console.log('Test A Status:', resA.status);
  console.log('Test A Body:', await resA.text());
}

testGasAttachments().catch(console.error);
