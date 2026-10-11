import React, { useState } from 'react';
import type { NoteStyle, KawaiiSticker, NoteColor } from '../types';

import { StickerBadge } from './Stickers';
import { X, Check, Code, ListTodo, FileText, Sparkles } from 'lucide-react';

interface PresetItem {
  id: string;
  name: string;
  category: 'all' | 'classic' | 'functional' | 'kawaii';
  styleType: NoteStyle;
  sticker: KawaiiSticker;
  color: NoteColor;
  previewTitle: string;
  previewText: string;
  hasChecklist?: boolean;
  hasCode?: boolean;
}

const PRESETS: PresetItem[] = [
  {
    id: 'kawaii-cat',
    name: 'Teacup Kitten',
    category: 'kawaii',
    styleType: 'kawaii',
    sticker: 'cat',
    color: 'sky',
    previewTitle: 'Study break',
    previewText: 'A warm cup of chamomile tea and 10 mins reading.',
  },
  {
    id: 'kawaii-panda',
    name: 'Bamboo Panda',
    category: 'kawaii',
    styleType: 'kawaii',
    sticker: 'panda',
    color: 'sage',
    previewTitle: 'Sentence drill',
    previewText: 'Practice Kanji flashcards before tomorrow’s quiz.',
  },
  {
    id: 'kawaii-duck',
    name: 'Pond Duckling',
    category: 'kawaii',
    styleType: 'kawaii',
    sticker: 'duck',
    color: 'butter',
    previewTitle: 'Floating ideas',
    previewText: 'Keep it gentle and simple. No stress.',
  },
  {
    id: 'kawaii-strawberry',
    name: 'Strawberry Bloom',
    category: 'kawaii',
    styleType: 'kawaii',
    sticker: 'strawberry',
    color: 'blush',
    previewTitle: 'Sweet reminder',
    previewText: 'Remember to stretch every 45 minutes.',
  },
  {
    id: 'kawaii-robot',
    name: 'Study Bot Checklist',
    category: 'functional',
    styleType: 'checklist',
    sticker: 'robot',
    color: 'peach',
    previewTitle: 'Tasks to finish',
    previewText: 'Read passage, Kanji drill, review lab report.',
    hasChecklist: true,
  },
  {
    id: 'kawaii-carrot',
    name: 'Carrot Patch',
    category: 'kawaii',
    styleType: 'kawaii',
    sticker: 'carrot',
    color: 'butter',
    previewTitle: 'Healthy habits',
    previewText: 'Hydrate, take fresh air, write 3 key takeaways.',
  },
  {
    id: 'functional-checklist',
    name: 'Daily Todo Sticky',
    category: 'functional',
    styleType: 'checklist',
    sticker: 'none',
    color: 'paper',
    previewTitle: 'Study Checklist',
    previewText: 'Tick off items as you finish lectures.',
    hasChecklist: true,
  },
  {
    id: 'functional-code',
    name: 'Code Snippet Sticky',
    category: 'functional',
    styleType: 'code',
    sticker: 'none',
    color: 'lilac',
    previewTitle: 'Python Algorithm',
    previewText: 'Preserves indentation and monospaced font.',
    hasCode: true,
  },
  {
    id: 'classic-notebook',
    name: 'Warm Paper Note',
    category: 'classic',
    styleType: 'classic',
    sticker: 'none',
    color: 'paper',
    previewTitle: 'Quick lecture thought',
    previewText: 'Capture the essence of the concept.',
  },
  {
    id: 'classic-lilac',
    name: 'Lilac Reflection',
    category: 'classic',
    styleType: 'classic',
    sticker: 'none',
    color: 'lilac',
    previewTitle: 'Personal journal',
    previewText: 'Calm thoughts after a long study session.',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: {
    styleType: NoteStyle;
    sticker: KawaiiSticker;
    color: NoteColor;
    title: string;
    hasChecklist?: boolean;
    hasCode?: boolean;
  }) => void;
}

export const StickyNotePickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'classic' | 'functional' | 'kawaii'>('kawaii');

  if (!isOpen) return null;

  const filtered = activeTab === 'all'
    ? PRESETS
    : PRESETS.filter((p) => p.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FAF6EF] rounded-3xl shadow-2xl border border-[#E2D7C4] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header directly inspired by user mockup */}
        <div className="px-6 py-4 border-b border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">📑</span>
            <h3 className="text-xl font-serif font-semibold text-[#37343C]">Sticky Note</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E7DDF8] text-[#55387A] font-medium ml-1">
              Cozy Templates
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher: All, Classic, Functional, Kawaii */}
        <div className="px-6 pt-4 pb-2 flex gap-2 border-b border-[#EFE8D6] bg-[#FAF6EF]/60">
          {(
            [
              { id: 'all', label: 'All', icon: Sparkles },
              { id: 'classic', label: 'Classic', icon: FileText },
              { id: 'functional', label: 'Functional', icon: ListTodo },
              { id: 'kawaii', label: 'Kawaii', icon: Sparkles },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  isSelected
                    ? 'bg-[#37343C] text-white shadow-sm'
                    : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/80'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid of Note Cards */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#F5EFE3]/30">
          {filtered.map((preset) => {
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset({
                    styleType: preset.styleType,
                    sticker: preset.sticker,
                    color: preset.color,
                    title: preset.previewTitle,
                    hasChecklist: preset.hasChecklist,
                    hasCode: preset.hasCode,
                  });
                  onClose();
                }}
                className="group relative text-left p-4 rounded-2xl bg-white border border-[#E3D9C7] hover:border-[#37343C] hover:shadow-md transition-all duration-200 flex flex-col justify-between h-44 cursor-pointer overflow-hidden"
              >
                {/* Decorative border / sticker layout like in mockup */}
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    {preset.name}
                  </span>
                  {preset.sticker !== 'none' ? (
                    <StickerBadge sticker={preset.sticker} className="w-8 h-8" />
                  ) : preset.hasChecklist ? (
                    <span className="p-1 rounded-md bg-blue-100 text-blue-700">
                      <ListTodo size={16} />
                    </span>
                  ) : preset.hasCode ? (
                    <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                      <Code size={16} />
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">📄</span>
                  )}
                </div>

                {/* Inner paper preview */}
                <div className="my-2 p-2.5 rounded-xl bg-[#FAF6EF]/90 border border-dashed border-stone-300/80 flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-serif font-bold text-stone-800 line-clamp-1 mb-1">
                    {preset.previewTitle}
                  </h4>
                  {preset.hasChecklist ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-600">
                        <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 flex items-center justify-center text-white text-[8px]">
                          <Check size={8} />
                        </span>
                        <span>Read chapter notes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-600">
                        <span className="w-2.5 h-2.5 rounded-xs border border-stone-400"></span>
                        <span>Practice questions</span>
                      </div>
                    </div>
                  ) : preset.hasCode ? (
                    <div className="bg-[#2D2A32] text-emerald-300 font-mono text-[9px] p-1.5 rounded-md">
                      def solve(x): return x * 2
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-600 leading-tight line-clamp-2">
                      {preset.previewText}
                    </p>
                  )}
                </div>

                {/* Footer label */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span className="capitalize">{preset.category}</span>
                  <span className="text-stone-400 group-hover:text-stone-800 transition">
                    Use Template →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
