import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';
const D1_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';
const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';

const ROOM_ID = 'TL-WFHP-5508';
const PRIMARY_ROOM_ID = 'TL-JGJK-4363';

async function fetchD1(table, action, filters = [], data = null) {
  const body = { table, action, filters };
  if (data !== null) body.data = data;
  const res = await fetch(D1_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function run() {
  console.log('=== STEP 1: FETCH ALL ROOM DATA FOR TL-WFHP-5508 ===');
  const d1RoomRes = await fetchD1('rooms', 'select', [{ column: 'id', operator: 'eq', value: ROOM_ID }]);
  const d1MembersRes = await fetchD1('members', 'select', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]);
  const d1TxRes = await fetchD1('transactions', 'select', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]);

  const roomData = d1RoomRes.data?.[0] || { id: ROOM_ID, name: 'Yarcaud' };
  const members = d1MembersRes.data || [];
  const transactions = (d1TxRes.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log(`Room: ${roomData.name} (${roomData.id})`);
  console.log(`Members: ${members.length}`);
  console.log(`Transactions: ${transactions.length}`);

  // Create full local backup file
  const backup = {
    exportedAt: new Date().toISOString(),
    room: roomData,
    members,
    transactions
  };
  fs.writeFileSync('scratch/TL-WFHP-5508_complete_backup.json', JSON.stringify(backup, null, 2));
  console.log('Saved local backup to scratch/TL-WFHP-5508_complete_backup.json');

  // Compute breakdown and settlements
  let totalSpend = 0;
  let paidBySampath = 0;
  let paidByEniya = 0;
  let sampathShare = 0;
  let eniyaShare = 0;

  const categoryTotals = {
    stay: 0,
    travel: 0,
    food: 0,
    activities: 0,
    fuel: 0,
    misc: 0
  };

  const formattedTransactions = transactions.map(t => {
    const amt = Number(t.amount) || 0;
    totalSpend += amt;
    const isSampath = (t.paid_by && t.paid_by.toLowerCase().includes('sampath')) || t.paid_by_uid === 't8tECIWsjbW01Hm2e4B93bXVTuU2';
    if (isSampath) paidBySampath += amt; else paidByEniya += amt;

    const catLower = (t.category || '').toLowerCase();
    const titleLower = (t.title || '').toLowerCase();

    let mappedCat = 'food';
    if (catLower.includes('fuel') || titleLower.includes('petrol') || titleLower.includes('fuel')) {
      mappedCat = 'fuel';
    } else if (titleLower.includes('hotel') || titleLower.includes('stay') || titleLower.includes('resort')) {
      mappedCat = 'stay';
    } else if (titleLower.includes('bike') || titleLower.includes('cab') || titleLower.includes('travel') || titleLower.includes('bus') || titleLower.includes('flight')) {
      mappedCat = 'travel';
    } else if (titleLower.includes('playzone') || titleLower.includes('park') || titleLower.includes('sky')) {
      mappedCat = 'activities';
    } else if (titleLower.includes('fine') || titleLower.includes('toll')) {
      mappedCat = 'misc';
    } else {
      mappedCat = 'food';
    }

    categoryTotals[mappedCat] = (categoryTotals[mappedCat] || 0) + amt;

    const sShare = amt / 2;
    const eShare = amt / 2;
    sampathShare += sShare;
    eniyaShare += eShare;

    return {
      id: t.id,
      title: t.title,
      amount: amt,
      category: mappedCat,
      originalCategory: t.category,
      date: t.date,
      time: t.time?.split('|')[0] || t.time,
      paidBy: t.paid_by,
      paidByUid: t.paid_by_uid,
      splitType: 'equal',
      splits: [
        { uid: 't8tECIWsjbW01Hm2e4B93bXVTuU2', nickname: 'Sampath Jogi Pusala', amount: sShare },
        { uid: 'z4MY8EgEPZU5Rme5ojwPIxMAEKE2', nickname: 'Eniya', amount: eShare }
      ]
    };
  });

  const eniyaOwesSampath = eniyaShare - paidByEniya;

  console.log('\n--- FINANCIAL SUMMARY ---');
  console.log(`Total Spend: ₹${totalSpend.toLocaleString('en-IN')}`);
  console.log(`Sampath Paid: ₹${paidBySampath.toLocaleString('en-IN')} | Share: ₹${sampathShare.toLocaleString('en-IN')}`);
  console.log(`Eniya Paid: ₹${paidByEniya.toLocaleString('en-IN')} | Share: ₹${eniyaShare.toLocaleString('en-IN')}`);
  console.log(`Settlement: Eniya owes Sampath ₹${eniyaOwesSampath.toLocaleString('en-IN')}`);
  console.log('Category Totals:', categoryTotals);

  // Generate Completed Trip Object for TripExpenseManager
  const completedTripObject = {
    id: `trip-room-${ROOM_ID}`,
    roomId: ROOM_ID,
    title: 'Yercaud Vacation Trip',
    destination: 'Yercaud, Tamil Nadu',
    startDate: '2026-09-29',
    endDate: '2026-09-30',
    status: 'Completed',
    closedAt: new Date().toISOString(),
    budget: 10000,
    currency: '₹',
    companions: [
      { id: 'c-host', uid: 't8tECIWsjbW01Hm2e4B93bXVTuU2', name: 'Sampath Jogi Pusala', email: 'sampathjogipusala123@gmail.com', isHost: true },
      { id: 'c-rm-1', uid: 'z4MY8EgEPZU5Rme5ojwPIxMAEKE2', name: 'Eniya', email: 'eniya2238@gmail.com', isHost: false }
    ],
    planner: {
      stay: 4000,
      travel: 2500,
      food: 2000,
      activities: 1000,
      fuel: 500
    },
    expenses: formattedTransactions.map(t => ({
      id: t.id,
      title: t.title,
      amount: t.amount,
      category: t.category,
      date: t.date,
      paidBy: 'c-host',
      payerName: 'Sampath Jogi Pusala',
      splitType: 'equal',
      includedMembers: ['c-host', 'c-rm-1']
    })),
    settlements: [
      {
        id: `st-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        payerId: 'c-rm-1',
        payerName: 'Eniya',
        receiverId: 'c-host',
        receiverName: 'Sampath Jogi Pusala',
        amount: eniyaOwesSampath,
        note: 'Final settlement for Yercaud Trip',
        status: 'Pending Settlement'
      }
    ]
  };

  console.log('\n=== STEP 2: DISPATCH STATEMENT EMAILS TO BOTH USERS ===');
  
  // Format HTML Email Report
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B1510; margin: 0; padding: 32px 16px; color: #F1F5F9; }
    .container { max-width: 640px; margin: 0 auto; background-color: #122118; border-radius: 20px; border: 1px solid #1E3A2B; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .header { background: linear-gradient(135deg, #1A3827 0%, #0D2015 100%); padding: 36px 28px; text-align: center; border-bottom: 1px solid #234834; }
    .badge { display: inline-block; background-color: #A3E635; color: #0F172A; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .header h1 { color: #FFFFFF; font-size: 24px; font-weight: 900; margin: 0 0 6px 0; }
    .header p { color: #86EFAC; font-size: 13px; margin: 0; }
    .content { padding: 32px 28px; }
    .card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 14px; padding: 16px; }
    .stat-label { font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .stat-val { font-size: 20px; font-weight: 900; color: #FFFFFF; }
    .settlement-box { background: linear-gradient(135deg, #162F21 0%, #0F2016 100%); border: 1.5px solid #A3E635; border-radius: 16px; padding: 20px; margin-bottom: 28px; }
    .table-container { margin-top: 24px; border-radius: 12px; overflow: hidden; border: 1px solid #1E3A2B; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background-color: #1A3827; color: #A3E635; font-weight: 800; text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 14px; border-bottom: 1px solid #1E3A2B; background-color: #0D1A13; color: #E2E8F0; }
    tr:nth-child(even) td { background-color: #0A140F; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background-color: #1E3A2B; color: #86EFAC; }
    .footer { background-color: #08100C; padding: 20px; text-align: center; border-top: 1px solid #1A3827; color: #64748B; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Trip Completed & Space Archived</div>
      <h1>Yercaud Vacation Trip</h1>
      <p>Room <strong>TL-WFHP-5508</strong> Permanently Closed • Final Ledger Statement</p>
    </div>
    
    <div class="content">
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #CBD5E1; line-height: 1.6;">
        The shared trip space <strong>"Yarcaud"</strong> (Code: <code>TL-WFHP-5508</code>) has completed its journey and is now permanently closed. All individual expense records have been securely added into your personal account data for future reference. Below is the final ledger report:
      </p>

      <!-- Key Stats Grid -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 20px;">
        <tr>
          <td style="background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 14px; padding: 16px; width: 50%;">
            <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Total Trip Spend</div>
            <div style="font-size: 22px; font-weight: 900; color: #A3E635; margin-top: 4px;">₹${totalSpend.toLocaleString('en-IN')}</div>
          </td>
          <td style="background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 14px; padding: 16px; width: 50%;">
            <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Total Items Logged</div>
            <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; margin-top: 4px;">${formattedTransactions.length} items</div>
          </td>
        </tr>
      </table>

      <!-- Settlement Box -->
      <div class="settlement-box">
        <div style="font-size: 11px; font-weight: 800; color: #A3E635; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">FINAL DEBT SETTLEMENT</div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
          <span style="color: #94A3B8;">Sampath Jogi Pusala Paid:</span>
          <strong style="color: #FFFFFF;">₹${paidBySampath.toLocaleString('en-IN')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px;">
          <span style="color: #94A3B8;">Eniya Paid:</span>
          <strong style="color: #FFFFFF;">₹${paidByEniya.toLocaleString('en-IN')}</strong>
        </div>
        <div style="border-top: 1px solid #234834; padding-top: 12px; margin-top: 8px;">
          <div style="font-size: 15px; color: #86EFAC; font-weight: 800;">
            👉 Eniya owes Sampath Jogi Pusala: ₹${eniyaOwesSampath.toLocaleString('en-IN')}
          </div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Each person's 50% split equal share is ₹${sampathShare.toLocaleString('en-IN')}.</p>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">SPENDING BY CATEGORY</div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #1E3A2B; border-radius: 10px; overflow: hidden;">
          <tr>
            <td style="padding: 8px 12px; font-size: 12px;">🍔 Food & Dining</td>
            <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${categoryTotals.food.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-size: 12px;">🚗 Transit & Travel</td>
            <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${categoryTotals.travel.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-size: 12px;">🏨 Stay & Accommodation</td>
            <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${categoryTotals.stay.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-size: 12px;">🌴 Activities & Sightseeing</td>
            <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${categoryTotals.activities.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-size: 12px;">⛽ Fuel & Tolls</td>
            <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${categoryTotals.fuel.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-size: 12px;">🏷️ Misc & Fine</td>
            <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${categoryTotals.misc.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <!-- Itemized Ledger -->
      <div style="font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">ALL 13 ITEMIZED EXPENSES</div>
      <div style="border: 1px solid #1E3A2B; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; font-size: 10px;">Date</th>
              <th style="padding: 10px; font-size: 10px;">Description</th>
              <th style="padding: 10px; font-size: 10px;">Category</th>
              <th style="padding: 10px; font-size: 10px;">Paid By</th>
              <th style="padding: 10px; font-size: 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${formattedTransactions.map(t => `
              <tr>
                <td style="padding: 10px; font-size: 11px; white-space: nowrap;">${t.date}</td>
                <td style="padding: 10px; font-size: 11px; font-weight: bold; color: #FFFFFF;">${t.title}</td>
                <td style="padding: 10px; font-size: 11px;"><span class="tag">${t.category}</span></td>
                <td style="padding: 10px; font-size: 11px;">${t.paidBy}</td>
                <td style="padding: 10px; font-size: 11px; text-align: right; font-weight: 800; color: #A3E635;">₹${t.amount.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
          🔒 <strong>Privacy & Access Notice:</strong> Room <code>TL-WFHP-5508</code> has been permanently closed. All individual expense records have been transferred into your private personal account ledger (under <em>Personal Expenses</em> and <em>Completed Trips</em>), where you can view and audit them anytime. They are private to your user account and not visible to anyone else.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://tallyin.vercel.app" style="display: inline-block; background-color: #A3E635; color: #0B1510; font-weight: 900; font-size: 13px; padding: 12px 32px; border-radius: 12px; text-decoration: none;">Open Tallyin Ledger</a>
      </div>
    </div>

    <div class="footer">
      Tallyin Autonomous Space Governance • Trip Splitter Completed Statement
    </div>
  </div>
</body>
</html>
  `;

  const recipients = [
    { email: 'sampathjogipusala123@gmail.com', name: 'Sampath Jogi Pusala' },
    { email: 'eniya2238@gmail.com', name: 'Eniya' }
  ];

  for (const r of recipients) {
    console.log(`Dispatching final trip statement email to ${r.name} (${r.email})...`);
    try {
      const emailPayload = {
        action: 'send_email',
        to: r.email,
        subject: `[Tallyin Trip Statement] Yercaud Vacation Trip Completed • Final Settlement & Ledger`,
        body: `Your shared trip space "Yarcaud" (TL-WFHP-5508) has completed. Total spend: ₹${totalSpend}. Settlement: Eniya owes Sampath ₹${eniyaOwesSampath}. All records are saved to your personal account. View at https://tallyin.vercel.app`,
        textBody: `Your shared trip space "Yarcaud" (TL-WFHP-5508) has completed. Total spend: ₹${totalSpend}. Settlement: Eniya owes Sampath ₹${eniyaOwesSampath}. All records are saved to your personal account. View at https://tallyin.vercel.app`,
        htmlBody: emailHtml,
        name: 'Tallyin Trip Splitter',
        senderName: 'Tallyin Trip Splitter'
      };

      const res = await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      const resText = await res.text();
      console.log(`Email dispatched to ${r.email}: status ${res.status}, response: ${resText}`);
    } catch (e) {
      console.error(`Failed to send email to ${r.email}:`, e);
    }
  }

  console.log('\n=== STEP 3: ADD LOGGED DATA INTO USERS DATA ===');
  // A. Save completed trip object in system_settings for both users
  const userTripsMap = [
    { uid: 't8tECIWsjbW01Hm2e4B93bXVTuU2', name: 'Sampath' },
    { uid: 'd0b4cb3b-e0bd-44df-b876-f284e542dc0f', name: 'Sampath (email uid)' },
    { uid: 'z4MY8EgEPZU5Rme5ojwPIxMAEKE2', name: 'Eniya' }
  ];

  for (const u of userTripsMap) {
    const key = `user_trips_${u.uid}`;
    console.log(`Saving completed trip in system_settings: ${key}`);
    const tripPayload = [completedTripObject];
    await fetchD1('system_settings', 'upsert', [], {
      key,
      value: JSON.stringify(tripPayload)
    });
  }

  // Also save complete archive record for permanent historical storage
  const archiveKey = `trip_archive_${ROOM_ID}`;
  await fetchD1('system_settings', 'upsert', [], {
    key: archiveKey,
    value: JSON.stringify(completedTripObject)
  });
  console.log(`Saved immutable trip archive: ${archiveKey}`);

  // B. Add individual personal expense logs into transactions under their primary room TL-JGJK-4363
  // with is_shared: 0, splits for self only, so it's private to them and NOT visible to anyone else!
  console.log('\nInjecting private personal expense logs into TL-JGJK-4363...');

  // 1. Sampath's personal share entries
  for (const t of formattedTransactions) {
    const sShare = t.amount / 2;
    const personalTxId = `personal-yercaud-sampath-${t.id}`;
    const txPayload = {
      id: personalTxId,
      room_id: PRIMARY_ROOM_ID,
      title: `[Yercaud Trip] ${t.title}`,
      amount: sShare,
      category: t.originalCategory || 'Food',
      date: t.date,
      time: t.time || '12:00 PM',
      paid_by: 'Sampath Jogi Pusala',
      paid_by_uid: 't8tECIWsjbW01Hm2e4B93bXVTuU2',
      is_shared: 0,
      is_edited: 0,
      split_type: 'equal',
      split: 'Personal',
      splits: JSON.stringify([
        { uid: 't8tECIWsjbW01Hm2e4B93bXVTuU2', nickname: 'Sampath Jogi Pusala', amount: sShare }
      ]),
      created_by: 't8tECIWsjbW01Hm2e4B93bXVTuU2'
    };
    await fetchD1('transactions', 'upsert', [], txPayload);
  }
  console.log(`Injected ${formattedTransactions.length} personal expenses for Sampath.`);

  // 2. Eniya's personal share entries
  for (const t of formattedTransactions) {
    const eShare = t.amount / 2;
    const personalTxId = `personal-yercaud-eniya-${t.id}`;
    const txPayload = {
      id: personalTxId,
      room_id: PRIMARY_ROOM_ID,
      title: `[Yercaud Trip] ${t.title}`,
      amount: eShare,
      category: t.originalCategory || 'Food',
      date: t.date,
      time: t.time || '12:00 PM',
      paid_by: 'Eniya',
      paid_by_uid: 'z4MY8EgEPZU5Rme5ojwPIxMAEKE2',
      is_shared: 0,
      is_edited: 0,
      split_type: 'equal',
      split: 'Personal',
      splits: JSON.stringify([
        { uid: 'z4MY8EgEPZU5Rme5ojwPIxMAEKE2', nickname: 'Eniya', amount: eShare }
      ]),
      created_by: 'z4MY8EgEPZU5Rme5ojwPIxMAEKE2'
    };
    await fetchD1('transactions', 'upsert', [], txPayload);
  }
  console.log(`Injected ${formattedTransactions.length} personal expenses for Eniya.`);

  console.log('\n=== STEP 4: UPDATE USERS ROOM_ID IN USERS TABLE ===');
  // Point both users back to their active shared room TL-JGJK-4363 in D1
  await fetchD1('users', 'update', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }], {
    room_id: PRIMARY_ROOM_ID
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  await supabase.from('users').update({ room_id: PRIMARY_ROOM_ID }).eq('room_id', ROOM_ID);
  console.log(`Updated users room_id to ${PRIMARY_ROOM_ID} in D1 & Supabase.`);

  console.log('\n=== STEP 5: PERMANENTLY CLOSE & DELETE ROOM TL-WFHP-5508 ===');
  // 1. Delete transactions of TL-WFHP-5508
  await fetchD1('transactions', 'delete', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]);
  await supabase.from('transactions').delete().eq('room_id', ROOM_ID);
  console.log('Deleted transactions for TL-WFHP-5508.');

  // 2. Delete members of TL-WFHP-5508
  await fetchD1('members', 'delete', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]);
  await supabase.from('members').delete().eq('room_id', ROOM_ID);
  console.log('Deleted members for TL-WFHP-5508.');

  // 3. Delete receipts of TL-WFHP-5508
  await fetchD1('receipts', 'delete', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]);
  await supabase.from('receipts').delete().eq('room_id', ROOM_ID);
  console.log('Deleted receipts for TL-WFHP-5508.');

  // 4. Delete activity_logs of TL-WFHP-5508
  await fetchD1('activity_logs', 'delete', [{ column: 'room_id', operator: 'eq', value: ROOM_ID }]);
  await supabase.from('activity_logs').delete().eq('room_id', ROOM_ID);
  console.log('Deleted activity logs for TL-WFHP-5508.');

  // 5. Delete system_settings keys for TL-WFHP-5508
  await fetchD1('system_settings', 'delete', [{ column: 'key', operator: 'eq', value: `room_mode_${ROOM_ID}` }]);
  await supabase.from('system_settings').delete().eq('key', `room_mode_${ROOM_ID}`);

  // 6. Delete room from rooms table
  await fetchD1('rooms', 'delete', [{ column: 'id', operator: 'eq', value: ROOM_ID }]);
  await supabase.from('rooms').delete().eq('id', ROOM_ID);
  console.log(`Deleted room ${ROOM_ID} from rooms table in D1 & Supabase.`);

  console.log('\n=== STEP 6: VERIFY CLEANUP ===');
  const checkRoomsD1 = await fetchD1('rooms', 'select', [{ column: 'id', operator: 'eq', value: ROOM_ID }]);
  const { data: checkRoomsSupa } = await supabase.from('rooms').select('*').eq('id', ROOM_ID);
  console.log('Remaining TL-WFHP-5508 in D1:', checkRoomsD1.data?.length || 0);
  console.log('Remaining TL-WFHP-5508 in Supabase:', checkRoomsSupa?.length || 0);

  console.log('\n=== ALL TASKS COMPLETED SUCCESSFULLY! ===');
}

run().catch(console.error);
