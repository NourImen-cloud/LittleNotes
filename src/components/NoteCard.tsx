import React, { useState } from 'react';
import type { Note, Notebook } from '../types';

import { NOTE_COLORS, STAGE_META } from '../utils/theme';
import { StickerBadge } from './Stickers';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import {
  Pin,
  CheckSquare,
  Edit3,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  ZoomIn,
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
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const colorScheme = NOTE_COLORS[note.color] || NOTE_COLORS.paper;
  const notebook = notebooks.find((nb) => nb.id === note.notebookId);
  const stageMeta = STAGE_META[note.stage];

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

  return (
    <div
      onClick={() => onEditNote(note)}
      style={{
        backgroundColor: colorScheme.bg,
        borderColor: colorScheme.border,
      }}
      className={`group relative min-h-[220px] h-full rounded-2xl p-4 sm:p-5 border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 select-none ${
        note.isPinned ? 'ring-2 ring-amber-400/60' : ''
      }`}
    >
      {/* Top Bar with Notebook Badge, Pin, Sticker */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {notebook && (
            <span
              style={{ backgroundColor: colorScheme.badge }}
              className="text-xs px-2.5 py-0.5 rounded-full font-medium text-stone-700 flex items-center gap-1 truncate max-w-[150px]"
            >
              <span>{notebook.icon}</span>
              <span className="truncate">{notebook.name}</span>
            </span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${stageMeta.badgeClass}`}
            title={stageMeta.desc}
          >
            {stageMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {note.kawaiiSticker && note.kawaiiSticker !== 'none' && (
            <StickerBadge sticker={note.kawaiiSticker} className="w-7 h-7" />
          )}

          <button
            onClick={handleTogglePin}
            className={`p-1.5 rounded-lg transition ${
              note.isPinned
                ? 'text-amber-600 bg-amber-100/90'
                : 'text-stone-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-stone-700 hover:bg-stone-200/60'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={15} className={note.isPinned ? 'fill-amber-500' : ''} />
          </button>
        </div>
      </div>

      {/* Middle Content Section */}
      <div className="flex-1 min-h-0 my-2 flex flex-col justify-start overflow-hidden">
        {/* Title */}
        {note.title && (
          <h3 className="font-serif text-lg font-semibold text-[#37343C] mb-1 leading-snug line-clamp-1 shrink-0">
            {note.title}
          </h3>
        )}

        {/* Photos Preview */}
        {note.photos && note.photos.length > 0 ? (
          <div className="flex-1 min-h-0 flex flex-col justify-start overflow-hidden">
            {note.content && (
              <p className="text-stone-700 text-xs leading-relaxed line-clamp-1 mb-1.5 font-normal">
                {note.content}
              </p>
            )}
            <div className="group/photo flex-1 min-h-[70px] max-h-[115px] rounded-xl overflow-hidden border border-stone-200/80 bg-stone-100/80 relative">
              {note.photos.length === 1 ? (
                <div
                  className="w-full h-full relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxPhoto(note.photos![0]);
                  }}
                >
                  <img
                    src={note.photos[0]}
                    alt="Note photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn size={16} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 w-full h-full p-1 bg-stone-100">
                  <div
                    className="relative w-full h-full rounded-lg overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhoto(note.photos![0]);
                    }}
                  >
                    <img
                      src={note.photos[0]}
                      alt="Note photo 1"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn size={14} />
                    </div>
                  </div>
                  <div
                    className="relative w-full h-full rounded-lg overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhoto(note.photos![1]);
                    }}
                  >
                    <img
                      src={note.photos[1]}
                      alt="Note photo 2"
                      className="w-full h-full object-cover"
                    />
                    {note.photos.length > 2 ? (
                      <div className="absolute inset-0 bg-black/50 hover:bg-black/40 flex items-center justify-center text-white font-semibold text-xs transition">
                        +{note.photos.length - 2}
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn size={14} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : note.content ? (
          <p
            className={`text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-normal ${
              note.title ? 'line-clamp-4' : 'line-clamp-5'
            }`}
          >
            {note.content}
          </p>
        ) : note.checklist && note.checklist.length > 0 ? (
          <div className="space-y-1 p-2 rounded-xl bg-white/70 border border-stone-200/60 text-xs">
            <div className="font-medium text-stone-600 flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare size={12} /> Checklist
              </span>
              <span className="font-mono text-[10px]">
                {note.checklist.filter((i) => i.done).length}/{note.checklist.length}
              </span>
            </div>
            {note.checklist.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 text-stone-600 truncate text-[11px]">
                <span className="text-[10px]">{item.done ? '✓' : '○'}</span>
                <span className={`truncate ${item.done ? 'line-through text-stone-400' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        ) : note.codeBlock ? (
          <div className="rounded-xl overflow-hidden border border-stone-700/20 bg-[#26242B] p-2 text-stone-200 font-mono text-[11px]">
            <span className="text-emerald-400 block text-[10px] mb-0.5">{note.codeBlock.language}</span>
            <pre className="truncate leading-tight text-amber-100/90"><code>{note.codeBlock.code}</code></pre>
          </div>
        ) : note.drawingDataUrl ? (
          <div className="h-20 rounded-xl overflow-hidden border border-stone-300/80 bg-white p-1">
            <img src={note.drawingDataUrl} alt="Sketch" className="w-full h-full object-contain" />
          </div>
        ) : null}
      </div>

      {/* Footer Info & Actions */}
      <div className="shrink-0 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <span>
            {new Date(note.updatedAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {note.photos && note.photos.length > 0 && (
            <span
              className="flex items-center gap-0.5 text-stone-500 font-medium text-[10px] bg-stone-200/60 px-1.5 py-0.5 rounded-md"
              title={`${note.photos.length} photo(s) attached`}
            >
              <ImageIcon size={10} />
              <span>{note.photos.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          {note.revisionQuestion && onStartRevision && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartRevision(note);
              }}
              className="p-1.5 rounded-lg text-purple-700 bg-purple-100/80 sm:bg-transparent hover:bg-purple-100 transition"
              title="Test yourself on this note"
              aria-label="Test yourself"
            >
              <BookOpen size={14} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditNote(note);
            }}
            className="p-1.5 rounded-lg text-stone-600 bg-stone-100/90 sm:bg-transparent hover:text-stone-900 hover:bg-stone-200/70 transition"
            title="Edit / Shape note"
            aria-label="Edit note"
          >
            <Edit3 size={14} />
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 p-1.5 px-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 sm:bg-transparent sm:hover:bg-rose-50 border border-rose-200/80 sm:border-transparent transition font-medium cursor-pointer"
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={14} className="text-rose-600 shrink-0" />
            <span className="sm:hidden text-[11px] font-semibold text-rose-600">Delete</span>
          </button>
        </div>
      </div>

      {/* Lightbox for instant full-size photo preview from board */}
      <PhotoLightboxModal
        isOpen={Boolean(lightboxPhoto)}
        photoUrl={lightboxPhoto}
        title={note.title || 'Note Photo'}
        onClose={() => setLightboxPhoto(null)}
      />
    </div>
  );
};
