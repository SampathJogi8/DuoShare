/**
 * Tallyin Terms of Service & Acceptable Use Policy Moderation Engine
 * 
 * Automatically detects inappropriate conduct, policy violations, abusive content,
 * fraudulent manipulations, and security threats against Tallyin Terms of Use.
 * 
 * Dispatches full incident logs and verified user tracking details directly
 * to System Administration (tallyin.alerts@gmail.com) in real-time.
 */

import { supabase } from '../supabase';
import { getUserCode } from './userCode';

export const SUPER_ADMIN_EMAIL = 'tallyin.alerts@gmail.com';
export const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
export const TALLYIN_LOGO_URL = 'https://raw.githubusercontent.com/SampathJogi8/DuoShare/main/src/assets/favicon_logo.png';

// 1. Prohibited Code / Script Injection Patterns (XSS / SQLi)
const INJECTION_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /\bon(?:error|load|click|mouseover|submit|focus)\s*=/gi,
  /<iframe\b/gi,
  /<embed\b/gi,
  /<object\b/gi,
  /document\.cookie/gi,
  /window\.location/gi,
  /\bunion\s+select\b/gi,
  /\bdrop\s+table\b/gi,
  /\bexec\s*\(/gi,
];

// 2. Prohibited Abusive / Harassment / Threat / Vulgar Keywords
// Matches whole words or exact abusive stems
const ABUSE_KEYWORDS = [
  'kill you', 'die b*tch', 'gonna hurt you', 'threaten you', 'extort you',
  'blackmail', 'scam you', 'steal money', 'f*** off', 'bitch', 'asshole',
  'bastard', 'motherfucker', 'cunt', 'dickhead', 'whore', 'slut',
  'kill yourself', 'kys', 'hate crime', 'nigger', 'faggot', 'retard',
  'chutiya', 'madarchod', 'bhenchod', 'harami', 'saale kutte'
];

// 3. Prohibited Malicious File Extensions
const PROHIBITED_FILE_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.php', '.phtml', '.js',
  '.mjs', '.vbs', '.py', '.rb', '.pl', '.jar', '.apk', '.html',
  '.htm', '.svg', '.msi', '.dll', '.scr', '.wsf', '.com'
];

/**
 * Checks arbitrary text against Tallyin Terms of Use
 */
export function checkTextTermsCompliance(text, context = 'general') {
  if (!text || typeof text !== 'string') return { compliant: true };
  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Check for Security / Injection Threats
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(raw)) {
      return {
        compliant: false,
        category: 'Security Threat: Script / Injection Attempt',
        ruleViolated: 'Rule 2: Prohibited Platform Misuse (Attempting unauthorized automated or script actions)',
        severity: 'CRITICAL',
        reason: 'Detected potential script or code injection payload in input.',
        match: raw.slice(0, 100)
      };
    }
  }

  // 2. Check for Abusive / Threat / Harassment Language
  for (const keyword of ABUSE_KEYWORDS) {
    const kwRegex = new RegExp(`(^|\\b|\\s)${keyword.replace(/[*+?^${}()|[\]\\]/g, '\\$&')}($|\\b|\\s)`, 'i');
    if (kwRegex.test(lower)) {
      return {
        compliant: false,
        category: 'Prohibited Conduct: Abusive / Harassing Language',
        ruleViolated: 'Rule 2: Prohibited Platform Misuse (Harassment, vulgarity, or intimidation in room records)',
        severity: 'HIGH',
        reason: `Detected inappropriate language or harassment pattern violating community standards.`,
        match: keyword
      };
    }
  }

  return { compliant: true };
}

/**
 * Checks an Expense Entry for financial fraud or terms violations
 */
