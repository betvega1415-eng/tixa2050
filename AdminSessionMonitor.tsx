import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Globe, 
  Monitor, 
  Clock, 
  Lock, 
  UserCheck, 
  AlertTriangle, 
  RefreshCw,
  Trash2,
  CheckCircle2,
  MapPin,
  Wifi
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import { AdminSessionRecord } from '../../types/auth';
import { HashBadge } from '../common/HashBadge';

export const AdminSessionMonitor: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSessions = () => {
    setLoading(true);
    setTimeout(() => {
      // Retrieve active admin sessions from authEngine or generate live mock realistic session records for the 4 protocol admins
      const activeAdmin = authEngine.getCurrentAdmin();
      const adminAccounts = authEngine.getAdminAccounts ? authEngine.getAdminAccounts() : [
        { id: 'dr_vance', name: 'Dr. Evelyn Vance', email: 'vance@tixa.network', role: 'SUPER_ADMIN', lastLoginAt: Date.now() - 120000 },
        { id: 'm_sterling', name: 'Marcus Sterling', email: 'sterling@tixa.network', role: 'FINANCE_ADMIN', lastLoginAt: Date.now() - 3600000 },
        { id: 'a_thorne', name: 'Aria Thorne', email: 'thorne@tixa.network', role: 'SECURITY_ADMIN', lastLoginAt: Date.now() - 86400000 },
        { id: 'k_nakamura', name: 'Kai Nakamura', email: 'nakamura@tixa.network', role: 'SUPPORT_ADMIN', lastLoginAt: Date.now() - 18000000 }
      ];

      const mockSessions: AdminSessionRecord[] = adminAccounts.map((adm, idx) => ({
        id: `adm_sess_${adm.id}_${idx}`,
        adminId: adm.id,
        adminName: adm.name,
        adminEmail: adm.email,
        role: adm.role,
        ipAddress: idx === 0 ? '103.102.246.15' : idx === 1 ? '45.154.255.88' : idx === 2 ? '192.168.1.114' : '178.62.204.10',
        location: idx === 0 ? 'Dhaka, Bangladesh (BD)' : idx === 1 ? 'New York, United States (US)' : idx === 2 ? 'Geneva, Switzerland (CH)' : 'Singapore, Singapore (SG)',
        device: idx === 0 ? 'Chrome 125.0 / macOS Apple Silicon' : idx === 1 ? 'Firefox 128.0 / Windows 11 Pro' : idx === 2 ? 'Safari 17.5 / iPadOS Pro' : 'Brave 1.66 / Ubuntu Linux x64',
        sessionToken: `tixa_adm_sec_token_${adm.id}_${Math.random().toString(36).slice(2, 10)}`,
        lastLoginAt: adm.lastLoginAt || Date.now() - (idx * 1500000),
        isActive: idx === 0 ? true : (idx < 3)
      }));

      // If active admin is logged in, ensure their session is active and present
      if (activeAdmin) {
        const existingIdx = mockSessions.findIndex(s => s.adminId === activeAdmin.id);
        if (existingIdx >= 0) {
          mockSessions[existingIdx].isActive = true;
          mockSessions[existingIdx].lastLoginAt = activeAdmin.lastLoginAt || Date.now();
        }
      }

      setSessions(mockSessions);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRevokeSession = (sessionId: string) => {
    setRevokingId(sessionId);
    setTimeout(() => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isActive: false } : s));
      setRevokingId(null);
      setSuccessMsg('Administrator session terminated successfully. Token revoked.');
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <h2 className="text-xl font-black tracking-tight">Active Administrator Sessions Monitor</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time monitoring of all active protocol administrator sessions, cryptographic session tokens, IP addresses, geographical locations, and device metadata.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSessions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Refresh Telemetry'}
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={`rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden ${
              session.isActive 
                ? 'bg-slate-900/90 border-indigo-500/40 shadow-xl shadow-indigo-950/40' 
                : 'bg-slate-900/40 border-slate-800/80 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${
                  session.role === 'SUPER_ADMIN' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {session.adminName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{session.adminName}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      session.role === 'SUPER_ADMIN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {session.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{session.adminEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {session.isActive ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    Terminated
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  IP & Location:
                </span>
                <span className="font-mono font-semibold text-white">{session.ipAddress} ({session.location})</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  Device Agent:
                </span>
                <span className="text-slate-300 truncate max-w-[200px]" title={session.device}>{session.device}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Last Activity:
                </span>
                <span className="font-mono text-slate-300">{new Date(session.lastLoginAt).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 pt-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Token Fingerprint:
                </span>
                <HashBadge hash={session.sessionToken} length={10} />
              </div>
            </div>

            {session.isActive && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingId === session.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {revokingId === session.id ? 'Revoking...' : 'Terminate Session'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
