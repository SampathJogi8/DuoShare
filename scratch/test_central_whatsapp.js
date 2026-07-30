import fetch from 'node-fetch';

async function testCentralScriptRelay() {
  console.log('🚀 Testing Central Tallyin Script Relay Endpoint...');

  const activeScriptUrl = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';

  const testPayload = {
    actionType: 'whatsapp_alert',
    room_id: 'DUO-TEST-2026',
    recipients: ['9876543210'],
    alert_type: 'bill_due_today',
    title: 'WiFi Fiber Broadband',
    amount: 999,
    due_date: new Date().toISOString().split('T')[0],
    payer: 'Alex',
    message: `🔔 *DuoShare Flat Bill Alert*\n\n📌 *Bill:* WiFi Fiber Broadband\n💰 *Amount:* ₹999\n📅 *Due Date:* ${new Date().toISOString().split('T')[0]} (TODAY)\n👤 *Payer:* Alex\n\n👉 Pay & log on DuoShare: https://tallyin.app`
  };

  try {
    const response = await fetch(activeScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    console.log('✓ Central Endpoint Response Status:', response.status);
    const text = await response.text();
    console.log('✓ Response Body (first 200 chars):', text.substring(0, 200));
  } catch (err) {
    console.log('ℹ Central endpoint error:', err.message);
  }
}

testCentralScriptRelay();
