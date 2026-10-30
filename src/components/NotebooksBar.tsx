import React, { useState } from 'react';
import type { Notebook, Note, ThoughtStage } from '../types';
import { FolderPlus, Sparkles, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  notebooks: Notebook[];
  notes: Note[];
  selectedNotebookId: string | 'all';
  onSelectNotebook: (id: string | 'all') => void;
  onAddNotebook: (notebook: { name: string; icon: string; color: string }) => void;
  onDeleteNotebook: (notebookId: string, deleteNotes: boolean, targetNotebookId?: string) => void;
  activeStage: ThoughtStage | 'all';
  onSelectStage: (stage: ThoughtStage | 'all') => void;
}

export const NotebooksBar: React.FC<Props> = ({
  notebooks,
  notes,
  selectedNotebookId,
  onSelectNotebook,
  onAddNotebook,
  onDeleteNotebook,
  activeStage,
  onSelectStage,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📚');

  // Delete notebook modal state
  const [deletingNotebook, setDeletingNotebook] = useState<Notebook | null>(null);
  const [deleteAction, setDeleteAction] = useState<'move' | 'delete'>('move');
  const [targetNotebookId, setTargetNotebookId] = useState<string>('');

  const handleOpenDelete = (nb: Notebook) => {
    setDeletingNotebook(nb);
    setDeleteAction('move');
    const availableOthers = notebooks.filter((n) => n.id !== nb.id);
    const preferred = availableOthers.find((n) => n.id === 'inbox') || availableOthers[0];
    setTargetNotebookId(preferred ? preferred.id : '');
  };

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
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-serif font-bold text-stone-700 tracking-wide uppercase">
              Your Notebooks
            </h2>
            {selectedNotebookId !== 'all' && (
              <span className="hidden sm:inline-flex items-center text-xs text-stone-500 font-medium">
                • {notebooks.find((nb) => nb.id === selectedNotebookId)?.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {selectedNotebookId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  const currentNb = notebooks.find((nb) => nb.id === selectedNotebookId);
                  if (currentNb) handleOpenDelete(currentNb);
                }}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition font-medium px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Delete this notebook"
              >
                <Trash2 size={13} />
                <span>Delete<span className="hidden sm:inline"> Notebook</span></span>
              </button>
            )}
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition font-medium px-2 py-1 rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              <FolderPlus size={13} />
              <span>New<span className="hidden sm:inline"> Notebook</span></span>
            </button>
          </div>
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
              className="px-3 py-1 bg-[#37343C] text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded-lg cursor-pointer"
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition shrink-0 cursor-pointer ${
              selectedNotebookId === 'all'
                ? 'bg-[#37343C] text-white border-[#37343C] shadow-sm'
                : 'bg-white/80 text-stone-700 border-[#E5DAC8] hover:bg-white hover:border-purple-300'
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
              <div
                key={nb.id}
                onClick={() => onSelectNotebook(nb.id)}
                className={`group flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-2xl border text-xs font-medium transition shrink-0 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#37343C] text-white border-[#37343C] shadow-xs'
                    : 'bg-white/80 text-stone-700 border-[#E5DAC8] hover:bg-white hover:border-purple-300'
                }`}
              >
                <span className="text-sm">{nb.icon}</span>
                <span className="font-serif">{nb.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition ${
                    isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDelete(nb);
                  }}
                  className={`p-1 rounded-full transition ml-0.5 cursor-pointer opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ${
                    isSelected
                      ? 'text-stone-300 hover:text-white hover:bg-rose-500/80'
                      : 'text-stone-400 hover:text-rose-600 hover:bg-rose-100/80'
                  }`}
                  title={`Delete "${nb.name}" notebook`}
                  aria-label={`Delete notebook ${nb.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
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
          className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer ${
            activeStage === 'all'
              ? 'bg-[#E7DDF8] text-[#402C5E] font-semibold'
              : 'text-stone-600 hover:text-stone-900'
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

      {/* Delete Notebook Confirmation Modal */}
      {deletingNotebook && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setDeletingNotebook(null)}
        >
          <div
            className="bg-[#FAF6EF] border border-[#DFCDB3] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  Delete Notebook
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-stone-900">
                    {deletingNotebook.icon} {deletingNotebook.name}
                  </span>
                  ?
                </p>
              </div>
            </div>

            {/* If only 1 notebook exists */}
            {notebooks.length <= 1 ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    This is your only notebook. You must keep at least one notebook in your collection. Please create another notebook before deleting this one.
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingNotebook(null)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </div>
            ) : getNoteCount(deletingNotebook.id) === 0 ? (
              /* If notebook is empty */
              <div className="space-y-4">
                <p className="text-xs text-stone-600">
                  This notebook currently has no notes. Deleting it will permanently remove it from your notebook list.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setDeletingNotebook(null)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteNotebook(deletingNotebook.id, false);
                      setDeletingNotebook(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium shadow-xs transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Notebook</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If notebook has notes */
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    This notebook contains{' '}
                    <span className="font-bold">
                      {getNoteCount(deletingNotebook.id)}
                    </span>{' '}
                    note
                    {getNoteCount(deletingNotebook.id) === 1 ? '' : 's'}. What would you like to do with them?
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      deleteAction === 'move'
                        ? 'bg-white border-stone-800 shadow-2xs'
                        : 'bg-white/60 border-stone-200 hover:bg-white'
                    }`}
                    onClick={() => setDeleteAction('move')}
                  >
                    <input
                      type="radio"
                      name="deleteNotebookAction"
                      checked={deleteAction === 'move'}
                      onChange={() => setDeleteAction('move')}
                      className="mt-0.5 text-stone-800"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="font-semibold text-stone-800">
                          Move notes to another notebook (Recommended)
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Keep your notes safe by transferring them to:
                        </div>
                      </div>
                      <select
                        value={targetNotebookId}
                        onChange={(e) => {
                          setTargetNotebookId(e.target.value);
                          setDeleteAction('move');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:outline-hidden"
                      >
                        {notebooks
                          .filter((nb) => nb.id !== deletingNotebook.id)
                          .map((nb) => (
                            <option key={nb.id} value={nb.id}>
                              {nb.icon} {nb.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      deleteAction === 'delete'
                        ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                        : 'bg-white/60 border-stone-200 hover:bg-white'
                    }`}
                    onClick={() => setDeleteAction('delete')}
                  >
                    <input
                      type="radio"
                      name="deleteNotebookAction"
                      checked={deleteAction === 'delete'}
                      onChange={() => setDeleteAction('delete')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="font-semibold text-rose-700">
                        Delete notebook and all its notes
                      </div>
                      <p className="text-[11px] text-rose-600/80 mt-0.5">
                        All {getNoteCount(deletingNotebook.id)} note
                        {getNoteCount(deletingNotebook.id) === 1 ? '' : 's'} inside will be permanently deleted.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setDeletingNotebook(null)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteNotebook(
                        deletingNotebook.id,
                        deleteAction === 'delete',
                        deleteAction === 'move' ? targetNotebookId : undefined
                      );
                      setDeletingNotebook(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-medium shadow-xs transition cursor-pointer ${
                      deleteAction === 'delete'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-[#37343C] hover:bg-stone-800'
                    }`}
                  >
                    <Trash2 size={13} />
                    <span>
                      {deleteAction === 'delete'
                        ? `Delete Notebook & ${getNoteCount(deletingNotebook.id)} Notes`
                        : 'Move Notes & Delete Notebook'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
