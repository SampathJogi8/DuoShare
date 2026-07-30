import fetch from 'node-fetch';

const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';

async function testPayloads() {
  const emails = ['sampathjogipusala123@gmail.com'];

  // Test Payload 1: Add Expense
  const payloadAdd = {
    to: emails[0],
    subject: 'Tallyin Expense: Dinner (₹500)',
    htmlBody: '<div style="font-family:sans-serif"><h2>New Expense Added</h2><p>Testing add notification</p></div>',
    textBody: 'Tallyin Alert [New Expense Added]: "Dinner" of ₹500 by Sampath in Room TL-ROOM.'
  };

  // Test Payload 2: Update Expense
  const payloadUpdate = {
    to: emails[0],
    subject: 'Tallyin Expense Updated: Dinner (₹650)',
    htmlBody: '<div style="font-family:sans-serif"><h2>Expense Updated</h2><p>Testing update notification</p></div>',
    textBody: 'Tallyin Alert [Expense Updated]: "Dinner" of ₹650 by Sampath in Room TL-ROOM.'
  };

  // Test Payload 3: Settle Payment
  const payloadSettle = {
    to: emails[0],
    subject: 'Tallyin Settlement Recorded: Payment: Sampath to Alex (₹300)',
    htmlBody: '<div style="font-family:sans-serif"><h2>Payment Settled</h2><p>Testing settle notification</p></div>',
    textBody: 'Tallyin Alert [Payment Settled]: "Payment: Sampath to Alex" of ₹300 by Sampath in Room TL-ROOM.'
  };

  console.log('Sending Add Payload...');
  const r1 = await fetch(activeScriptUrl, { method: 'POST', body: JSON.stringify(payloadAdd) });
  console.log('R1:', r1.status, await r1.text());

  console.log('Sending Update Payload...');
  const r2 = await fetch(activeScriptUrl, { method: 'POST', body: JSON.stringify(payloadUpdate) });
  console.log('R2:', r2.status, await r2.text());

  console.log('Sending Settle Payload...');
  const r3 = await fetch(activeScriptUrl, { method: 'POST', body: JSON.stringify(payloadSettle) });
  console.log('R3:', r3.status, await r3.text());
}

testPayloads().catch(console.error);
