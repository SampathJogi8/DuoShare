import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  User,
  MessageSquare
} from 'lucide-react';
import { dispatchTermsIncidentToAdmin } from '../utils/termsModeration';
import { getUserCode } from '../utils/userCode';

export default function ReportViolationModal({
  isOpen,
  onClose,
  targetItem = null, // { type: 'expense' | 'comment' | 'member', title, text, id, author, authorEmail, authorUid }
  currentUser,
  currentNickname,
  roomId,
  roomName,
  triggerToast
}) {
  const [violationType, setViolationType] = useState('Abusive / Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncidentId, setSubmittedIncidentId] = useState(null);

  if (!isOpen) return null;

  const targetName = targetItem?.author || targetItem?.name || 'Reported User';
  const targetEmail = targetItem?.authorEmail || targetItem?.email || '';
  const targetUserCode = getUserCode(targetEmail || targetItem?.authorUid || targetItem?.uid || targetName);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportDetails.trim()) {
      if (triggerToast) triggerToast('Please explain the reason for this report.');
      return;
    }

    setIsSubmitting(true);
    try {
      const evidence = `
Target Item Type: ${targetItem?.type || 'Record'}
Target Summary: ${targetItem?.title || targetItem?.text || 'N/A'}
Reported User: ${targetName} (${targetEmail || 'No email on record'}) [${targetUserCode}]
Reason / Details from Reporter:
${reportDetails.trim()}
`.trim();

      const result = await dispatchTermsIncidentToAdmin({
        user: {
          email: targetEmail || 'unspecified@tallyin.local',
          user_metadata: { full_name: targetName },
          id: targetItem?.authorUid || targetItem?.uid || 'target_uid',
          user_code: targetUserCode
        },
        userNickname: targetName,
        roomId,
        roomName,
        incidentType: `User Conduct Report: ${violationType}`,
        violationContent: evidence,
        ruleViolated: 'Rule 2: Prohibited Platform Misuse & Community Code',
        severity: violationType.includes('Harassment') || violationType.includes('Threats') ? 'CRITICAL' : 'HIGH',
        actionTaken: 'User-Reported Incident Dispatched to Admin Queue',
        reporter: {
          name: currentNickname || currentUser?.displayName || 'Roommate',
          email: currentUser?.email || '',
          id: currentUser?.id || currentUser?.uid
        },
        extraDetails: {
          itemId: targetItem?.id,
          itemType: targetItem?.type
        }
      });

      setSubmittedIncidentId(result.incidentId);
      if (triggerToast) triggerToast(`🛡️ Incident report ${result.incidentId} sent to System Administration.`);
    } catch (err) {
      console.error("Report dispatch error:", err);
      if (triggerToast) triggerToast('Failed to submit incident report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setSubmittedIncidentId(null);
    setReportDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-600/10 via-rose-500/5 to-transparent border-b border-[#E3E8E3] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A3827] dark:text-white flex items-center gap-2">
                Report Terms of Use Violation
              </h3>
              <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                Dispatches an urgent incident notification with user details directly to administration.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {submittedIncidentId ? (
          <div className="p-6 sm:p-8 space-y-5 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-lg text-[#1A3827] dark:text-white">Incident Dispatched to Admin</h4>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                The incident and offending user details have been recorded and sent to <span className="font-bold text-[#1A3827] dark:text-white">tallyin.alerts@gmail.com</span> for immediate administrative action.
              </p>
            </div>
            <div className="p-3 bg-[#F6F8F6] dark:bg-slate-950 rounded-2xl border border-[#E3E8E3] dark:border-slate-800 inline-block font-mono text-xs font-black text-emerald-800 dark:text-[#A3E635]">
              Reference: {submittedIncidentId}
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDone}
                className="w-full py-3 bg-[#1A3827] hover:bg-[#255038] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Close &amp; Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Target Item Preview Card */}
            {targetItem && (
              <div className="p-3.5 rounded-2xl bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 space-y-2 text-left">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-[#5C6E5C] dark:text-slate-400 flex items-center gap-1.5">
                    {targetItem.type === 'expense' && <FileText className="w-3.5 h-3.5" />}
                    {targetItem.type === 'comment' && <MessageSquare className="w-3.5 h-3.5" />}
                    {targetItem.type === 'member' && <User className="w-3.5 h-3.5" />}
                    Reported Item
                  </span>
                  <span className="font-mono text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#A3E635] px-2 py-0.5 rounded-md">
                    {targetUserCode}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-[#1A3827] dark:text-slate-100 truncate">
                    {targetItem.title || targetItem.text || targetName}
                  </p>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400">
                    Created by: <span className="font-semibold text-slate-700 dark:text-slate-300">{targetName}</span>
                    {targetEmail ? ` (${targetEmail})` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Violation Category Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">
                Violation Classification
              </label>
              <select
                value={violationType}
                onChange={e => setViolationType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Abusive / Inappropriate Content">Abusive, Vulgar or Inappropriate Content</option>
                <option value="Fraudulent / Fake Expense Claim">Fraudulent / Manipulated Fake Expense</option>
                <option value="Harassment or Intimidation">Harassment, Threats or Intimidation</option>
                <option value="Suspicious Media / Receipt Attachment">Suspicious / Malicious File Attachment</option>
                <option value="Room Governance Misuse">Unauthorized Room Host Governance Misuse</option>
                <option value="Other Terms of Use Violation">Other Terms of Service Non-Compliance</option>
              </select>
            </div>

            {/* Evidence & Explanation Textarea */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">
                Describe the Incident <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Explain what happened and why this entry or behavior violates Tallyin terms of use..."
                className="w-full p-3 bg-white dark:bg-slate-950 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Warning Callout */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-snug">
                Submitting this report sends an immediate email alert containing the accused user's identity details, room records, and evidence to Tallyin administration (<span className="font-mono font-bold">tallyin.alerts@gmail.com</span>).
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-xs font-bold text-[#5C6E5C] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Incident to Admin</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
