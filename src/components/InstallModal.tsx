import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Apple,
  Check,
  Share,
  PlusSquare,
  AlertTriangle,
  Compass,
  QrCode,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPromptInstall?: () => void;
  canPromptDirectly: boolean;
  isInstalled?: boolean;
}

export const InstallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onPromptInstall,
  canPromptDirectly,
  isInstalled = false,
}) => {
  // Device detection
  const { isIOS, isAndroid, isInAppBrowser } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { isIOS: false, isAndroid: false, isInAppBrowser: false };
    }
    const ua = navigator.userAgent || '';
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /Android/i.test(ua);
    const isInApp = /FBAN|FBAV|Instagram|TikTok|Line|Twitter|MicroMessenger/i.test(ua);

    return {
      isIOS: isIOSDevice,
      isAndroid: isAndroidDevice,
      isInAppBrowser: isInApp,
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6EF] border border-[#DFCDB3] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center text-xl shadow-xs">
              📲
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-800 text-base leading-tight">
                Install LittleNotes
              </h3>
              <p className="text-xs text-stone-500">
                Use as a fullscreen standalone app on your iPhone, Android, or PC
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

        {/* Already Installed on current device banner */}
        {isInstalled && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>Already installed on this device! Check other tabs to install on your phone.</span>
            </div>
          </div>
        )}

        {/* In-App Browser Warning (Critical for iPhone QR scanners & social apps) */}
        {isInAppBrowser && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">In-App Browser Detected</span>
              <span>
                You are viewing this inside an in-app viewer (like a QR scanner or social app). Apple only allows home screen installation in <strong>Safari</strong>. Please tap the <Compass size={12} className="inline mx-0.5" /> Compass or <strong>⋯</strong> menu and select <strong>"Open in Safari"</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Platform Tabs */}
        <div className="flex border-b border-stone-200/70 bg-stone-100/60 px-6 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-stone-800 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Apple size={14} />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-emerald-600 text-emerald-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone size={14} />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'desktop'
                ? 'border-purple-600 text-purple-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Laptop size={14} />
            <span>PC & Mac</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: iPHONE & iPAD */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              {!isIOS && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-purple-100 shrink-0">
                    <QRCodeSVG
                      value="https://titanium-trust-worldcat-exams.trycloudflare.com"
                      size={100}
                      level="M"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-purple-950">
                    <div className="font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode size={14} className="text-purple-600" />
                      <span>Scan to Open on iPhone</span>
                    </div>
                    <p className="text-purple-800 leading-relaxed">
                      Point your iPhone's camera at this QR code to open the app directly in Safari, then follow the 3 steps below to add it to your home screen!
                    </p>
                    <a
                      href="https://titanium-trust-worldcat-exams.trycloudflare.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[11px] text-purple-700 underline font-mono break-all"
                    >
                      https://titanium-trust-worldcat-exams.trycloudflare.com
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-white border border-[#E4D9C7] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700">
                  <Apple size={15} />
                  <span>How to install on iOS Safari (3 Simple Steps)</span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5 text-stone-900">
                        <span>Tap the Share Button</span>
                        <Share size={13} className="text-blue-600" />
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        At the bottom of your screen in Safari, tap the <strong>Share</strong> icon (the square with an arrow pointing upward).
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5 text-stone-900">
                        <span>Tap "Add to Home Screen"</span>
                        <PlusSquare size={13} className="text-purple-600" />
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Scroll down the menu list and tap <strong>"Add to Home Screen"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="text-xs text-stone-700 space-y-1">
                      <div className="font-semibold text-stone-900">
                        Tap "Add" in Top-Right
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        Confirm the name and tap <strong>Add</strong>. LittleNotes will now launch in its own full-screen window with zero browser bars!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>No App Store account needed. Launches instantly and works 100% offline.</span>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {!isAndroid && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-emerald-100 shrink-0">
                    <QRCodeSVG
                      value="https://titanium-trust-worldcat-exams.trycloudflare.com"
                      size={100}
                      level="M"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-emerald-950">
                    <div className="font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode size={14} className="text-emerald-600" />
                      <span>Scan to Open on Android</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      Scan with your phone's camera to open the app on Android and install it in one tap!
                    </p>
                    <a
                      href="https://titanium-trust-worldcat-exams.trycloudflare.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[11px] text-emerald-700 underline font-mono break-all"
                    >
                      https://titanium-trust-worldcat-exams.trycloudflare.com
                    </a>
                  </div>
                </div>
              )}

              {canPromptDirectly && onPromptInstall && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-center">
                  <p className="text-xs font-semibold text-emerald-900">
                    One-click installation ready!
                  </p>
                  <button
                    onClick={() => {
                      onPromptInstall();
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Install LittleNotes to Android Now</span>
                  </button>
                </div>
              )}

              <div className="bg-white border border-[#E4D9C7] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700">
                  <Smartphone size={15} className="text-emerald-600" />
                  <span>Manual Install on Chrome for Android</span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700">1.</span>
                    <span>Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700">2.</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700">3.</span>
                    <span>Confirm by tapping <strong>Install</strong>. LittleNotes will appear in your app drawer.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PC & MAC */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              {canPromptDirectly && onPromptInstall && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-center">
                  <p className="text-xs font-semibold text-purple-900">
                    Fast desktop installation ready
                  </p>
                  <button
                    onClick={() => {
                      onPromptInstall();
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-[#37343C] hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Install to Desktop Now</span>
                  </button>
                </div>
              )}

              <div className="bg-white border border-[#E4D9C7] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700">
                  <Laptop size={15} className="text-purple-600" />
                  <span>Desktop App (Chrome, Edge, Brave)</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  In Chrome or Edge, click the <strong>Install</strong> icon on the right side of the URL address bar. LittleNotes opens in its own lightweight window that you can place in the corner of your screen while studying or watching lectures!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200/80 bg-white/60 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700">
              <Check size={12} />
              <span>Offline Ready</span>
            </span>
            <span className="flex items-center gap-1 text-purple-700">
              <Check size={12} />
              <span>Zero Account Needed</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-medium transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
