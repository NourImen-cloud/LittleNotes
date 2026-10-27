import React, { useState, useEffect, useRef } from 'react';
import type { Note, Notebook, ThoughtStage, NoteStyle, KawaiiSticker, NoteColor } from './types';
import { INITIAL_NOTEBOOKS, INITIAL_NOTES } from './data/initialData';
import { Header } from './components/Header';
import { QuickCapture } from './components/QuickCapture';
import { NotebooksBar } from './components/NotebooksBar';
import { NoteCard } from './components/NoteCard';
import { StickyNotePickerModal } from './components/StickyNotePickerModal';
import { EditNoteModal } from './components/EditNoteModal';
import { RevisionModal } from './components/RevisionModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { DoodleCanvasModal } from './components/DoodleCanvasModal';
import { SyncModal } from './components/SyncModal';
import { InstallModal } from './components/InstallModal';
import { QRScannerModal } from './components/QRScannerModal';
import {
  getStoredRoomCode,
  saveStoredRoomCode,
  pushSyncData,
  pullSyncData,
  subscribeToSyncRoom,
  requestSyncSnapshot,
} from './utils/syncService';
import type { SyncStatus } from './utils/syncService';
import { Plus, Pin, Search } from 'lucide-react';

const STORAGE_NOTES_KEY = 'littlenotes_notes_v1';
const STORAGE_NOTEBOOKS_KEY = 'littlenotes_notebooks_v1';
const STORAGE_TEXTURE_KEY = 'littlenotes_texture_v1';
const STORAGE_NIGHT_KEY = 'littlenotes_night_v1';
const STORAGE_WIDGET_KEY = 'littlenotes_widget_mode_v1';
const STORAGE_INSTALLED_KEY = 'littlenotes_installed_v1';

const checkIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const App: React.FC = () => {
  // Load data from localStorage or initial seed
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTES_KEY);
      if (!saved) return INITIAL_NOTES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTEBOOKS_KEY);
      if (!saved) return INITIAL_NOTEBOOKS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTEBOOKS;
    } catch {
      return INITIAL_NOTEBOOKS;
    }
  });

  const [paperTexture, setPaperTexture] = useState<'grid' | 'ruled' | 'clean'>(() => {
    try {
      return (localStorage.getItem(STORAGE_TEXTURE_KEY) as any) || 'grid';
    } catch {
      return 'grid';
    }
  });

  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_NIGHT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | 'all'>('all');
  const [activeStage, setActiveStage] = useState<ThoughtStage | 'all'>('all');

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionInitialId, setRevisionInitialId] = useState<string | undefined>();
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    try {
      if (checkIsStandalone()) return true;
      return localStorage.getItem(STORAGE_INSTALLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('littlenotes_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [isWidgetMode, setIsWidgetMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_WIDGET_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Capture PWA install state and beforeinstallprompt event
  useEffect(() => {
    const standaloneMQ = window.matchMedia('(display-mode: standalone)');
    const handleMQChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };
    standaloneMQ.addEventListener?.('change', handleMQChange);

    // If getInstalledRelatedApps is supported
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any)
        .getInstalledRelatedApps()
        .then((relatedApps: any[]) => {
          if (Array.isArray(relatedApps) && relatedApps.length > 0) {
            setIsInstalled(true);
            try {
              localStorage.setItem(STORAGE_INSTALLED_KEY, 'true');
            } catch {}
          }
        })
        .catch(() => {});
    }

    const promptHandler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!checkIsStandalone()) {
        setIsInstalled(false);
        try {
          localStorage.removeItem(STORAGE_INSTALLED_KEY);
        } catch {}
      }
    };
    window.addEventListener('beforeinstallprompt', promptHandler);

    const appInstalledHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(STORAGE_INSTALLED_KEY, 'true');
      } catch {}
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      standaloneMQ.removeEventListener?.('change', handleMQChange);
      window.removeEventListener('beforeinstallprompt', promptHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const handlePromptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
        try {
          localStorage.setItem(STORAGE_INSTALLED_KEY, 'true');
        } catch {}
      }
    }
  };

  const handleToggleWidgetMode = () => {
    setIsWidgetMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_WIDGET_KEY, String(next));
      } catch (err) {
        console.error('Failed to save widget mode preference', err);
      }
      return next;
    });
  };

  // Device Sync State
  const [syncRoomCode, setSyncRoomCode] = useState<string | null>(() => getStoredRoomCode());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const isRemoteUpdating = useRef(false);

  // Keep live refs for sync data requests
  const notesRef = useRef(notes);
  const notebooksRef = useRef(notebooks);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    notebooksRef.current = notebooks;
  }, [notebooks]);

  const isJoinedFromUrlRef = useRef(false);

  // Auto-join if URL contains ?sync=LN-XXXX
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const incoming = params.get('sync');
      if (incoming) {
        isJoinedFromUrlRef.current = true;
        const cleanCode = incoming.trim().toUpperCase();
        setSyncRoomCode(cleanCode);
        saveStoredRoomCode(cleanCode);
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (err) {
      console.error('Failed to parse sync param', err);
    }
  }, []);

  // Room Subscription & Real-time Live Relay
  useEffect(() => {
    if (!syncRoomCode) {
      setSyncStatus('idle');
      return;
    }

    setSyncStatus('syncing');

    const applyRemoteData = (remote: { notes?: Note[]; notebooks?: Notebook[] }) => {
      isRemoteUpdating.current = true;
      if (Array.isArray(remote.notes) && remote.notes.length > 0) {
        setNotes(remote.notes);
      }
      if (Array.isArray(remote.notebooks) && remote.notebooks.length > 0) {
        setNotebooks(remote.notebooks);
      }
      setTimeout(() => {
        isRemoteUpdating.current = false;
      }, 400);
      setSyncStatus('connected');
    };

    // 1. Initial Pull: grab latest notes & notebooks from the room snapshot
    pullSyncData(syncRoomCode).then((remote) => {
      if (
        remote &&
        ((Array.isArray(remote.notes) && remote.notes.length > 0) ||
          (Array.isArray(remote.notebooks) && remote.notebooks.length > 0))
      ) {
        applyRemoteData(remote);
      } else if (!isJoinedFromUrlRef.current) {
        // If room is fresh on the creating device (e.g. PC), push our current notes & notebooks to the room
        pushSyncData(syncRoomCode, notesRef.current, notebooksRef.current, 'SYNC_FULL').then((ok) => {
          setSyncStatus(ok ? 'connected' : 'idle');
        });
      } else {
        // Device joined via link/QR: ask the host device to send its full snapshot
        requestSyncSnapshot(syncRoomCode).then(() => {
          setSyncStatus('connected');
        });
      }
    });

    // 2. Real-time stream: listens for updates and snapshot requests
    const unsubscribe = subscribeToSyncRoom(syncRoomCode, (remote) => {
      if (remote.type === 'REQUEST_SYNC') {
        // Another device just joined! Transmit our current notes & notebooks immediately
        pushSyncData(syncRoomCode, notesRef.current, notebooksRef.current, 'SYNC_FULL');
        return;
      }

      applyRemoteData(remote);
    });

    return () => {
      unsubscribe();
    };
  }, [syncRoomCode]);

  // Debounced auto-push when notes or notebooks change
  useEffect(() => {
    if (!syncRoomCode || isRemoteUpdating.current) return;

    const timer = setTimeout(() => {
      setSyncStatus('syncing');
      pushSyncData(syncRoomCode, notes, notebooks).then((ok) => {
        setSyncStatus(ok ? 'connected' : 'error');
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [notes, notebooks, syncRoomCode]);

  const handleSetRoomCode = (code: string | null) => {
    setSyncRoomCode(code);
    saveStoredRoomCode(code);
  };

  const handleTriggerSync = () => {
    if (syncRoomCode) {
      setSyncStatus('syncing');
      pushSyncData(syncRoomCode, notesRef.current, notebooksRef.current).then((ok) => {
        setSyncStatus(ok ? 'connected' : 'error');
      });
    }
  };

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch (err) {
      console.error('Failed to save notes to localStorage', err);
    }
  }, [notes]);

  // Persist notebooks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTEBOOKS_KEY, JSON.stringify(notebooks));
    } catch (err) {
      console.error('Failed to save notebooks to localStorage', err);
    }
  }, [notebooks]);

  // Persist texture preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEXTURE_KEY, paperTexture);
    } catch (err) {
      console.error('Failed to save texture preference', err);
    }
  }, [paperTexture]);

  // Persist night mode preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NIGHT_KEY, String(isNightMode));
    } catch (err) {
      console.error('Failed to save night mode preference', err);
    }
  }, [isNightMode]);

  // Handlers
  const handleCaptureQuickNote = (noteData: Partial<Note>) => {
    const fallbackNbId = notebooks.some((nb) => nb.id === 'inbox')
      ? 'inbox'
      : (notebooks[0]?.id || 'inbox');
    const targetNbId =
      noteData.notebookId && notebooks.some((nb) => nb.id === noteData.notebookId)
        ? noteData.notebookId
        : (selectedNotebookId !== 'all' ? selectedNotebookId : fallbackNbId);

    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: noteData.title || '',
      content: noteData.content || '',
      notebookId: targetNbId,
      color: noteData.color || 'paper',
      styleType: noteData.styleType || 'classic',
      stage: 'catch',
      tags: noteData.tags || [],
      photos: noteData.photos || undefined,
      drawingDataUrl: noteData.drawingDataUrl || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
  };

  const handleSelectPreset = (preset: {
    styleType: NoteStyle;
    sticker: KawaiiSticker;
    color: NoteColor;
    title: string;
    hasChecklist?: boolean;
    hasCode?: boolean;
  }) => {
    const fallbackNbId = notebooks.some((nb) => nb.id === 'inbox')
      ? 'inbox'
      : (notebooks[0]?.id || 'inbox');

    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: preset.title,
      content: 'Write your notes or thoughts here...',
      notebookId: selectedNotebookId !== 'all' ? selectedNotebookId : fallbackNbId,
      color: preset.color,
      styleType: preset.styleType,
      kawaiiSticker: preset.sticker,
      stage: 'shape',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: preset.hasChecklist
        ? [
            { id: 'c-1', text: 'First study task', done: false },
            { id: 'c-2', text: 'Second study task', done: false },
          ]
        : undefined,
      codeBlock: preset.hasCode
        ? {
            language: 'python',
            code: '# Your code note\ndef study_session():\n    pass',
          }
        : undefined,
    };

    setNotes([newNote, ...notes]);
    setEditingNote(newNote);
    setIsEditModalOpen(true);
  };

  const handleUpdateNote = (updated: Note) => {
    setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  };

  const handleStartRevision = (note: Note) => {
    setRevisionInitialId(note.id);
    setIsRevisionModalOpen(true);
  };

  const handleAddNotebook = (nb: { name: string; icon: string; color: string }) => {
    const newNb: Notebook = {
      id: 'nb-' + Date.now(),
      name: nb.name,
      icon: nb.icon,
      color: nb.color,
    };
    setNotebooks([...notebooks, newNb]);
  };

  const handleDeleteNotebook = (
    notebookId: string,
    deleteNotes: boolean = false,
    targetNotebookId?: string
  ) => {
    if (deleteNotes) {
      setNotes((prevNotes) => prevNotes.filter((n) => n.notebookId !== notebookId));
    } else if (targetNotebookId) {
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.notebookId === notebookId
            ? { ...n, notebookId: targetNotebookId, updatedAt: new Date().toISOString() }
            : n
        )
      );
    } else {
      const fallbackNb = notebooks.find((nb) => nb.id !== notebookId);
      if (fallbackNb) {
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.notebookId === notebookId
              ? { ...n, notebookId: fallbackNb.id, updatedAt: new Date().toISOString() }
              : n
          )
        );
      }
    }

    setNotebooks((prevNotebooks) => prevNotebooks.filter((nb) => nb.id !== notebookId));

    if (selectedNotebookId === notebookId) {
      setSelectedNotebookId('all');
    }
  };

  // Doodle handler
  const handleSaveDoodle = (dataUrl: string) => {
    if (editingNote) {
      handleUpdateNote({
        ...editingNote,
        drawingDataUrl: dataUrl,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newDoodleNote: Note = {
        id: 'note-' + Date.now(),
        title: 'Handwritten Formula / Sketch',
        content: 'Quick visual derivation drawn on grid paper.',
        notebookId: selectedNotebookId !== 'all' ? selectedNotebookId : 'inbox',
        color: 'paper',
        styleType: 'classic',
        drawingDataUrl: dataUrl,
        stage: 'shape',
        tags: ['sketch', 'handwriting'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newDoodleNote, ...notes]);
    }
  };

  // Print Cheat Sheet
  const handlePrintGuide = () => {
    window.print();
  };

  // Export JSON
  const handleExportNotes = () => {
    const exportData = {
      notes,
      notebooks,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `littlenotes_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportNotes = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed.notes)) {
            setNotes(parsed.notes);
          }
          if (Array.isArray(parsed.notebooks)) {
            setNotebooks(parsed.notebooks);
          }
          alert('Notes restored successfully! 🌿');
        } catch {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Filter notes
  const hasSearch = searchQuery.trim().length > 0;
  const q = searchQuery.trim().toLowerCase();

  const filteredNotes = notes.filter((n) => {
    // When searching, perform global search across all fields safely
    if (hasSearch) {
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchContent = (n.content || '').toLowerCase().includes(q);
      const matchTags =
        Array.isArray(n.tags) && n.tags.some((t) => (t || '').toLowerCase().includes(q));
      const matchCode = (n.codeBlock?.code || '').toLowerCase().includes(q);
      const matchRevision =
        (n.revisionQuestion || '').toLowerCase().includes(q) ||
        (n.revisionAnswer || '').toLowerCase().includes(q);
      const matchChecklist =
        Array.isArray(n.checklist) &&
        n.checklist.some((item) => (item.text || '').toLowerCase().includes(q));
      const matchAudio = (n.audioNote?.transcript || '').toLowerCase().includes(q);
      const nb = notebooks.find((b) => b.id === n.notebookId);
      const matchNotebook = (nb?.name || '').toLowerCase().includes(q);

      return (
        matchTitle ||
        matchContent ||
        matchTags ||
        matchCode ||
        matchRevision ||
        matchChecklist ||
        matchAudio ||
        matchNotebook
      );
    }

    // Notebook filter (when not actively searching)
    if (selectedNotebookId !== 'all' && n.notebookId !== selectedNotebookId) {
      return false;
    }
    // Stage filter (when not actively searching)
    if (activeStage !== 'all' && n.stage !== activeStage) {
      return false;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned);

  // Background texture class
  const textureClass =
    paperTexture === 'grid'
      ? 'grid-paper-bg'
      : paperTexture === 'ruled'
      ? 'ruled-paper-bg'
      : 'bg-[#FAF6EF]';

  return (
    <div
      className={`min-h-screen ${
        isNightMode ? 'bg-[#1C1A21] text-amber-50' : textureClass + ' text-[#37343C]'
      } flex flex-col font-sans transition-colors duration-300`}
    >
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paperTexture={paperTexture}
        onTextureChange={setPaperTexture}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenRevision={() => {
          setRevisionInitialId(undefined);
          setIsRevisionModalOpen(true);
        }}
        onOpenTimer={() => setIsTimerModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        isPaired={Boolean(syncRoomCode)}
        isWidgetMode={isWidgetMode}
        onToggleWidgetMode={handleToggleWidgetMode}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isInstalled={isInstalled}
        onPrintGuide={handlePrintGuide}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
      />

      {/* Main Body */}
      <main className={`flex-1 ${isWidgetMode ? 'max-w-md px-3 py-2' : 'max-w-7xl px-4 sm:px-6 py-4'} w-full mx-auto transition-all duration-300`}>
        {isWidgetMode && (
          <div className="mb-3 px-3 py-2 bg-[#E7DDF8]/70 border border-[#D8C6F2] rounded-2xl text-xs text-[#3E2B5A] flex items-center justify-between shadow-2xs">
            <span className="font-medium flex items-center gap-1.5">
              <span>📌</span>
              <span>Corner Widget Mode (Resize to screen corner)</span>
            </span>
            <button
              onClick={handleToggleWidgetMode}
              className="text-[11px] font-semibold underline hover:text-stone-900 cursor-pointer"
            >
              Full View
            </button>
          </div>
        )}

        {/* Step 1: Catch it - Instant Quick Capture with Voice & Doodle buttons */}
        <div className="print:hidden">
          <QuickCapture
            onCapture={handleCaptureQuickNote}
            onOpenDoodle={() => setIsDoodleModalOpen(true)}
          />

          {/* Notebooks bar */}
          <NotebooksBar
            notebooks={notebooks}
            notes={notes}
            selectedNotebookId={selectedNotebookId}
            onSelectNotebook={setSelectedNotebookId}
            onAddNotebook={handleAddNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            activeStage={activeStage}
            onSelectStage={setActiveStage}
          />
        </div>

        {/* Printable Study Guide Banner (shown when printing) */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            🌿 LittleNotes Study Guide & Cheat Sheet
          </h1>
          <p className="text-xs text-stone-600">
            Generated on {new Date().toLocaleDateString()} • {filteredNotes.length} notes compiled
          </p>
        </div>

        {/* Notes Grid */}
        <div className="max-w-6xl mx-auto px-4 mt-6">
          {/* Active Search Results Indicator */}
          {hasSearch && (
            <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-2.5 mb-5 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-amber-700 shrink-0" />
                <span>
                  Found <strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'note' : 'notes'} matching &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo; (searched across all notebooks)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-amber-800 hover:text-amber-950 font-medium underline cursor-pointer ml-3 shrink-0"
              >
                Clear search
              </button>
            </div>
          )}

          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white/70 border border-dashed border-[#DFCDB3] rounded-3xl max-w-md mx-auto space-y-3">
              <span className="text-4xl">🪴</span>
              <h3 className="font-serif text-lg font-semibold text-stone-700">
                {searchQuery ? 'No notes matched your search' : 'No notes in this view yet'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try searching with fewer words or reset the filters.'
                  : 'Catch a quick thought above or choose a cozy sticky note template to get started!'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 bg-stone-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="px-4 py-2 bg-[#E7DDF8] text-[#402C5E] rounded-xl text-xs font-medium hover:bg-[#D8C6F2] transition cursor-pointer"
                >
                  Browse Sticky Templates
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pinned Notes section */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-800 uppercase tracking-wider print:hidden">
                    <Pin size={13} className="fill-amber-700" />
                    <span>Pinned Notes</span>
                  </div>
                  <div className={`grid ${isWidgetMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4 items-start print:grid-cols-2`}>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        notebooks={notebooks}
                        onUpdateNote={handleUpdateNote}
                        onDeleteNote={handleDeleteNote}
                        onEditNote={handleOpenEdit}
                        onStartRevision={handleStartRevision}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes section */}
              {regularNotes.length > 0 && (
                <div className="space-y-3">
                  {pinnedNotes.length > 0 && (
                    <div className="text-xs font-serif font-bold text-stone-600 uppercase tracking-wider print:hidden">
                      All Notes
                    </div>
                  )}
                  <div className={`grid ${isWidgetMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4 items-start print:grid-cols-2`}>
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        notebooks={notebooks}
                        onUpdateNote={handleUpdateNote}
                        onDeleteNote={handleDeleteNote}
                        onEditNote={handleOpenEdit}
                        onStartRevision={handleStartRevision}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Install Promotion Banner */}
      {!isInstalled && !isBannerDismissed && (
        <div className="md:hidden fixed bottom-22 left-4 right-4 z-30 bg-stone-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-stone-700 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg shrink-0">📲</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">Install on your phone</p>
              <p className="text-[10px] text-stone-300 truncate">Adds to home screen & runs full screen</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-2.5 py-1 bg-[#E7DDF8] hover:bg-[#D8C6F2] text-[#3E2B5A] rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              Install
            </button>
            <button
              onClick={() => {
                setIsBannerDismissed(true);
                try {
                  sessionStorage.setItem('littlenotes_banner_dismissed', 'true');
                } catch {}
              }}
              className="p-1 text-stone-400 hover:text-white rounded-lg transition"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setIsTemplateModalOpen(true)}
        className="md:hidden fixed right-6 bottom-6 w-14 h-14 rounded-full bg-[#37343C] text-white shadow-xl flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition z-40 cursor-pointer print:hidden"
        title="Add Sticky Note"
      >
        <Plus size={24} />
      </button>

      {/* Footer info */}
      <footer className="mt-12 py-6 border-t border-[#E8DFC9] text-center text-xs text-stone-500 bg-[#FAF6EF]/60 print:hidden">
        <p className="flex items-center justify-center gap-2">
          <span>🌿 LittleNotes</span>
          <span>•</span>
          <span>The cozy study notebook for students</span>
          <span>•</span>
        </p>
      </footer>

      {/* Sticky Note Template Picker Modal */}
      <StickyNotePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Edit & Shape Modal */}
      <EditNoteModal
        note={editingNote}
        notebooks={notebooks}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleUpdateNote}
      />

      {/* Revision & Exam Prep Mode */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        notes={notes}
        initialNoteId={revisionInitialId}
        onClose={() => {
          setIsRevisionModalOpen(false);
          setRevisionInitialId(undefined);
        }}
      />

      {/* Study Café Timer Modal */}
      <StudyTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />

      {/* Doodle & Sketch Canvas Modal */}
      <DoodleCanvasModal
        isOpen={isDoodleModalOpen}
        onClose={() => setIsDoodleModalOpen(false)}
        onSaveDoodle={handleSaveDoodle}
      />

      {/* Device Sync & QR Pairing Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        currentRoomCode={syncRoomCode}
        notes={notes}
        notebooks={notebooks}
        onSetRoomCode={handleSetRoomCode}
        onTriggerSync={handleTriggerSync}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Built-in Camera QR Scanner */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onImportData={(data) => {
          if (Array.isArray(data.notes) && data.notes.length > 0) {
            setNotes(data.notes);
          }
          if (Array.isArray(data.notebooks) && data.notebooks.length > 0) {
            setNotebooks(data.notebooks);
          }
        }}
        onPairCode={(code) => {
          handleSetRoomCode(code);
        }}
      />

      {/* PWA App Installation Guidance Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onPromptInstall={handlePromptInstall}
        canPromptDirectly={Boolean(deferredPrompt) && !isInstalled}
        isInstalled={isInstalled}
      />
    </div>
  );
};

export default App;
