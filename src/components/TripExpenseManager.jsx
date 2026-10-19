import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Wallet,
  DollarSign,
  Check,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Share2,
  Download,
  Copy,
  Sparkles,
  TrendingUp,
  Calculator,
  Bed,
  Car,
  Utensils,
  Fuel,
  ShoppingBag,
  Tag,
  AlertCircle,
  ArrowRight,
  Clock,
  ArrowLeftRight,
  FileText,
  Palmtree,
  Luggage,
  Sliders,
  Mail,
  Send,
  Loader2,
  Lock,
  ShieldCheck,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const LOGO_URL = 'https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png';

// Category helpers
export const TRIP_CATEGORIES = [
  { id: 'stay', label: 'Accommodation & Stay', icon: Bed, color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' },
  { id: 'travel', label: 'Flights, Train & Transit', icon: Car, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'activities', label: 'Activities & Sightseeing', icon: Palmtree, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' },
  { id: 'fuel', label: 'Fuel & Tolls', icon: Fuel, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  { id: 'shopping', label: 'Shopping & Souvenirs', icon: ShoppingBag, color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20' },
  { id: 'misc', label: 'Misc & Others', icon: Tag, color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' }
];

export const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

// Calculate Debt Simplification Algorithm
export function calculateTripSettlements(companions = [], expenses = [], settlements = []) {
  const balances = {};
  companions.forEach(c => {
    balances[c.id] = 0;
  });

  // Calculate Net Balances from Expenses
  expenses.forEach(exp => {
    const amount = Number(exp.amount) || 0;
    const payerId = exp.paidBy;
    balances[payerId] = (balances[payerId] || 0) + amount;

    if (exp.splitType === 'exact' && exp.splits) {
      Object.entries(exp.splits).forEach(([cid, share]) => {
        balances[cid] = (balances[cid] || 0) - (Number(share) || 0);
      });
    } else if (exp.includedMembers && exp.includedMembers.length > 0) {
      const splitAmount = amount / exp.includedMembers.length;
      exp.includedMembers.forEach(cid => {
        balances[cid] = (balances[cid] || 0) - splitAmount;
      });
    } else {
      const splitAmount = amount / (companions.length || 1);
      companions.forEach(c => {
        balances[c.id] = (balances[c.id] || 0) - splitAmount;
      });
    }
  });

  // Factor in Recorded Settlements
  settlements.forEach(st => {
    const amt = Number(st.amount) || 0;
    // payer gave money to receiver -> payer balance increases (debt cleared), receiver decreases
    balances[st.payerId] = (balances[st.payerId] || 0) + amt;
    balances[st.receiverId] = (balances[st.receiverId] || 0) - amt;
  });

  // Debt Simplification (Greedy algorithm for minimum transactions)
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([id, bal]) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ id, amount: -rounded });
    } else if (rounded > 0.01) {
      creditors.push({ id, amount: rounded });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let d = 0;
  let c = 0;
  const dCopy = debtors.map(item => ({ ...item }));
  const cCopy = creditors.map(item => ({ ...item }));

  while (d < dCopy.length && c < cCopy.length) {
    const debtor = dCopy[d];
    const creditor = cCopy[c];
    const settleAmt = Math.min(debtor.amount, creditor.amount);

    if (settleAmt > 0.01) {
      transfers.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(settleAmt)
      });
    }

    debtor.amount -= settleAmt;
    creditor.amount -= settleAmt;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return { balances, transfers };
}

// Generate HTML email for Trip Completion
export function generateTripCompletionEmailHtml({ trip, tripStats, userNickname, userEmail }) {
  const totalSpent = tripStats.totalSpent || 0;
  const companions = trip.companions || [];
  const expenses = trip.expenses || [];
  const compMap = {};
  companions.forEach(c => { compMap[c.id] = c.name; });

  const perPersonAvg = companions.length > 0 ? Math.round(totalSpent / companions.length) : 0;

  // Category totals
  const categoryTotals = {};
  TRIP_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
  expenses.forEach(e => {
    const cat = e.category || 'misc';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });

  const transfers = tripStats.transfers || [];

  return `
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
                  <span style="font-size: 10px; font-weight: 700; color: #A3E635; text-transform: uppercase; letter-spacing: 1px;">Trip Splitter • Final Statement</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div class="badge">Trip Completed & Closed</div>
      <h1>${trip.title}</h1>
      <p>${trip.destination || 'Vacation'} • Final Financial Ledger Statement</p>
    </div>
    
    <div class="content">
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #CBD5E1; line-height: 1.6;">
        All expenses for <strong>"${trip.title}"</strong> have been finalized and the trip has been marked as <strong>Completed</strong>. Below is the full financial statement, individual shares, and simplified settlement transfers:
      </p>

      <!-- Key Stats Grid -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 20px;">
        <tr>
          <td style="background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 14px; padding: 16px; width: 50%;">
            <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Total Trip Spend</div>
            <div style="font-size: 22px; font-weight: 900; color: #A3E635; margin-top: 4px;">₹${totalSpent.toLocaleString('en-IN')}</div>
          </td>
          <td style="background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 14px; padding: 16px; width: 50%;">
            <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Per Person Share</div>
            <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; margin-top: 4px;">₹${perPersonAvg.toLocaleString('en-IN')}</div>
          </td>
        </tr>
      </table>

      <!-- Settlement Box -->
      <div class="settlement-box">
        <div style="font-size: 11px; font-weight: 800; color: #A3E635; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">FINAL DEBT SETTLEMENTS</div>
        ${companions.map(c => {
          const bal = Math.round(tripStats.balances?.[c.id] || 0);
          const balText = bal > 0 ? `Gets back ₹${bal.toLocaleString('en-IN')}` : bal < 0 ? `Owes ₹${Math.abs(bal).toLocaleString('en-IN')}` : `Settled (₹0)`;
          const balColor = bal > 0 ? '#A3E635' : bal < 0 ? '#F87171' : '#94A3B8';
          return `
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
              <span style="color: #E2E8F0;">${c.name} ${c.isHost ? '(Host)' : ''}:</span>
              <strong style="color: ${balColor};">${balText}</strong>
            </div>
          `;
        }).join('')}

        ${transfers.length > 0 ? `
          <div style="border-top: 1px solid #234834; padding-top: 12px; margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 800; color: #86EFAC; text-transform: uppercase; margin-bottom: 6px;">Recommended Direct Transfers:</div>
            ${transfers.map(tr => `
              <div style="font-size: 14px; color: #FFFFFF; font-weight: bold; margin-bottom: 4px;">
                👉 ${compMap[tr.from] || tr.from} pays ${compMap[tr.to] || tr.to}: <span style="color: #A3E635;">₹${tr.amount.toLocaleString('en-IN')}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="border-top: 1px solid #234834; padding-top: 10px; margin-top: 8px; color: #86EFAC; font-size: 13px; font-weight: bold;">
            ✓ All accounts are balanced!
          </div>
        `}
      </div>

      <!-- Category Breakdown -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">CATEGORY SPENDING</div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #1E3A2B; border-radius: 10px; overflow: hidden;">
          ${TRIP_CATEGORIES.filter(cat => (categoryTotals[cat.id] || 0) > 0).map(cat => `
            <tr>
              <td style="padding: 8px 12px; font-size: 12px;">${cat.label}</td>
              <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: bold; color: #FFFFFF;">₹${(categoryTotals[cat.id] || 0).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <!-- Itemized Ledger -->
      <div style="font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">ALL ${expenses.length} RECORDED EXPENSES</div>
      <div style="border: 1px solid #1E3A2B; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; font-size: 10px;">Date</th>
              <th style="padding: 10px; font-size: 10px;">Description</th>
              <th style="padding: 10px; font-size: 10px;">Paid By</th>
              <th style="padding: 10px; font-size: 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td style="padding: 10px; font-size: 11px; white-space: nowrap;">${e.date || '-'}</td>
                <td style="padding: 10px; font-size: 11px; font-weight: bold; color: #FFFFFF;">${e.title}</td>
                <td style="padding: 10px; font-size: 11px;">${e.payerName || compMap[e.paidBy] || e.paidBy}</td>
                <td style="padding: 10px; font-size: 11px; text-align: right; font-weight: 800; color: #A3E635;">₹${Number(e.amount).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="background-color: #0A140F; border: 1px solid #1E3A2B; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
          🔒 <strong>Personal Ledger Archive:</strong> This completed trip is saved under your private account on Tallyin. You can review, export, or audit this trip anytime.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://tallyin.vercel.app" style="display: inline-block; background-color: #A3E635; color: #0B1510; font-weight: 900; font-size: 13px; padding: 12px 32px; border-radius: 12px; text-decoration: none;">View on Tallyin</a>
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
}

// Helper: safe base64 encoding for email attachments
export const toBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return '';
  }
};

// Generate CSV string for Trip Expenses
export function generateTripCsvContent(trip) {
  if (!trip) return '';
  const compMap = {};
  (trip.companions || []).forEach(c => { compMap[c.id] = c.name; });

  const headers = ['Date', 'Title/Description', 'Category', 'Amount (INR)', 'Paid By', 'Split Mode', 'Notes'];
  const rows = (trip.expenses || []).map(e => {
    const payer = compMap[e.paidBy] || e.payerName || e.paidBy || '';
    const cat = TRIP_CATEGORIES.find(c => c.id === e.category)?.label || e.category || 'Misc';
    return [
      e.date || '',
      e.title || '',
      cat,
      Number(e.amount) || 0,
      payer,
      e.splitType || 'equal',
      e.notes || ''
    ];
  });

  return [
    headers.join(','),
    ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
}

// Generate Excel-compatible (.xls) HTML table for Trip
export function generateTripExcelHtml({ trip, tripStats, userNickname = 'You' }) {
  if (!trip) return '';
  const totalSpent = tripStats.totalSpent || 0;
  const companions = trip.companions || [];
  const expenses = trip.expenses || [];
  const compMap = {};
  companions.forEach(c => { compMap[c.id] = c.name; });
  const transfers = tripStats.transfers || [];
  const perPersonAvg = companions.length > 0 ? Math.round(totalSpent / companions.length) : 0;

  const categoryTotals = {};
  TRIP_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
  expenses.forEach(e => {
    const cat = e.category || 'misc';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; padding: 20px; }
        .header-title { font-size: 18px; color: #1A3827; font-weight: bold; }
        .section-title { font-size: 13px; color: #1A3827; font-weight: bold; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 18px; font-size: 11px; }
        th { background-color: #1A3827; color: #ffffff; font-weight: bold; padding: 8px 10px; border: 1px solid #1A3827; text-align: left; }
        td { border: 1px solid #D1D5DB; padding: 7px 10px; color: #1E293B; }
        tr:nth-child(even) td { background-color: #F8FAFC; }
        .pos { color: #047857; font-weight: bold; }
        .neg { color: #B91C1C; font-weight: bold; }
        .neutral { color: #64748B; }
      </style>
    </head>
    <body>
      <div style="margin-bottom: 16px;">
        <span class="header-title">🌴 Tallyin Trip Financial Ledger — ${trip.title}</span><br/>
        <b>Destination:</b> ${trip.destination || 'Vacation Spot'}<br/>
        <b>Dates:</b> ${trip.startDate || 'N/A'} ${trip.endDate ? 'to ' + trip.endDate : ''}<br/>
        <b>Status:</b> ${trip.status || 'Ongoing'}<br/>
        <b>Total Spend:</b> ₹${totalSpent.toLocaleString('en-IN')}<br/>
        <b>Budget Target:</b> ${trip.budget ? '₹' + Number(trip.budget).toLocaleString('en-IN') : 'N/A'}<br/>
        <b>Per Person Share:</b> ₹${perPersonAvg.toLocaleString('en-IN')}<br/>
        <b>Companions Count:</b> ${companions.length}<br/>
        <b>Generated Date:</b> ${new Date().toLocaleDateString('en-IN')}<br/>
        <b>Privacy:</b> 🔒 Private Individual Module (Not shared with flatmates)
      </div>

      <div class="section-title">1. Simplified Debt Transfers (Who Owes Whom)</div>
      <table>
        <thead>
          <tr>
            <th>From (Debtor)</th>
            <th>To (Creditor)</th>
            <th>Settlement Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${transfers.length > 0 ? transfers.map(tr => `
            <tr>
              <td><b>${compMap[tr.from] || tr.from}</b></td>
              <td><b>${compMap[tr.to] || tr.to}</b></td>
              <td><b>₹${Number(tr.amount).toLocaleString('en-IN')}</b></td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="3" style="text-align: center; color: #047857; font-weight: bold;">✓ All accounts are balanced! No pending settlements.</td>
            </tr>
          `}
        </tbody>
      </table>

      <div class="section-title">2. Companion Standings & Net Balance</div>
      <table>
        <thead>
          <tr>
            <th>Companion Name</th>
            <th>Role</th>
            <th>Paid Out of Pocket (INR)</th>
            <th>Net Balance (INR)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${companions.map(c => {
            const bal = Math.round(tripStats.balances?.[c.id] || 0);
            const paid = expenses.filter(e => e.paidBy === c.id).reduce((s, e) => s + (Number(e.amount) || 0), 0);
            const statusClass = bal > 0 ? 'pos' : bal < 0 ? 'neg' : 'neutral';
            const statusText = bal > 0 ? `Gets back ₹${bal.toLocaleString('en-IN')}` : bal < 0 ? `Owes ₹${Math.abs(bal).toLocaleString('en-IN')}` : 'Settled (₹0)';
            return `
              <tr>
                <td><b>${c.name}</b></td>
                <td>${c.isHost ? 'Host / Organizer' : 'Companion'}</td>
                <td>₹${paid.toLocaleString('en-IN')}</td>
                <td class="${statusClass}">₹${bal.toLocaleString('en-IN')}</td>
                <td class="${statusClass}">${statusText}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="section-title">3. Category Spend Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Spend (INR)</th>
            <th>% of Total Spend</th>
          </tr>
        </thead>
        <tbody>
          ${TRIP_CATEGORIES.map(cat => {
            const amt = categoryTotals[cat.id] || 0;
            const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
            return `
              <tr>
                <td>${cat.label}</td>
                <td>₹${amt.toLocaleString('en-IN')}</td>
                <td>${pct}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="section-title">4. Complete Itemized Expenses Ledger (${expenses.length})</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description / Merchant</th>
            <th>Category</th>
            <th>Amount (INR)</th>
            <th>Paid By</th>
            <th>Split Mode</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(e => {
            const cat = TRIP_CATEGORIES.find(c => c.id === e.category)?.label || e.category || 'Misc';
            const payer = compMap[e.paidBy] || e.payerName || e.paidBy;
            return `
              <tr>
                <td>${e.date || '-'}</td>
                <td><b>${e.title}</b></td>
                <td>${cat}</td>
                <td><b>₹${Number(e.amount).toLocaleString('en-IN')}</b></td>
                <td>${payer}</td>
                <td>${e.splitType || 'Equal'}</td>
                <td>${e.notes || ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

// Generate Printable PDF HTML Statement for Trip
export function generateTripPdfHtml({ trip, tripStats, userNickname = 'You' }) {
  if (!trip) return '';
  const totalSpent = tripStats.totalSpent || 0;
  const companions = trip.companions || [];
  const expenses = trip.expenses || [];
  const compMap = {};
  companions.forEach(c => { compMap[c.id] = c.name; });
  const transfers = tripStats.transfers || [];
  const perPersonAvg = companions.length > 0 ? Math.round(totalSpent / companions.length) : 0;

  const categoryTotals = {};
  TRIP_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
  expenses.forEach(e => {
    const cat = e.category || 'misc';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
  });

  const auditRefCode = `TRIP-${(trip.id || 'TRIP').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tallyin — Trip Statement (${trip.title})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      padding: 36px;
      background-color: #FFFFFF;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 2.5px solid #1A3827;
      margin-bottom: 24px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1.5px solid #1A3827;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 900;
      color: #1A3827;
      letter-spacing: -0.5px;
      line-height: 1;
    }
    .statement-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #059669;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .meta-row {
      margin-bottom: 2px;
    }
    .meta-ref {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748B;
      font-weight: 600;
      margin-top: 4px;
    }
    .trip-banner {
      background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
      border: 1.5px solid #A7F3D0;
      border-radius: 14px;
      padding: 18px 22px;
      margin-bottom: 24px;
    }
    .trip-title {
      font-size: 20px;
      font-weight: 900;
      color: #064E3B;
      margin-bottom: 4px;
    }
    .trip-dest {
      font-size: 12px;
      font-weight: 700;
      color: #047857;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      border: 1px solid #E2E8F0;
      background-color: #F8FAFC;
      border-radius: 12px;
      padding: 14px;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748B;
      margin-bottom: 4px;
    }
    .kpi-val {
      font-size: 18px;
      font-weight: 900;
      color: #0F172A;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #1A3827;
      margin: 20px 0 8px 0;
    }
    .settlement-card {
      background-color: #F8FAFC;
      border: 1.5px solid #CBD5E1;
      border-left: 5px solid #1A3827;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 20px;
    }
    th {
      background-color: #F1F5F9;
      color: #1E293B;
      font-weight: 800;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 2px solid #CBD5E1;
    }
    th.text-right, td.text-right { text-align: right; }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
    }
    tr:nth-child(even) td { background-color: #FAFAFA; }
    .badge-pos {
      color: #047857;
      font-weight: 800;
      background-color: #ECFDF5;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #A7F3D0;
    }
    .badge-neg {
      color: #B91C1C;
      font-weight: 800;
      background-color: #FEF2F2;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #FECACA;
    }
    .badge-zero {
      color: #64748B;
      font-weight: 700;
      background-color: #F1F5F9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
    }
    @media print {
      body { padding: 16px; }
      tr { page-break-inside: avoid; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-row">
      <img src="${LOGO_URL}" class="brand-logo" alt="Tallyin Logo" />
      <div>
        <div class="brand-name">Tallyin</div>
        <div class="statement-tag">Trip Splitter • Official Statement of Account</div>
      </div>
    </div>
    <div class="meta-box">
      <div class="meta-row"><strong>Exported by:</strong> ${userNickname || 'You'}</div>
      <div class="meta-row"><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div class="meta-row"><strong>Status:</strong> ${trip.status || 'Ongoing'}</div>
      <div class="meta-ref">REF #${auditRefCode}</div>
    </div>
  </div>

  <div class="trip-banner">
    <div class="trip-title">🌴 ${trip.title}</div>
    <div class="trip-dest">📍 ${trip.destination || 'Vacation'} ${trip.startDate ? '• ' + trip.startDate + (trip.endDate ? ' to ' + trip.endDate : '') : ''}</div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Spend</div>
      <div class="kpi-val" style="color: #047857;">₹${totalSpent.toLocaleString('en-IN')}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Per Person Average</div>
      <div class="kpi-val">₹${perPersonAvg.toLocaleString('en-IN')}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Companions</div>
      <div class="kpi-val">${companions.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Expenses Logged</div>
      <div class="kpi-val">${expenses.length}</div>
    </div>
  </div>

  <div class="section-title">⚖️ Final Debt Settlements (Who Owes Whom)</div>
  <div class="settlement-card">
    ${transfers.length > 0 ? `
      <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 8px;">Recommended Direct Transfers:</div>
      ${transfers.map(tr => `
        <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 5px;">
          👉 <strong>${compMap[tr.from] || tr.from}</strong> pays <strong>${compMap[tr.to] || tr.to}</strong>: <span style="color: #047857;">₹${Number(tr.amount).toLocaleString('en-IN')}</span>
        </div>
      `).join('')}
    ` : `
      <div style="font-size: 12px; font-weight: 800; color: #047857;">
        ✓ All accounts are balanced! No pending transfers.
      </div>
    `}
  </div>

  <div class="section-title">👥 Companion Net Standings</div>
  <table>
    <thead>
      <tr>
        <th>Companion</th>
        <th>Role</th>
        <th class="text-right">Paid Out of Pocket</th>
        <th class="text-right">Net Standing</th>
      </tr>
    </thead>
    <tbody>
      ${companions.map(c => {
        const bal = Math.round(tripStats.balances?.[c.id] || 0);
        const paid = expenses.filter(e => e.paidBy === c.id).reduce((s, e) => s + (Number(e.amount) || 0), 0);
        const badgeClass = bal > 0 ? 'badge-pos' : bal < 0 ? 'badge-neg' : 'badge-zero';
        const balText = bal > 0 ? `+₹${bal.toLocaleString('en-IN')} (Gets back)` : bal < 0 ? `-₹${Math.abs(bal).toLocaleString('en-IN')} (Owes)` : `Settled (₹0)`;
        return `
          <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.isHost ? 'Host / Organizer' : 'Companion'}</td>
            <td class="text-right font-medium">₹${paid.toLocaleString('en-IN')}</td>
            <td class="text-right"><span class="${badgeClass}">${balText}</span></td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="section-title">📊 Category Spending Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th class="text-right">Total Amount</th>
        <th class="text-right">% of Spend</th>
      </tr>
    </thead>
    <tbody>
      ${TRIP_CATEGORIES.filter(cat => (categoryTotals[cat.id] || 0) > 0).map(cat => {
        const amt = categoryTotals[cat.id] || 0;
        const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
        return `
          <tr>
            <td>${cat.label}</td>
            <td class="text-right"><strong>₹${amt.toLocaleString('en-IN')}</strong></td>
            <td class="text-right">${pct}%</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="section-title">📑 Complete Itemized Ledger (${expenses.length} Records)</div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Title / Merchant</th>
        <th>Category</th>
        <th>Paid By</th>
        <th>Split Mode</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${expenses.map(e => {
        const cat = TRIP_CATEGORIES.find(c => c.id === e.category)?.label || e.category || 'Misc';
        const payer = compMap[e.paidBy] || e.payerName || e.paidBy;
        return `
          <tr>
            <td>${e.date || '-'}</td>
            <td><strong>${e.title}</strong></td>
            <td>${cat}</td>
            <td>${payer}</td>
            <td>${e.splitType || 'Equal'}</td>
            <td class="text-right"><strong>₹${Number(e.amount).toLocaleString('en-IN')}</strong></td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>🔒 Tallyin Space Governance • Private Individual Trip Ledger</div>
    <div>REF: ${auditRefCode}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;
}

export default function TripExpenseManager({
  members = [],
  userNickname = 'You',
  userRoomId = null,
  user = null,
  supabase = null,
  triggerToast = () => {},
  isDarkMode = false,
  onNavigate,
  codeLoginEmail = '',
  roomName = ''
}) {
  // Resolve current logged-in user email across all auth methods
  const currentUserEmail = useMemo(() => {
    return (
      user?.email ||
      user?.user_metadata?.email ||
      codeLoginEmail ||
      (typeof window !== 'undefined' ? (localStorage.getItem('codeLoginEmail') || localStorage.getItem('tallyin_user_email')) : '') ||
      ''
    ).trim().toLowerCase();
  }, [user, codeLoginEmail]);

  // Scoped unique ID for individual private storage (never shared with room members)
  const currentUid = useMemo(() => {
    return (
      user?.id ||
      user?.uid ||
      (currentUserEmail ? currentUserEmail.replace(/[^a-zA-Z0-9]/g, '_') : null) ||
      (userNickname && userNickname !== 'You' ? userNickname.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') : 'default_user')
    );
  }, [user, currentUserEmail, userNickname]);

  // Master Trip State with user-scoped isolation
  const [trips, setTrips] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const userKey = `tallyin_trips_data_${currentUid}`;
        const saved = localStorage.getItem(userKey) || localStorage.getItem('tallyin_trips_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          const cleaned = Array.isArray(parsed) ? parsed.filter(t => t.id !== 'trip-seed-goa') : [];
          return cleaned;
        }
      } catch (e) {
        console.error('Error loading trips data:', e);
      }
    }
    return [];
  });

  // Fetch and sync user trips from database (strictly private system_settings per UID)
  useEffect(() => {
    if (!currentUid || !supabase) return;

    let isMounted = true;
    async function syncCloudTrips() {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', `user_trips_${currentUid}`)
          .maybeSingle();

        if (data?.value && isMounted) {
          const cloudTrips = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(cloudTrips)) {
            setTrips(prev => {
              const merged = [...prev];
              cloudTrips.forEach(ct => {
                const idx = merged.findIndex(m => m.id === ct.id);
                if (idx >= 0) {
                  merged[idx] = { ...ct, ...merged[idx] };
                } else {
                  merged.push(ct);
                }
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Notice: user trips cloud sync:', err);
      }
    }

    syncCloudTrips();
    return () => { isMounted = false; };
  }, [currentUid, supabase]);

  // Persist trips to user-scoped localStorage and cloud
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUid) {
      try {
        const userKey = `tallyin_trips_data_${currentUid}`;
        localStorage.setItem(userKey, JSON.stringify(trips));
        localStorage.setItem('tallyin_trips_data', JSON.stringify(trips));
      } catch (e) {
        console.error('Error saving trips:', e);
      }
    }
    if (currentUid && supabase && trips.length > 0) {
      supabase.from('system_settings').upsert({
        key: `user_trips_${currentUid}`,
        value: JSON.stringify(trips),
        created_at: new Date().toISOString()
      }, { onConflict: 'key' }).catch(() => {});
    }
  }, [trips, currentUid, supabase]);

  // Selected Trip View
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [tripTab, setTripTab] = useState('expenses'); // 'expenses' | 'settlement' | 'planner' | 'companions'

  // Filter & Search states
  const [tripStatusFilter, setTripStatusFilter] = useState('all'); // 'all' | 'Ongoing' | 'Planning' | 'Completed'
  const [tripSearch, setTripSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePayer, setSettlePayer] = useState('');
  const [settleReceiver, setSettleReceiver] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [tripToExport, setTripToExport] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSendingOnDemandEmail, setIsSendingOnDemandEmail] = useState(false);
  const [isCompleteTripModalOpen, setIsCompleteTripModalOpen] = useState(false);
  const [tripToComplete, setTripToComplete] = useState(null);
  const [isSendingTripEmails, setIsSendingTripEmails] = useState(false);

  // Active Trip Object
  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  // Current User's Companion Record in Active Trip
  const currentUserCompanion = useMemo(() => {
    if (!activeTrip) return null;
    return (
      activeTrip.companions.find(c => c.name.toLowerCase() === (userNickname || 'You').toLowerCase()) ||
      activeTrip.companions[0] ||
      null
    );
  }, [activeTrip, userNickname]);

  // Trip Calculations for Active Trip
  const tripStats = useMemo(() => {
    if (!activeTrip) return { totalSpent: 0, perPersonAvg: 0, categoryTotals: {}, balances: {}, transfers: [] };

    const expenses = activeTrip.expenses || [];
    const companions = activeTrip.companions || [];
    const settlements = activeTrip.settlements || [];

    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const perPersonAvg = companions.length > 0 ? totalSpent / companions.length : 0;

    // Category breakdown
    const categoryTotals = {};
    TRIP_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
    expenses.forEach(e => {
      const cat = e.category || 'misc';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });

    // Settlements & Balances
    const { balances, transfers } = calculateTripSettlements(companions, expenses, settlements);

    return {
      totalSpent,
      perPersonAvg,
      categoryTotals,
      balances,
      transfers
    };
  }, [activeTrip]);

  // Trip Calculations for the Export Target Trip (activeTrip or selected card in hub)
  const exportTargetTrip = tripToExport || activeTrip;
  const exportTripStats = useMemo(() => {
    if (!exportTargetTrip) return { totalSpent: 0, perPersonAvg: 0, categoryTotals: {}, balances: {}, transfers: [] };
    if (activeTrip && exportTargetTrip.id === activeTrip.id) return tripStats;
    const exp = exportTargetTrip.expenses || [];
    const comp = exportTargetTrip.companions || [];
    const setl = exportTargetTrip.settlements || [];
    const totalSpent = exp.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const perPersonAvg = comp.length > 0 ? totalSpent / comp.length : 0;
    const categoryTotals = {};
    TRIP_CATEGORIES.forEach(cat => { categoryTotals[cat.id] = 0; });
    exp.forEach(e => {
      const cat = e.category || 'misc';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });
    const { balances, transfers } = calculateTripSettlements(comp, exp, setl);
    return { totalSpent, perPersonAvg, categoryTotals, balances, transfers };
  }, [exportTargetTrip, activeTrip, tripStats]);

  // Overall Global Trips Summary
  const globalSummary = useMemo(() => {
    const totalTrips = trips.length;
    const ongoingCount = trips.filter(t => t.status === 'Ongoing').length;
    const totalSpendAllTrips = trips.reduce((sum, t) => {
      return sum + (t.expenses || []).reduce((eSum, exp) => eSum + (Number(exp.amount) || 0), 0);
    }, 0);

    return {
      totalTrips,
      ongoingCount,
      totalSpendAllTrips
    };
  }, [trips]);

  // Handlers for Trip Creation & Editing
  const handleSaveTrip = (tripData) => {
    if (editingTrip) {
      setTrips(prev => prev.map(t => t.id === editingTrip.id ? { ...t, ...tripData } : t));
      triggerToast('Trip details updated successfully!');
    } else {
      const newTrip = {
        id: `trip-${Date.now()}`,
        ...tripData,
        expenses: [],
        settlements: []
      };
      setTrips(prev => [newTrip, ...prev]);
      setSelectedTripId(newTrip.id);
      triggerToast('✨ New trip created! Let the journey begin!');
    }
    setIsTripModalOpen(false);
    setEditingTrip(null);
  };

  const handleDeleteTrip = (tripId) => {
    const target = trips.find(t => t.id === tripId);
    if (!window.confirm(`Are you sure you want to permanently delete "${target?.title || 'this trip'}"?`)) {
      return;
    }
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
    triggerToast('Trip removed.');
  };

  // Complete Trip & Trigger Final Statement Emails
  const handleCompleteTrip = async ({ tripId, companionEmails = {}, sendEmails = true }) => {
    const targetTrip = trips.find(t => t.id === tripId);
    if (!targetTrip) return;

    setIsSendingTripEmails(true);

    try {
      const updatedTrip = {
        ...targetTrip,
        status: 'Completed',
        closedAt: new Date().toISOString(),
        companions: targetTrip.companions.map(c => ({
          ...c,
          email: companionEmails[c.id] || c.email || ''
        }))
      };

      setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));

      if (sendEmails) {
        triggerToast('📧 Preparing statement and sending emails to companions...');
        const stats = calculateTripSettlements(
          updatedTrip.companions || [],
          updatedTrip.expenses || [],
          updatedTrip.settlements || []
        );
        const totalSpent = (updatedTrip.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
        const enrichedStats = { ...stats, totalSpent };

        const emailHtml = generateTripCompletionEmailHtml({
          trip: updatedTrip,
          tripStats: enrichedStats,
          userNickname,
          userEmail: currentUserEmail
        });

        const csvContent = generateTripCsvContent(updatedTrip);
        const excelContent = generateTripExcelHtml({ trip: updatedTrip, tripStats: enrichedStats, userNickname });
        const pdfHtmlContent = generateTripPdfHtml({ trip: updatedTrip, tripStats: enrichedStats, userNickname });

        const cleanTitle = updatedTrip.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const attachments = [
          {
            name: `tallyin_trip_${cleanTitle}_statement.csv`,
            mimeType: 'text/csv',
            base64: toBase64(csvContent)
          },
          {
            name: `tallyin_trip_${cleanTitle}_statement.xls`,
            mimeType: 'application/vnd.ms-excel',
            base64: toBase64(excelContent)
          },
          {
            name: `tallyin_trip_${cleanTitle}_statement.html`,
            mimeType: 'text/html',
            base64: toBase64(pdfHtmlContent),
            convertToPdf: true
          }
        ];

        // Collect recipient emails
        const recipients = [];
        for (const c of updatedTrip.companions) {
          const isCurrentUser = c.isHost || (c.name && c.name.toLowerCase() === (userNickname || 'You').toLowerCase());
          const email = (
            companionEmails[c.id] ||
            c.email ||
            (isCurrentUser ? currentUserEmail : '') ||
            (members.find(m => (m.nickname && m.nickname.toLowerCase() === c.name.toLowerCase()) || (m.name && m.name.toLowerCase() === c.name.toLowerCase()))?.email)
          );

          if (email && email.includes('@') && !recipients.some(r => r.email.toLowerCase() === email.trim().toLowerCase())) {
            recipients.push({ email: email.trim(), name: c.name });
          }
        }

        let sentCount = 0;
        for (const r of recipients) {
          try {
            await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'send_email',
                to: r.email,
                subject: `🌴 [Tallyin Trip Statement] ${updatedTrip.title} Completed • Final Settlement & Ledger`,
                body: `Trip "${updatedTrip.title}" has been marked as Completed! Total spend: ₹${totalSpent}. Statements attached (PDF, Excel, CSV). View complete ledger at https://tallyin.vercel.app`,
                textBody: `Trip "${updatedTrip.title}" has been marked as Completed! Total spend: ₹${totalSpent}. Statements attached (PDF, Excel, CSV). View complete ledger at https://tallyin.vercel.app`,
                htmlBody: emailHtml,
                attachments: attachments,
                name: 'Tallyin Trip Splitter',
                senderName: 'Tallyin Trip Splitter'
              })
            });
            sentCount++;
          } catch (e) {
            console.warn(`Failed to dispatch trip statement email to ${r.email}:`, e);
          }
        }

        if (recipients.length === 0) {
          triggerToast(`🎉 Trip "${updatedTrip.title}" completed! (No emails sent: no recipient email addresses were entered).`);
        } else if (sentCount > 0) {
          triggerToast(`🎉 Trip "${updatedTrip.title}" completed! Statements & files emailed to ${sentCount} recipient(s).`);
        } else {
          triggerToast(`⚠️ Trip completed, but could not dispatch statement emails. Please check your network connection.`);
        }
      } else {
        triggerToast(`🎉 Trip "${updatedTrip.title}" marked as Completed!`);
      }
      setIsCompleteTripModalOpen(false);
      setTripToComplete(null);
    } catch (err) {
      console.error('Error completing trip:', err);
      triggerToast('Error completing trip. Please check connection.');
    } finally {
      setIsSendingTripEmails(false);
    }
  };

  const handleReopenTrip = (tripId) => {
    if (!window.confirm('Reopen this trip back to Ongoing?')) return;
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Ongoing', closedAt: null } : t));
    triggerToast('Trip reopened as Ongoing.');
  };

  // Handlers for Expenses
  const handleSaveExpense = (expenseData) => {
    if (!activeTrip) return;

    if (editingExpense) {
      setTrips(prev => prev.map(t => {
        if (t.id !== activeTrip.id) return t;
        return {
          ...t,
          expenses: t.expenses.map(e => e.id === editingExpense.id ? { ...e, ...expenseData } : e)
        };
      }));
      triggerToast('Expense updated!');
    } else {
      const newExpense = {
        id: `exp-${Date.now()}`,
        ...expenseData
      };
      setTrips(prev => prev.map(t => {
        if (t.id !== activeTrip.id) return t;
        return {
          ...t,
          expenses: [newExpense, ...(t.expenses || [])]
        };
      }));
      triggerToast('Trip expense recorded!');
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    if (!activeTrip) return;
    if (!window.confirm('Delete this expense entry?')) return;

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        expenses: t.expenses.filter(e => e.id !== expenseId)
      };
    }));
    triggerToast('Expense deleted.');
  };

  // Handlers for Settlements
  const handleRecordSettlement = () => {
    if (!activeTrip || !settlePayer || !settleReceiver || !settleAmount || Number(settleAmount) <= 0) {
      triggerToast('Please select payer, receiver and valid amount.');
      return;
    }
    if (settlePayer === settleReceiver) {
      triggerToast('Payer and receiver cannot be the same person.');
      return;
    }

    const newSettlement = {
      id: `st-${Date.now()}`,
      payerId: settlePayer,
      receiverId: settleReceiver,
      amount: Number(settleAmount),
      date: new Date().toISOString().split('T')[0],
      note: settleNote.trim() || 'Settlement via Tallyin'
    };

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        settlements: [newSettlement, ...(t.settlements || [])]
      };
    }));

    setIsSettleModalOpen(false);
    setSettleAmount('');
    setSettleNote('');
    triggerToast('Settlement logged! Balances updated.');
  };

  const handleDeleteSettlement = (settleId) => {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        settlements: (t.settlements || []).filter(s => s.id !== settleId)
      };
    }));
    triggerToast('Settlement record removed.');
  };

  // Handler for adding/updating trip budget planner
  const handleUpdatePlanner = (categoryKey, value) => {
    if (!activeTrip) return;
    const num = Math.max(0, Number(value) || 0);
    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      const currentPlanner = t.planner || {};
      const updatedPlanner = { ...currentPlanner, [categoryKey]: num };
      const newTotalBudget = Object.values(updatedPlanner).reduce((sum, v) => sum + (Number(v) || 0), 0);
      return {
        ...t,
        planner: updatedPlanner,
        budget: newTotalBudget > 0 ? newTotalBudget : t.budget
      };
    }));
  };

  // Handler for managing companions
  const handleAddCompanion = (name) => {
    if (!activeTrip || !name.trim()) return;
    const trimmed = name.trim();
    if (activeTrip.companions.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      triggerToast('A companion with this name already exists.');
      return;
    }

    const newCompanion = {
      id: `c-${Date.now()}`,
      name: trimmed,
      isHost: false
    };

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        companions: [...t.companions, newCompanion]
      };
    }));
    triggerToast(`Added ${trimmed} to trip!`);
  };

  const handleRemoveCompanion = (cid) => {
    if (!activeTrip) return;
    const comp = activeTrip.companions.find(c => c.id === cid);
    const hasExpenses = (activeTrip.expenses || []).some(
      e => e.paidBy === cid || (e.includedMembers && e.includedMembers.includes(cid))
    );

    if (hasExpenses) {
      triggerToast(`Cannot remove ${comp?.name || 'companion'}: they are linked to recorded expenses.`);
      return;
    }

    if (activeTrip.companions.length <= 1) {
      triggerToast('A trip must have at least one companion.');
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id !== activeTrip.id) return t;
      return {
        ...t,
        companions: t.companions.filter(c => c.id !== cid)
      };
    }));
    triggerToast(`Removed ${comp?.name || 'companion'}.`);
  };

  // Helper: Export text formatted summary
  const generateTripShareText = (targetTrip = activeTrip, targetStats = tripStats) => {
    const tripToUse = targetTrip || activeTrip;
    if (!tripToUse) return '';
    const statsToUse = targetStats || tripStats;
    const companions = tripToUse.companions || [];
    const compMap = {};
    companions.forEach(c => { compMap[c.id] = c.name; });

    let msg = `🌴 *${tripToUse.title.toUpperCase()}*\n`;
    msg += `📍 Destination: ${tripToUse.destination || 'Vacation'}\n`;
    if (tripToUse.startDate) msg += `🗓️ Dates: ${tripToUse.startDate} to ${tripToUse.endDate || 'TBD'}\n`;
    msg += `💰 Total Spend: ${formatINR(statsToUse.totalSpent)}\n`;
    msg += `👥 Per Person Average: ${formatINR(statsToUse.perPersonAvg)}\n\n`;

    msg += `⚖️ *WHO OWES WHOM (SIMPLIFIED SETTLEMENTS)*:\n`;
    if (!statsToUse.transfers || statsToUse.transfers.length === 0) {
      msg += `🎉 Everyone is all settled up! No pending payments.\n\n`;
    } else {
      statsToUse.transfers.forEach(tf => {
        msg += `• *${compMap[tf.from] || tf.from}* owes *${compMap[tf.to] || tf.to}*: ${formatINR(tf.amount)}\n`;
      });
      msg += `\n`;
    }

    msg += `📊 *INDIVIDUAL NET STANDINGS*:\n`;
    companions.forEach(c => {
      const bal = statsToUse.balances?.[c.id] || 0;
      const status = bal > 0 ? `Gets back ${formatINR(bal)}` : bal < 0 ? `Owes ${formatINR(Math.abs(bal))}` : `Settled (₹0)`;
      msg += `• ${c.name}: ${status}\n`;
    });

    msg += `\n_Generated via Tallyin Trip Splitter_ 🚀`;
    return msg;
  };

  const copyTripSummary = (targetTrip = activeTrip, targetStats = tripStats) => {
    const text = generateTripShareText(targetTrip, targetStats);
    navigator.clipboard.writeText(text);
    triggerToast('Trip settlement summary copied to clipboard!');
  };

  const shareViaWhatsApp = (targetTrip = activeTrip, targetStats = tripStats) => {
    const text = encodeURIComponent(generateTripShareText(targetTrip, targetStats));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Full Export to PDF Handler
  const handleExportPDF = (targetTrip = activeTrip, targetStats = tripStats) => {
    const tripToUse = targetTrip || exportTargetTrip;
    const statsToUse = targetStats || exportTripStats;
    if (!tripToUse) return;

    try {
      const htmlContent = generateTripPdfHtml({ trip: tripToUse, tripStats: statsToUse, userNickname });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      }
      triggerToast('Generating PDF statement / print preview...');
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback: download HTML statement file
      const blob = new Blob([generateTripPdfHtml({ trip: tripToUse, tripStats: statsToUse, userNickname })], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tallyin_${tripToUse.title.replace(/\s+/g, '_')}_statement.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('Print blocked. Downloaded printable statement as HTML file.');
    }
  };

  // Full Export to Excel (.xls) Handler
  const handleExportExcel = (targetTrip = activeTrip, targetStats = tripStats) => {
    const tripToUse = targetTrip || exportTargetTrip;
    const statsToUse = targetStats || exportTripStats;
    if (!tripToUse) return;

    try {
      const excelContent = generateTripExcelHtml({ trip: tripToUse, tripStats: statsToUse, userNickname });
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tallyin_trip_${tripToUse.title.replace(/\s+/g, '_')}_statement.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('Excel spreadsheet (.xls) downloaded successfully!');
    } catch (err) {
      console.error('Excel export error:', err);
      triggerToast('Failed to export Excel spreadsheet.');
    }
  };

  // Full Export to CSV Handler
  const handleExportCSV = (targetTrip = activeTrip) => {
    const tripToUse = targetTrip || exportTargetTrip;
    if (!tripToUse) return;

    try {
      const csvContent = generateTripCsvContent(tripToUse);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tallyin_trip_${tripToUse.title.replace(/\s+/g, '_')}_expenses.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('CSV ledger downloaded successfully!');
    } catch (err) {
      console.error('CSV export error:', err);
      triggerToast('Failed to export CSV file.');
    }
  };

  // On-Demand Direct Email Dispatch Handler
  const handleSendOnDemandEmail = async (targetEmail, targetTrip = activeTrip, targetStats = tripStats) => {
    const tripToUse = targetTrip || exportTargetTrip;
    const statsToUse = targetStats || exportTripStats;
    if (!tripToUse) return;

    if (!targetEmail || !targetEmail.includes('@')) {
      triggerToast('Please enter a valid email address.');
      return;
    }

    setIsSendingOnDemandEmail(true);
    triggerToast(`📧 Preparing statement and emailing to ${targetEmail.trim()}...`);
    try {
      const emailHtml = generateTripCompletionEmailHtml({
        trip: tripToUse,
        tripStats: statsToUse,
        userNickname,
        userEmail: currentUserEmail
      });

      const csvContent = generateTripCsvContent(tripToUse);
      const excelContent = generateTripExcelHtml({ trip: tripToUse, tripStats: statsToUse, userNickname });
      const pdfHtmlContent = generateTripPdfHtml({ trip: tripToUse, tripStats: statsToUse, userNickname });

      const cleanTitle = tripToUse.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const attachments = [
        {
          name: `tallyin_trip_${cleanTitle}_statement.csv`,
          mimeType: 'text/csv',
          base64: toBase64(csvContent)
        },
        {
          name: `tallyin_trip_${cleanTitle}_statement.xls`,
          mimeType: 'application/vnd.ms-excel',
          base64: toBase64(excelContent)
        },
        {
          name: `tallyin_trip_${cleanTitle}_statement.html`,
          mimeType: 'text/html',
          base64: toBase64(pdfHtmlContent),
          convertToPdf: true
        }
      ];

      await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'send_email',
          to: targetEmail.trim(),
          subject: `🌴 [Tallyin Trip Statement] ${tripToUse.title} • Financial Settlement & Ledger`,
          body: `Hi,\n\nAttached is your financial statement for trip "${tripToUse.title}" (${tripToUse.destination || 'Vacation'}). Total spend: ₹${statsToUse.totalSpent}. Attachments include PDF, Excel (.xls), and CSV statements.\n\nView online at https://tallyin.vercel.app`,
          textBody: `Hi,\n\nAttached is your financial statement for trip "${tripToUse.title}" (${tripToUse.destination || 'Vacation'}). Total spend: ₹${statsToUse.totalSpent}. Attachments include PDF, Excel (.xls), and CSV statements.\n\nView online at https://tallyin.vercel.app`,
          htmlBody: emailHtml,
          attachments: attachments,
          name: 'Tallyin Trip Splitter',
          senderName: 'Tallyin Trip Splitter'
        })
      });

      triggerToast(`🎉 Statement and attachments successfully emailed to ${targetEmail.trim()}!`);
    } catch (err) {
      console.error('Error emailing trip statement:', err);
      triggerToast('Failed to email statement. Please check your network connection.');
    } finally {
      setIsSendingOnDemandEmail(false);
    }
  };

  // ==========================================
  // RENDER: SINGLE TRIP WORKSPACE
  // ==========================================
  if (activeTrip) {
    const companions = activeTrip.companions || [];
    const compMap = {};
    companions.forEach(c => { compMap[c.id] = c.name; });

    const myBalance = currentUserCompanion ? (tripStats.balances[currentUserCompanion.id] || 0) : 0;
    const budgetPct = activeTrip.budget > 0 ? Math.min(Math.round((tripStats.totalSpent / activeTrip.budget) * 100), 150) : 0;
    const budgetRemaining = (activeTrip.budget || 0) - tripStats.totalSpent;

    return (
      <div className="space-y-6 animate-fade-in text-left pb-16">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E8E3] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTripId(null)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-200 hover:bg-[#dfe7e2] text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>All Trips</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight truncate">
                  {activeTrip.title}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                  activeTrip.status === 'Ongoing'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#A3E635] border border-emerald-500/30'
                    : activeTrip.status === 'Completed'
                      ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                }`}>
                  {activeTrip.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#5C6E5C] dark:text-slate-400 font-medium mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635]" />
                  {activeTrip.destination || 'Vacation'}
                </span>
                {activeTrip.startDate && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeTrip.startDate} {activeTrip.endDate ? `to ${activeTrip.endDate}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  {companions.length} Companions
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>

            {activeTrip.status !== 'Completed' ? (
              <button
                onClick={() => {
                  setTripToComplete(activeTrip);
                  setIsCompleteTripModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 text-white dark:text-[#A3E635] dark:hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
                title="Mark trip as completed and trigger final statement emails"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setTripToComplete(activeTrip);
                    setIsCompleteTripModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
                  title="Resend trip completion statement emails"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635]" />
                  <span>Resend Statement</span>
                </button>
                <button
                  onClick={() => handleReopenTrip(activeTrip.id)}
                  className="px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  title="Reopen trip back to Ongoing"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reopen</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleExportPDF(activeTrip, tripStats)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
              title="Print or Save as PDF Statement"
            >
              <Printer className="w-4 h-4 text-rose-500" />
              <span className="hidden md:inline">PDF</span>
            </button>

            <button
              onClick={() => handleExportExcel(activeTrip, tripStats)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
              title="Download Excel Spreadsheet (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
              <span className="hidden md:inline">Excel</span>
            </button>

            <button
              onClick={() => {
                setTripToExport(activeTrip);
                setIsExportModalOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
              title="Export & Share Trip Ledger"
            >
              <Download className="w-4 h-4" />
              <span>Export & Share</span>
            </button>
            <button
              onClick={() => {
                setEditingTrip(activeTrip);
                setIsTripModalOpen(true);
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              title="Edit Trip Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Core Summary Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Group Spend */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Total Group Spend</span>
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">
              {formatINR(tripStats.totalSpent)}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
              Across {(activeTrip.expenses || []).length} logged expenses
            </p>
          </div>

          {/* Card 2: Budget Progress */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Trip Budget</span>
              <Calculator className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-[#1A3827] dark:text-slate-100">
                {formatINR(activeTrip.budget || 0)}
              </span>
              <span className={`text-[11px] font-black ${
                budgetRemaining < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-[#A3E635]'
              }`}>
                {budgetRemaining >= 0 ? `${formatINR(budgetRemaining)} left` : `${formatINR(Math.abs(budgetRemaining))} over`}
              </span>
            </div>
            <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetPct > 100 ? 'bg-rose-500' : budgetPct > 80 ? 'bg-amber-500' : 'bg-emerald-500 dark:bg-[#A3E635]'
                }`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Per-Person Average */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Per Person Avg</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100">
              {formatINR(tripStats.perPersonAvg)}
            </p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
              Divided equally ({companions.length} members)
            </p>
          </div>

          {/* Card 4: Your Balance Standing */}
          <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
              <span>Your Standing ({currentUserCompanion?.name || 'You'})</span>
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-xl sm:text-2xl font-black ${
              myBalance > 0
                ? 'text-emerald-600 dark:text-[#A3E635]'
                : myBalance < 0
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'text-[#1A3827] dark:text-slate-200'
            }`}>
              {myBalance > 0 ? `+${formatINR(myBalance)}` : myBalance < 0 ? `-${formatINR(Math.abs(myBalance))}` : '₹0'}
            </p>
            <p className="text-[10px] font-semibold text-[#5C6E5C] dark:text-slate-400">
              {myBalance > 0 ? 'You are owed by friends' : myBalance < 0 ? 'You owe friends' : 'All balances settled'}
            </p>
          </div>

        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EAF0EC]/80 dark:bg-slate-900 border border-[#1A3827]/5 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setTripTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'expenses'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Expenses & Ledger ({(activeTrip.expenses || []).length})</span>
          </button>

          <button
            onClick={() => setTripTab('settlement')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'settlement'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Who Owes Whom ({tripStats.transfers.length} Debts)</span>
          </button>

          <button
            onClick={() => setTripTab('planner')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'planner'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Budget Estimator & Actuals</span>
          </button>

          <button
            onClick={() => setTripTab('companions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              tripTab === 'companions'
                ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Companions ({companions.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: EXPENSES & LEDGER */}
        {/* ======================================================== */}
        {tripTab === 'expenses' && (
          <div className="space-y-4">
            
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expenses by title or note..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setExpenseCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    expenseCategoryFilter === 'all'
                      ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950'
                      : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#dfe7e2]'
                  }`}
                >
                  All
                </button>
                {TRIP_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setExpenseCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                      expenseCategoryFilter === cat.id
                        ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950'
                        : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#dfe7e2]'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    <span>{cat.label.split('&')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses List */}
            {(() => {
              const filtered = (activeTrip.expenses || []).filter(e => {
                if (expenseCategoryFilter !== 'all' && e.category !== expenseCategoryFilter) return false;
                if (expenseSearch) {
                  const q = expenseSearch.toLowerCase();
                  const matchTitle = e.title?.toLowerCase().includes(q);
                  const matchNotes = e.notes?.toLowerCase().includes(q);
                  const matchPayer = (compMap[e.paidBy] || '').toLowerCase().includes(q);
                  if (!matchTitle && !matchNotes && !matchPayer) return false;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="hud-card rounded-3xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto">
                      <Palmtree className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                      No expenses match your search
                    </h3>
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
                      Log your first hotel booking, travel tickets, dining bill, or adventure sport pass!
                    </p>
                    <button
                      onClick={() => {
                        setEditingExpense(null);
                        setIsExpenseModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add First Expense</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-2.5">
                  {filtered.map(exp => {
                    const catObj = TRIP_CATEGORIES.find(c => c.id === exp.category) || TRIP_CATEGORIES[TRIP_CATEGORIES.length - 1];
                    const CatIcon = catObj.icon;
                    const payerName = compMap[exp.paidBy] || exp.paidBy;

                    // Calculation of participants
                    const count = exp.includedMembers ? exp.includedMembers.length : companions.length;
                    const perPersonShare = count > 0 ? (Number(exp.amount) || 0) / count : 0;

                    return (
                      <div
                        key={exp.id}
                        className="hud-card-interactive rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${catObj.color} shrink-0`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                                {exp.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-300">
                                {catObj.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#5C6E5C] dark:text-slate-400 flex-wrap">
                              <span className="font-semibold text-emerald-700 dark:text-[#A3E635]">
                                Paid by {payerName}
                              </span>
                              <span>•</span>
                              <span>{exp.date || 'Today'}</span>
                              <span>•</span>
                              <span>
                                Split {count} ways ({formatINR(perPersonShare)} / person)
                              </span>
                            </div>
                            {exp.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                "{exp.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#E3E8E3] dark:border-slate-800">
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-black text-[#1A3827] dark:text-slate-100">
                              {formatINR(exp.amount)}
                            </p>
                            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                              Your share: {formatINR(perPersonShare)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingExpense(exp);
                                setIsExpenseModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#5C6E5C] hover:text-[#1A3827] dark:hover:text-slate-200 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 transition-all"
                              title="Edit Expense"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: WHO OWES WHOM & SETTLEMENT MATRIX */}
        {/* ======================================================== */}
        {tripTab === 'settlement' && (
          <div className="space-y-6">
            
            {/* Top Settlement Action Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  Smart Debt Simplification
                </h3>
                <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                  Tallyin minimizes cross-transfers into the fewest possible payments so friends settle debts effortlessly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSettlePayer(companions[0]?.id || '');
                    setSettleReceiver(companions[1]?.id || '');
                    setSettleAmount('');
                    setIsSettleModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Payment / Settle Up</span>
                </button>
                <button
                  onClick={shareViaWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Simplified Transfer Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Optimized Direct Transfers ({tripStats.transfers.length})
              </h4>

              {tripStats.transfers.length === 0 ? (
                <div className="hud-card rounded-2xl p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <h4 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
                    All Settled Up!
                  </h4>
                  <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                    No debts pending between trip companions. Everyone is balanced out.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tripStats.transfers.map((tf, idx) => {
                    const fromName = compMap[tf.from] || tf.from;
                    const toName = compMap[tf.to] || tf.to;

                    return (
                      <div
                        key={idx}
                        className="hud-card rounded-2xl p-4 flex items-center justify-between gap-3 border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#A3E635] flex items-center justify-center font-black text-xs shadow-inner">
                            {fromName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-[#1A3827] dark:text-slate-100">
                              <span>{fromName}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-emerald-700 dark:text-[#A3E635]">{toName}</span>
                            </div>
                            <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                              Payment of <strong className="text-[#1A3827] dark:text-slate-200">{formatINR(tf.amount)}</strong> clears this debt
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSettlePayer(tf.from);
                            setSettleReceiver(tf.to);
                            setSettleAmount(String(tf.amount));
                            setIsSettleModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 hover:bg-emerald-100 text-emerald-800 dark:text-[#A3E635] font-black text-xs transition-all shrink-0"
                        >
                          Mark Settled
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Companion Balances Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Individual Participant Ledgers
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {companions.map(c => {
                  const bal = tripStats.balances[c.id] || 0;
                  const totalPaid = (activeTrip.expenses || [])
                    .filter(e => e.paidBy === c.id)
                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                  return (
                    <div key={c.id} className="hud-card rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-black text-[#1A3827] dark:text-slate-100 truncate max-w-[100px]">
                            {c.name}
                          </span>
                        </div>
                        {c.isHost && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">
                            Host
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 pt-1 text-xs">
                        <div className="flex justify-between text-[#5C6E5C] dark:text-slate-400">
                          <span>Total Paid:</span>
                          <span className="font-bold text-[#1A3827] dark:text-slate-200">{formatINR(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1 border-t border-[#E3E8E3] dark:border-slate-800">
                          <span className="font-bold">Net Standing:</span>
                          <span className={`font-black ${
                            bal > 0
                              ? 'text-emerald-600 dark:text-[#A3E635]'
                              : bal < 0
                                ? 'text-rose-500'
                                : 'text-slate-500'
                          }`}>
                            {bal > 0 ? `+${formatINR(bal)}` : bal < 0 ? `-${formatINR(Math.abs(bal))}` : '₹0 (Settled)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recorded Settlements History */}
            {(activeTrip.settlements || []).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                  Recorded Settlement Payments ({(activeTrip.settlements || []).length})
                </h4>
                <div className="space-y-2">
                  {(activeTrip.settlements || []).map(st => {
                    const pName = compMap[st.payerId] || st.payerId;
                    const rName = compMap[st.receiverId] || st.receiverId;

                    return (
                      <div
                        key={st.id}
                        className="hud-card rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                          <div>
                            <span className="font-black text-[#1A3827] dark:text-slate-100">{pName}</span>
                            <span className="text-[#5C6E5C] dark:text-slate-400"> paid </span>
                            <span className="font-black text-[#1A3827] dark:text-slate-100">{rName}</span>
                            <span className="font-black text-emerald-700 dark:text-[#A3E635] ml-2">
                              {formatINR(st.amount)}
                            </span>
                            {st.note && (
                              <span className="text-[11px] text-slate-500 ml-2 italic">({st.note})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400">{st.date}</span>
                          <button
                            onClick={() => handleDeleteSettlement(st.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="Delete Settlement Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PRE-TRIP BUDGET ESTIMATOR & PLANNER */}
        {/* ======================================================== */}
        {tripTab === 'planner' && (
          <div className="space-y-6">
            
            {/* Header intro */}
            <div className="hud-card rounded-3xl p-6 space-y-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-[#A3E635]">
                <Calculator className="w-5 h-5" />
                <h3 className="text-base font-black">Pre-Trip Group Cost Estimator</h3>
              </div>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-300 leading-relaxed max-w-2xl">
                Plan expected expenses per category before packing your bags. Adjust estimates, view projected per-person costs, and track real-time variance against what you actually spent.
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-bold text-[#1A3827] dark:text-slate-200">
                <div>
                  <span className="text-[#5C6E5C] dark:text-slate-400">Total Estimated Budget: </span>
                  <span className="font-black text-base text-emerald-700 dark:text-[#A3E635]">
                    {formatINR(activeTrip.budget || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#5C6E5C] dark:text-slate-400">Est. Cost Per Person: </span>
                  <span className="font-black text-base text-purple-700 dark:text-purple-400">
                    {formatINR(companions.length > 0 ? (activeTrip.budget || 0) / companions.length : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Breakdown & Comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Planned vs. Actual Spend Breakdown
              </h4>

              <div className="space-y-3">
                {TRIP_CATEGORIES.map(cat => {
                  const planned = (activeTrip.planner && activeTrip.planner[cat.id]) || 0;
                  const actual = tripStats.categoryTotals[cat.id] || 0;
                  const variance = planned - actual;
                  const pct = planned > 0 ? Math.min(Math.round((actual / planned) * 100), 150) : (actual > 0 ? 100 : 0);
                  const CatIcon = cat.icon;

                  return (
                    <div key={cat.id} className="hud-card rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${cat.color}`}>
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#1A3827] dark:text-slate-100">
                              {cat.label}
                            </h5>
                            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                              Actual Spend: <strong className="text-[#1A3827] dark:text-slate-200">{formatINR(actual)}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Editable Planner Input */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block">
                              Estimated Budget (₹)
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={planned || ''}
                              placeholder="0"
                              onChange={(e) => handleUpdatePlanner(cat.id, e.target.value)}
                              className="w-28 px-2.5 py-1 text-right rounded-lg border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="text-right min-w-[70px]">
                            <span className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 block">Status</span>
                            <span className={`text-xs font-black ${
                              variance < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-[#A3E635]'
                            }`}>
                              {variance >= 0 ? `${formatINR(variance)} left` : `${formatINR(Math.abs(variance))} over`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            pct > 100 ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500 dark:bg-[#A3E635]'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: COMPANIONS & PARTICIPANTS */}
        {/* ======================================================== */}
        {tripTab === 'companions' && (
          <div className="space-y-6">
            
            {/* Add Companion Form */}
            <div className="hud-card rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                Add Friends & Guest Companions
              </h4>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400">
                You can add any friend, partner, or guest traveling on this trip without requiring them to join your flat room.
              </p>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.companionName;
                  handleAddCompanion(input.value);
                  input.value = '';
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  name="companionName"
                  type="text"
                  placeholder="e.g. Vikram, Neha, Rohit..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Companions Roster */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400">
                Active Trip Travelers ({companions.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {companions.map(c => {
                  const totalPaid = (activeTrip.expenses || [])
                    .filter(e => e.paidBy === c.id)
                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                  const bal = tripStats.balances[c.id] || 0;

                  return (
                    <div key={c.id} className="hud-card rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-inner">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-black text-[#1A3827] dark:text-slate-100">
                              {c.name}
                            </h5>
                            {c.isHost && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                Host
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                            Paid: {formatINR(totalPaid)} • Net: {bal > 0 ? `+${formatINR(bal)}` : bal < 0 ? `-${formatINR(Math.abs(bal))}` : '₹0'}
                          </p>
                        </div>
                      </div>

                      {!c.isHost && (
                        <button
                          onClick={() => handleRemoveCompanion(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          title="Remove Companion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ADD / EDIT EXPENSE */}
        {/* ======================================================== */}
        {isExpenseModalOpen && (
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => {
              setIsExpenseModalOpen(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense}
            companions={companions}
            currentUserId={currentUserCompanion?.id}
            onSave={handleSaveExpense}
          />
        )}

        {/* ======================================================== */}
        {/* MODAL: RECORD SETTLEMENT */}
        {/* ======================================================== */}
        {isSettleModalOpen && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left"
            onClick={(e) => { if (e.target === e.currentTarget) setIsSettleModalOpen(false); }}
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E2EAE3] dark:border-slate-800 shadow-2xl rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
                  <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                    Record Payment / Settle Up
                  </h3>
                </div>
                <button
                  onClick={() => setIsSettleModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Who Paid? (Debtor)
                  </label>
                  <select
                    value={settlePayer}
                    onChange={(e) => setSettlePayer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  >
                    {companions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Who Received the Money? (Creditor)
                  </label>
                  <select
                    value={settleReceiver}
                    onChange={(e) => setSettleReceiver(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  >
                    {companions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Settlement Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter settled amount"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                    Note / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid via GPay / UPI, Cash at hotel"
                    value={settleNote}
                    onChange={(e) => setSettleNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordSettlement}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md"
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ======================================================== */}
        {/* MODAL: EXPORT & SHARE HUB */}
        {/* ======================================================== */}
        {isExportModalOpen && (
          <ExportAndShareModal
            isOpen={isExportModalOpen}
            onClose={() => {
              setIsExportModalOpen(false);
              setTripToExport(null);
            }}
            trip={exportTargetTrip}
            tripStats={exportTripStats}
            userNickname={userNickname}
            currentUserEmail={currentUserEmail}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onSendEmail={handleSendOnDemandEmail}
            isSendingEmail={isSendingOnDemandEmail}
          />
        )}

        {/* ======================================================== */}
        {/* MODAL: EDIT ACTIVE TRIP */}
        {/* ======================================================== */}
        {isTripModalOpen && (
          <TripModal
            isOpen={isTripModalOpen}
            onClose={() => {
              setIsTripModalOpen(false);
              setEditingTrip(null);
            }}
            initialData={editingTrip || activeTrip}
            defaultHostName={userNickname}
            roomMembers={members}
            onSave={handleSaveTrip}
          />
        )}

        {/* ======================================================== */}
        {/* MODAL: COMPLETE TRIP & EMAIL LEDGER */}
        {/* ======================================================== */}
        {isCompleteTripModalOpen && (
          <CompleteTripModal
            isOpen={isCompleteTripModalOpen}
            onClose={() => {
              setIsCompleteTripModalOpen(false);
              setTripToComplete(null);
            }}
            trip={tripToComplete || activeTrip}
            tripStats={
              (tripToComplete && tripToComplete.id !== activeTrip?.id)
                ? {
                    ...calculateTripSettlements(
                      tripToComplete.companions || [],
                      tripToComplete.expenses || [],
                      tripToComplete.settlements || []
                    ),
                    totalSpent: (tripToComplete.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
                  }
                : tripStats
            }
            roomMembers={members}
            user={user}
            currentUserEmail={currentUserEmail}
            userNickname={userNickname}
            onConfirm={handleCompleteTrip}
            isSending={isSendingTripEmails}
          />
        )}

      </div>
    );
  }

  // ==========================================
  // RENDER: TRIPS HUB (OVERVIEW LIST)
  // ==========================================
  const filteredTrips = trips.filter(t => {
    if (tripStatusFilter !== 'all' && t.status !== tripStatusFilter) return false;
    if (tripSearch) {
      const q = tripSearch.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDest = t.destination?.toLowerCase().includes(q);
      if (!matchTitle && !matchDest) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left pb-16">
      
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600 dark:text-[#A3E635] shrink-0" />
              <span className="truncate">Trips & Vacation Expense Splitter</span>
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#A3E635] text-[10px] font-bold">
              <Lock className="w-3 h-3" />
              <span>100% Private to You</span>
            </div>
          </div>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-medium mt-1">
            Plan group budgets, track on-the-go travel expenses, split costs with companions & settle balances. 🔒 Private to your account — roommates cannot view your trips.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrip(null);
            setIsTripModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Global Stats Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
            <span>Total Trips</span>
            <Luggage className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
          </div>
          <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">
            {globalSummary.totalTrips}
          </p>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            {globalSummary.ongoingCount} currently active/ongoing
          </p>
        </div>

        <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
            <span>All Trips Total Spend</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-[#1A3827] dark:text-slate-100">
            {formatINR(globalSummary.totalSpendAllTrips)}
          </p>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            Tracked across all past and ongoing journeys
          </p>
        </div>

        <div className="hud-card rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-[#5C6E5C] dark:text-slate-400 text-xs font-bold">
            <span>Split settlements</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-[#A3E635]">
            Instant Math
          </p>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            Automated minimum transfer algorithm
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EAF0EC]/80 dark:bg-slate-900 border border-[#1A3827]/5 dark:border-slate-800 overflow-x-auto">
          {['all', 'Ongoing', 'Planning', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setTripStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                tripStatusFilter === status
                  ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              {status === 'all' ? 'All Trips' : status}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-[#5C6E5C] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search destination or trip..."
            value={tripSearch}
            onChange={(e) => setTripSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-[#1A3827] dark:text-slate-100 placeholder-[#5C6E5C] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="hud-card rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#5C6E5C]">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-[#1A3827] dark:text-slate-100">
            No trips found
          </h3>
          <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto">
            Ready for your next adventure? Create a trip to plan budgets and split expenses with friends.
          </p>
          <button
            onClick={() => {
              setEditingTrip(null);
              setIsTripModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Your First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map(trip => {
            const expenses = trip.expenses || [];
            const companions = trip.companions || [];
            const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const budget = trip.budget || 0;
            const progress = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

            // Find current user balance
            const currentUser = companions.find(c => c.name.toLowerCase() === (userNickname || 'You').toLowerCase()) || companions[0];
            const { balances } = calculateTripSettlements(companions, expenses, trip.settlements || []);
            const userBal = currentUser ? (balances[currentUser.id] || 0) : 0;

            return (
              <div
                key={trip.id}
                className="hud-card-interactive rounded-3xl p-6 flex flex-col justify-between space-y-4 group cursor-pointer"
                onClick={() => setSelectedTripId(trip.id)}
              >
                <div className="space-y-3">
                  
                  {/* Status & Destination */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      trip.status === 'Ongoing'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#A3E635] border border-emerald-500/30'
                        : trip.status === 'Completed'
                          ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                    }`}>
                      {trip.status}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {trip.status !== 'Completed' ? (
                        <button
                          onClick={() => {
                            setTripToComplete(trip);
                            setIsCompleteTripModalOpen(true);
                          }}
                          className="p-1 text-emerald-600 dark:text-[#A3E635] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Complete Trip & Email Statements"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTripToComplete(trip);
                            setIsCompleteTripModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-[#A3E635] rounded-lg transition-colors cursor-pointer"
                          title="Resend Statement Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTripToExport(trip);
                          setIsExportModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-[#A3E635] rounded-lg transition-colors cursor-pointer"
                        title="Export PDF / Excel / CSV or Share"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTrip(trip);
                          setIsTripModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200"
                        title="Edit Trip Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-[#A3E635] transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-[#5C6E5C] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 dark:text-[#A3E635]" />
                      <span>{trip.destination || 'Vacation Spot'}</span>
                      {trip.startDate && <span>• {trip.startDate}</span>}
                    </p>
                  </div>

                  {/* Spend vs Budget */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#5C6E5C] dark:text-slate-400">Total Spent</span>
                      <span className="text-[#1A3827] dark:text-slate-200">
                        {formatINR(totalSpent)} {budget > 0 ? `/ ${formatINR(budget)}` : ''}
                      </span>
                    </div>

                    <div className="w-full bg-[#EAF0EC] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-[#A3E635] h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Companions Avatars */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {companions.slice(0, 4).map((c, i) => (
                        <div
                          key={c.id}
                          className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs"
                          title={c.name}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {companions.length > 4 && (
                        <div className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[9px] font-black flex items-center justify-center">
                          +{companions.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Net balance status chip */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      userBal > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-[#A3E635]'
                        : userBal < 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-[#EAF0EC] text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {userBal > 0 ? `+${formatINR(userBal)}` : userBal < 0 ? `-${formatINR(Math.abs(userBal))}` : 'Settled'}
                    </span>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-700 dark:text-[#A3E635]">
                  <span>Open Trip Workspace</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT TRIP */}
      {/* ======================================================== */}
      {isTripModalOpen && (
        <TripModal
          isOpen={isTripModalOpen}
          onClose={() => {
            setIsTripModalOpen(false);
            setEditingTrip(null);
          }}
          initialData={editingTrip}
          defaultHostName={userNickname}
          roomMembers={members}
          onSave={handleSaveTrip}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: COMPLETE TRIP & EMAIL LEDGER */}
      {/* ======================================================== */}
      {isCompleteTripModalOpen && (
        <CompleteTripModal
          isOpen={isCompleteTripModalOpen}
          onClose={() => {
            setIsCompleteTripModalOpen(false);
            setTripToComplete(null);
          }}
          trip={tripToComplete || activeTrip}
          tripStats={
            (tripToComplete && tripToComplete.id !== activeTrip?.id)
              ? {
                  ...calculateTripSettlements(
                    tripToComplete.companions || [],
                    tripToComplete.expenses || [],
                    tripToComplete.settlements || []
                  ),
                  totalSpent: (tripToComplete.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
                }
              : tripStats
          }
          roomMembers={members}
          user={user}
          currentUserEmail={currentUserEmail}
          userNickname={userNickname}
          onConfirm={handleCompleteTrip}
          isSending={isSendingTripEmails}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: EXPORT & SHARE HUB */}
      {/* ======================================================== */}
      {isExportModalOpen && (
        <ExportAndShareModal
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
            setTripToExport(null);
          }}
          trip={exportTargetTrip}
          tripStats={exportTripStats}
          userNickname={userNickname}
          currentUserEmail={currentUserEmail}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          onSendEmail={handleSendOnDemandEmail}
          isSendingEmail={isSendingOnDemandEmail}
        />
      )}

    </div>
  );
}

// =========================================================================
// SUB-MODAL COMPONENT: TRIP CREATE / EDIT
// =========================================================================
function TripModal({
  isOpen,
  onClose,
  initialData,
  defaultHostName = 'You',
  roomMembers = [],
  onSave
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [budget, setBudget] = useState(initialData?.budget || '');
  const [status, setStatus] = useState(initialData?.status || 'Planning');
  
  // Companions
  const [companions, setCompanions] = useState(() => {
    if (initialData?.companions && initialData.companions.length > 0) {
      return initialData.companions;
    }
    // Default: only the organizer/host (private to individual user)
    return [
      { id: 'c-host', name: defaultHostName || 'You', isHost: true }
    ];
  });

  const [newCompanionInput, setNewCompanionInput] = useState('');

  if (!isOpen) return null;

  const handleAddCompanionChip = () => {
    if (!newCompanionInput.trim()) return;
    const name = newCompanionInput.trim();
    if (companions.some(c => c.name.toLowerCase() === name.toLowerCase())) return;

    setCompanions(prev => [...prev, { id: `c-${Date.now()}`, name, isHost: false }]);
    setNewCompanionInput('');
  };

  const handleRemoveChip = (cid) => {
    if (companions.length <= 1) return;
    setCompanions(prev => prev.filter(c => c.id !== cid));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: Number(budget) || 0,
      status,
      companions
    });
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E2EAE3] dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
            <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
              {initialData ? 'Edit Trip Details' : 'Plan New Vacation / Trip'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Guarantee Notice */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-[#A3E635]" />
          <div className="text-xs leading-relaxed">
            <span className="font-black text-[11px] uppercase tracking-wider text-emerald-700 dark:text-[#A3E635] block">
              🔒 100% Private to Your Account
            </span>
            This trip and its expenses are strictly private to you. Roommates cannot view your trips, and trip balances never mix with your shared room ledger.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Trip Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Goa Beach Weekend, Manali Trek 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Goa, Pondicherry, Ladakh"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Trip Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Planning">Planning</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Estimated Total Budget Target (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              placeholder="e.g. 40000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Companions / Participants selector */}
          <div className="space-y-2 pt-1 border-t border-[#E3E8E3] dark:border-slate-800">
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block">
              Trip Companions ({companions.length})
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              {companions.map(c => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-[#A3E635] border border-emerald-500/20 font-bold text-xs"
                >
                  <span>{c.name}</span>
                  {c.isHost && <span className="text-[9px] uppercase font-black opacity-70">(Host)</span>}
                  {!c.isHost && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(c.id)}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add companion name (e.g. friend outside flat)..."
                value={newCompanionInput}
                onChange={(e) => setNewCompanionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompanionChip();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
              />
              <button
                type="button"
                onClick={handleAddCompanionChip}
                className="px-3.5 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 hover:bg-[#dfe7e2] font-black text-xs shrink-0 cursor-pointer"
              >
                + Add
              </button>
            </div>

            {/* Quick add flatmates if present */}
            {roomMembers.filter(m => {
              const name = m.nickname || m.name;
              return name && !companions.some(c => c.name.toLowerCase() === name.toLowerCase());
            }).length > 0 && (
              <div className="pt-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Quick add flatmates (optional):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roomMembers.filter(m => {
                    const name = m.nickname || m.name;
                    return name && !companions.some(c => c.name.toLowerCase() === name.toLowerCase());
                  }).map((m, idx) => {
                    const name = m.nickname || m.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCompanions(prev => [...prev, { id: `c-rm-${Date.now()}-${idx}`, name, isHost: false }])}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        + {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md"
            >
              {initialData ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

// =========================================================================
// SUB-MODAL COMPONENT: ADD / EDIT EXPENSE
// =========================================================================
function ExpenseModal({
  isOpen,
  onClose,
  initialData,
  companions = [],
  currentUserId,
  onSave
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || 'food');
  const [paidBy, setPaidBy] = useState(initialData?.paidBy || currentUserId || companions[0]?.id || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [splitMode, setSplitMode] = useState(initialData?.splitType || 'equal'); // 'equal' | 'selective' | 'exact'
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Selected members for 'selective' split
  const [selectedMembers, setSelectedMembers] = useState(() => {
    if (initialData?.includedMembers) {
      return initialData.includedMembers;
    }
    return companions.map(c => c.id);
  });

  // Exact custom amounts for 'exact' split
  const [exactShares, setExactShares] = useState(() => {
    if (initialData?.splits) {
      return initialData.splits;
    }
    const shares = {};
    companions.forEach(c => { shares[c.id] = ''; });
    return shares;
  });

  if (!isOpen) return null;

  const toggleMemberSelection = (cid) => {
    if (selectedMembers.includes(cid)) {
      if (selectedMembers.length <= 1) return; // Must have at least 1 person
      setSelectedMembers(prev => prev.filter(id => id !== cid));
    } else {
      setSelectedMembers(prev => [...prev, cid]);
    }
  };

  const handleExactShareChange = (cid, val) => {
    setExactShares(prev => ({ ...prev, [cid]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!title.trim() || !numAmt || numAmt <= 0) return;

    const payload = {
      title: title.trim(),
      amount: numAmt,
      category,
      paidBy,
      date,
      splitType: splitMode,
      notes: notes.trim()
    };

    if (splitMode === 'selective') {
      payload.includedMembers = selectedMembers;
    } else if (splitMode === 'exact') {
      payload.splits = {};
      companions.forEach(c => {
        payload.splits[c.id] = Number(exactShares[c.id]) || 0;
      });
    }

    onSave(payload);
  };

  // Exact shares sum check
  const totalExactShares = Object.values(exactShares).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const exactDifference = (Number(amount) || 0) - totalExactShares;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E2EAE3] dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
            <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
              {initialData ? 'Edit Trip Expense' : 'Log Trip Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scuba diving, Beach resort stay, Dinner at Fisherman's Wharf"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="₹0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-sm text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TRIP_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {companions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-[#1A3827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Split Mode Selector */}
          <div className="space-y-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block">
              Split Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'equal', label: 'All Equally' },
                { id: 'selective', label: 'Select Who' },
                { id: 'exact', label: 'Exact ₹' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSplitMode(mode.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all ${
                    splitMode === mode.id
                      ? 'bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 shadow-sm'
                      : 'bg-[#EAF0EC] dark:bg-slate-800 text-[#5C6E5C] dark:text-slate-400 hover:bg-[#dfe7e2]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Split Details: Selective */}
            {splitMode === 'selective' && (
              <div className="p-3 rounded-2xl bg-[#EAF0EC]/60 dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-[#5C6E5C] dark:text-slate-400">
                  Select companions participating in this expense:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {companions.map(c => {
                    const isSelected = selectedMembers.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleMemberSelection(c.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-[#A3E635] border border-emerald-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Details: Exact */}
            {splitMode === 'exact' && (
              <div className="p-3 rounded-2xl bg-[#EAF0EC]/60 dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-semibold">
                  <span className="text-[#5C6E5C] dark:text-slate-400">Specify amount for each person:</span>
                  <span className={exactDifference === 0 ? 'text-emerald-600 font-black' : 'text-rose-500 font-black'}>
                    {exactDifference === 0 ? '✓ Balanced' : `${formatINR(Math.abs(exactDifference))} ${exactDifference > 0 ? 'unassigned' : 'over'}`}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {companions.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{c.name}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="₹0"
                        value={exactShares[c.id] || ''}
                        onChange={(e) => handleExactShareChange(c.id, e.target.value)}
                        className="w-24 px-2 py-1 text-right rounded-lg border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-[#1A3827] dark:text-slate-200 block mb-1">
              Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Scuba tickets for 3 people, includes equipment hire"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E3E8E3] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EAF0EC] dark:bg-slate-800 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1A3827] text-white dark:bg-[#A3E635] dark:text-slate-950 font-black text-xs shadow-md"
            >
              {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

// =========================================================================
// SUB-MODAL COMPONENT: COMPLETE TRIP & EMAIL LEDGER
// =========================================================================
function CompleteTripModal({
  isOpen,
  onClose,
  trip,
  tripStats,
  roomMembers = [],
  user = null,
  currentUserEmail = '',
  userNickname = 'You',
  onConfirm,
  isSending = false
}) {
  const [companionEmails, setCompanionEmails] = useState({});
  const [sendEmails, setSendEmails] = useState(true);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!trip) return;
    const initialEmails = {};
    (trip.companions || []).forEach(c => {
      const matchMember = roomMembers.find(m => 
        (m.nickname && m.nickname.toLowerCase() === c.name.toLowerCase()) || 
        (m.name && m.name.toLowerCase() === c.name.toLowerCase())
      );
      const isCurrentUser = c.isHost || (c.name && c.name.toLowerCase() === (userNickname || 'You').toLowerCase());
      initialEmails[c.id] = c.email || (isCurrentUser ? currentUserEmail : '') || matchMember?.email || '';
    });
    setCompanionEmails(initialEmails);
    setEmailError('');
  }, [trip, roomMembers, user, currentUserEmail, userNickname]);

  if (!isOpen || !trip) return null;

  const handleEmailChange = (cid, val) => {
    setCompanionEmails(prev => ({ ...prev, [cid]: val }));
    setEmailError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sendEmails) {
      const validEmails = Object.values(companionEmails).filter(em => em && em.includes('@'));
      if (validEmails.length === 0) {
        setEmailError('Please enter at least one recipient email address (or uncheck the email option) to proceed.');
        return;
      }
    }
    setEmailError('');
    onConfirm({ tripId: trip.id, companionEmails, sendEmails });
  };

  const totalSpent = tripStats.totalSpent || 0;
  const transfers = tripStats.transfers || [];
  const compMap = {};
  (trip.companions || []).forEach(c => { compMap[c.id] = c.name; });

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left"
      onClick={(e) => { if (e.target === e.currentTarget && !isSending) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E2EAE3] dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
            <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
              Complete Trip & Finalize Statements
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trip Overview Pill */}
        <div className="bg-[#F8FAF9] dark:bg-slate-900/60 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1A3827] dark:text-slate-100">{trip.title}</span>
            <span className="text-xs font-black text-emerald-600 dark:text-[#A3E635]">₹{totalSpent.toLocaleString('en-IN')} Total</span>
          </div>
          {transfers.length > 0 ? (
            <div className="text-[11px] text-[#5C6E5C] dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Final Settlement Summary:</span>
              {transfers.map((tr, idx) => (
                <div key={idx} className="font-medium">
                  • <strong>{compMap[tr.from] || tr.from}</strong> owes <strong>{compMap[tr.to] || tr.to}</strong> ₹{tr.amount.toLocaleString('en-IN')}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ All accounts are balanced!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Notification Option */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={sendEmails}
                onChange={(e) => setSendEmails(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-black text-[#1A3827] dark:text-slate-100 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635]" />
                Email Final Statement & Itemized Ledger to Companions
              </span>
            </label>
            <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 pl-6">
              Sends an official branded statement with PDF, Excel (.xls), and CSV attachments directly.
            </p>
          </div>

          {/* Companions Email Inputs */}
          {sendEmails && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Companion Email Recipients
                </label>
                {currentUserEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      const hostComp = (trip.companions || []).find(c => c.isHost) || trip.companions?.[0];
                      if (hostComp) {
                        setCompanionEmails(prev => ({ ...prev, [hostComp.id]: currentUserEmail }));
                        setEmailError('');
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-600 dark:text-[#A3E635] hover:underline cursor-pointer"
                  >
                    Use my email ({currentUserEmail})
                  </button>
                )}
              </div>

              {emailError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  ⚠️ {emailError}
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(trip.companions || []).map(c => {
                  const bal = Math.round(tripStats.balances?.[c.id] || 0);
                  const balLabel = bal > 0 ? `+₹${bal.toLocaleString('en-IN')}` : bal < 0 ? `-₹${Math.abs(bal).toLocaleString('en-IN')}` : '₹0';
                  return (
                    <div key={c.id} className="flex items-center gap-2">
                      <div className="w-28 shrink-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {c.name} {c.isHost ? '(Host)' : ''}
                        </span>
                        <span className={`text-[10px] font-black ${bal > 0 ? 'text-emerald-600' : bal < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                          {balLabel}
                        </span>
                      </div>
                      <input
                        type="email"
                        value={companionEmails[c.id] || ''}
                        onChange={(e) => handleEmailChange(c.id, e.target.value)}
                        placeholder="Enter companion email..."
                        className="flex-1 px-3 py-1.5 bg-[#F8FAF9] dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3E8E3] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing & Dispatching...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Completed & Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

// =========================================================================
// SUB-MODAL COMPONENT: EXPORT & SHARE HUB
// =========================================================================
function ExportAndShareModal({
  isOpen,
  onClose,
  trip,
  tripStats,
  userNickname = 'You',
  currentUserEmail = '',
  onExportPDF,
  onExportExcel,
  onExportCSV,
  onSendEmail,
  isSendingEmail = false
}) {
  const [recipientEmail, setRecipientEmail] = useState(currentUserEmail || '');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (currentUserEmail && !recipientEmail) {
      setRecipientEmail(currentUserEmail);
    }
  }, [currentUserEmail]);

  if (!isOpen || !trip) return null;

  const totalSpent = tripStats.totalSpent || 0;
  const companions = trip.companions || [];
  const compMap = {};
  companions.forEach(c => { compMap[c.id] = c.name; });

  const shareText = `🌴 *${trip.title.toUpperCase()}*\n📍 Destination: ${trip.destination || 'Vacation'}\n💰 Total Spend: ₹${Number(totalSpent).toLocaleString('en-IN')}\n\n⚖️ *WHO OWES WHOM*:\n${(tripStats.transfers || []).length > 0 ? (tripStats.transfers || []).map(tr => `• *${compMap[tr.from] || tr.from}* owes *${compMap[tr.to] || tr.to}*: ₹${Number(tr.amount).toLocaleString('en-IN')}`).join('\n') : '✓ All accounts are balanced!'}\n\n_Generated via Tallyin Trip Splitter_ 🚀`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) return;
    onSendEmail(recipientEmail, trip, tripStats);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left"
      onClick={(e) => { if (e.target === e.currentTarget && !isSendingEmail) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E2EAE3] dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3E8E3] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
            <div>
              <h3 className="text-base font-black text-[#1A3827] dark:text-slate-100">
                Export & Share Trip Ledger
              </h3>
              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 font-medium">
                {trip.title} • ₹{Number(totalSpent).toLocaleString('en-IN')} Total Spend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSendingEmail}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: File Exports (PDF, Excel, CSV) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Download Financial Statement Documents
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* PDF Option */}
            <button
              type="button"
              onClick={() => onExportPDF(trip, tripStats)}
              className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-slate-100">PDF Statement</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Print / Save as PDF</div>
            </button>

            {/* Excel Option */}
            <button
              type="button"
              onClick={() => onExportExcel(trip, tripStats)}
              className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-slate-100">Excel Sheet (.xls)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Styled Multi-Table</div>
            </button>

            {/* CSV Option */}
            <button
              type="button"
              onClick={() => onExportCSV(trip)}
              className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-950/60 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-slate-100">Raw CSV File</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Sheets / Audits</div>
            </button>
          </div>
        </div>

        {/* Section 2: On-Demand Email Statement */}
        <div className="space-y-2.5 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-[#A3E635]" />
            <span>Email Statement to Yourself or Companions</span>
          </label>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter email address (e.g. your@email.com)..."
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-[#F8FAF9] dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              disabled={isSendingEmail}
            />
            <button
              type="submit"
              disabled={isSendingEmail || !recipientEmail || !recipientEmail.includes('@')}
              className="px-4 py-2.5 rounded-xl bg-[#1A3827] hover:bg-[#255038] text-white dark:bg-[#A3E635] dark:text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </form>
          <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
            Sends an official statement with printable PDF statement, Excel (.xls), and CSV files attached directly.
          </p>
        </div>

        {/* Section 3: WhatsApp & Quick Text */}
        <div className="space-y-2 pt-2 border-t border-[#E3E8E3] dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Instant Chat Sharing
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#EAF0EC] dark:bg-slate-800 hover:bg-[#dfe7e2] font-black text-[11px] flex items-center gap-1 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-slate-950/80 border border-[#E3E8E3] dark:border-slate-800 font-mono text-xs max-h-36 overflow-y-auto whitespace-pre-wrap select-all text-slate-700 dark:text-slate-300">
            {shareText}
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
