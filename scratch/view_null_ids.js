import fs from 'fs';

const WORKER_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';
const ROOM_ID = 'TL-SPTD-1888';

async function check() {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table: 'transactions',
      action: 'select',
      filters: [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]
    })
  });
  const res = await response.json();
  const txs = res.data;

  console.log("=== ALL ROOM TRANSACTIONS ===");
  txs.forEach(t => {
    console.log(`id: ${JSON.stringify(t.id)}, title: ${JSON.stringify(t.title)}, paid_by_uid: ${JSON.stringify(t.paid_by_uid)}, amount: ${t.amount}`);
  });
}

check();
