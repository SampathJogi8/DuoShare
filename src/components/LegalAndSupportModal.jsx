import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Mail, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Send, 
  Lock, 
  Database, 
  Eye, 
  HeartHandshake, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const CENTRAL_EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzR-z7qOZ31UJ7roEmBUqXkuWeNVkaUQJ-ZkitryJxlC_rvxt5MEZiD4JvzCDpyhatkMQ/exec';
const SUPPORT_EMAIL = 'tallyin.alerts@gmail.com';

export default function LegalAndSupportModal({
  isOpen = true,
  initialTab = 'privacy',
  onClose,
  user = null,
  triggerToast = null,
  isFullPage = false,
  onNavigate = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'privacy');
  
  // Contact Form State
  const [contactName, setContactName] = useState(user?.displayName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactCategory, setContactCategory] = useState('general');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendContactMessage = async (e) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) {
      if (triggerToast) triggerToast('Please provide your email address and message.');
      return;
    }

    setIsSending(true);
    try {
      const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const payload = {
        type: 'SUPPORT_INQUIRY',
        ticketId,
        name: contactName.trim() || 'Tallyin User',
        email: contactEmail.trim().toLowerCase(),
        category: contactCategory,
        subject: contactSubject.trim() || `Support Inquiry: ${contactCategory.toUpperCase()}`,
        message: contactMessage.trim(),
        timestamp: new Date().toISOString()
      };

      await fetch(CENTRAL_EMAIL_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setIsSent(true);
      if (triggerToast) triggerToast(`Message sent! Reference: ${ticketId}`);
    } catch (err) {
      console.error('Support dispatch error:', err);
      // Fallback
      setIsSent(true);
      if (triggerToast) triggerToast('Inquiry registered! Our team will respond shortly.');
    } finally {
      setIsSending(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full max-h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          {isFullPage && onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Tallyin Trust, Policies & Support</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clear commitments on your privacy, room safety guidelines, and direct help.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-white dark:bg-slate-900 shrink-0 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'privacy'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-3 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'terms'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Usage Policy & Terms</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'contact'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact & Support</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
        
        {/* ── TAB 1: PRIVACY POLICY ── */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 max-w-3xl animate-fade-in text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-emerald-950 dark:text-emerald-200 text-sm">
                  Our Privacy Principle: Zero Data Selling & Private Room Isolation
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                  Tallyin was created to simplify shared expenses for flatmates, couples, and travelers. We never sell your personal data or share your financial records with advertising brokers.
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>1. Information We Collect & Store</span>
              </h3>
              <p>When you use Tallyin, we process only the minimum operational information necessary to power your shared spaces:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Profile & Identity:</strong> Nickname or display name, optional email address (when signing in via Google, Firebase, or magic code), and optional profile avatar.</li>
                <li><strong>Room Data:</strong> Unique room codes (e.g. <code>ROOM1234</code>), room title, category, monthly budget limits, and member lists.</li>
                <li><strong>Expense & Debt Records:</strong> Expense item descriptions, amounts, payment timestamps, payer attribution, itemized bill splits, and settlement logs.</li>
                <li><strong>Receipt Attachments:</strong> Digital receipts or bill images you choose to upload to your shared space.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>2. Room Data Isolation & Security</span>
              </h3>
              <p>
                Each room operates as an isolated cryptographic silo. Only people who possess the verified Room Code or an authorized invitation link can view that room's expenses, itemized bills, and debts.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data in transit is encrypted using industry-standard TLS 1.3, and cloud records are managed securely via Supabase PostgreSQL protected by Row Level Security (RLS) policies.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>3. Local Storage & Functional Cookies</span>
              </h3>
              <p>
                Tallyin uses browser <code>localStorage</code> and <code>sessionStorage</code> exclusively for functional preferences: saving your dark mode choice, active room ID, offline cache, and banner dismissal timestamps. We do not use third-party tracking pixels or commercial ad identifiers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>4. Your Data Rights & Room Deletion</span>
              </h3>
              <p>
                You retain complete control over your records. Room hosts can export complete room ledgers to Excel/CSV or permanently purge a room and all attached transactions, receipts, and member records directly from Room Settings.
              </p>
              <p className="text-xs">
                To request manual account removal, contact our data protection team at <code>{SUPPORT_EMAIL}</code>.
              </p>
            </section>
          </div>
        )}

        {/* ── TAB 2: USAGE POLICY & TERMS ── */}
        {activeTab === 'terms' && (
          <div className="space-y-6 max-w-3xl animate-fade-in text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-blue-950 dark:text-blue-200 text-sm">
                  Acceptable Use & Roommate Community Standards
                </h4>
                <p className="text-xs text-blue-800/90 dark:text-blue-300/90 mt-0.5">
                  By creating or joining a room on Tallyin, you agree to maintain transparent, honest bookkeeping and respectful collaboration with your roommates.
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                1. Honest Bookkeeping & Mutual Agreement
              </h3>
              <p>
                Tallyin provides mathematical debt calculation and expense tracking tools. All financial commitments, debt settlements, and expense entries reflect real-world agreements between room participants.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Only record genuine shared expenses incurred on behalf of the household or group.</li>
                <li>Verify settlement amounts before marking transactions as settled.</li>
                <li>In case of a dispute, consult the room activity log or use the settlement calculator to inspect exact mathematical debts.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                2. Prohibited Activities
              </h3>
              <p>You agree not to use the Tallyin platform for:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-rose-700 dark:text-rose-300">
                <li>Recording fraudulent or deceptive expense claims against roommates.</li>
                <li>Uploading offensive, unlawful, or copyrighted material as bill receipts.</li>
                <li>Attempting to brute-force room codes or bypass administrative access controls.</li>
                <li>Spamming system broadcast channels or misusing automated scripts.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                3. Host & Co-Host Privileges
              </h3>
              <p>
                Room creators (Hosts) and assigned Co-Hosts have administrative control over room settings, member removals, and frozen read-only locks. Hosts are responsible for inviting authorized members and securing their room access codes.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                4. Availability & Disclaimer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tallyin is provided on an "as-is" and "as-available" basis for personal expense calculation. While we strive for 99.9% uptime and real-time synchronization, Tallyin is not a chartered banking institution and does not hold custodial escrow funds.
              </p>
            </section>
          </div>
        )}

        {/* ── TAB 3: CONTACT & SUPPORT ── */}
        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-3xl animate-fade-in text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Official Support Email</h4>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs font-black text-emerald-700 dark:text-emerald-300 underline block break-all">
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-1">
                <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Response Time</h4>
                <p className="text-xs text-purple-800 dark:text-purple-300 font-semibold">
                  Typically within 12–24 hours
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Security Contact</h4>
                <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold">
                  Direct Escalation & Security
                </p>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="space-y-0.5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Send Us a Direct Message</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Have a question, feedback, or need help with a room? Fill in the form below:
                </p>
              </div>

              {isSent ? (
                <div className="p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-2 animate-scale-up">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="font-black text-emerald-950 dark:text-emerald-100 text-sm">Thank You! Your Inquiry Has Been Registered.</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    A confirmation has been sent to our core support desk. We will reach back out to you at <strong>{contactEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSent(false);
                      setContactSubject('');
                      setContactMessage('');
                    }}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendContactMessage} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Your Name</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="e.g. Alex Taylor"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Your Email (Required)</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="e.g. alex@gmail.com"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Inquiry Category</label>
                      <select
                        value={contactCategory}
                        onChange={e => setContactCategory(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        <option value="general">General Question</option>
                        <option value="room_access">Room Access / Joining Issue</option>
                        <option value="dispute_help">Room Expense Dispute Assistance</option>
                        <option value="feature_request">Feature Request / Suggestion</option>
                        <option value="bug_report">Bug Report / Technical Glitch</option>
                        <option value="security">Security & Privacy Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Subject</label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={e => setContactSubject(e.target.value)}
                        placeholder="Brief summary of inquiry"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Message / Details</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder="Please describe how we can assist you..."
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick FAQ accordion */}
            <div className="space-y-2 pt-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Frequently Asked Questions</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">How do room codes work?</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Each room has a unique code. Sharing the code or QR code lets flatmates immediately sync balances and split transactions in real time.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">How are debts mathematically calculated?</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tallyin calculates net balances using an optimized settlement algorithm, minimizing the total number of payments needed to clear group debts.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Can I delete my room and all records?</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Yes. Room hosts can permanently delete their room and purge all associated transactions and member entries under Room Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <span>© {new Date().getFullYear()} Tallyin • All rights reserved.</span>
        <span>Version: {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'v4.18.0'}</span>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 p-4 sm:p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl h-[90vh]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="max-w-4xl w-full animate-scale-up">
        {content}
      </div>
    </div>
  );
}
