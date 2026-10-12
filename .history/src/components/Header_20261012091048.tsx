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
  isPaired: boolean;
  isWidgetMode: boolean;
  onToggleWidgetMode: () => void;
  onOpenInstall: () => void;
  onPrintGuide: () => void;
  onExportNotes: () => void;
  onImportNotes: () => void;
}

export const Header: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  isNightMode,
  onOpenTemplates,
  onOpenRevision,
  onOpenTimer,
  onOpenSync,
  isPaired,
  isWidgetMode,
  onToggleWidgetMode,
  onOpenInstall,
  onPrintGuide: _onPrintGuide,
  onExportNotes: _onExportNotes,
  onImportNotes: _onImportNotes,
}) => {
  return (
    <header className={`sticky top-0 z-30 ${isNightMode ? 'bg-[#211E26]/90 border-stone-800' : 'bg-[#FAF6EF]/90 border-[#E8DFC9]'} backdrop-blur-md border-b px-4 sm:px-8 py-3 transition-colors print:hidden`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${isNightMode ? 'bg-[#3A3347] border-[#4E4461]' : 'bg-[#E7DDF8] border-[#D8C6F2]'} border flex items-center justify-center text-xl shadow-xs`}>
              📝
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-serif font-bold ${isNightMode ? 'text-amber-100' : 'text-[#37343C]'} tracking-tight m-0`}>
                little notes
              </h1>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onToggleWidgetMode}
              className={`p-2 rounded-xl border transition ${
                isWidgetMode
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-white/90 border-stone-200 text-stone-600'
              }`}
              title={isWidgetMode ? 'Full View' : 'Corner Widget Mode'}
            >
              {isWidgetMode ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onOpenInstall}
              className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200"
              title="Install App"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onOpenSync}
              className={`p-2 rounded-xl border transition ${
                isPaired
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-purple-100 text-purple-900 border-purple-200'
              }`}
              title="Device Sync / QR Code"
            >
              <QrCode size={16} />
            </button>
            <button
              onClick={onOpenTimer}
              className="p-2 rounded-xl bg-amber-100 text-amber-900"
              title="Study Timer"
            >
              <Coffee size={16} />
            </button>
            <button
              onClick={onOpenTemplates}
              className="p-2 rounded-xl bg-[#37343C] text-white shadow-xs"
              title="Add Sticky Note"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, formulas, code, or tags..."
            className={`w-full ${isNightMode ? 'bg-[#2B2733] border-stone-700 text-amber-100 placeholder:text-stone-500' : 'bg-white/90 border-[#E3D8C6] text-stone-800 placeholder:text-stone-400'} border rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-hidden focus:border-stone-500 focus:ring-1 focus:ring-stone-500 shadow-xs`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>



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

          {/* Install App Button */}
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E4D9C7] bg-white/90 hover:bg-white text-stone-700 transition shadow-2xs cursor-pointer"
            title="Install LittleNotes App (Desktop / Phone)"
          >
            <Download size={13} className="text-amber-700" />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Corner Sticky Widget Mode Toggle */}
          <button
            onClick={onToggleWidgetMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition shadow-2xs cursor-pointer ${
              isWidgetMode
                ? 'bg-purple-100 text-purple-900 border-purple-300 font-semibold'
                : 'bg-white/90 text-stone-700 border-[#E4D9C7] hover:bg-white'
            }`}
            title={isWidgetMode ? 'Expand to Full View' : 'Corner Sticky Widget Mode (small floating window)'}
          >
            {isWidgetMode ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            <span className="hidden lg:inline">{isWidgetMode ? 'Full View' : 'Corner Mode'}</span>
          </button>
          {/* Add Sticky Note button */}
          <button
            onClick={onOpenTemplates}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#37343C] hover:bg-stone-800 text-white text-xs font-medium transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Sticky Note</span>
          </button>

          
        </div>
    
  
  </header>
