import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Edit3, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  ExternalLink, 
  Trash2, 
  Power, 
  Key, 
  History, 
  Sparkles, 
  Layers, 
  Globe, 
  Eye, 
  EyeOff,
  Filter,
  ArrowRight,
  Info,
  Sliders,
  DollarSign
} from 'lucide-react';
import { paymentConfigEngine } from '../../core/paymentConfigEngine';
import { authEngine } from '../../core/authEngine';
import { 
  PaymentMethodConfig, 
  PaymentAddressAuditLog, 
  SupportedNetwork, 
  PaymentCategory 
} from '../../types/paymentConfig';
import { AdminUser } from '../../types/auth';
import { PaymentLogoIcon } from '../common/PaymentLogoIcon';
import confetti from 'canvas-confetti';

interface PaymentAddressManagementProps {
  adminUser: AdminUser;
}

export const PaymentAddressManagement: React.FC<PaymentAddressManagementProps> = ({ adminUser }) => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(paymentConfigEngine.getPaymentMethods());
  const [auditLogs, setAuditLogs] = useState<PaymentAddressAuditLog[]>(paymentConfigEngine.getAuditLogs());
  const [activeSubTab, setActiveSubTab] = useState<'methods' | 'history'>('methods');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [editReason, setEditReason] = useState('Standard scheduled security key & treasury vault rotation');
  const [twoFactorPin, setTwoFactorPin] = useState('205099');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  // MFS 3-Mode Sub-Configuration State
  const [mfsPaymentNumber, setMfsPaymentNumber] = useState('');
  const [mfsPaymentCounter, setMfsPaymentCounter] = useState('1');
  const [mfsPaymentInstructions, setMfsPaymentInstructions] = useState('');
  const [mfsSendMoneyNumber, setMfsSendMoneyNumber] = useState('');
  const [mfsSendMoneyInstructions, setMfsSendMoneyInstructions] = useState('');
  const [mfsCashOutNumber, setMfsCashOutNumber] = useState('');
  const [mfsCashOutInstructions, setMfsCashOutInstructions] = useState('');

  // Add New Method Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNetwork, setNewNetwork] = useState<SupportedNetwork>('TRC20');
  const [newNetworkDisplayName, setNewNetworkDisplayName] = useState('Tron (TRC20)');
  const [newCurrency, setNewCurrency] = useState('USDT');
  const [newCategory, setNewCategory] = useState<PaymentCategory>('STABLECOIN');
  const [newReceivingAddress, setNewReceivingAddress] = useState('');
  const [newMinDeposit, setNewMinDeposit] = useState('10');
  const [newWarning, setNewWarning] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newIconType, setNewIconType] = useState('usdt');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Success Notification banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // RBAC Permission Check
  const hasManagePermission = paymentConfigEngine.checkAdminPermission(adminUser, 'payment_address.manage');

  const refreshState = () => {
    setMethods(paymentConfigEngine.getPaymentMethods());
    setAuditLogs(paymentConfigEngine.getAuditLogs());
  };

  useEffect(() => {
    const unsub = paymentConfigEngine.subscribe(refreshState);
    return unsub;
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Edit Modal
  const handleOpenEdit = (method: PaymentMethodConfig) => {
    if (!hasManagePermission) {
      alert(`Permission Denied: Administrator role '${adminUser.role}' is read-only for payment address changes.`);
      return;
    }
    setEditingMethod(method);
    setNewAddressInput(method.receivingAddress);
    setMfsPaymentNumber(method.mfsModes?.paymentNumber || '');
    setMfsPaymentCounter(method.mfsModes?.paymentCounter || '1');
    setMfsPaymentInstructions(method.mfsModes?.paymentInstructions || '');
    setMfsSendMoneyNumber(method.mfsModes?.sendMoneyNumber || '');
    setMfsSendMoneyInstructions(method.mfsModes?.sendMoneyInstructions || '');
    setMfsCashOutNumber(method.mfsModes?.cashOutNumber || '');
    setMfsCashOutInstructions(method.mfsModes?.cashOutInstructions || '');
    setEditReason('Treasury security key rotation & address update');
    setTwoFactorPin('205099');
    setEditError(null);
    setShowEditConfirmation(false);
  };

  // Execute Edit Address Save
  const handleConfirmEditAddress = async () => {
    if (!editingMethod) return;
    setIsSavingEdit(true);
    setEditError(null);

    try {
      if (twoFactorPin.trim() !== '205099' && twoFactorPin.trim().length < 4) {
        throw new Error('Please enter valid 2FA Admin PIN (Default: 205099).');
      }

      // If MFS method, save MFS 3-modes
      const isMfs = editingMethod.category === 'MFS_BANGLADESH' || !!editingMethod.mfsModes;
      if (isMfs) {
        await paymentConfigEngine.updateMfsPaymentModes({
          methodId: editingMethod.id,
          mfsModes: {
            paymentNumber: mfsPaymentNumber.trim(),
            paymentCounter: mfsPaymentCounter.trim() || '1',
            paymentInstructions: mfsPaymentInstructions.trim(),
            sendMoneyNumber: mfsSendMoneyNumber.trim(),
            sendMoneyInstructions: mfsSendMoneyInstructions.trim(),
            cashOutNumber: mfsCashOutNumber.trim(),
            cashOutInstructions: mfsCashOutInstructions.trim()
          },
          admin: adminUser,
          twoFactorPin: twoFactorPin.trim(),
          reason: editReason.trim()
        });
      }

      const res = await paymentConfigEngine.updatePaymentMethodAddress({
        methodId: editingMethod.id,
        newAddress: newAddressInput.trim() || (isMfs ? (mfsPaymentNumber.trim() || mfsSendMoneyNumber.trim() || mfsCashOutNumber.trim()) : ''),
        admin: adminUser,
        twoFactorPin: twoFactorPin.trim(),
        reason: editReason.trim(),
        ipAddress: '192.168.1.100 (TLS 1.3 Quantum-Secured)',
        deviceInfo: 'Admin FIDO2 Workstation'
      });

      setSuccessToast(
        `✅ Successfully updated payment configuration for ${editingMethod.name} (${editingMethod.networkDisplayName})! All user deposit screens now receive funds at the updated addresses.`
      );
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setEditingMethod(null);
      setShowEditConfirmation(false);
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update receiving address.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (method: PaymentMethodConfig) => {
    if (!hasManagePermission) {
      alert(`Permission Denied: Administrator role '${adminUser.role}' cannot toggle payment channel status.`);
      return;
    }

    const nextStatus = !method.isActive;
    const confirmMsg = nextStatus 
      ? `Activate payment channel '${method.name} (${method.network})'? Users will immediately be able to select it for deposits.`
      : `DEACTIVATE payment channel '${method.name} (${method.network})'? It will be hidden from public deposit screens.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await paymentConfigEngine.togglePaymentMethodStatus({
        methodId: method.id,
        isActive: nextStatus,
        admin: adminUser,
        reason: `Admin toggle ${nextStatus ? 'ONLINE' : 'OFFLINE'}`
      });

      setSuccessToast(`Channel ${method.name} (${method.network}) is now ${nextStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Payment Method
  const handleDeleteMethod = async (method: PaymentMethodConfig) => {
    if (!hasManagePermission) {
      alert(`Permission Denied: Administrator role '${adminUser.role}' cannot delete payment methods.`);
      return;
    }

    const confirmMsg = `Are you sure you want to PERMANENTLY REMOVE payment channel '${method.name} (${method.network})'? This will remove it from all database configurations.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await paymentConfigEngine.deletePaymentMethod({
        methodId: method.id,
        admin: adminUser,
        reason: 'Admin deleted payment method'
      });
      setSuccessToast(`Payment method ${method.name} was removed.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add New Payment Method Save
  const handleSaveNewMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setIsSavingNew(true);

    try {
      if (!newName.trim() || !newReceivingAddress.trim()) {
        throw new Error('Please fill in method name and receiving address.');
      }

      await paymentConfigEngine.addPaymentMethod({
        name: newName.trim(),
        network: newNetwork,
        networkDisplayName: newNetworkDisplayName.trim() || newNetwork,
        currency: newCurrency.trim().toUpperCase(),
        category: newCategory,
        receivingAddress: newReceivingAddress.trim(),
        minDepositUsd: parseFloat(newMinDeposit) || 10,
        networkWarning: newWarning.trim(),
        depositInstructions: newInstructions.trim(),
        iconType: newIconType,
        admin: adminUser
      });

      setSuccessToast(`🎉 Successfully added new payment method '${newName}' (${newNetwork})!`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsAddModalOpen(false);
      // Reset form
      setNewName('');
      setNewReceivingAddress('');
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add payment method.');
    } finally {
      setIsSavingNew(false);
    }
  };

  // Filtered Methods
  const filteredMethods = methods.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.networkDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.receivingAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currency.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
    if (statusFilter === 'ACTIVE' && !m.isActive) return false;
    if (statusFilter === 'INACTIVE' && m.isActive) return false;
    return true;
  });

  // Metrics
  const totalCount = methods.length;
  const activeCount = methods.filter(m => m.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const auditCount = auditLogs.length;

  return (
    <div id="admin-payment-management-dashboard" className="space-y-6 font-sans">
      
      {/* Top Banner & RBAC Authorization State */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#060e22] via-[#091533] to-[#040817] border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Admin Payment Address & Gateway Configuration
              </h2>
              <p className="text-slate-400 text-[11px]">
                RBAC Permission: <span className="text-cyan-300 font-bold">payment_address.manage</span> • Dynamic Backend Database State
              </p>
            </div>
          </div>
        </div>

        {/* Admin Clearance & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            hasManagePermission
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span>
              {hasManagePermission ? 'WRITE PERMISSION GRANTED' : 'READ-ONLY ACCESS'} ({adminUser.role})
            </span>
          </div>

          {hasManagePermission && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="wipe-all-payment-addresses-btn"
                onClick={() => {
                  if (window.confirm('⚠️ Are you sure you want to WIPE all deposit receiving addresses and phone numbers? All address fields will become completely empty.')) {
                    paymentConfigEngine.wipeAllPaymentAddresses();
                    setSuccessToast('🧹 Successfully wiped all receiving payment addresses. Fields are now blank.');
                    setTimeout(() => setSuccessToast(null), 5000);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wipe All Addresses</span>
              </button>

              <button
                type="button"
                id="add-new-payment-method-btn"
                onClick={() => {
                  setAddError(null);
                  setIsAddModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Payment Method</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-mono flex items-center gap-2.5 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1">{successToast}</span>
          <button 
            onClick={() => setSuccessToast(null)} 
            className="p-1 text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">TOTAL CHANNELS</span>
            <strong className="text-lg text-white font-bold">{totalCount}</strong>
          </div>
          <Layers className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">ACTIVE RECEIVING</span>
            <strong className="text-lg text-emerald-400 font-bold">{activeCount}</strong>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">INACTIVE / PAUSED</span>
            <strong className="text-lg text-rose-400 font-bold">{inactiveCount}</strong>
          </div>
          <XCircle className="w-5 h-5 text-rose-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">AUDIT LOG TRAIL</span>
            <strong className="text-lg text-amber-300 font-bold">{auditCount}</strong>
          </div>
          <History className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Primary Sub-Tabs: [ Payment Methods ] & [ Cryptographic Audit Trail ] */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('methods')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'methods'
              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configured Payment Methods ({filteredMethods.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Address Change Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Payment Methods List */}
      {activeSubTab === 'methods' && (
        <div className="space-y-4 font-mono text-xs">
          
          {/* Search and Category Filters */}
          <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search payment method, network (e.g. TRC20, ERC20, BEP20, BTC), or receiving address..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'STABLECOIN', label: 'USDT / Stable' },
                { id: 'LAYER1_CRYPTO', label: 'L1 Crypto' },
                { id: 'MFS_BANGLADESH', label: '🇧🇩 MFS' },
                { id: 'EXCHANGE_PAY', label: 'Binance Pay' },
                { id: 'FIAT_BANK', label: 'Bank Wire' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500'
                }`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  statusFilter === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' : 'text-slate-500'
                }`}
              >
                ACTIVE
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('INACTIVE')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  statusFilter === 'INACTIVE' ? 'bg-rose-950 text-rose-300 border border-rose-600/40' : 'text-slate-500'
                }`}
              >
                INACTIVE
              </button>
            </div>
          </div>

          {/* Payment Methods Grid */}
          {filteredMethods.length === 0 ? (
            <div className="p-12 text-center bg-[#050915] rounded-2xl border border-slate-800 text-slate-500 space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500/60" />
              <p className="text-sm font-bold text-slate-300">No payment methods match your query.</p>
              <p className="text-xs">Try clearing filters or add a new payment method.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMethods.map(method => {
                const isCopied = copiedId === method.id;
                const lastUpdatedStr = new Date(method.lastUpdatedAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={method.id}
                    id={`payment-method-card-${method.id}`}
                    className={`rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between space-y-3.5 shadow-xl ${
                      method.isActive
                        ? 'bg-[#050a18] border-cyan-500/30 hover:border-cyan-500/60'
                        : 'bg-[#0a0c14] border-slate-800/80 opacity-75'
                    }`}
                  >
                    {/* Active Accent Top Line */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: method.isActive ? (method.brandColor || '#06B6D4') : '#475569' }}
                    />

                    {/* Method Header: Icon, Name, Network Badge, Active Toggle */}
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shadow-inner">
                          <PaymentLogoIcon type={method.iconType} className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{method.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                              {method.currency}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{method.networkDisplayName}</span>
                        </div>
                      </div>

                      {/* Status Toggle Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(method)}
                        title={method.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                          method.isActive
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{method.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                      </button>
                    </div>

                    {/* Receiving Address Display Box with Copy and Live Target */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        <span>Receiving Address / Account:</span>
                        <span className="text-cyan-400">Validated {method.network}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-slate-200 font-bold text-xs truncate select-all" title={method.receivingAddress}>
                          {method.receivingAddress || (
                            <span className="text-slate-500 font-normal italic font-sans text-[11px]">(Empty / Unassigned)</span>
                          )}
                        </span>

                        {method.receivingAddress && (
                          <button
                            type="button"
                            onClick={() => handleCopy(method.receivingAddress, method.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors shrink-0"
                            title="Copy Receiving Address"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MFS 3-Mode Sub-Numbers Badge Breakdown (if MFS method) */}
                    {method.mfsModes && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
                          <span>MFS 3-Mode Configuration:</span>
                          <span className="text-slate-400">3 Separate Channels</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <span className="text-pink-400 font-bold block">1. PAYMENT</span>
                            <span className="text-slate-300 font-mono truncate block">
                              {method.mfsModes.paymentNumber || '(Empty)'}
                            </span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <span className="text-cyan-400 font-bold block">2. SEND MONEY</span>
                            <span className="text-slate-300 font-mono truncate block">
                              {method.mfsModes.sendMoneyNumber || '(Empty)'}
                            </span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <span className="text-amber-400 font-bold block">3. CASH OUT</span>
                            <span className="text-slate-300 font-mono truncate block">
                              {method.mfsModes.cashOutNumber || '(Empty)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Network Warning & Min Deposit Details */}
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">Min Deposit:</span>
                        <span className="text-white font-bold">${method.minDepositUsd.toFixed(2)} USD</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2" title={method.networkWarning}>
                        {method.networkWarning}
                      </p>
                    </div>

                    {/* Last Updated Timestamp & Admin Stamp */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <div>
                        <span>Updated: </span>
                        <span className="text-slate-300">{lastUpdatedStr}</span>
                      </div>
                      <span className="text-cyan-400 truncate max-w-[140px]" title={method.lastUpdatedByAdmin.adminName}>
                        by {method.lastUpdatedByAdmin.adminName.split(' ')[0]} ({method.lastUpdatedByAdmin.adminRole})
                      </span>
                    </div>

                    {/* Action Buttons: [ Change Address ] and [ Delete ] */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        id={`edit-address-btn-${method.id}`}
                        onClick={() => handleOpenEdit(method)}
                        disabled={!hasManagePermission}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          hasManagePermission
                            ? 'bg-slate-900 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                            : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Change Address</span>
                      </button>

                      {hasManagePermission && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMethod(method)}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700 text-slate-500 hover:text-rose-300 transition-colors"
                          title="Remove Payment Method"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Immutable Cryptographic Audit Log */}
      {activeSubTab === 'history' && (
        <div className="bg-[#050915] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-2xl font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Immutable Payment Address Audit Ledger</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {auditLogs.length} Records
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">SHA-256 Cryptographic Chain</span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-500">
                  <th className="py-2.5 px-3">TIMESTAMP & ID</th>
                  <th className="py-2.5 px-3">ADMIN OFFICER</th>
                  <th className="py-2.5 px-3">METHOD & NETWORK</th>
                  <th className="py-2.5 px-3">ACTION</th>
                  <th className="py-2.5 px-3">OLD ADDRESS → NEW ADDRESS</th>
                  <th className="py-2.5 px-3 text-right">HASH INTEGRITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {auditLogs.map(log => {
                  const dateStr = new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="text-slate-200 font-bold">{dateStr}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.id}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{log.adminName}</div>
                        <div className="text-[10px] text-cyan-400">{log.adminEmail} ({log.adminRole})</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{log.paymentMethodName}</div>
                        <div className="text-[10px] text-slate-400">{log.network}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'UPDATED'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                            : log.action === 'CREATED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : log.action === 'STATUS_TOGGLED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-slate-400 truncate text-[10px] line-through">
                          {log.oldAddress}
                        </div>
                        <div className="text-emerald-400 font-bold truncate text-[11px]">
                          → {log.newAddress}
                        </div>
                        {log.reason && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            Note: {log.reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 select-all">
                          {log.hash.slice(0, 12)}...
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CHANGE RECEIVING ADDRESS (RBAC & NETWORK VALIDATION ENFORCED) */}
      {/* ========================================================================= */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#060c1d] border border-cyan-500/50 shadow-2xl p-5 sm:p-6 text-slate-100 space-y-5 font-mono text-xs my-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Change Receiving Wallet Address
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingMethod.name} • Network: <strong className="text-cyan-300">{editingMethod.networkDisplayName}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingMethod(null);
                  setShowEditConfirmation(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {editError && (
              <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{editError}</span>
              </div>
            )}

            {!showEditConfirmation ? (
              /* STEP 1: Address Input & Network Validation */
              <div className="space-y-4">
                {/* Current Active Address */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Current Active Receiving Address:</span>
                  <span className="text-slate-300 font-bold break-all">
                    {editingMethod.receivingAddress || '(None configured)'}
                  </span>
                </div>

                {/* MFS 3-System Specific Input Panels (PAYMENT, SEND MONEY, CASH OUT) */}
                {(editingMethod.category === 'MFS_BANGLADESH' || editingMethod.mfsModes) ? (
                  <div className="space-y-3.5 p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 font-sans">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        বাংলাদেশ MFS ৩টি আলাদা সিস্টেম কনফিগারেশন:
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Payment / Send Money / Cash Out</span>
                    </div>

                    {/* Mode 1: PAYMENT */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-pink-950/30 to-slate-900/60 border border-pink-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-300 text-xs">1. PAYMENT (মার্চেন্ট পেমেন্ট নম্বর)</span>
                        <span className="text-[10px] text-pink-400/80 font-mono">Make Payment</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">মার্চেন্ট নম্বর (Merchant Number):</label>
                          <input
                            type="text"
                            placeholder="e.g. 018XXXXXXXX or 017XXXXXXXX"
                            value={mfsPaymentNumber}
                            onChange={e => setMfsPaymentNumber(e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-950 border border-pink-500/40 text-white font-mono text-xs focus:outline-none focus:border-pink-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">কাউন্টার নং (Counter):</label>
                          <input
                            type="text"
                            placeholder="1"
                            value={mfsPaymentCounter}
                            onChange={e => setMfsPaymentCounter(e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">পেমেন্ট নির্দেশনা (Payment Instructions):</label>
                        <input
                          type="text"
                          placeholder="e.g. Make Payment করুন এবং রেফারেন্স এ আপনার ইউজারনেম দিন"
                          value={mfsPaymentInstructions}
                          onChange={e => setMfsPaymentInstructions(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Mode 2: SEND MONEY */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/30 to-slate-900/60 border border-cyan-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300 text-xs">2. SEND MONEY (পার্সোনাল সেন্ড মানি নম্বর)</span>
                        <span className="text-[10px] text-cyan-400/80 font-mono">Send Money</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">সেন্ড মানি নম্বর (Personal Number):</label>
                        <input
                          type="text"
                          placeholder="e.g. 019XXXXXXXX or 013XXXXXXXX"
                          value={mfsSendMoneyNumber}
                          onChange={e => setMfsSendMoneyNumber(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-cyan-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">সেন্ড মানি নির্দেশনা (Instructions):</label>
                        <input
                          type="text"
                          placeholder="e.g. পার্সোনাল বিকাশ/নগদ থেকে সেন্ড মানি করুন"
                          value={mfsSendMoneyInstructions}
                          onChange={e => setMfsSendMoneyInstructions(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Mode 3: CASH OUT */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-900/60 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 text-xs">3. CASH OUT (এজেন্ট ক্যাশ আউট নম্বর)</span>
                        <span className="text-[10px] text-amber-400/80 font-mono">Cash Out</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">এজেন্ট নম্বর (Agent Cash Out Number):</label>
                        <input
                          type="text"
                          placeholder="e.g. 017XXXXXXXX or 018XXXXXXXX"
                          value={mfsCashOutNumber}
                          onChange={e => setMfsCashOutNumber(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-amber-500/40 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">ক্যাশ আউট নির্দেশনা (Instructions):</label>
                        <input
                          type="text"
                          placeholder="e.g. এজেন্ট ক্যাশ আউট করার পর TrxID সাবমিট করুন"
                          value={mfsCashOutInstructions}
                          onChange={e => setMfsCashOutInstructions(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Standard Crypto/Bank Address Input */
                  <div className="space-y-1.5">
                    <label className="block text-slate-200 font-bold text-xs flex items-center justify-between">
                      <span>Enter New Receiving Wallet Address:</span>
                      <span className="text-cyan-400 text-[11px]">Enforced: {editingMethod.network}</span>
                    </label>

                    <input
                      type="text"
                      required
                      placeholder={`Paste validated ${editingMethod.network} address here...`}
                      value={newAddressInput}
                      onChange={e => setNewAddressInput(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-white font-bold text-xs focus:border-cyan-400 focus:outline-none"
                    />

                    {/* Real-time Address Validator Indicator */}
                    {(() => {
                      const val = paymentConfigEngine.validateAddress(editingMethod.network, newAddressInput);
                      if (!newAddressInput.trim()) return null;
                      if (val.isValid) {
                        return (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Address syntax is valid for {editingMethod.network}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center gap-1.5 text-rose-400 text-[11px] pt-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{val.errorMessage}</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Change Reason Note */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold text-[11px]">
                    Change Reason / Audit Justification:
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={e => setEditReason(e.target.value)}
                    placeholder="e.g. Treasury rotation / New multi-sig cold storage target"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                {/* Modal Navigation Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingMethod(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const isMfs = editingMethod.category === 'MFS_BANGLADESH' || !!editingMethod.mfsModes;
                      if (!isMfs) {
                        const val = paymentConfigEngine.validateAddress(editingMethod.network, newAddressInput);
                        if (!val.isValid) {
                          setEditError(val.errorMessage || 'Invalid address');
                          return;
                        }
                      }
                      setEditError(null);
                      setShowEditConfirmation(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <span>Next: Security Confirmation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: Security Verification & 2FA Confirmation Modal */
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Confirm Live Receiving Address Change</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Upon confirmation, this address will <strong>immediately</strong> become the active deposit destination across all public TIXA user payment interfaces. Ensure you control this receiving vault.
                  </p>
                </div>

                {/* Old vs New Address Comparison Diff */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">OLD RECEIVING ADDRESS (RETIRED):</span>
                    <span className="text-rose-400 line-through break-all text-xs font-mono">{editingMethod.receivingAddress}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">NEW ACTIVE RECEIVING ADDRESS:</span>
                    <span className="text-emerald-300 font-bold break-all text-xs font-mono">{newAddressInput.trim()}</span>
                  </div>
                </div>

                {/* 2FA Security PIN Input */}
                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-bold text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Admin 2FA Security PIN / FIDO2 Passkey:</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Test Default: 205099</span>
                  </label>

                  <input
                    type="password"
                    maxLength={10}
                    value={twoFactorPin}
                    onChange={e => setTwoFactorPin(e.target.value)}
                    placeholder="Enter 6-digit Admin PIN"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-300 font-bold text-center tracking-widest text-base focus:outline-none"
                  />
                </div>

                {/* Confirm Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditConfirmation(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Back to Edit
                  </button>

                  <button
                    type="button"
                    id="confirm-save-receiving-address-btn"
                    onClick={handleConfirmEditAddress}
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isSavingEdit ? 'Propagating to Database...' : 'Confirm & Propagate Address'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW PAYMENT METHOD (CONFIGURABLE GATEWAY PROVISIONING) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#060c1d] border border-cyan-500/50 shadow-2xl p-5 sm:p-6 text-slate-100 space-y-4 font-mono text-xs my-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Payment Channel</h3>
                  <p className="text-[11px] text-slate-400">Expand supported cryptocurrency & local payment gateways</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewMethod} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Method Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. USDT (Arbitrum), Solana USDC, Upay"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500"
                  />
                </div>

                {/* Network Dropdown */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Blockchain / Network *</label>
                  <select
                    value={newNetwork}
                    onChange={e => {
                      const net = e.target.value as SupportedNetwork;
                      setNewNetwork(net);
                      if (net === 'TRC20') setNewNetworkDisplayName('Tron (TRC20)');
                      else if (net === 'ERC20') setNewNetworkDisplayName('Ethereum (ERC20)');
                      else if (net === 'BEP20') setNewNetworkDisplayName('BNB Smart Chain (BEP20)');
                      else if (net === 'POLYGON') setNewNetworkDisplayName('Polygon PoS (POL)');
                      else if (net === 'ARBITRUM') setNewNetworkDisplayName('Arbitrum One (ARB)');
                      else if (net === 'SOLANA') setNewNetworkDisplayName('Solana Mainnet');
                      else if (net === 'BITCOIN') setNewNetworkDisplayName('Bitcoin Mainnet');
                      else if (net === 'TIXA_2050_NATIVE') setNewNetworkDisplayName('TIXAPAY Quantum Mainnet');
                      else if (net === 'BANGLADESH_MFS') setNewNetworkDisplayName('Bangladesh MFS Gateway');
                      else if (net === 'BINANCE_DIRECT') setNewNetworkDisplayName('Binance Pay Zero-Fee ID');
                      else if (net === 'BANK_WIRE') setNewNetworkDisplayName('Bank Wire Settlement');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500"
                  >
                    <option value="TRC20">Tron (TRC20)</option>
                    <option value="ERC20">Ethereum (ERC20)</option>
                    <option value="BEP20">BNB Smart Chain (BEP20)</option>
                    <option value="TIXA_2050_NATIVE">TIXAPAY Quantum Mainnet</option>
                    <option value="BITCOIN">Bitcoin (BTC Mainnet)</option>
                    <option value="SOLANA">Solana Mainnet</option>
                    <option value="POLYGON">Polygon PoS</option>
                    <option value="ARBITRUM">Arbitrum One</option>
                    <option value="BINANCE_DIRECT">Binance Pay ID</option>
                    <option value="BANGLADESH_MFS">Bangladesh MFS (bKash/Nagad/Rocket)</option>
                    <option value="BANK_WIRE">Bank Corporate Wire</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Asset Symbol (e.g. USDT, BTC, BDT) *</label>
                  <input
                    type="text"
                    required
                    placeholder="USDT"
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 uppercase"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Gateway Category *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500"
                  >
                    <option value="STABLECOIN">Stablecoin (USDT/USDC)</option>
                    <option value="LAYER1_CRYPTO">Layer 1 Native Crypto</option>
                    <option value="MFS_BANGLADESH">Bangladesh MFS Gateway</option>
                    <option value="EXCHANGE_PAY">Exchange Direct Pay</option>
                    <option value="FIAT_BANK">Bank Corporate Escrow</option>
                  </select>
                </div>
              </div>

              {/* Receiving Address */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Receiving Wallet Address / Account Number * ({newNetwork})
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Enter verified receiving address for ${newNetwork}...`}
                  value={newReceivingAddress}
                  onChange={e => setNewReceivingAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-white font-bold text-xs focus:border-cyan-400"
                />
              </div>

              {/* Min Deposit & Network Warning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Deposit (USD Equivalent)</label>
                  <input
                    type="number"
                    step="any"
                    value={newMinDeposit}
                    onChange={e => setNewMinDeposit(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Logo Icon Type</label>
                  <select
                    value={newIconType}
                    onChange={e => setNewIconType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="usdt">USDT Tether</option>
                    <option value="tixa">TIXA Quantum</option>
                    <option value="btc">Bitcoin</option>
                    <option value="eth">Ethereum</option>
                    <option value="sol">Solana</option>
                    <option value="binance">Binance</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="citybank">City Bank</option>
                  </select>
                </div>
              </div>

              {/* Deposit Warning and Instructions */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit Network Warning</label>
                <input
                  type="text"
                  placeholder="e.g. ⚠️ Send ONLY on selected network to avoid permanent loss."
                  value={newWarning}
                  onChange={e => setNewWarning(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for user on deposit screen..."
                  value={newInstructions}
                  onChange={e => setNewInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingNew}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSavingNew ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                  <span>{isSavingNew ? 'Saving Method...' : 'Save & Publish Payment Method'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
