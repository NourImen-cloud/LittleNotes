import React, { useState } from 'react';
import type { Note, Notebook } from '../types';

import { NOTE_COLORS, STAGE_META } from '../utils/theme';
import { StickerBadge } from './Stickers';
import {
  Pin,
  CheckSquare,
  Square,
  Copy,
  Check,
  Edit3,
  Trash2,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface Props {
  note: Note;
  notebooks: Notebook[];
  onUpdateNote: (updated: Note) => void;
  onDeleteNote: (id: string) => void;
  onEditNote: (note: Note) => void;
  onStartRevision?: (note: Note) => void;
}

export const NoteCard: React.FC<Props> = ({
  note,
  notebooks,
  onUpdateNote,
  onDeleteNote,
  onEditNote,
  onStartRevision,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const colorScheme = NOTE_COLORS[note.color] || NOTE_COLORS.paper;
  const notebook = notebooks.find((nb) => nb.id === note.notebookId);
  const stageMeta = STAGE_META[note.stage];

  const handleToggleChecklist = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.checklist) return;
    const updatedChecklist = note.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdateNote({
      ...note,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.codeBlock) return;
    navigator.clipboard.writeText(note.codeBlock.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      onDeleteNote(note.id);
    }
  };

  const isLongContent =
    (note.content?.length || 0) > 200 ||
    (note.content?.split('\n').length || 0) > 5;

  return (
    <div
      onClick={() => onEditNote(note)}
      style={{
        backgroundColor: colorScheme.bg,
        borderColor: colorScheme.border,
      }}
      className={`group relative rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col hover:-translate-y-0.5 ${
        note.isPinned ? 'ring-2 ring-amber-400/60' : ''
      }`}
    >
      {/* Top Bar with Notebook Badge, Pin, Sticker */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {notebook && (
            <span
              style={{ backgroundColor: colorScheme.badge }}
              className="text-xs px-2.5 py-0.5 rounded-full font-medium text-stone-700 flex items-center gap-1"
            >
              <span>{notebook.icon}</span>
              <span>{notebook.name}</span>
            </span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${stageMeta.badgeClass}`}
            title={stageMeta.desc}
          >
            {stageMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {note.kawaiiSticker && note.kawaiiSticker !== 'none' && (
            <StickerBadge sticker={note.kawaiiSticker} className="w-8 h-8 mr-1" />
          )}

          <button
            onClick={handleTogglePin}
            className={`p-1 rounded-md transition ${
              note.isPinned
                ? 'text-amber-600 bg-amber-100/80'
                : 'text-stone-400 opacity-0 group-hover:opacity-100 hover:text-stone-700 hover:bg-stone-200/50'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={15} className={note.isPinned ? 'fill-amber-500' : ''} />
          </button>
        </div>
      </div>

      {/* Title */}
      {note.title && (
        <h3 className="font-serif text-lg font-semibold text-[#37343C] mb-2 leading-snug">
          {note.title}
        </h3>
      )}

      {/* Main Content */}
      {note.content && (
        <div className="relative mb-3">
          <div
            className={`text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-normal ${
              isLongContent ? 'max-h-36 overflow-hidden' : ''
            }`}
          >
            {note.content}
          </div>
          {isLongContent && (
            <div
              style={{
                background: `linear-gradient(to top, ${colorScheme.bg} 80%, transparent)`,
              }}
              className="absolute bottom-0 left-0 right-0 h-14 flex items-end justify-end pointer-events-none pb-0.5"
            >
              <span className="text-[11px] font-medium text-stone-600 bg-white/80 px-2.5 py-0.5 rounded-full shadow-2xs border border-stone-300/60 backdrop-blur-xs">
                Click to open full note ↗
              </span>
            </div>
          )}
        </div>
      )}

      {/* Handwritten Doodle / Diagram if present */}
      {note.drawingDataUrl && (
        <div className="mb-3 rounded-xl overflow-hidden border border-stone-300/80 bg-white shadow-inner p-1">
          <img
            src={note.drawingDataUrl}
            alt="Handwritten sketch"
            className="w-full h-auto max-h-36 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Interactive Checklist if present */}
      {note.checklist && note.checklist.length > 0 && (
        <div className="mb-3 space-y-1.5 p-3 rounded-xl bg-white/70 border border-stone-200/60">
          <div className="text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
            <CheckSquare size={13} />
            <span>Checklist</span>
            <span className="text-[10px] text-stone-600 ml-auto font-mono">
              {note.checklist.filter((i) => i.done).length}/{note.checklist.length}
            </span>
          </div>
          {note.checklist.slice(0, 3).map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleToggleChecklist(item.id, e)}
              className="w-full flex items-start gap-2 text-left py-0.5 text-xs text-stone-700 hover:text-stone-900 group/check"
            >
              <span className="mt-0.5 text-stone-500 group-hover/check:text-stone-800">
                {item.done ? (
                  <CheckSquare size={14} className="text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square size={14} className="text-stone-400" />
                )}
              </span>
              <span
                className={`flex-1 transition-all truncate ${
                  item.done ? 'line-through text-stone-400' : ''
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
          {note.checklist.length > 3 && (
            <div className="text-[11px] text-stone-400 pt-0.5 text-center font-medium italic">
              +{note.checklist.length - 3} more items...
            </div>
          )}
        </div>
      )}

      {/* Code Block if present */}
      {note.codeBlock && (
        <div className="mb-3 rounded-xl overflow-hidden border border-stone-700/20 bg-[#26242B] text-stone-100 shadow-inner">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1F1E24] text-[11px] text-stone-300 font-mono border-b border-stone-700/40">
            <span className="text-emerald-400">{note.codeBlock.language}</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-sm bg-stone-700 hover:bg-stone-600 text-stone-200 transition cursor-pointer"
              title="Copy snippet"
            >
              {copiedCode ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed text-amber-100/90 max-h-32 scrollbar-thin">
            <code>{note.codeBlock.code}</code>
          </pre>
        </div>
      )}

      {/* Revision Prompt Teaser (Step 3: Reuse it) */}
      {note.revisionQuestion && (
        <div className="mb-3 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/80 flex items-start gap-2">
          <Sparkles size={14} className="text-purple-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-purple-900 block">Revision Prompt:</span>
            <span className="text-purple-800 line-clamp-1">{note.revisionQuestion}</span>
          </div>
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200/60 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info & Actions */}
      <div className="mt-auto pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-400">
        <span>
          {new Date(note.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {note.revisionQuestion && onStartRevision && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartRevision(note);
              }}
              className="p-1 rounded-md text-purple-600 hover:bg-purple-100 transition"
              title="Test yourself on this note"
            >
              <BookOpen size={14} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditNote(note);
            }}
            className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition"
            title="Edit / Shape note"
          >
            <Edit3 size={14} />
          </button>

          <button
            onClick={handleDelete}
            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
