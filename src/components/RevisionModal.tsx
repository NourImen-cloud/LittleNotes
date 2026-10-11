import React, { useState } from 'react';
import type { Note } from '../types';
import { X, Sparkles, Eye, ArrowRight, ArrowLeft, CheckCircle2, RotateCw } from 'lucide-react';
import { StickerBadge } from './Stickers';

interface Props {
  isOpen: boolean;
  notes: Note[];
  initialNoteId?: string;
  onClose: () => void;
}

export const RevisionModal: React.FC<Props> = ({
  isOpen,
  notes,
  initialNoteId,
  onClose,
}) => {
  if (!isOpen) return null;

  // Filter notes that have revision content or meaningful explanations
  const studyNotes = notes.filter((n) => n.revisionQuestion || n.stage === 'reuse' || n.title);
  const initialIndex = initialNoteId
    ? Math.max(0, studyNotes.findIndex((n) => n.id === initialNoteId))
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isRevealed, setIsRevealed] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());


  const currentNote = studyNotes[currentIndex];

  if (!currentNote) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="bg-[#FAF6EF] rounded-3xl p-8 max-w-md w-full border border-[#E0D5C3] text-center space-y-4">
          <p className="text-3xl">🌱</p>
          <h3 className="font-serif text-lg font-bold text-stone-800">No revision notes yet</h3>
          <p className="text-xs text-stone-600">
            Shape any note and add an exam prompt in Step 3 to test yourself here before exams!
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#37343C] text-white rounded-xl text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev + 1) % studyNotes.length);
  };

  const handlePrev = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev - 1 + studyNotes.length) % studyNotes.length);
  };

  const handleMaster = () => {
    setMasteredIds((prev) => new Set(prev).add(currentNote.id));
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#FAF6EF] rounded-3xl shadow-2xl border border-[#E0D5C3] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600" />
            <h3 className="text-lg font-serif font-semibold text-[#37343C]">
              Step 3: Revision & Active Recall
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {masteredIds.size > 0 && (
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                ✓ Mastered: {masteredIds.size}
              </span>
            )}
            <span className="text-xs font-mono text-stone-500">
              {currentIndex + 1} / {studyNotes.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
            >
              <X size={18} />
            </button>
          </div>

        </div>

        {/* Card Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E0D5C3] shadow-sm relative min-h-[220px] flex flex-col justify-between">
            {/* Cute sticker */}
            {currentNote.kawaiiSticker && (
              <div className="absolute top-4 right-4">
                <StickerBadge sticker={currentNote.kawaiiSticker} className="w-9 h-9" />
              </div>
            )}

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full inline-block mb-3">
                Question to Recall
              </span>

              <h2 className="text-xl font-serif font-medium text-stone-900 leading-snug">
                {currentNote.revisionQuestion || currentNote.title || 'Review this key concept'}
              </h2>
            </div>

            {/* Answer section */}
            <div className="mt-4 pt-4 border-t border-dashed border-stone-200">
              {!isRevealed ? (
                <button
                  onClick={() => setIsRevealed(true)}
                  className="w-full py-3 rounded-xl bg-[#FAF6EF] hover:bg-[#E7DDF8] border border-stone-300 text-stone-700 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Eye size={15} />
                  <span>Reveal Explanation / Answer</span>
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                    Model Explanation
                  </span>
                  <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {currentNote.revisionAnswer || currentNote.content}
                  </p>

                  {currentNote.codeBlock && (
                    <div className="rounded-xl overflow-hidden bg-[#242229] p-3 text-emerald-300 font-mono text-xs max-h-36 overflow-y-auto">
                      <code>{currentNote.codeBlock.code}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition"
          >
            <ArrowLeft size={14} />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRevealed(false)}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition"
              title="Flip back"
            >
              <RotateCw size={15} />
            </button>
            <button
              onClick={handleMaster}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>I Know This!</span>
            </button>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition"
          >
            <span>Next</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
