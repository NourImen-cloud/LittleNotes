import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Unlink,
  Camera,
  ArrowRight,
  Download,
  Upload,
  Globe,
} from 'lucide-react';
import {
  generateSyncCode,
} from '../utils/syncService';
import type { SyncStatus } from '../utils/syncService';
import type { Note, Notebook } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  currentRoomCode: string | null;
  notes: Note[];
  notebooks: Notebook[];
  onSetRoomCode: (code: string | null) => void;
  onTriggerSync: () => void;
  onExportNotes: () => void;
  onImportNotes: () => void;
  onOpenScanner: () => void;
}

export const SyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  syncStatus,
  currentRoomCode,
  notes: _notes,
  notebooks: _notebooks,
  onSetRoomCode,
  onTriggerSync,
  onExportNotes,
  onImportNotes,
  onOpenScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'join'>('live');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Custom public URL (e.g. if deployed on Vercel, Netlify, or custom domain)
  const [customDomain, setCustomDomain] = useState<string>(() => {
    return localStorage.getItem('littlenotes_custom_domain') || '';
  });
  const [isEditingDomain, setIsEditingDomain] = useState(false);

  if (!isOpen) return null;

  const ensureRoomCode = () => {
    if (!currentRoomCode) {
      const newCode = generateSyncCode();
      onSetRoomCode(newCode);
      return newCode;
    }
    return currentRoomCode;
  };

  const activeCode = currentRoomCode || ensureRoomCode();

  const isLocalHostOrPrivateIP =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.startsWith('172.'));

  const PUBLIC_TUNNEL_URL = 'https://architecture-nec-facilities-adaptor.trycloudflare.com';

  // Generate pairing URL: use public HTTPS tunnel when on local PC so phones can actually reach it
  const baseDomain =
    customDomain.trim() ||
    (isLocalHostOrPrivateIP ? PUBLIC_TUNNEL_URL : window.location.origin);
  const pairingUrl = `${baseDomain}${window.location.pathname}?sync=${encodeURIComponent(activeCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGenerateNewCode = () => {
    const newCode = generateSyncCode();
    onSetRoomCode(newCode);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      setJoinError('Please enter a sync code');
      return;
    }
    onSetRoomCode(clean);
    setInputCode('');
    setJoinError('');
    setActiveTab('live');
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from this sync room? Your local notes remain safely on this device.')) {
      onSetRoomCode(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6EF] border border-[#DFCDB3] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-xl shadow-xs">
              📲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-800 text-base leading-tight">
                  Pair Phone & PC
                </h3>
                {syncStatus === 'connected' && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Synced</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Keep the same notes on your phone and PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200/70 bg-stone-100/60 px-6 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'border-purple-600 text-purple-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <QrCode size={13} />
            <span>Scan QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('join')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'join'
                ? 'border-purple-600 text-purple-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone size={13} />
            <span>Enter Code</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: LIVE SYNC (Any network, worldwide via relay) */}
          {activeTab === 'live' && (
            <div className="space-y-4">
              {/* QR Container */}
              <div className="bg-white border border-[#DFCDB3] rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xs">
                <div className="p-3 bg-white border border-stone-200/80 rounded-2xl shadow-xs mb-3">
                  <QRCodeSVG
                    value={pairingUrl}
                    size={175}
                    level="M"
                    fgColor="#2F2936"
                    bgColor="#FFFFFF"
                  />
                </div>

                <div className="space-y-1">
                  <p className="font-serif font-bold text-stone-800 text-sm">
                    Scan with your phone's camera
                  </p>
                  <p className="text-xs text-stone-500 max-w-xs">
                    Works over any network (cellular data, 5G, 4G, or Wi-Fi).
                  </p>
                </div>
              </div>

              {/* Room Code Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/80 border border-stone-200 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Sync Code
                    </span>
                    <span className="font-mono text-base font-bold text-stone-800 tracking-wider">
                      {activeCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleGenerateNewCode}
                      title="Generate new room code"
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 bg-[#37343C] hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
                  </button>

                  <button
                    onClick={onTriggerSync}
                    className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Send latest notes now"
                  >
                    <RefreshCw size={13} />
                    <span>Sync</span>
                  </button>

                  {currentRoomCode && (
                    <button
                      onClick={handleDisconnect}
                      className="p-2 border border-stone-200 bg-white hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                      title="Unlink sync room"
                    >
                      <Unlink size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Public URL helper if user has deployed */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1 text-[11px] text-stone-700">
                    <Globe size={12} className="text-stone-500" />
                    <span>Live Web Address</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingDomain(!isEditingDomain)}
                    className="text-[10px] text-purple-700 underline font-medium cursor-pointer"
                  >
                    {isEditingDomain ? 'Done' : 'Set Custom URL'}
                  </button>
                </div>

                {isEditingDomain ? (
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value);
                      localStorage.setItem('littlenotes_custom_domain', e.target.value.trim());
                    }}
                    placeholder="e.g. https://littlenotes.vercel.app"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono text-stone-800 focus:outline-hidden"
                  />
                ) : (
                  <p className="text-[10px] text-stone-500 truncate font-mono">
                    {pairingUrl}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ENTER CODE */}
          {activeTab === 'join' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-stone-800 text-sm">
                  Join with Code
                </h4>
                <p className="text-xs text-stone-500">
                  Enter the 6-character code shown on your other screen to link them together worldwide over the internet.
                </p>
              </div>

              <form onSubmit={handleJoinWithCode} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LN-7931"
                    className="w-full text-center font-mono text-lg font-bold tracking-widest bg-white border border-[#E3D8C6] rounded-xl px-4 py-3 text-stone-800 placeholder:text-stone-300 focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    maxLength={10}
                    autoFocus
                  />
                  {joinError && <p className="text-xs text-rose-600 mt-1">{joinError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="w-full py-2.5 bg-[#37343C] hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Link This Device</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer: Scan Camera Button & Offline File Backup */}
        <div className="px-6 py-3 border-t border-stone-200/80 bg-white/60 flex items-center justify-between text-xs text-stone-500">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Camera size={13} />
            <span>Scan with Camera</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportNotes}
              className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              title="Download backup file"
            >
              <Download size={12} />
              <span>Export</span>
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              onClick={onImportNotes}
              className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              title="Import backup file"
            >
              <Upload size={12} />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
