import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ShieldCheck, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  UserX, 
  Wallet, 
  Settings, 
  RefreshCw, 
  ExternalLink,
  Eye,
  Sliders,
  Check,
  Building2,
  Sparkles
} from 'lucide-react';
import { 
  BlueTixaVideo, 
  BlueTixaReport, 
  BlueTixaWithdrawal, 
  BlueTixaAdminConfig 
} from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { blueTixaRewardEngine } from '../../core/blueTixaRewardEngine';
import { HashBadge } from '../common/HashBadge';
import confetti from 'canvas-confetti';

export const BlueTixaAdminSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'moderation' | 'withdrawals' | 'config' | 'reports'>('moderation');

  const [videos, setVideos] = useState<BlueTixaVideo[]>([]);
  const [reports, setReports] = useState<BlueTixaReport[]>([]);
  const [withdrawals, setWithdrawals] = useState<BlueTixaWithdrawal[]>([]);
  const [config, setConfig] = useState<BlueTixaAdminConfig>(blueTixaRewardEngine.getAdminConfig());

  // Edit config inputs
  const [editPointsPerUsd, setEditPointsPerUsd] = useState(config.pointsPerUsd);
  const [editMinWithdrawal, setEditMinWithdrawal] = useState(config.minWithdrawalPoints);
  const [editCreatorReward, setEditCreatorReward] = useState(config.creatorRewardPointsPer1kEligibleViews);
  const [editViewerDailyCap, setEditViewerDailyCap] = useState(config.viewerDailyMaxPoints);
  const [configSuccess, setConfigSuccess] = useState(false);

  const refresh = () => {
    setVideos(blueTixaVideoEngine.getFeed({}));
    setReports(blueTixaVideoEngine.getReports());
    setWithdrawals(blueTixaRewardEngine.getAllWithdrawals());
    setConfig(blueTixaRewardEngine.getAdminConfig());
  };

  useEffect(() => {
    refresh();
    const unsubV = blueTixaVideoEngine.subscribe(refresh);
    const unsubR = blueTixaRewardEngine.subscribe(refresh);
    return () => {
      unsubV();
      unsubR();
    };
  }, []);

  const handleUpdateStatus = (videoId: string, status: BlueTixaVideo['status']) => {
    blueTixaVideoEngine.updateVideoStatus(videoId, status);
    refresh();
  };

  const handleResolveReport = (reportId: string, actionTaken: string) => {
    blueTixaVideoEngine.resolveReport(reportId, actionTaken);
    refresh();
  };

  const handleUpdateWithdrawalStatus = (id: string, status: BlueTixaWithdrawal['status']) => {
    blueTixaRewardEngine.adminUpdateWithdrawalStatus(id, status, 'SUPER_ADMIN_COUNCIL', 'Admin decision');
    refresh();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    blueTixaRewardEngine.adminUpdateConfig({
      pointsPerUsd: Number(editPointsPerUsd) || 100,
      minWithdrawalPoints: Number(editMinWithdrawal) || 500,
      creatorRewardPointsPer1kEligibleViews: Number(editCreatorReward) || 200,
      viewerDailyMaxPoints: Number(editViewerDailyCap) || 200
    }, 'SUPER_ADMIN_COUNCIL');
    setConfigSuccess(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#060c1c] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black">
              <Play className="w-4 h-4 fill-black" />
            </div>
            <h2 className="text-xl font-bold text-white font-mono">BLUE TIXA Platform Moderation & Reward Hub</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Manage short-form video safety, review reported content, audit withdrawals, and tune reward distribution parameters.
          </p>
        </div>

        {/* Quick Nav Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('moderation')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeSubTab === 'moderation'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Videos ({videos.length})
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeSubTab === 'reports'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reports ({reports.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveSubTab('withdrawals')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeSubTab === 'withdrawals'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Payouts ({withdrawals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeSubTab === 'config'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reward Config
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Videos Moderation */}
      {activeSubTab === 'moderation' && (
        <div className="rounded-3xl bg-[#060c1c] border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono">Live Video Feed Moderation Table</h3>
            <span className="text-xs font-mono text-cyan-400">{videos.length} Total Shorts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Video & Caption</th>
                  <th className="px-5 py-3">Creator</th>
                  <th className="px-5 py-3">Views / Eligible</th>
                  <th className="px-5 py-3">Points Minted</th>
                  <th className="px-5 py-3">Current Status</th>
                  <th className="px-5 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {videos.map(v => (
                  <tr key={v.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={v.thumbnailUrl} alt="" className="w-10 h-14 rounded-lg object-cover border border-cyan-500/20" />
                        <div className="max-w-xs">
                          <div className="font-bold text-white truncate">{v.caption}</div>
                          <div className="text-[10px] text-slate-500">{v.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{v.creatorName}</div>
                      <div className="text-[10px] text-cyan-400">{v.creatorHandle}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white font-bold">{v.viewsCount.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-400">{v.eligibleViewsCount.toLocaleString()} eligible</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-amber-400 font-bold">+{v.pointsEarned.toLocaleString()} Pts</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : v.status === 'UNDER_REVIEW'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'PUBLISHED')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {v.status !== 'UNDER_REVIEW' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'UNDER_REVIEW')}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold"
                          >
                            Review
                          </button>
                        )}
                        {v.status !== 'REMOVED' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'REMOVED')}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                          >
                            Takedown
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Reports Queue */}
      {activeSubTab === 'reports' && (
        <div className="rounded-3xl bg-[#060c1c] border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono">User Community Reports</h3>
            <span className="text-xs font-mono text-rose-400">{reports.length} Total Reports</span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
              <p className="text-xs font-mono">No reported videos in queue. All clean!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Report ID / Time</th>
                    <th className="px-5 py-3">Video ID</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Details</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Council Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reports.map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{r.id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(r.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-cyan-300">{r.videoId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/40 font-bold">
                          {r.reason}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-slate-400">
                        {r.details}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleResolveReport(r.id, 'Dismissed as false positive')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateStatus(r.videoId, 'REMOVED');
                                handleResolveReport(r.id, 'Video takedown executed');
                              }}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                            >
                              Takedown Video
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">{r.actionTaken}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: Withdrawals Queue */}
      {activeSubTab === 'withdrawals' && (
        <div className="rounded-3xl bg-[#060c1c] border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono">BLUE TIXA Reward Withdrawals & Payouts</h3>
            <span className="text-xs font-mono text-emerald-400">{withdrawals.length} Dispatches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Withdrawal ID</th>
                  <th className="px-5 py-3">User & Wallet</th>
                  <th className="px-5 py-3">Points / USD</th>
                  <th className="px-5 py-3">Network</th>
                  <th className="px-5 py-3">Tx Hash</th>
                  <th className="px-5 py-3 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{w.id}</div>
                      <div className="text-[10px] text-slate-500">{new Date(w.requestedAt).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white font-bold">{w.userName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{w.walletAddress}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-cyan-300 font-bold">{w.requestedPoints.toLocaleString()} Pts</div>
                      <div className="text-emerald-400 text-[10px]">${w.usdAmount.toFixed(2)} USD</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white">{w.network}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-slate-400 text-[10px] truncate max-w-[120px] block">{w.txHash || 'Mempool'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {w.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateWithdrawalStatus(w.id, 'COMPLETED')}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]"
                          >
                            Mark Completed
                          </button>
                        )}
                        {w.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateWithdrawalStatus(w.id, 'REJECTED')}
                            className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Reward Parameters Config */}
      {activeSubTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-[#060c1c] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Reward Tokenomics & Anti-Fraud Thresholds</span>
            </h3>
            {configSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Parameters updated!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Points per 1.00 USD Conversion</label>
              <input
                type="number"
                value={editPointsPerUsd}
                onChange={(e) => setEditPointsPerUsd(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Default: 100 Points = $1.00 USD</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Minimum Withdrawal Threshold (Points)</label>
              <input
                type="number"
                value={editMinWithdrawal}
                onChange={(e) => setEditMinWithdrawal(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Default: 500 Points ($5.00 USD)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Creator Reward (Points per 1k Eligible Views)</label>
              <input
                type="number"
                value={editCreatorReward}
                onChange={(e) => setEditCreatorReward(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Default: 200 Points ($2.00 USD)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Viewer Daily Max Earn Cap (Points)</label>
              <input
                type="number"
                value={editViewerDailyCap}
                onChange={(e) => setEditViewerDailyCap(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500">Default: 200 Points ($2.00 USD per 24h)</span>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
          >
            Save Parameters
          </button>
        </form>
      )}
    </div>
  );
};
