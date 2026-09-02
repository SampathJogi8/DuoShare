import fs from 'fs';

const WORKER_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';
const ROOM_ID = 'TL-SPTD-1888';

async function queryWorker(table, action, filters = [], data = null) {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        action,
        filters,
        data
      })
    });
    const res = await response.json();
    return res.data;
  } catch (err) {
    return null;
  }
}

async function check() {
  const transactions = await queryWorker('transactions', 'select', [
    { column: 'room_id', operator: 'eq', value: ROOM_ID }
  ]);

  const targetUids = ['d0b4cb3b-e0bd-44df-b876-f284e542dc0f', '961a6854-4fe2-46b6-9e72-cf06433c489a'];
  
  console.log("=== TRANSACTIONS CONTAINING TARGET UIDS ===");
  transactions.forEach(t => {
    let hasTarget = false;
    if (targetUids.includes(t.paid_by_uid)) {
      hasTarget = true;
    }
    let splits = [];
    try {
      splits = typeof t.splits === 'string' ? JSON.parse(t.splits) : t.splits;
    } catch(e) {}
    if (splits && Array.isArray(splits)) {
      splits.forEach(s => {
        if (targetUids.includes(s.uid)) {
          hasTarget = true;
        }
      });
    }
    
    if (hasTarget) {
      console.log(`TX ID: ${t.id}, Title: "${t.title}", PayerName: "${t.paid_by}", PayerUid: "${t.paid_by_uid}", Category: "${t.category}", Date: "${t.date}"`);
      console.log("Splits:", splits);
      console.log("---");
    }
  });

  console.log("=== MEMBERS IN THIS ROOM ===");
  const members = await queryWorker('members', 'select', [
    { column: 'room_id', operator: 'eq', value: ROOM_ID }
  ]);
  console.log(members);
}

check();
