import fetch from 'node-fetch';

const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';

async function testGas() {
  console.log('Sending test email to script URL...');
  
  // Test 1: Normal alert (like sendEmailNotification)
  const res1 = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'sampathjogipusala123@gmail.com',
      subject: 'Test Alert: Expense Updated',
      htmlBody: '<h1>Test Expense Updated Alert</h1><p>Testing Apps Script payload</p>',
      textBody: 'Test Expense Updated Alert'
    })
  });
  console.log('Res 1 status:', res1.status);
  const text1 = await res1.text();
  console.log('Res 1 body:', text1);

  // Test 2: Text plain format
  const res2 = await fetch(activeScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      to: 'sampathjogipusala123@gmail.com',
      subject: 'Test Alert 2: Payment Settled',
      htmlBody: '<h1>Test Payment Settled Alert</h1><p>Testing Apps Script text/plain payload</p>',
      textBody: 'Test Payment Settled Alert'
    })
  });
  console.log('Res 2 status:', res2.status);
  const text2 = await res2.text();
  console.log('Res 2 body:', text2);
}

testGas().catch(console.error);
