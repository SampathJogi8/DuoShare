import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const WORKER_URL = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';
const OUTPUT_DIR = '/Users/sampathjogipusala/.gemini/antigravity-ide/brain/0ce63ae1-a012-4b45-89fe-0ec1ff725dbd';

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

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function getDisplayCategory(splitType) {
  const raw = splitType || 'Other';
  if (raw.startsWith('Audited:')) {
    return raw.split(':')[1];
  }
  return raw;
}

async function run() {
  console.log("Fetching transactions...");
  const transactions = await queryWorker('transactions', 'select', []);
  if (!transactions) {
    console.error("Failed to load transactions.");
    return;
  }

  const targetFunds = [
    { id: '314ebf41-e2da-45c9-a2ed-c8c8f0400346', filename: 'college_fees_statement.pdf' },
    { id: 'b93c4821-5bfa-4742-92f8-5e4284dbcefc', filename: 'dads_money_statement.pdf' }
  ];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const target of targetFunds) {
    const fund = transactions.find(t => t.id === target.id);
    if (!fund) {
      console.warn(`Could not find fund with ID ${target.id}`);
      continue;
    }

    console.log(`Processing fund "${fund.title}" (${fund.id})...`);

    // Fetch spends for this fund
    const fundSpends = transactions.filter(t => 
      t.category === '__FUND_SPEND__' && 
      t.split && 
      t.split.replace(' [PAID_BACK]', '') === fund.id
    );

    const spent = fundSpends.filter(s => s.amount > 0).reduce((sum, s) => sum + s.amount, 0);
    const received = fundSpends.filter(s => s.amount < 0).reduce((sum, s) => sum + Math.abs(s.amount), 0);
    const netSpent = spent - received;
    const remaining = fund.amount - netSpent;

    console.log(`- Total Spends Count: ${fundSpends.length}`);
    console.log(`- Allocated: ${fund.amount}, Spent: ${spent}, Remaining: ${remaining}`);

    // Generate HTML content matching exportFundToPDF style
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fund.title} - Statement</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; color: #102217; padding: 40px; background-color: #ffffff; }
          .header-banner { background-color: #1A3827; color: #ffffff; padding: 24px 32px; border-radius: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo-title { display: flex; align-items: center; gap: 12px; }
          .logo-text { font-weight: 800; font-size: 22px; letter-spacing: -0.025em; }
          .doc-info { text-align: right; font-size: 11px; opacity: 0.85; line-height: 1.5; }
          
          .summary-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #5C6E5C; letter-spacing: 0.05em; margin-bottom: 12px; }
          .cards-grid { display: grid; grid-template-cols: repeat(5, 1fr); gap: 16px; margin-bottom: 30px; }
          .summary-card { border: 1px solid #E3E8E3; border-radius: 16px; padding: 16px; background-color: #fcfdfc; }
          .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #5C6E5C; margin-bottom: 4px; }
          .card-value { font-size: 18px; font-weight: 800; color: #1A3827; }
          .card-value.green { color: #15803d; }
          .card-value.blue { color: #1a5632; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; padding: 14px 16px; background-color: #F6F8F6; color: #5C6E5C; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #E3E8E3; }
          td { padding: 14px 16px; font-size: 12px; color: #102217; border-bottom: 1px solid #E3E8E3; font-weight: 500; }
          tr:hover td { background-color: #fcfdfc; }
          td.amount-col { font-weight: 800; text-align: right; }
          td.amount-col.outflow { color: #102217; }
          td.amount-col.inflow { color: #15803d; }
          
          .badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; background-color: #EAF0EC; color: #1A3827; }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div class="logo-title">
            <div style="width: 36px; height: 36px; background: #eaf0ec; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #1A3827;">T</div>
            <div>
              <h1 class="logo-text">Tallyin Funds</h1>
              <p style="font-size: 11px; opacity: 0.8; font-weight: 600; margin-top: 2px;">Private & Isolated Fund statement</p>
            </div>
          </div>
          <div class="doc-info">
            <p style="font-weight: 700;">${fund.title}</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Created: ${new Date(fund.date).toLocaleDateString()}</p>
          </div>
        </div>

        <p class="summary-title">Allocation Summary</p>
        <div class="cards-grid">
          <div class="summary-card">
            <p class="card-label">Total Allocation</p>
            <p class="card-value">${formatINR(fund.amount)}</p>
          </div>
          <div class="summary-card">
            <p class="card-label">Total Spent</p>
            <p class="card-value">${formatINR(spent)}</p>
          </div>
          <div class="summary-card">
            <p class="card-label">Total Received</p>
            <p class="card-value green">${formatINR(received)}</p>
          </div>
          <div class="summary-card">
            <p class="card-label">Net Spent</p>
            <p class="card-value">${formatINR(netSpent)}</p>
          </div>
          <div class="summary-card">
            <p class="card-label">Remaining Balance</p>
            <p class="card-value blue">${formatINR(remaining)}</p>
          </div>
        </div>

        <p class="summary-title">Transaction Ledger</p>
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Title</th>
              <th style="width: 20%;">Category</th>
              <th style="width: 15%;">Date</th>
              <th style="width: 20%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${fundSpends.length === 0 ? `
              <tr>
                <td colspan="4" style="text-align: center; color: #5C6E5C; font-style: italic;">No transactions recorded.</td>
              </tr>
            ` : fundSpends.map(s => `
              <tr>
                <td style="font-weight: 700;">${s.title}</td>
                <td><span class="badge">${getDisplayCategory(s.splitType)}</span></td>
                <td>${new Date(s.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td class="amount-col ${s.amount < 0 ? 'inflow' : 'outflow'}">
                  ${s.amount < 0 ? `+ ${formatINR(Math.abs(s.amount))}` : `- ${formatINR(s.amount)}`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

      </body>
      </html>
    `;

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfPath = path.join(OUTPUT_DIR, target.filename);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    console.log(`Successfully generated PDF: ${pdfPath}`);
  }

  await browser.close();
  console.log("Done generating PDFs.");
}

run();
