import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mphuwixprztbzrxndqsl.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';
const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const APP_URL = 'https://tallyin.vercel.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getOfficialEmailHtml(userName, targetEmail) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Official Tallyin Release: Trip Splitter</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F6FAF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6FAF7; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E2EAE3; box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.08); overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; background: linear-gradient(135deg, #1A3827 0%, #0F2318 100%); text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">Tallyin</span>
                    <span style="display: block; font-size: 10px; font-weight: 800; color: #A3E635; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px;">Smart Roommate & Travel Sync</span>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(163, 230, 53, 0.15); border: 1px solid rgba(163, 230, 53, 0.3); color: #A3E635; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; rounded: 12px; border-radius: 20px; letter-spacing: 0.5px;">
                      Oct 2, 2026 Release
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: left;">
              <p style="margin: 0; font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px;">
                🎉 Major Platform Announcement
              </p>
              <h1 style="margin: 6px 0 12px 0; font-size: 24px; font-weight: 900; color: #1A3827; letter-spacing: -0.5px; line-height: 1.3;">
                Introducing the All-in-One Trip Splitter & Vacation Expense Manager
              </h1>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Planning a beach roadtrip, a mountain getaway, or traveling with friends? Starting today, Tallyin makes group vacation budgeting and shared expense splitting effortless.
              </p>
            </td>
          </tr>

          <!-- Feature Cards Grid -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              
              <!-- Feature 1 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAF9; border: 1px solid #EAEFEA; border-radius: 16px; margin-bottom: 12px; padding: 16px;">
                <tr>
                  <td width="36" valign="top">
                    <span style="font-size: 22px;">🌴</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <strong style="font-size: 13px; color: #1A3827; display: block; margin-bottom: 3px;">Dedicated Trips Hub & Companion Access</strong>
                    <span style="font-size: 12px; color: #64748B; line-height: 1.5; display: block;">
                      Create individual trip spaces with dates, location & budgets. Invite room flatmates or add external guest friends without requiring them to join your flat room.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAF9; border: 1px solid #EAEFEA; border-radius: 16px; margin-bottom: 12px; padding: 16px;">
                <tr>
                  <td width="36" valign="top">
                    <span style="font-size: 22px;">💸</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <strong style="font-size: 13px; color: #1A3827; display: block; margin-bottom: 3px;">Live Group Expense Splitter & Selective Sharing</strong>
                    <span style="font-size: 12px; color: #64748B; line-height: 1.5; display: block;">
                      Track hotel stays, travel transit, cafe dining, activities, fuel, and shopping. Split equally, selectively check who was there, or specify exact custom shares.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAF9; border: 1px solid #EAEFEA; border-radius: 16px; margin-bottom: 12px; padding: 16px;">
                <tr>
                  <td width="36" valign="top">
                    <span style="font-size: 22px;">⚖️</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <strong style="font-size: 13px; color: #1A3827; display: block; margin-bottom: 3px;">Smart Debt Simplification ("Who Owes Whom")</strong>
                    <span style="font-size: 12px; color: #64748B; line-height: 1.5; display: block;">
                      Eliminate circular debts! Tallyin automatically condenses balances into the fewest possible direct transfers with 1-click UPI and cash payment logging.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Feature 4 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAF9; border: 1px solid #EAEFEA; border-radius: 16px; margin-bottom: 12px; padding: 16px;">
                <tr>
                  <td width="36" valign="top">
                    <span style="font-size: 22px;">📊</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <strong style="font-size: 13px; color: #1A3827; display: block; margin-bottom: 3px;">Pre-Trip Budget Estimator & Actuals Meter</strong>
                    <span style="font-size: 12px; color: #64748B; line-height: 1.5; display: block;">
                      Estimate per-category group costs and see projected per-person share before leaving. Track real-time progress bars to avoid vacation overspending.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Feature 5 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAF9; border: 1px solid #EAEFEA; border-radius: 16px; margin-bottom: 4px; padding: 16px;">
                <tr>
                  <td width="36" valign="top">
                    <span style="font-size: 22px;">📤</span>
                  </td>
                  <td style="padding-left: 12px; text-align: left;">
                    <strong style="font-size: 13px; color: #1A3827; display: block; margin-bottom: 3px;">1-Click WhatsApp Settlement & CSV Export</strong>
                    <span style="font-size: 12px; color: #64748B; line-height: 1.5; display: block;">
                      Instantly generate a clean, formatted settlement summary to send straight to your trip's WhatsApp group or download as a CSV spreadsheet.
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Call to Action Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${APP_URL}" target="_blank" style="display: inline-block; background-color: #1A3827; color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 14px rgba(26, 56, 39, 0.25);">
                🚀 Open Tallyin & Try Trip Splitter →
              </a>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #94A3B8;">
                Available now on all devices at <a href="${APP_URL}" style="color: #059669; text-decoration: none; font-weight: 700;">tallyin.vercel.app</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAF9; border-top: 1px solid #EAEFEA; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748B;">
                Tallyin Official Notification Desk
              </p>
              <p style="margin: 0; font-size: 10px; color: #94A3B8;">
                Dispatched to ${targetEmail} • Verified System Dispatch: tallyin.alerts@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getOfficialPlainText(userName) {
  return `Hello ${userName},

We are excited to announce a major new release now live in Tallyin:
🌴 The All-in-One Trip Splitter & Vacation Expense Manager (Oct 2, 2026)!

HIGHLIGHTS:
• 🌴 Dedicated Trips Hub: Plan trips with destination, dates, and budget targets. Include room members or invite external friends without flat room restrictions.
• 💸 Live Group Expense Splitter: Track stay, flights, dining, activities, fuel, and shopping. Split equally, selectively choose participants, or enter exact custom shares.
• ⚖️ Automated Debt Simplification: Computes "Who Owes Whom" with minimal transfers so settling balances is instant.
• 📊 Pre-Trip Budget Estimator: Estimate category costs before leaving and compare planned vs actual spend in real time.
• 📤 1-Click WhatsApp Share: Share itemized settlements directly to your trip's WhatsApp group.

Try it now: ${APP_URL}

Best regards,
The Tallyin Team
tallyin.alerts@gmail.com`;
}

