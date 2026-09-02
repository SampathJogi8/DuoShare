import fetch from 'node-fetch';

const WORKER_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';
const SOURCE_ROOM_ID = 'DUO-KLIZ-2508';
const TARGET_ROOM_ID = 'TL-SPTD-1888';
const TARGET_UID = 't8tECIWsjbW01Hm2e4B93bXVTuU2';
const TARGET_NICKNAME = 'Sampath Jogi Pusala';

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
    console.error(err);
    return null;
  }
}

async function seed() {
  console.log("=== SEEDING FUNDS TO USER ROOM ===");

  // Fetch all transactions in the source room
  const sourceTxs = await queryWorker('transactions', 'select', [
    { column: 'room_id', operator: 'eq', value: SOURCE_ROOM_ID }
  ]);

  if (!sourceTxs) {
    console.error("No source transactions found.");
    return;
  }

  // Filter fund tracker transactions
  const fundTxs = sourceTxs.filter(t => t.category === '__FUND_INIT__' || t.category === '__FUND_SPEND__');
  console.log(`Found ${fundTxs.length} fund tracker transactions to seed.`);

  let seedCount = 0;

  for (const t of fundTxs) {
    // Check if a transaction with the same ID already exists in the target room
    const existing = await queryWorker('transactions', 'select', [
      { column: 'id', operator: 'eq', value: t.id },
      { column: 'room_id', operator: 'eq', value: TARGET_ROOM_ID }
    ]);

    // Parse and update splits
    let splitsArr = [];
    try {
      splitsArr = typeof t.splits === 'string' ? JSON.parse(t.splits) : t.splits;
    } catch(e) {}

    if (splitsArr && Array.isArray(splitsArr)) {
      splitsArr.forEach(s => {
        s.uid = TARGET_UID;
        s.nickname = TARGET_NICKNAME;
      });
    }

    const payload = {
      id: t.id,
      room_id: TARGET_ROOM_ID,
      title: t.title,
      amount: t.amount,
      category: t.category,
      date: t.date,
      time: t.time,
      paid_by: TARGET_NICKNAME,
      paid_by_uid: TARGET_UID,
      is_shared: t.is_shared,
      split_type: t.split_type,
      split: t.split,
      splits: JSON.stringify(splitsArr),
      created_by: TARGET_UID
    };

    if (existing && existing.length > 0) {
      console.log(`Updating existing seeded transaction ${t.id} in target room...`);
      await queryWorker('transactions', 'update', [
        { column: 'id', operator: 'eq', value: t.id },
        { column: 'room_id', operator: 'eq', value: TARGET_ROOM_ID }
      ], payload);
    } else {
      console.log(`Inserting new seeded transaction ${t.id} into target room...`);
      await queryWorker('transactions', 'insert', payload);
      seedCount++;
    }
  }

  console.log(`=== SEEDING COMPLETE: Seeded ${seedCount} transactions ===`);
}

seed();
