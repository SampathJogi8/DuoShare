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

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }

    const res = await response.json();
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

async function settleRoom() {
  console.log(`=== START SETTLEMENT FOR ROOM: ${ROOM_ID} ===`);

  // 1. Fetch Room Members
  const { data: members, error: membersErr } = await queryWorker('members', 'select', [
    { column: 'room_id', operator: 'eq', value: ROOM_ID }
  ]);

  if (membersErr) {
    console.error('Error fetching members:', membersErr);
    return;
  }
  if (!members || members.length === 0) {
    console.log("No members found for room.");
    return;
  }
  console.log(`Loaded ${members.length} members:`, members.map(m => `${m.nickname || m.name} (${m.uid})`));

  // 2. Fetch Room Transactions
  const { data: rawTransactions, error: txErr } = await queryWorker('transactions', 'select', [
    { column: 'room_id', operator: 'eq', value: ROOM_ID }
  ]);

  if (txErr) {
    console.error('Error fetching transactions:', txErr);
    return;
  }
  console.log(`Loaded ${rawTransactions ? rawTransactions.length : 0} total transactions.`);

  // Parse transactions splits (similar to fetchTransactions map)
  const transactions = (rawTransactions || []).map(t => {
    let splits = t.splits;
    if (typeof splits === 'string') {
      try {
        splits = JSON.parse(splits);
      } catch (e) {
        splits = [];
      }
    }
    return {
      ...t,
      splits: splits || []
    };
  });

  // 3. Compute Roommate Balances
  const data = transactions.filter(t => t.category !== '__FUND_INIT__' && t.category !== '__FUND_SPEND__' && t.category !== '__SHOPPING__' && t.category !== '__BILL__' && t.category !== '__CHORE__' && t.category !== '__DELETE_PROPOSAL__');
  const roomBalances = {};
  
  // Initialize balances for all room members
  members.forEach(m => {
    const key = m.uid || m.id;
    if (key) roomBalances[key] = 0;
  });

  data.forEach(t => {
    const amount = Number(t.amount) || 0;
    const isPayment = t.category === 'Payment';
    
    // Determine Payer
    let payerUid = t.paid_by_uid || t.paidByUid;
    if (!payerUid) {
      const match = members.find(m => m.nickname === t.paid_by || m.name === t.paid_by || m.email === t.paid_by);
      if (match) {
        payerUid = match.uid || match.id;
      }
    }

    if (payerUid) {
      if (roomBalances[payerUid] !== undefined) {
        roomBalances[payerUid] += amount;
      } else {
        roomBalances[payerUid] = amount;
      }
    }

    if (isPayment) {
      // Resolve receiver
      let receiverUid = null;
      if (t.splits && Array.isArray(t.splits)) {
        const recSplit = t.splits.find(s => {
          let sUid = s.uid;
          if (!sUid) {
            const match = members.find(m => m.nickname === s.nickname || m.name === s.nickname);
            sUid = match ? (match.uid || match.id) : null;
          }
          return sUid !== payerUid && (Number(s.amount) > 0 || t.splits.length === 2);
        });
        if (recSplit) {
          receiverUid = recSplit.uid;
          if (!receiverUid) {
            const match = members.find(m => m.nickname === recSplit.nickname || m.name === recSplit.nickname);
            receiverUid = match ? (match.uid || match.id) : null;
          }
        }
      }

      if (!receiverUid && payerUid) {
        const otherMember = members.find(m => (m.uid || m.id) !== payerUid);
        if (otherMember) {
          receiverUid = otherMember.uid || otherMember.id;
        }
      }

      if (receiverUid) {
        if (roomBalances[receiverUid] !== undefined) {
          roomBalances[receiverUid] -= amount;
        } else {
          roomBalances[receiverUid] = -amount;
        }
      }
    } else {
      // Regular expense split logic
      if (t.splits && Array.isArray(t.splits) && t.splits.length > 0) {
        t.splits.forEach(split => {
          let splitUid = split.uid;
          if (!splitUid) {
            const match = members.find(m => m.nickname === split.nickname || m.name === split.nickname);
            splitUid = match ? (match.uid || match.id) : null;
          }
          if (splitUid) {
            if (roomBalances[splitUid] !== undefined) {
              roomBalances[splitUid] -= Number(split.amount) || 0;
            } else {
              roomBalances[splitUid] = -(Number(split.amount) || 0);
            }
          }
        });
      } else {
        const mKeys = Object.keys(roomBalances);
        if (mKeys.length > 0) {
          const share = amount / mKeys.length;
          mKeys.forEach(k => {
            roomBalances[k] -= share;
          });
        }
      }
    }
  });

  // Round values
  Object.keys(roomBalances).forEach(k => {
    roomBalances[k] = Math.round(roomBalances[k] * 100) / 100;
  });

  console.log("Calculated Net Balances:", roomBalances);

  // 4. Compute Suggested Transfers
  const debtors = [];
  const creditors = [];
  
  Object.entries(roomBalances).forEach(([uid, bal]) => {
    const member = members.find(m => (m.uid || m.id) === uid);
    if (member) {
      if (bal < -0.01) {
        debtors.push({ uid, nickname: member.nickname || member.name, amount: Math.abs(bal) });
      } else if (bal > 0.01) {
        creditors.push({ uid, nickname: member.nickname || member.name, amount: bal });
      }
    }
  });
  
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  const transfers = [];
  let dIdx = 0;
  let cIdx = 0;
  
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    
    const payment = Math.min(debtor.amount, creditor.amount);
    if (payment > 0.01) {
      transfers.push({
        fromUid: debtor.uid,
        fromName: debtor.nickname,
        toUid: creditor.uid,
        toName: creditor.nickname,
        amount: payment
      });
    }
    
    debtor.amount -= payment;
    creditor.amount -= payment;
    
    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  console.log("Suggested Transfers to clear debts:", transfers);

  if (transfers.length === 0) {
    console.log("Room is already completely settled! No actions needed.");
    return;
  }

  // 5. Insert Settlement Payments directly
  for (const t of transfers) {
    const amountVal = Math.round(t.amount * 100) / 100;
    const payerMember = members.find(m => (m.uid || m.id) === t.fromUid);
    const receiverMember = members.find(m => (m.uid || m.id) === t.toUid);

    const newPayment = {
      id: `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      room_id: ROOM_ID,
      title: `Payment: ${t.fromName} to ${t.toName}`,
      amount: amountVal,
      category: 'Payment',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      paid_by: t.fromName,
      paid_by_uid: t.fromUid,
      is_shared: 1,
      split_type: 'amount',
      splits: JSON.stringify([
        { uid: t.fromUid, nickname: t.fromName, amount: 0 },
        { uid: t.toUid, nickname: t.toName, amount: amountVal }
      ])
    };

    console.log(`Inserting payment: ${newPayment.title} of ₹${amountVal}...`);
    const { data, error } = await queryWorker('transactions', 'insert', [], [newPayment]);
    if (error) {
      console.error(`Failed to insert transaction for ${newPayment.title}:`, error);
    } else {
      console.log(`Successfully settled: ${newPayment.title} (₹${amountVal})`);
    }
  }

  console.log("=== SETTLEMENT COMPLETE ===");
}

settleRoom();
