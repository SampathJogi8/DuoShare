import fetch from 'node-fetch'; // wait, in ES Modules fetch is global in Node 18+, but we can use the global fetch

const WORKER_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';

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

async function findCode() {
  const users = await queryWorker('users', 'select', []);
  console.log("=== USERS ===");
  console.log(users);

  const transactions = await queryWorker('transactions', 'select', []);
  console.log("=== ALL FUNDS (__FUND_INIT__) ===");
  const fundInits = transactions.filter(t => t.category === '__FUND_INIT__');
  fundInits.forEach(f => {
    console.log(`Fund ID: ${f.id}, Title: "${f.title}", Amount: ${f.amount}, PayerUid: ${f.paid_by_uid}, RoomId: ${f.room_id}`);
  });
}

findCode();
