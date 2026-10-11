import React, { useState } from 'react';
import type { Notebook, Note, ThoughtStage } from '../types';
import { FolderPlus, Sparkles } from 'lucide-react';


interface Props {
  notebooks: Notebook[];
  notes: Note[];
  selectedNotebookId: string | 'all';
  onSelectNotebook: (id: string | 'all') => void;
  onAddNotebook: (notebook: { name: string; icon: string; color: string }) => void;
  activeStage: ThoughtStage | 'all';
  onSelectStage: (stage: ThoughtStage | 'all') => void;
}

export const NotebooksBar: React.FC<Props> = ({
  notebooks,
  notes,
  selectedNotebookId,
  onSelectNotebook,
  onAddNotebook,
  activeStage,
  onSelectStage,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📚');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddNotebook({
      name: newTitle.trim(),
      icon: newIcon || '📘',
      color: '#E7DDF8',
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const getNoteCount = (nbId: string) => {
    return notes.filter((n) => n.notebookId === nbId).length;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 my-4 space-y-4">
      {/* Notebook Cards Row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-serif font-bold text-stone-700 tracking-wide uppercase">
            Your Notebooks
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition font-medium"
          >
            <FolderPlus size={13} />
            <span>New Notebook</span>
          </button>
        </div>

        {/* Add notebook prompt */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="mb-3 p-3 bg-white/90 border border-stone-200 rounded-2xl flex flex-wrap items-center gap-2 animate-in fade-in"
          >
            <input
              type="text"
              placeholder="Icon (e.g. 📊, 🧬, ⚡)"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-16 px-2 py-1 text-sm bg-stone-50 border border-stone-200 rounded-lg text-center"
            />
            <input
              type="text"
              placeholder="Notebook name (e.g. Linear Algebra, Bio Labs)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1 bg-[#37343C] text-white rounded-lg text-xs font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Horizontal scrollable / wrap notebook pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {/* All Notes card */}
          <button
            onClick={() => onSelectNotebook('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-medium transition shrink-0 cursor-pointer ${
              selectedNotebookId === 'all'
                ? 'bg-[#37343C] text-white border-[#37343C] shadow-sm'
                : 'bg-white/80 text-stone-700 border-[#E5DAC8] hover:bg-white hover:border-stone-400'
            }`}
          >
            <span>📖</span>
            <span className="font-serif">All Notes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedNotebookId === 'all' ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {notes.length}
            </span>
          </button>

          {/* Individual Notebooks */}
          {notebooks.map((nb) => {
            const count = getNoteCount(nb.id);
            const isSelected = selectedNotebookId === nb.id;
            return (
              <button
                key={nb.id}
                onClick={() => onSelectNotebook(nb.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-medium transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#37343C] text-white border-[#37343C] shadow-sm'
                    : 'bg-white/80 text-stone-700 border-[#E5DAC8] hover:bg-white hover:border-stone-400'
                }`}
              >
                <span>{nb.icon}</span>
                <span className="font-serif">{nb.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thought Flow Filter Pills (Catch it -> Shape it -> Reuse it) */}
      <div className="flex items-center gap-2 pt-1 border-t border-stone-200/50 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-600 font-serif italic text-xs shrink-0 flex items-center gap-1">
          <Sparkles size={12} className="text-purple-500" />
          <span>Thought Flow:</span>
        </span>

        <button
          onClick={() => onSelectStage('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
            activeStage === 'all'
              ? 'bg-[#E7DDF8] text-[#402C5E] font-semibold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All Stages
        </button>

        <button
          onClick={() => onSelectStage('catch')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
            activeStage === 'catch'
              ? 'bg-amber-100 text-amber-900 font-semibold ring-1 ring-amber-300'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          title="Instant captures waiting to be organized"
        >
          1. Catch it ({notes.filter((n) => n.stage === 'catch').length})
        </button>

        <button
          onClick={() => onSelectStage('shape')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
            activeStage === 'shape'
              ? 'bg-emerald-100 text-emerald-900 font-semibold ring-1 ring-emerald-300'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          title="Enriched with notes, code, and checklists"
        >
          2. Shape it ({notes.filter((n) => n.stage === 'shape').length})
        </button>

        <button
          onClick={() => onSelectStage('reuse')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
            activeStage === 'reuse'
              ? 'bg-purple-100 text-purple-900 font-semibold ring-1 ring-purple-300'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          title="Exam questions & study references"
        >
          3. Reuse it ({notes.filter((n) => n.stage === 'reuse').length})
        </button>
      </div>
    </div>
  );
};
