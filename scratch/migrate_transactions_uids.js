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
    console.error(err);
    return null;
  }
}

const UID_MAP = {
  'd0b4cb3b-e0bd-44df-b876-f284e542dc0f': 't8tECIWsjbW01Hm2e4B93bXVTuU2',
  '961a6854-4fe2-46b6-9e72-cf06433c489a': 'axexdrzByIgihcBxpyyRCyZIAqy1'
};

async function runMigration() {
  console.log("=== STARTING TRANSACTIONS UID MIGRATION ===");

  // Fetch all transactions for the room
  const transactions = await queryWorker('transactions', 'select', [
    { column: 'room_id', operator: 'eq', value: ROOM_ID }
  ]);

  if (!transactions) {
    console.error("No transactions found.");
    return;
  }

  console.log(`Loaded ${transactions.length} transactions for migration inspection.`);

  let updateCount = 0;

  for (const t of transactions) {
    let needsUpdate = false;
    let newPaidByUid = t.paid_by_uid;
    
    // Check if payer UID is in our map
    if (t.paid_by_uid && UID_MAP[t.paid_by_uid]) {
      newPaidByUid = UID_MAP[t.paid_by_uid];
      needsUpdate = true;
      console.log(`Updating Payer UID for TX ID: ${t.id} from ${t.paid_by_uid} to ${newPaidByUid}`);
    }

    // Check splits JSON
    let splits = [];
    try {
      splits = typeof t.splits === 'string' ? JSON.parse(t.splits) : t.splits;
    } catch(e) {}

    if (splits && Array.isArray(splits)) {
      splits.forEach(s => {
        if (s.uid && UID_MAP[s.uid]) {
          console.log(`Updating Split UID for TX ID: ${t.id} from ${s.uid} to ${UID_MAP[s.uid]}`);
          s.uid = UID_MAP[s.uid];
          needsUpdate = true;
        }
      });
    }

    if (needsUpdate) {
      const updatedFields = {
        paid_by_uid: newPaidByUid,
        splits: JSON.stringify(splits)
      };

      console.log(`Executing database update for TX ID: ${t.id}...`);
      const { data, error } = await queryWorker('transactions', 'update', [
        { column: 'id', operator: 'eq', value: t.id }
      ], updatedFields);

      if (error) {
        console.error(`Failed to update TX ID: ${t.id}:`, error);
      } else {
        updateCount++;
        console.log(`Successfully migrated TX ID: ${t.id}`);
      }
    }
  }

  console.log(`=== MIGRATION COMPLETE: Updated ${updateCount} transactions ===`);
}

runMigration();
