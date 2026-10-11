import React, { useState } from 'react';
import type { Note, Notebook, NoteColor, NoteStyle, KawaiiSticker, ThoughtStage, ChecklistItem } from '../types';
import { STAGE_META } from '../utils/theme';
import { StickerBadge } from './Stickers';
import {
  X,
  Plus,
  Trash2,
  Code,
  ListTodo,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface Props {
  note: Note | null;
  notebooks: Notebook[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Note) => void;
}

const LANGUAGES = ['python', 'typescript', 'javascript', 'html', 'css', 'sql', 'bash', 'c++', 'rust'];

export const EditNoteModal: React.FC<Props> = ({
  note,
  notebooks,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !note) return null;

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
    if (stage === 'catch' && (notebookId !== 'inbox' || hasCode || checklist.length > 0 || hasRevision)) {
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
              placeholder="Write your explanation, lecture takeaways, or thoughts..."
              className="w-full bg-white border border-[#E3D8C6] rounded-xl p-3.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-600 focus:ring-1 focus:ring-stone-600 leading-relaxed font-sans"
            />
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


            {/* Drawing / Sketch section if present */}
            {drawingDataUrl && (
              <div className="p-3 bg-white/80 rounded-xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={drawingDataUrl}
                    alt="Attached sketch"
                    className="w-16 h-12 object-contain rounded-md bg-stone-50 border border-stone-200"
                  />
                  <span className="text-xs text-stone-700 font-medium">Attached Handwritten Sketch</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawingDataUrl(undefined)}
                  className="text-xs text-rose-600 hover:text-rose-800 p-1 font-medium cursor-pointer"
                >
                  Remove Sketch
                </button>
              </div>
            )}


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
    </div>
  );
};
