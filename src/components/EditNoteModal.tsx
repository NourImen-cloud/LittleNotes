import React, { useState, useRef } from 'react';
import type { Note, Notebook, NoteColor, NoteStyle, KawaiiSticker, ThoughtStage, ChecklistItem } from '../types';
import { STAGE_META } from '../utils/theme';
import { StickerBadge } from './Stickers';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { processImageFiles, getImagesFromClipboard } from '../utils/imageUtils';
import {
  X,
  Plus,
  Trash2,
  Code,
  ListTodo,
  Sparkles,
  CheckCircle,
  Image as ImageIcon,
  ZoomIn,
  UploadCloud,
  Loader2,
} from 'lucide-react';

interface Props {
  note: Note | null;
  notebooks: Notebook[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Note) => void;
}

const LANGUAGES = ['python', 'typescript', 'javascript', 'html', 'css', 'sql', 'bash', 'c++', 'rust'];

interface ContentProps {
  note: Note;
  notebooks: Notebook[];
  onClose: () => void;
  onSave: (updated: Note) => void;
}

const EditNoteModalContent: React.FC<ContentProps> = ({
  note,
  notebooks,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [notebookId, setNotebookId] = useState(note.notebookId);
  const [color, setColor] = useState<NoteColor>(note.color);
  const [styleType] = useState<NoteStyle>(note.styleType);
  const [kawaiiSticker, setKawaiiSticker] = useState<KawaiiSticker>(note.kawaiiSticker || 'none');
  const [stage, setStage] = useState<ThoughtStage>(note.stage);
  const [tagsInput, setTagsInput] = useState(note.tags.join(', '));


  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(note.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Code state
  const [hasCode, setHasCode] = useState(Boolean(note.codeBlock));
  const [codeLang, setCodeLang] = useState(note.codeBlock?.language || 'python');
  const [codeContent, setCodeContent] = useState(note.codeBlock?.code || '');

  // Revision state
  const [hasRevision, setHasRevision] = useState(Boolean(note.revisionQuestion));
  const [revisionQuestion, setRevisionQuestion] = useState(note.revisionQuestion || '');
  const [revisionAnswer, setRevisionAnswer] = useState(note.revisionAnswer || '');

  // Sketch doodle state
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | undefined>(note.drawingDataUrl);

  // Photos state
  const [photos, setPhotos] = useState<string[]>(note.photos || []);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const newPhotos = await processImageFiles(files);
      if (newPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }
    } catch (err) {
      console.error('Failed to attach photos', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePastePhoto = async (e: React.ClipboardEvent) => {
    const pasted = await getImagesFromClipboard(e);
    if (pasted.length > 0) {
      e.preventDefault();
      setPhotos((prev) => [...prev, ...pasted]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoGenerateFlashcard = () => {
    setHasRevision(true);
    let question = '';
    let answer = '';
    if (title && title.includes('?')) {
      question = title;
      answer = content ? content.slice(0, 300) : 'Recall the core reasoning.';
    } else if (title) {
      question = `Explain the core concept and significance of: ${title}`;
      answer = content ? content.slice(0, 300) : 'Recall the core principle.';
    } else {
      question = 'What is the main takeaway and definition of this concept?';
      answer = content ? content.slice(0, 300) : '';
    }
    setRevisionQuestion(question);
    setRevisionAnswer(answer);
  };


  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: 'c-' + Date.now(),
        text: newChecklistText.trim(),
        done: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleToggleChecklistDone = (id: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleSave = () => {
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    // If student enriched the note, automatically advance stage from 'catch' to 'shape' or 'reuse'
    let finalStage = stage;
    if (stage === 'catch' && (notebookId !== 'inbox' || hasCode || checklist.length > 0 || hasRevision || photos.length > 0)) {
      finalStage = 'shape';
    }
    if (hasRevision && revisionQuestion.trim()) {
      finalStage = 'reuse';
    }

    const updated: Note = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      notebookId,
      color,
      styleType,
      kawaiiSticker,
      stage: finalStage,
      tags: parsedTags,
      photos: photos.length > 0 ? photos : undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      codeBlock: hasCode && codeContent.trim() ? { language: codeLang, code: codeContent } : undefined,
      revisionQuestion: hasRevision && revisionQuestion.trim() ? revisionQuestion.trim() : undefined,
      revisionAnswer: hasRevision && revisionAnswer.trim() ? revisionAnswer.trim() : undefined,
      drawingDataUrl: drawingDataUrl,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#FAF6EF] rounded-3xl shadow-2xl border border-[#E0D5C3] overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="text-xl font-serif font-semibold text-[#37343C]">Shape Your Note</h3>
              <p className="text-xs text-stone-500 font-sans">
                Turn quick thoughts into lasting knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Notebook selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Note Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why does PCA maximize variance?"
                className="w-full text-lg font-serif font-medium bg-white border border-[#E3D8C6] rounded-xl px-3.5 py-2 text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-600 focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Notebook
              </label>
              <select
                value={notebookId}
                onChange={(e) => setNotebookId(e.target.value)}
                className="w-full bg-white border border-[#E3D8C6] rounded-xl px-3 py-2.5 text-sm font-medium text-stone-800 focus:outline-hidden focus:border-stone-600"
              >
                {notebooks.map((nb) => (
                  <option key={nb.id} value={nb.id}>
                    {nb.icon} {nb.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Kawaii Sticker selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/60 border border-[#E8DFC9]">
            {/* Color selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
                Paper Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'paper', label: 'Paper', bg: '#FAF6EF', border: '#E8DFC9' },
                    { id: 'lilac', label: 'Lilac', bg: '#E7DDF8', border: '#D8C6F2' },
                    { id: 'sage', label: 'Sage', bg: '#DCE9DD', border: '#BED9C2' },
                    { id: 'blush', label: 'Blush', bg: '#F3DCD6', border: '#ECC9C0' },
                    { id: 'butter', label: 'Butter', bg: '#FEF08A', border: '#FDE047' },
                    { id: 'sky', label: 'Sky', bg: '#E0F2FE', border: '#BAE6FD' },
                    { id: 'peach', label: 'Peach', bg: '#FFEDD5', border: '#FED7AA' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c.id ? 'scale-125 ring-2 ring-stone-700 ring-offset-1' : 'hover:scale-110'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Kawaii Sticker Companion */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
                Corner Sticker
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(['none', 'panda', 'cat', 'duck', 'strawberry', 'robot', 'carrot'] as const).map(
                  (stk) => (
                    <button
                      key={stk}
                      type="button"
                      onClick={() => setKawaiiSticker(stk)}
                      className={`p-1 rounded-xl border transition ${
                        kawaiiSticker === stk
                          ? 'border-stone-800 bg-white ring-2 ring-stone-800/20'
                          : 'border-transparent hover:border-stone-300'
                      }`}
                      title={stk}
                    >
                      {stk === 'none' ? (
                        <span className="w-6 h-6 flex items-center justify-center text-xs text-stone-400">
                          ✕
                        </span>
                      ) : (
                        <StickerBadge sticker={stk} className="w-6 h-6" />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Note Notes & Explanations
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePastePhoto}
              placeholder="Write your explanation, lecture takeaways, or thoughts... (Tip: paste screenshots with Ctrl+V)"
              className="w-full bg-white border border-[#E3D8C6] rounded-xl p-3.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-600 focus:ring-1 focus:ring-stone-600 leading-relaxed font-sans"
            />
          </div>

          {/* Photos & Visual Attachments Section */}
          <div
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('Files')) {
                e.preventDefault();
                setIsDraggingPhoto(true);
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingPhoto(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingPhoto(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handlePhotoFiles(e.dataTransfer.files);
              }
            }}
            className={`p-4 rounded-2xl bg-white border transition-all duration-200 space-y-3 ${
              isDraggingPhoto
                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/40'
                : 'border-[#E8DFC9]'
            }`}
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotoFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-amber-600" />
                  <span>Photos & Images</span>
                </span>
                {photos.length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                    {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium flex items-center gap-1 transition cursor-pointer"
              >
                {isUploadingPhoto ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-stone-600" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    <span>Add Photo</span>
                  </>
                )}
              </button>
            </div>

            {/* Photos Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-4/3 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs transition hover:shadow-md"
                  >
                    <img
                      src={photoUrl}
                      alt={`Note photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveLightboxUrl(photoUrl)}
                        className="p-1.5 rounded-lg bg-white/90 text-stone-800 hover:bg-white hover:scale-110 transition shadow-xs cursor-pointer"
                        title="Enlarge photo"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 hover:scale-110 transition shadow-xs cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <span className="absolute bottom-1 left-1.5 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-md font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                {/* Add more button tile */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="aspect-4/3 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-500 bg-stone-50/50 hover:bg-amber-50/30 flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 transition cursor-pointer"
                >
                  <Plus size={18} />
                  <span className="text-[11px] font-medium mt-1">Add more</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-5 text-center cursor-pointer transition hover:bg-amber-50/30 flex flex-col items-center justify-center gap-1.5"
              >
                <div className="p-2.5 rounded-full bg-amber-50 text-amber-700">
                  <UploadCloud size={20} />
                </div>
                <div className="text-xs font-medium text-stone-700">
                  Click to upload photos or drag & drop images here
                </div>
                <div className="text-[11px] text-stone-400">
                  Paste screenshots with <kbd className="px-1 py-0.5 rounded-sm bg-stone-100 font-mono text-[10px]">Ctrl+V</kbd> • Diagrams, whiteboard photos, slides
                </div>
              </div>
            )}

            {/* Handwritten sketch if attached */}
            {drawingDataUrl && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <img
                    src={drawingDataUrl}
                    alt="Attached sketch"
                    className="w-16 h-12 object-contain rounded-md bg-white border border-stone-200"
                  />
                  <div>
                    <span className="text-xs text-stone-800 font-medium block">Handwritten Sketch / Doodle</span>
                    <span className="text-[10px] text-stone-400">Drawn with stylus or pen tool</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveLightboxUrl(drawingDataUrl)}
                    className="text-xs text-stone-600 hover:text-stone-900 p-1 font-medium cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawingDataUrl(undefined)}
                    className="text-xs text-rose-600 hover:text-rose-800 p-1 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Checklist section */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8DFC9] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <ListTodo size={14} className="text-blue-600" />
                <span>Checklist / Action items</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {checklist.filter((c) => c.done).length}/{checklist.length} completed
              </span>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200/70"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklistDone(item.id)}
                      className="w-4 h-4 rounded-sm text-emerald-600 cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-xs text-stone-800 ${
                        item.done ? 'line-through text-stone-400' : ''
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist item (e.g. Read passage, Kanji practice)..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-hidden focus:border-stone-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-stone-700 flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Proper Code Note Section (Prompt Feature 3) */}
          <div className="p-4 rounded-2xl bg-[#26242B] text-stone-100 border border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={hasCode}
                  onChange={(e) => setHasCode(e.target.checked)}
                  className="rounded-sm accent-emerald-500"
                />
                <Code size={14} />
                <span>Attach Code Snippet (Monospaced & Syntax Preserved)</span>
              </label>

              {hasCode && (
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-[#1F1E24] text-xs font-mono text-emerald-300 border border-stone-600 rounded-lg px-2.5 py-1 focus:outline-hidden"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {hasCode && (
              <textarea
                rows={4}
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="Paste code or terminal snippet here..."
                className="w-full bg-[#1A191E] font-mono text-xs text-amber-100/90 rounded-xl p-3 border border-stone-700 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
              />
            )}
          </div>

          {/* Step 3: Reuse it - Revision & Exam Prep Question */}
          <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={hasRevision}
                  onChange={(e) => setHasRevision(e.target.checked)}
                  className="rounded-sm accent-purple-600"
                />
                <Sparkles size={14} className="text-purple-600" />
                <span>Step 3: Turn into Revision / Exam Question</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoGenerateFlashcard}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-200/80 hover:bg-purple-300 text-purple-900 font-medium flex items-center gap-1 cursor-pointer transition"
                  title="Automatically create active recall flashcard from title and note content"
                >
                  <Sparkles size={12} className="text-purple-700" />
                  <span>Auto-Generate</span>
                </button>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                  Active Recall
                </span>
              </div>
            </div>

            {hasRevision && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-purple-900 block mb-1">
                    Exam Prompt / Flashcard Question
                  </label>
                  <input
                    type="text"
                    value={revisionQuestion}
                    onChange={(e) => setRevisionQuestion(e.target.value)}
                    placeholder="e.g. Why does PCA maximize variance?"
                    className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-purple-900 block mb-1">
                    Model Explanation / Key Formula to Recall
                  </label>
                  <textarea
                    rows={2}
                    value={revisionAnswer}
                    onChange={(e) => setRevisionAnswer(e.target.value)}
                    placeholder="Key insight or answer to test yourself against..."
                    className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. machine-learning, exam, chapter-2"
              className="w-full bg-white border border-[#E3D8C6] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Stage:</span>
            <div className="flex gap-1">
              {(['catch', 'shape', 'reuse'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStage(st)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition font-medium ${
                    stage === st
                      ? STAGE_META[st].badgeClass + ' font-bold'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {STAGE_META[st].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200/60 transition text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#37343C] text-white hover:bg-stone-800 transition text-xs font-medium cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle size={14} />
              <span>Save & Keep</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox */}
      <PhotoLightboxModal
        isOpen={Boolean(activeLightboxUrl)}
        photoUrl={activeLightboxUrl}
        title={title || 'Note Attachment'}
        onClose={() => setActiveLightboxUrl(null)}
      />
    </div>
  );
};

export const EditNoteModal: React.FC<Props> = ({
  note,
  notebooks,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !note) return null;

  return (
    <EditNoteModalContent
      note={note}
      notebooks={notebooks}
      onClose={onClose}
      onSave={onSave}
    />
  );
};
