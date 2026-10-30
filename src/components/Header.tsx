import React from 'react';
import {
  Search,
  BookOpen,
  Plus,
  Coffee,
  QrCode,
  Minimize2,
  Maximize2,
  Download,
} from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  paperTexture: 'grid' | 'ruled' | 'clean';
  onTextureChange: (t: 'grid' | 'ruled' | 'clean') => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onOpenTemplates: () => void;
  onOpenRevision: () => void;
  onOpenTimer: () => void;
  onOpenSync: () => void;
  onOpenScanner?: () => void;
  isPaired: boolean;
  isWidgetMode: boolean;
  onToggleWidgetMode: () => void;
  onOpenInstall: () => void;
  isInstalled?: boolean;
  onPrintGuide: () => void;
  onExportNotes: () => void;
  onImportNotes: () => void;
}

export const Header: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  isNightMode,
  onToggleNightMode: _onToggleNightMode,
  onOpenTemplates,
  onOpenRevision,
  onOpenTimer,
  onOpenSync,
  onOpenScanner: _onOpenScanner,
  isPaired,
  isWidgetMode,
  onToggleWidgetMode,
  onOpenInstall,
  isInstalled = false,
  onPrintGuide: _onPrintGuide,
  onExportNotes: _onExportNotes,
  onImportNotes: _onImportNotes,
}) => {
  return (
    <header className={`sticky top-0 z-30 ${isNightMode ? 'bg-[#211E26]/90 border-stone-800' : 'bg-[#FAF6EF]/90 border-[#E8DFC9]'} backdrop-blur-md border-b px-4 sm:px-8 py-3 transition-colors print:hidden`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${isNightMode ? 'bg-[#3A3347] border-[#4E4461]' : 'bg-[#E7DDF8] border-[#D8C6F2]'} border flex items-center justify-center text-lg sm:text-xl shadow-xs shrink-0`}>
              📝
            </div>
            <div>
              <h1 className={`text-lg sm:text-2xl font-serif font-bold ${isNightMode ? 'text-amber-100' : 'text-[#37343C]'} tracking-tight m-0 truncate`}>
                little notes
              </h1>
            </div>
          </div>

          {/* Mobile Action Buttons - Horizontally scrollable without squishing */}
          <div className="flex items-center gap-1.5 md:hidden overflow-x-auto py-1 max-w-[65%] sm:max-w-none scrollbar-none">
            {/* Exam Mode / Flashcards */}
            <button
              onClick={onOpenRevision}
              className="w-9 h-9 rounded-xl bg-[#E7DDF8] text-[#3E2B5A] border border-[#D8C6F2] flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Exam Mode / Flashcards"
              aria-label="Exam Mode"
            >
              <BookOpen size={16} />
            </button>

            {/* Café Timer */}
            <button
              onClick={onOpenTimer}
              className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-200/80 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
              title="Study Café Timer"
              aria-label="Study Café Timer"
            >
              <Coffee size={16} />
            </button>

            {/* Device Sync */}
            <button
              onClick={onOpenSync}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition cursor-pointer shadow-2xs ${
                isPaired
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-white/90 border-stone-200 text-purple-900'
              }`}
              title="Device Sync / QR Code"
              aria-label="Device Sync"
            >
              <QrCode size={16} />
            </button>

            {/* Install App */}
            {!isInstalled && (
              <button
                onClick={onOpenInstall}
                className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Install App"
                aria-label="Install App"
              >
                <Download size={16} />
              </button>
            )}

            {/* Widget Mode */}
            <button
              onClick={onToggleWidgetMode}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition cursor-pointer shadow-2xs ${
                isWidgetMode
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-white/90 border-stone-200 text-stone-600'
              }`}
              title={isWidgetMode ? 'Full View' : 'Corner Widget Mode'}
              aria-label="Widget Mode"
            >
              {isWidgetMode ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>

            {/* Quick Add Sticky Note */}
            <button
              onClick={onOpenTemplates}
              className="w-9 h-9 rounded-xl bg-[#37343C] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
              title="Add Sticky Note"
              aria-label="Add Sticky Note"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, formulas, code, or tags..."
            className={`w-full ${isNightMode ? 'bg-[#2B2733] border-stone-700 text-amber-100 placeholder:text-stone-500' : 'bg-white/90 border-[#E3D8C6] text-stone-800 placeholder:text-stone-400'} border rounded-full pl-9 pr-8 py-1.5 text-xs focus:outline-hidden focus:border-stone-500 focus:ring-1 focus:ring-stone-500 shadow-xs`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Café Timer */}
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 text-xs font-medium border border-amber-300/80 transition shadow-2xs cursor-pointer"
            title="Cozy Study Timer & Ambient Lo-Fi Rain"
          >
            <Coffee size={14} />
            <span className="hidden sm:inline">Café Timer</span>
          </button>

          {/* Active Recall / Revision Mode */}
          <button
            onClick={onOpenRevision}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E7DDF8] hover:bg-[#D8C6F2] text-[#3E2B5A] text-xs font-medium border border-[#D8C6F2] transition shadow-2xs cursor-pointer"
            title="Step 3: Revision & Exam Prep"
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Exam Mode</span>
          </button>

          {/* Device Sync & QR Pairing */}
          <button
            onClick={onOpenSync}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition shadow-2xs cursor-pointer ${
              isPaired
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white/90 text-stone-700 border-[#E4D9C7] hover:bg-white'
            }`}
            title="Sync Phone & PC via QR Code"
          >
            <QrCode size={14} className={isPaired ? 'text-emerald-600' : 'text-purple-600'} />
            <span className="hidden sm:inline">{isPaired ? 'Device Synced' : 'Pair Phone'}</span>
          </button>

          {/* Install App Button (hidden once installed) */}
          {!isInstalled && (
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E4D9C7] bg-white/90 hover:bg-white text-stone-700 transition shadow-2xs cursor-pointer"
              title="Install LittleNotes App (iPhone / Android / Desktop)"
            >
              <Download size={13} className="text-amber-700" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Add Sticky Note button */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#37343C] hover:bg-stone-800 text-white text-xs font-medium transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Sticky Note</span>
          </button>
        </div>
      </div>
    </header>
  );
};
