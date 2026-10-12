import React from 'react';
import { X, Download, Smartphone, Laptop, Apple, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPromptInstall?: () => void;
  canPromptDirectly: boolean;
}

export const InstallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onPromptInstall,
  canPromptDirectly,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6EF] border border-[#DFCDB3] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
              📲
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-800 text-base">
                Install LittleNotes
              </h3>
              <p className="text-xs text-stone-500">
                Use as a standalone app on your PC or phone
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

        {/* Direct Install Button if supported */}
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
              className="w-full py-2.5 px-4 bg-[#37343C] hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Download size={14} />
              <span>Install to this Device Now</span>
            </button>
          </div>
        )}

        {/* Instructions by Device */}
        <div className="space-y-2.5 text-xs">
          {/* PC / Mac */}
          <div className="p-3 bg-white/80 border border-stone-200 rounded-2xl space-y-1">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Laptop size={14} className="text-purple-600" />
              <span>PC / Mac (Chrome, Edge, Brave)</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Click the <strong>Install</strong> icon in the right side of your browser address bar. It opens in its own window that you can resize into a small corner widget!
            </p>
          </div>

          {/* iPhone / iPad */}
          <div className="p-3 bg-white/80 border border-stone-200 rounded-2xl space-y-1">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Apple size={14} className="text-stone-800" />
              <span>iPhone & iPad (Safari)</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Tap the <strong>Share</strong> button (square with arrow pointing up) at the bottom, then scroll down and tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>

          {/* Android */}
          <div className="p-3 bg-white/80 border border-stone-200 rounded-2xl space-y-1">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Smartphone size={14} className="text-emerald-600" />
              <span>Android (Chrome)</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Tap the <strong>three dots menu (⋮)</strong> at top right and choose <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Check size={12} className="text-emerald-600" />
            <span>Works 100% offline</span>
          </span>
          <span className="flex items-center gap-1">
            <Check size={12} className="text-emerald-600" />
            <span>No App Store needed</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