export function checkExpenseTermsCompliance({ description, amount, notes, category }) {
  // Check Description
  const descCheck = checkTextTermsCompliance(description, 'expense_description');
  if (!descCheck.compliant) return descCheck;

  // Check Notes
  if (notes) {
    const notesCheck = checkTextTermsCompliance(notes, 'expense_notes');
    if (!notesCheck.compliant) return notesCheck;
  }

  // Check Category
  if (category) {
    const catCheck = checkTextTermsCompliance(category, 'expense_category');
    if (!catCheck.compliant) return catCheck;
  }

  // Check Amount Sanity / Deceitful Manipulation
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return {
      compliant: false,
      category: 'Financial Record Violation: Invalid Amount Value',
      ruleViolated: 'Rule 1: Honest Bookkeeping & Shared Responsibility (Accurate expense recording)',
      severity: 'MEDIUM',
      reason: 'Expense amount is non-numeric or corrupt.',
      match: String(amount)
    };
  }

  if (num < 0) {
    return {
      compliant: false,
      category: 'Financial Record Violation: Negative Amount Tampering',
      ruleViolated: 'Rule 1 & 2: Honest Bookkeeping & Prohibited Platform Misuse (Manipulating settlement figures deceitfully)',
      severity: 'HIGH',
      reason: 'Negative amounts cannot be entered as expenses to falsely drain member balances.',
      match: `Amount: ${num}`
    };
  }

  if (num > 10000000) {
    return {
      compliant: false,
      category: 'Financial Record Violation: Absurd Unrealistic Amount',
      ruleViolated: 'Rule 1: Honest Bookkeeping & Shared Responsibility (Fabricating false expense claims)',
      severity: 'HIGH',
      reason: 'Expense amount exceeds the single-transaction maximum platform threshold (₹10,000,000 / $10,000,000).',
      match: `Amount: ${num}`
    };
  }

  return { compliant: true };
}

/**
 * Checks an uploaded receipt file attachment for security violations
 */
export function checkFileTermsCompliance(file) {
  if (!file) return { compliant: true };
  const fileName = (file.name || '').toLowerCase();

  for (const ext of PROHIBITED_FILE_EXTENSIONS) {
    if (fileName.endsWith(ext)) {
      return {
        compliant: false,
        category: 'Prohibited Upload: Dangerous File Extension',
        ruleViolated: 'Rule 2: Prohibited Platform Misuse (Uploading unlawful or executable attachments as receipt proofs)',
        severity: 'CRITICAL',
        reason: `File "${file.name}" has an executable or prohibited script extension (${ext}).`,
        match: ext
      };
    }
  }

  // Check MIME type
  const mime = (file.type || '').toLowerCase();
  if (
    mime.includes('javascript') ||
    mime.includes('x-sh') ||
    mime.includes('x-msdownload') ||
    mime.includes('x-php') ||
    mime.includes('x-python')
  ) {
    return {
      compliant: false,
      category: 'Prohibited Upload: Dangerous MIME Type',
      ruleViolated: 'Rule 2: Prohibited Platform Misuse (Uploading unlawful or executable media attachments)',
      severity: 'CRITICAL',
      reason: `Uploaded file MIME type (${mime}) is prohibited for receipt proofs.`,
      match: mime
    };
  }

  return { compliant: true };
}

/**
 * Dispatches a complete Terms of Use violation incident with full user details to Admin
 */
