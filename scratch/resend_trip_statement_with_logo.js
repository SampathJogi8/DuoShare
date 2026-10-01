import fs from 'fs';

const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const LOGO_URL = 'https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png';

async function run() {
  const backup = JSON.parse(fs.readFileSync('scratch/TL-WFHP-5508_complete_backup.json', 'utf8'));
  const transactions = backup.transactions || [];
  
  let totalSpend = 0;
  let paidBySampath = 0;
  let paidByEniya = 0;

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

    return {
      title: t.title,
      amount: amt,
      category: mappedCat,
      date: t.date,
      paidBy: t.paid_by
    };
  });

  const sampathShare = totalSpend / 2;
  const eniyaShare = totalSpend / 2;
  const eniyaOwesSampath = eniyaShare - paidByEniya;

  const emailHtmlWithLogo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B1510; margin: 0; padding: 32px 16px; color: #F1F5F9; }
    .container { max-width: 640px; margin: 0 auto; background-color: #122118; border-radius: 24px; border: 1px solid #1E3A2B; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .header { background: linear-gradient(135deg, #1A3827 0%, #0D2015 100%); padding: 36px 28px; text-align: center; border-bottom: 1px solid #234834; }
    .badge { display: inline-block; background-color: #A3E635; color: #0F172A; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .header h1 { color: #FFFFFF; font-size: 24px; font-weight: 900; margin: 0 0 6px 0; }
    .header p { color: #86EFAC; font-size: 13px; margin: 0; }
    .content { padding: 32px 28px; }
    .settlement-box { background: linear-gradient(135deg, #162F21 0%, #0F2016 100%); border: 1.5px solid #A3E635; border-radius: 16px; padding: 20px; margin-bottom: 28px; }
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
      <!-- Tallyin Brand Logo Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="text-align: center; background: transparent; border: none; padding: 0;">
            <table style="display: inline-table; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px; background: transparent; border: none;">
                  <img src="${LOGO_URL}" alt="Tallyin Logo" width="48" height="48" style="display: block; border-radius: 12px; border: 2px solid #A3E635; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
                </td>
                <td style="vertical-align: middle; text-align: left; background: transparent; border: none;">
                  <span style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; display: block; line-height: 1;">Tallyin</span>
                  <span style="font-size: 10px; font-weight: 700; color: #A3E635; text-transform: uppercase; letter-spacing: 1px;">Smart Roommate Sync</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

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
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; background: transparent; border: none; padding: 0;">
            <img src="${LOGO_URL}" alt="Tallyin" width="24" height="24" style="display: inline-block; vertical-align: middle; border-radius: 6px; margin-right: 6px;" />
            <span style="vertical-align: middle; font-weight: 800; color: #94A3B8;">Tallyin Space Governance • Official Statement</span>
          </td>
        </tr>
      </table>
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
    console.log(`Re-dispatching trip statement with official logo to ${r.name} (${r.email})...`);
    try {
      const emailPayload = {
        action: 'send_email',
        to: r.email,
        subject: `[Tallyin Trip Statement] Yercaud Vacation Trip Completed • Final Settlement & Ledger`,
        body: `Your shared trip space "Yarcaud" (TL-WFHP-5508) has completed. Total spend: ₹${totalSpend}. Settlement: Eniya owes Sampath ₹${eniyaOwesSampath}. All records are saved to your personal account. View at https://tallyin.vercel.app`,
        textBody: `Your shared trip space "Yarcaud" (TL-WFHP-5508) has completed. Total spend: ₹${totalSpend}. Settlement: Eniya owes Sampath ₹${eniyaOwesSampath}. All records are saved to your personal account. View at https://tallyin.vercel.app`,
        htmlBody: emailHtmlWithLogo,
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
}

run().catch(console.error);