async function run() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log(`[Notification Engine] Fetching all registered users from database...`);
  const [{ data: memberData, error: mErr }, { data: userData, error: uErr }] = await Promise.all([
    supabase.from('members').select('email, nickname'),
    supabase.from('users').select('email, name')
  ]);

  if (mErr) console.warn('[Members Warning]', mErr.message);
  if (uErr) console.warn('[Users Warning]', uErr.message);

  const emailMap = new Map();

  (memberData || []).forEach(m => {
    const email = (m.email || '').trim().toLowerCase();
    if (email && email.includes('@') && !email.endsWith('@tallyin.app')) {
      emailMap.set(email, m.nickname || email.split('@')[0]);
    }
  });

  (userData || []).forEach(u => {
    const email = (u.email || '').trim().toLowerCase();
    if (email && email.includes('@') && !email.endsWith('@tallyin.app')) {
      if (!emailMap.has(email)) {
        emailMap.set(email, u.name || email.split('@')[0]);
      }
    }
  });

  const recipients = Array.from(emailMap.entries()).map(([email, name]) => ({ email, name }));

  console.log(`[Notification Engine] Found ${recipients.length} distinct recipient accounts.`);
  if (recipients.length === 0) {
    console.log('No valid recipient emails found.');
    return;
  }

  if (isDryRun) {
    console.log('\n--- DRY RUN PREVIEW ---');
    console.log(`Target Count: ${recipients.length}`);
    console.log('Recipients:', recipients.map(r => `${r.name} <${r.email}>`));
    console.log('\nSubject: 🌴 New in Tallyin: Trip Splitter, Vacation Budgets & Who Owes Whom!');
    console.log('Sample Plain Text:\n', getOfficialPlainText(recipients[0]?.name || 'User'));
    console.log('\n[Dry Run Complete: No emails dispatched]');
    return;
  }

  console.log(`[Notification Engine] Starting automated dispatch to ${recipients.length} users via Central Relay...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const { email, name } = recipients[i];
    const subject = `🌴 New in Tallyin: Trip Splitter, Vacation Budgets & Who Owes Whom!`;
    const body = getOfficialPlainText(name);
    const htmlBody = getOfficialEmailHtml(name, email);

    try {
      console.log(`[${i + 1}/${recipients.length}] Sending to ${name} (${email})...`);
      const res = await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'send_email',
          to: email,
          subject,
          body,
          htmlBody
        })
      });

      if (res.ok) {
        successCount++;
        console.log(`  ✓ Success for ${email}`);
      } else {
        failCount++;
        console.warn(`  ⚠️ Relay returned status ${res.status} for ${email}`);
      }
    } catch (err) {
      failCount++;
      console.error(`  ❌ Failed for ${email}:`, err.message);
    }

    // Rate-limiting delay: 350ms between dispatches
    await new Promise(resolve => setTimeout(resolve, 350));
  }

  console.log(`\n==========================================`);
  console.log(`DISPATCH SUMMARY:`);
  console.log(`Total Recipients: ${recipients.length}`);
  console.log(`Successfully Dispatched: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`==========================================\n`);
}

run().catch(console.error);