export async function dispatchTermsIncidentToAdmin({
  user,
  userNickname = 'User',
  roomId = null,
  roomName = 'Shared Room',
  incidentType = 'Terms of Use Violation',
  violationContent = '',
  ruleViolated = 'Rule 2: Prohibited Platform Misuse',
  severity = 'HIGH',
  actionTaken = 'Incident Logged & Reported to Administration',
  reporter = null, // Set if reported by a roommate
  extraDetails = {}
}) {
  const now = new Date();
  const nowIso = now.toISOString();
  const dateStr = nowIso.slice(0, 10).replace(/-/g, '');
  const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const incidentId = `INC-${dateStr}-${randCode}`;

  const cleanEmail = (user?.email || (typeof user === 'string' ? user : '') || 'unauthenticated@tallyin.local').trim().toLowerCase();
  const cleanName = userNickname || user?.user_metadata?.full_name || cleanEmail.split('@')[0] || 'User';
  const cleanUid = user?.id || user?.uid || 'anonymous';
  const userCode = getUserCode(cleanEmail === 'sampathjogipusala123@gmail.com' ? 'sampathjogipusala123@gmail.com' : (user?.user_code || cleanEmail || cleanUid));

  const reporterCode = reporter ? getUserCode(reporter.email || reporter.id || reporter.name) : null;

  // Severity color mapping
  const severityBadgeColor = severity === 'CRITICAL' ? '#dc2626' : (severity === 'HIGH' ? '#ea580c' : '#ca8a04');
  const severityBgColor = severity === 'CRITICAL' ? '#fee2e2' : (severity === 'HIGH' ? '#ffedd5' : '#fef9c3');

  const clientInfo = typeof navigator !== 'undefined' ? `${navigator.userAgent || 'Unknown'} (${navigator.language || 'en'})` : 'Web Client';

  // Construct Incident Record for Database
  const incidentRecord = {
    id: incidentId,
    ticketId: incidentId,
    refId: incidentId,
    refNumber: incidentId,
    type: 'violation',
    category: incidentType,
    severity,
    priority: severity === 'CRITICAL' ? 'URGENT' : (severity === 'HIGH' ? 'HIGH' : 'MEDIUM'),
    status: 'OPEN',
    ruleViolated,
    title: `🚨 [Terms Violation] ${incidentType} by ${cleanName} (${userCode})`,
    message: String(violationContent || ''),
    description: String(violationContent || ''),
    actionTaken,
    userName: cleanName,
    user_name: cleanName,
    userEmail: cleanEmail,
    user_email: cleanEmail,
    userCode,
    user_code: userCode,
    userId: cleanUid,
    user_id: cleanUid,
    roomId: roomId || 'GLOBAL',
    room_id: roomId || 'GLOBAL',
    roomName: roomName || 'N/A',
    room_name: roomName || 'N/A',
    reporter: reporter ? {
      name: reporter.name || 'Roommate',
      email: reporter.email || '',
      code: reporterCode
    } : null,
    clientInfo,
    createdAt: nowIso,
    updatedAt: nowIso,
    timestamp: nowIso,
    extraDetails
  };

  // Plain Text Body for Email
  const plainTextBody = `
🚨 TALLYIN TERMS OF USE VIOLATION ALERT
Incident Tracking ID: ${incidentId}
Date & Time: ${now.toUTCString()}
Severity: ${severity}

OFFENDING USER DETAILS:
------------------------------------------
• Name: ${cleanName}
• Account Email: ${cleanEmail}
• Permanent Unique User ID: ${userCode}
• User UID: ${cleanUid}
• Room ID: ${roomId || 'N/A'} (${roomName || 'N/A'})

INCIDENT BREAKDOWN:
------------------------------------------
• Category: ${incidentType}
• Specific Rule: ${ruleViolated}
• Action Taken: ${actionTaken}
${reporter ? `• Reported By: ${reporter.name} (${reporter.email || 'N/A'}) [User Code: ${reporterCode}]\n` : ''}

VIOLATION CONTENT / EVIDENCE:
------------------------------------------
${violationContent}

CLIENT ENVIRONMENT:
------------------------------------------
${clientInfo}

ADMINISTRATIVE CONSOLE:
https://tallyin.vercel.app/admin
`.trim();

  // Rich HTML Email Template with Mandatory Tallyin Logo
  const adminHtmlBody = `
    <div style="background-color: #f6f8f6; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e3e8e3; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header Banner with Logo -->
        <div style="background: linear-gradient(135deg, #1A3827 0%, #0f2318 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 14px;">
            <img src="${TALLYIN_LOGO_URL}" alt="Tallyin Logo" width="56" height="56" style="display: inline-block; width: 56px; height: 56px; border-radius: 14px; border: 2px solid #A3E635; box-shadow: 0 4px 14px rgba(0,0,0,0.4); vertical-align: middle;" />
          </div>
          <div style="display: inline-block; background-color: ${severityBadgeColor}; color: #ffffff; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
            🚨 Terms of Use Violation • ${severity} SEVERITY
          </div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Security &amp; Policy Incident Detected</h1>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0;">Automated trust &amp; safety dispatch to Tallyin Administration</p>
        </div>

        <div style="padding: 28px 24px; color: #1A3827; font-size: 13px; line-height: 1.6;">
          
          <!-- Tracking Reference Box -->
          <div style="background-color: ${severityBgColor}; border: 1px solid ${severityBadgeColor}40; border-left: 4px solid ${severityBadgeColor}; padding: 14px 18px; border-radius: 12px; margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 800; color: #7f1d1d; text-transform: uppercase; letter-spacing: 0.5px;">Incident Reference Tracking ID</div>
            <div style="font-size: 18px; font-weight: 900; color: #991b1b; font-family: monospace; margin-top: 2px;">${incidentId}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Logged on: ${now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</div>
          </div>

          <!-- Offending User Details Section -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 800; color: #1A3827; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              👤 Offending User Account Details
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 5px 0; color: #64748b; width: 140px;"><strong>Permanent User ID:</strong></td>
                <td style="padding: 5px 0;"><span style="font-family: monospace; font-weight: 900; background-color: #ecfdf5; color: #065f46; padding: 2px 8px; border-radius: 6px; border: 1px solid #a7f3d0;">${userCode}</span></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>User Name:</strong></td>
                <td style="padding: 5px 0; color: #1e293b; font-weight: 700;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>Account Email:</strong></td>
                <td style="padding: 5px 0; color: #1e293b;"><a href="mailto:${cleanEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>Database UID:</strong></td>
                <td style="padding: 5px 0; color: #475569; font-family: monospace; font-size: 11px;">${cleanUid}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>Active Room:</strong></td>
                <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${roomName} (<span style="font-family: monospace;">${roomId || 'GLOBAL'}</span>)</td>
              </tr>
              ${reporter ? `
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>Reported By:</strong></td>
                <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${reporter.name} (${reporter.email || 'N/A'}) [${reporterCode}]</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Violation Evidence Card -->
          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 16px 18px; margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ⚠️ Incident Violation Details &amp; Evidence
            </div>
            <div style="font-size: 12px; color: #881337; margin-bottom: 6px;">
              <strong>Violation Type:</strong> ${incidentType}
            </div>
            <div style="font-size: 12px; color: #881337; margin-bottom: 10px;">
              <strong>Policy Section:</strong> ${ruleViolated}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #9f1239; margin-bottom: 4px;">Submitted Content / Offending Snippet:</div>
            <div style="background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #991b1b; font-family: monospace; white-space: pre-wrap; word-break: break-all;">${String(violationContent || '').slice(0, 1000)}</div>
            <div style="font-size: 11px; color: #9f1239; margin-top: 8px;">
              <strong>System Action Taken:</strong> ${actionTaken}
            </div>
          </div>

          <!-- Action Button for Administrator -->
          <div style="text-align: center; margin: 26px 0 10px 0;">
            <a href="https://tallyin.vercel.app/admin" style="display: inline-block; background-color: #1A3827; color: #ffffff; font-weight: 800; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(26,56,39,0.25);">
              Open Admin Console to Review or Suspend Account →
            </a>
          </div>

          <!-- Footer Metadata -->
          <div style="border-top: 1px solid #e3e8e3; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0;"><strong>Client Environment:</strong> ${clientInfo}</p>
            <p style="margin: 4px 0 0 0;">This security alert was dispatched automatically by Tallyin Trust &amp; Safety Moderation Engine.</p>
          </div>
        </div>

        <!-- Official Tallyin Footer -->
        <div style="background-color: #f6f8f6; border-top: 1px solid #e3e8e3; padding: 18px 24px; text-align: center; font-size: 11px; color: #718271;">
          <div style="margin-bottom: 6px;">
            <img src="${TALLYIN_LOGO_URL}" alt="Tallyin" width="22" height="22" style="display: inline-block; vertical-align: middle; border-radius: 6px; margin-right: 6px;" />
            <span style="font-weight: 900; color: #1A3827; font-size: 12px; vertical-align: middle;">Tallyin Trust &amp; Safety</span>
          </div>
          <p style="margin: 0;">Corporate Security &amp; Roommate Terms Enforcement</p>
          <p style="margin: 4px 0 0 0; color: #94a394;">Super Administrator: <a href="mailto:${SUPER_ADMIN_EMAIL}" style="color: #1A3827; font-weight: 700; text-decoration: none;">${SUPER_ADMIN_EMAIL}</a></p>
        </div>

      </div>
    </div>
  `;

  // 1. Dispatch Incident to Supabase & Realtime & LocalStorage
  try {
    // Save to user's local storage log
    if (typeof window !== 'undefined') {
      try {
        const localList = JSON.parse(localStorage.getItem('tallyin_incident_reports') || '[]');
        localStorage.setItem('tallyin_incident_reports', JSON.stringify([incidentRecord, ...localList.slice(0, 50)]));
      } catch (e) {}
    }

    // Fetch existing disputes and append
    let currentDisputes = [];
    try {
      const { data } = await supabase.from('rooms').select('name').eq('id', '__SYSTEM_USER_DISPUTES_QUERIES__').maybeSingle();
      if (data?.name) {
        const parsed = JSON.parse(data.name);
        if (Array.isArray(parsed)) currentDisputes = parsed;
      }
    } catch (e) {}

    const updatedDisputes = [incidentRecord, ...currentDisputes.filter(d => d.id !== incidentId)];

    // Fetch existing audit logs and append
    let currentAudits = [];
    try {
      const { data: auditData } = await supabase.from('rooms').select('name').eq('id', '__SYSTEM_AUDIT_LOGS__').maybeSingle();
      if (auditData?.name) {
        const parsed = JSON.parse(auditData.name);
        if (Array.isArray(parsed)) currentAudits = parsed;
      }
    } catch (e) {}

    const auditEntry = {
      id: `audit-${Date.now()}-${randCode}`,
      timestamp: nowIso,
      adminEmail: 'System Security Engine',
      action: 'TERMS_VIOLATION_INCIDENT',
      details: `[${severity}] ${incidentType} by ${cleanName} (${userCode}, ${cleanEmail}): ${violationContent.slice(0, 120)}`
    };
    const updatedAudits = [auditEntry, ...currentAudits].slice(0, 150);

    // Asynchronously update Supabase tables, send Realtime Broadcast, and send Email
    await Promise.allSettled([
      // A. Save to rooms __SYSTEM_USER_DISPUTES_QUERIES__
      supabase.from('rooms').upsert({
        id: '__SYSTEM_USER_DISPUTES_QUERIES__',
        name: JSON.stringify(updatedDisputes),
        created_by: 'system',
        created_at: nowIso
      }, { onConflict: 'id' }),

      // B. Save to system_settings user_disputes_and_queries
      supabase.from('system_settings').upsert({
        key: 'user_disputes_and_queries',
        value: JSON.stringify(updatedDisputes),
        created_at: nowIso
      }, { onConflict: 'key' }),

      // C. Save to __SYSTEM_AUDIT_LOGS__
      supabase.from('rooms').upsert({
        id: '__SYSTEM_AUDIT_LOGS__',
        name: JSON.stringify(updatedAudits),
        created_by: 'system',
        created_at: nowIso
      }, { onConflict: 'id' }),

      // D. Broadcast to open Admin Dashboards in real time
      (async () => {
        try {
          const channel = supabase.channel('system_admin_channel');
          await channel.send({
            type: 'broadcast',
            event: 'DISPUTE_SUBMITTED',
            payload: { dispute: incidentRecord }
          });
        } catch (bcErr) {}
      })(),

      // E. DISPATCH ALERT EMAIL TO ADMIN
      fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'send_email',
          to: SUPER_ADMIN_EMAIL,
          subject: `🚨 [${incidentId}] Terms of Use Violation: ${incidentType} (${userCode} - ${cleanEmail})`,
          body: plainTextBody,
          htmlBody: adminHtmlBody,
          senderName: 'Tallyin Security & Safety'
        })
      })
    ]);

    return { success: true, incidentId, incidentRecord };
  } catch (err) {
    console.error("Failed to complete incident dispatch to admin:", err);
    return { success: false, incidentId, error: err.message };
  }
}
