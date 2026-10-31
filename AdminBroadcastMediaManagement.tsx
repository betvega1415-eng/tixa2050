import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Video, 
  MessageSquare, 
  Bell, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  MousePointerClick, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  RotateCcw, 
  Search, 
  ExternalLink,
  Zap,
  Sliders,
  Check,
  X,
  Play
} from 'lucide-react';
import { broadcastMediaEngine, MEDIA_PRESETS } from '../../core/broadcastMediaEngine';
import { 
  BroadcastMediaItem, 
  BroadcastMediaType, 
  BroadcastPlacement, 
  AudienceTargetType 
} from '../../types/broadcast';
import { AdminUser } from '../../types/auth';
import confetti from 'canvas-confetti';

interface AdminBroadcastMediaManagementProps {
  adminUser: AdminUser | null;
}

export const AdminBroadcastMediaManagement: React.FC<AdminBroadcastMediaManagementProps> = ({ adminUser }) => {
  const [items, setItems] = useState<BroadcastMediaItem[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<BroadcastPlacement | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<BroadcastMediaType>('image');
  const [placement, setPlacement] = useState<BroadcastPlacement>('HERO_SWIPER');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [badgeText, setBadgeText] = useState('');
  
  // Scheduling & Timing (তারিখ, সময়, মিনিট)
  const [alwaysActive, setAlwaysActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  
  // Targeting (ইউজার জিমেইল বা নম্বর টার্গেট)
  const [targetType, setTargetType] = useState<AudienceTargetType>('ALL');
  const [targetEmailsInput, setTargetEmailsInput] = useState('');
  const [targetPhonesInput, setTargetPhonesInput] = useState('');
  
  const [priorityOrder, setPriorityOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Audience Simulator state
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [simulatedMatches, setSimulatedMatches] = useState<BroadcastMediaItem[] | null>(null);

  const refresh = () => {
    setItems(broadcastMediaEngine.getAllBroadcasts());
  };

  useEffect(() => {
    refresh();
    const unsub = broadcastMediaEngine.subscribe(refresh);
    return unsub;
  }, []);

  const resetForm = () => {
    setEditingItemId(null);
    setTitle('');
    setSubtitle('');
    setType('image');
    setPlacement('HERO_SWIPER');
    setImageUrl(MEDIA_PRESETS[0].imageUrl);
    setThumbnailUrl(MEDIA_PRESETS[0].thumbnailUrl);
    setVideoUrl('');
    setMessage('');
    setActionLabel('Learn More');
    setActionUrl('#markets');
    setBadgeText('FEATURED');
    setAlwaysActive(true);
    setStartDate('');
    setStartTime('00:00');
    setEndDate('');
    setEndTime('23:59');
    setTargetType('ALL');
    setTargetEmailsInput('');
    setTargetPhonesInput('');
    setPriorityOrder(items.length + 1);
    setIsActive(true);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BroadcastMediaItem) => {
    setEditingItemId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setType(item.type);
    setPlacement(item.placement);
    setImageUrl(item.imageUrl || '');
    setThumbnailUrl(item.thumbnailUrl || '');
    setVideoUrl(item.videoUrl || '');
    setMessage(item.message);
    setActionLabel(item.actionLabel || '');
    setActionUrl(item.actionUrl || '');
    setBadgeText(item.badgeText || '');
    setAlwaysActive(item.alwaysActive);
    setStartDate(item.startDate || '');
    setStartTime(item.startTime || '00:00');
    setEndDate(item.endDate || '');
    setEndTime(item.endTime || '23:59');
    setTargetType(item.targetType);
    setTargetEmailsInput((item.targetEmails || []).join(', '));
    setTargetPhonesInput((item.targetPhones || []).join(', '));
    setPriorityOrder(item.priorityOrder || 1);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof MEDIA_PRESETS[0]) => {
    setImageUrl(preset.imageUrl);
    setThumbnailUrl(preset.thumbnailUrl);
    setBadgeText(preset.tag);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedbackMsg({ text: 'Title and Message text are mandatory.', type: 'error' });
      return;
    }

    const parsedEmails = targetEmailsInput
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    const parsedPhones = targetPhonesInput
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    if (editingItemId) {
      broadcastMediaEngine.updateBroadcast(editingItemId, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        type,
        placement,
        imageUrl: imageUrl.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        message: message.trim(),
        actionLabel: actionLabel.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        alwaysActive,
        startDate: startDate || undefined,
        startTime: startTime || undefined,
        endDate: endDate || undefined,
        endTime: endTime || undefined,
        targetType,
        targetEmails: parsedEmails,
        targetPhones: parsedPhones,
        priorityOrder: Number(priorityOrder),
        isActive
      });
      setFeedbackMsg({ text: 'Broadcast media item updated successfully!', type: 'success' });
    } else {
      broadcastMediaEngine.createBroadcast({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        type,
        placement,
        imageUrl: imageUrl.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        message: message.trim(),
        actionLabel: actionLabel.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        alwaysActive,
        startDate: startDate || undefined,
        startTime: startTime || undefined,
        endDate: endDate || undefined,
        endTime: endTime || undefined,
        targetType,
        targetEmails: parsedEmails,
        targetPhones: parsedPhones,
        priorityOrder: Number(priorityOrder),
        isActive,
        createdByAdminName: adminUser?.name || 'Administrator'
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setFeedbackMsg({ text: 'New broadcast banner created and deployed to UI!', type: 'success' });
    }

    setIsModalOpen(false);
    refresh();
  };

  const handleDelete = (id: string, itemTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
      broadcastMediaEngine.deleteBroadcast(id);
      setFeedbackMsg({ text: `Deleted "${itemTitle}"`, type: 'success' });
      refresh();
    }
  };

  const handleToggleStatus = (id: string) => {
    const newState = broadcastMediaEngine.toggleStatus(id);
    setFeedbackMsg({ 
      text: `Status changed to ${newState ? 'ACTIVE' : 'INACTIVE'}`, 
      type: 'success' 
    });
    refresh();
  };

  const handleMovePriority = (index: number, direction: 'UP' | 'DOWN') => {
    const currentList = [...items];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const temp = currentList[index].priorityOrder;
    currentList[index].priorityOrder = currentList[targetIndex].priorityOrder;
    currentList[targetIndex].priorityOrder = temp;

    broadcastMediaEngine.updateBroadcast(currentList[index].id, { priorityOrder: currentList[index].priorityOrder });
    broadcastMediaEngine.updateBroadcast(currentList[targetIndex].id, { priorityOrder: currentList[targetIndex].priorityOrder });
    refresh();
  };

  const handleRunSimulator = () => {
    const matched = broadcastMediaEngine.getActiveBroadcasts(
      'HERO_SWIPER',
      testEmail.trim() || undefined,
      testPhone.trim() || undefined
    );
    setSimulatedMatches(matched);
  };

  // Filtered items
  const filteredItems = items
    .filter(i => selectedPlacement === 'ALL' || i.placement === selectedPlacement)
    .filter(i => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        (i.subtitle && i.subtitle.toLowerCase().includes(q)) ||
        i.message.toLowerCase().includes(q) ||
        (i.targetEmails && i.targetEmails.some(e => e.includes(q))) ||
        (i.targetPhones && i.targetPhones.some(p => p.includes(q)))
      );
    });

  return (
    <div id="admin-broadcast-media-management" className="space-y-6 font-sans">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0b1026] border border-cyan-500/40 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
              ADMIN CONTROL HUB
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Media, Banners & Targeted Broadcasts
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            পিকচার, থাম্বেল, ভিডিও, এসএমএস ও এনাউন্সমেন্ট বক্স ম্যানেজ করুন। তারিখ, সময় ও মিনিট সেট করে নির্দিষ্ট জিমেইল/ফোন নম্বর অথবা সকল ইউজারের জন্য ৩-৫টি পিকচার Front UI-তে অটোমেটিক সোয়াপিং প্রদর্শন করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all broadcasts to default 4-5 high-tech crypto banners?')) {
                broadcastMediaEngine.resetToDefaults();
                refresh();
                setFeedbackMsg({ text: 'Reset to default preset banners.', type: 'success' });
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 text-black font-extrabold text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Banner / Box</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 shadow-lg ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px] font-mono flex items-center justify-between">
            <span>Total Items</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{items.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px] font-mono flex items-center justify-between">
            <span>Hero Swiper (Front UI)</span>
            <Image className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">
            {items.filter(i => i.placement === 'HERO_SWIPER' && i.isActive).length} Active
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px] font-mono flex items-center justify-between">
            <span>Targeted Items</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 font-mono">
            {items.filter(i => i.targetType !== 'ALL').length} Target
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px] font-mono flex items-center justify-between">
            <span>Total Impressions</span>
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 font-mono">
            {items.reduce((acc, curr) => acc + (curr.viewCount || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono overflow-x-auto">
          {(['ALL', 'HERO_SWIPER', 'POPUP_MODAL', 'MARQUEE_TICKER', 'USER_INBOX_SMS'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlacement(p)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedPlacement === p
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'ALL' ? 'All Placements' : p.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, email, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Grid of Broadcast Media Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item, idx) => {
          const isCurrentlyActive = broadcastMediaEngine.isScheduleActive(item);
          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 ${
                item.isActive 
                  ? 'bg-[#090e23] border-cyan-500/30 hover:border-cyan-400 shadow-lg' 
                  : 'bg-slate-950/80 border-slate-800 opacity-60'
              }`}
            >
              {/* Card Header: Type, Placement & Status Badges */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[10px] font-bold">
                    #{item.priorityOrder} {item.placement}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono text-[10px]">
                    {item.type.toUpperCase()}
                  </span>
                  {item.badgeText && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-950 border border-amber-600 text-amber-300 font-mono text-[10px] font-bold">
                      {item.badgeText}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                      item.isActive
                        ? isCurrentlyActive 
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' 
                          : 'bg-yellow-950 border border-yellow-500 text-yellow-300'
                        : 'bg-rose-950 border border-rose-500 text-rose-300'
                    }`}
                  >
                    {item.isActive ? (isCurrentlyActive ? '● ACTIVE LIVE' : '⏳ SCHEDULED') : '○ INACTIVE'}
                  </button>
                </div>
              </div>

              {/* Media Thumbnail / Preview Preview */}
              <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover brightness-[0.6]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-900 to-cyan-950 flex items-center justify-center text-slate-500 font-mono text-xs">
                    No Image Specified
                  </div>
                )}
                <div className="absolute inset-0 p-3 flex flex-col justify-between bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-end">
                    {item.type === 'video' && (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-white" /> VIDEO
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm line-clamp-1">{item.title}</h4>
                    {item.subtitle && <p className="text-cyan-300 text-xs font-mono line-clamp-1">{item.subtitle}</p>}
                  </div>
                </div>
              </div>

              {/* Message snippet & Timing / Target details */}
              <div className="space-y-2 text-xs font-mono">
                <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                  {item.message}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-[10px]">
                  {/* Scheduling (তারিখ, সময়, মিনিট) */}
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      Schedule:
                    </span>
                    <span className="text-slate-200">
                      {item.alwaysActive 
                        ? 'Always Active 24/7' 
                        : `${item.startDate || 'Any'} ${item.startTime || ''} → ${item.endDate || 'Forever'} ${item.endTime || ''}`}
                    </span>
                  </div>

                  {/* Targeting (ইউজার জিমেইল বা নম্বর) */}
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400" />
                      Targeting:
                    </span>
                    <span className="text-slate-200 font-bold">
                      {item.targetType === 'ALL' && 'All Public Users (সবাই)'}
                      {item.targetType === 'TARGETED_EMAIL' && `Emails: ${(item.targetEmails || []).join(', ') || 'None'}`}
                      {item.targetType === 'TARGETED_PHONE' && `Phones: ${(item.targetPhones || []).join(', ') || 'None'}`}
                      {item.targetType === 'TARGETED_ROLE' && `Roles: ${(item.targetRoles || []).join(', ')}`}
                    </span>
                  </div>

                  {/* Impressions & Clicks */}
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
                    <span>Views: <strong className="text-white">{item.viewCount || 0}</strong></span>
                    <span>Clicks: <strong className="text-cyan-400">{item.clickCount || 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions: Priority reorder, Edit, Delete */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMovePriority(idx, 'UP')}
                    disabled={idx === 0}
                    title="Move Up Order"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePriority(idx, 'DOWN')}
                    disabled={idx === filteredItems.length - 1}
                    title="Move Down Order"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-500 text-rose-400 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Targeting Simulator / Test Section */}
      <div className="p-6 rounded-3xl bg-[#090e23] border border-purple-500/40 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white font-heading">
            Target Audience Simulator & Tester
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          কোনো ইউজারের জিমেইল অথবা মোবাইল নম্বর দিয়ে টেস্ট করুন যে সেই নির্দিষ্ট ইউজার কোন কোন ব্যানার ও এনাউন্সমেন্ট ফ্রন্ট UI-তে দেখতে পাবে:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="Enter Test Gmail (e.g. user@gmail.com)"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
          />
          <input
            type="text"
            placeholder="Enter Test Phone (e.g. 017xxxxxxxx)"
            value={testPhone}
            onChange={e => setTestPhone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
          />
          <button
            type="button"
            onClick={handleRunSimulator}
            className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate User View</span>
          </button>
        </div>

        {simulatedMatches && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 font-mono">
              Simulation Result: {simulatedMatches.length} Banners will display for this user
            </h4>
            <div className="space-y-1 text-xs font-mono">
              {simulatedMatches.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-white font-bold">#{i + 1} {m.title}</span>
                  <span className="text-cyan-400 text-[10px]">{m.targetType}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- CREATE / EDIT BROADCAST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#090e23] border-2 border-cyan-500/50 shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {editingItemId ? 'Edit Broadcast Media Item' : 'Create New Broadcast / Banner'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Dynamic Swiper, Targeted Banner & Timed Announcements
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5 text-xs font-mono">
              
              {/* Type & Placement Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Media Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as BroadcastMediaType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="image">Picture / Banner (ছবি)</option>
                    <option value="video">Video + Thumbnail (ভিডিও)</option>
                    <option value="sms">SMS / Direct Message Box (এসএমএস)</option>
                    <option value="announcement">Urgent Announcement (এনাউন্সমেন্ট)</option>
                    <option value="box">Interactive Promo Box (BOX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Placement</label>
                  <select
                    value={placement}
                    onChange={e => setPlacement(e.target.value as BroadcastPlacement)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="HERO_SWIPER">Hero Swiper (Front UI ৩-৫ পিকচার সোয়াপ)</option>
                    <option value="POPUP_MODAL">Popup Modal Box (পপ-আপ)</option>
                    <option value="MARQUEE_TICKER">Marquee Ticker (স্ক্রোলিং টেক্সট বার)</option>
                    <option value="USER_INBOX_SMS">User Inbox / Notification Box</option>
                  </select>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Title (শিরোনাম) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Genesis Mainnet Launch Active"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subtitle (সাব-হেডিং)</label>
                  <input
                    type="text"
                    placeholder="e.g. Zero-Gas Speed & 3.0s Finality"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Quick Image Presets Selection */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-slate-300 font-bold block flex items-center justify-between">
                  <span>Cyber Preset Images (এক ক্লিকে হাই-টেক ছবি বাছাই করুন):</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {MEDIA_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-1.5 rounded-xl border border-slate-800 hover:border-cyan-400 bg-slate-900 text-left space-y-1 transition-all"
                    >
                      <img src={p.thumbnailUrl} alt={p.name} className="w-full h-10 object-cover rounded-lg" />
                      <div className="text-[9px] text-cyan-300 truncate font-bold">{p.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image & Video URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Picture / Banner URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Video URL (If Video Type)</label>
                  <input
                    type="url"
                    placeholder="https://.../video.mp4 or embed"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* Message / Body Text */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Message / SMS / Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Enter detailed broadcast message or promotion text..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              {/* Action Button & Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 TIXA PAY"
                    value={badgeText}
                    onChange={e => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Action Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Deposit Now"
                    value={actionLabel}
                    onChange={e => setActionLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Action Link</label>
                  <input
                    type="text"
                    placeholder="e.g. #deposit or #tokens"
                    value={actionUrl}
                    onChange={e => setActionUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Scheduling & Timers (তারিখ, সময়, মিনিট) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300">
                      তারিখ, সময় ও মিনিট শিডিউলিং (Scheduling & Timers)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alwaysActive}
                      onChange={e => setAlwaysActive(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-400"
                    />
                    <span>Always Active (সব সময় চলবে)</span>
                  </label>
                </div>

                {!alwaysActive && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Start Date (শুরুর তারিখ)</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Start Time (সময়:মিনিট)</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">End Date (শেষ তারিখ)</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">End Time (সময়:মিনিট)</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Targeting (ইউজার জিমেইল বা নম্বর টার্গেট) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-purple-300">
                    ইউজার টার্গেটিং (Audience Targeting)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'All Users (সবাই)' },
                    { id: 'TARGETED_EMAIL', label: 'Target Emails (জিমেইল)' },
                    { id: 'TARGETED_PHONE', label: 'Target Phones (নম্বর)' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetType(t.id as AudienceTargetType)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        targetType === t.id
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {targetType === 'TARGETED_EMAIL' && (
                  <div className="pt-2">
                    <label className="block text-slate-300 text-[11px] mb-1">
                      Target Gmail/Emails (কমা দিয়ে একাধিক ইমেইল লিখুন):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. betvega1415@gmail.com, alex@tixapay.io"
                      value={targetEmailsInput}
                      onChange={e => setTargetEmailsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                )}

                {targetType === 'TARGETED_PHONE' && (
                  <div className="pt-2">
                    <label className="block text-slate-300 text-[11px] mb-1">
                      Target Phone Numbers (কমা দিয়ে একাধিক নম্বর লিখুন):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01712345678, 01887654321"
                      value={targetPhonesInput}
                      onChange={e => setTargetPhonesInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Priority & Active toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-slate-300">Priority Order (১, ২, ৩...):</label>
                  <input
                    type="number"
                    min={1}
                    value={priorityOrder}
                    onChange={e => setPriorityOrder(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-center font-bold"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-400"
                  />
                  <span className="font-bold text-emerald-400">Publish as Active Live</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-extrabold text-xs font-mono shadow-lg shadow-cyan-500/20"
                >
                  {editingItemId ? 'Save Changes' : 'Create & Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
