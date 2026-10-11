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
  ArrowRight,
} from 'lucide-react';
import {
  generateSyncCode,
} from '../utils/syncService';
import type { SyncStatus } from '../utils/syncService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  currentRoomCode: string | null;
  onSetRoomCode: (code: string | null) => void;
  onTriggerSync: () => void;
}

export const SyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  syncStatus,
  currentRoomCode,
  onSetRoomCode,
  onTriggerSync,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'join'>('qr');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [joinError, setJoinError] = useState('');

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

  // Generate pairing URL
  const baseUrl = window.location.origin + window.location.pathname;
  const pairingUrl = `${baseUrl}?sync=${encodeURIComponent(activeCode)}`;

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
    setActiveTab('qr');
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from this sync room? Your local notes will remain on this device.')) {
      onSetRoomCode(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6EF] border border-[#DFCDB3] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-white/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-800 text-base leading-none">
                Device Sync & Pair
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Keep your phone and laptop in sync with zero login
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

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200/70 bg-stone-100/60 px-6 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
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
            <span>Enter Sync Code</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              {/* QR Container */}
              <div className="bg-white border border-[#DFCDB3] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
                <div className="p-3 bg-white border border-stone-200/80 rounded-2xl shadow-xs mb-3">
                  <QRCodeSVG
                    value={pairingUrl}
                    size={180}
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
                    Point your camera at this QR code to instantly pair your phone to this notebook.
                  </p>
                </div>
              </div>

              {/* Room Code & Copy Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/70 border border-stone-200 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Your Sync Code
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
                    <span>{copiedLink ? 'Pairing Link Copied!' : 'Copy Direct Pairing Link'}</span>
                  </button>

                  {currentRoomCode && (
                    <button
                      onClick={handleDisconnect}
                      className="p-2 border border-stone-200 bg-white hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                      title="Unlink / Leave Sync Room"
                    >
                      <Unlink size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENTER CODE */}
          {activeTab === 'join' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-stone-800 text-sm">
                  Join a notebook from another device
                </h4>
                <p className="text-xs text-stone-500">
                  Enter the 6-character Sync Code displayed on your other device to link them.
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
                  <span>Link Device & Sync Notes</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100/70 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'syncing'
                  ? 'bg-amber-500 animate-pulse'
                  : syncStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : syncStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-stone-300'
              }`}
            />
            <span className="font-medium text-stone-700">
              {currentRoomCode
                ? `Room: ${activeCode}`
                : 'Not paired to any sync room'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentRoomCode && (
              <button
                type="button"
                onClick={onTriggerSync}
                className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-medium transition cursor-pointer flex items-center gap-1"
                title="Force push latest notes now"
              >
                <RefreshCw size={12} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-medium transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
