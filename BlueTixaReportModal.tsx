import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  UserX,
  Flag
} from 'lucide-react';
import { BlueTixaReport } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { authEngine } from '../../core/authEngine';

interface BlueTixaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  creatorId: string;
  creatorHandle: string;
}

export const BlueTixaReportModal: React.FC<BlueTixaReportModalProps> = ({
  isOpen,
  onClose,
  videoId,
  creatorId,
  creatorHandle
}) => {
  const [reason, setReason] = useState<BlueTixaReport['reason']>('SPAM');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const session = authEngine.getSession();

  if (!isOpen) return null;

  const reasonsList: { id: BlueTixaReport['reason']; label: string; desc: string }[] = [
    { id: 'SPAM', label: 'Spam or Bot Engagement', desc: 'Repetitive spam, artificial views, or scam promotional loops' },
    { id: 'COPYRIGHT', label: 'Copyright / IP Infringement', desc: 'Unauthorized re-upload of intellectual property or music' },
    { id: 'FRAUD_VIEWS', label: 'Reward Fraud / View Farming', desc: 'Attempting to exploit viewer or creator reward pools' },
    { id: 'MISINFORMATION', label: 'Financial Misinformation', desc: 'Misleading trading signals or fraudulent financial schemes' },
    { id: 'INAPPROPRIATE', label: 'Inappropriate Content', desc: 'Violates community guidelines or safety standards' },
    { id: 'OTHER', label: 'Other Violation', desc: 'Other concerns requiring administrative moderation review' }
  ];

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    blueTixaVideoEngine.reportVideo({
      videoId,
      reportedBy: session?.walletAddress || 'GUEST_USER',
      reason,
      details: details.trim() || `User reported for ${reason}`
    });
    setIsSubmitted(true);
  };

  const handleBlockUser = () => {
    blueTixaVideoEngine.blockUser(creatorId);
    setIsBlocked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#070d1e] border border-red-500/30 rounded-t-3xl sm:rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.2)] p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white font-mono tracking-wide">Report & Safety Shield</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Report Submitted to Moderation</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Our automated decentralized safety nodes and admin moderation council will audit this video. Thank you for protecting the TIXA ecosystem.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4 py-3">
            <div className="text-xs text-slate-300">
              Select reason for reporting video by <span className="text-cyan-400 font-bold">{creatorHandle}</span>:
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {reasonsList.map(item => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                    reason === item.id 
                      ? 'bg-rose-950/40 border-rose-500/50 text-white' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={item.id}
                    checked={reason === item.id}
                    onChange={() => setReason(item.id)}
                    className="mt-1 accent-rose-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Optional details or timestamps..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBlockUser}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition ${
                  isBlocked 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                    : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>{isBlocked ? 'Creator Blocked' : `Block ${creatorHandle}`}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs font-mono shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
