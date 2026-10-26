import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';
import { Send, CheckCircle2, Mic, MicOff, PenTool, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { processImageFiles, getImagesFromClipboard } from '../utils/imageUtils';

interface Props {
  onCapture: (noteData: Partial<Note>) => void;
  onOpenDoodle: () => void;
}

export const QuickCapture: React.FC<Props> = ({
  onCapture,
  onOpenDoodle,
}) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-US');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef(content);
  const baseContentRef = useRef('');

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const stopListening = () => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech-to-text is supported in Chrome, Edge, and Safari browsers.');
      return;
    }

    setSpeechError(null);
    shouldListenRef.current = true;
    baseContentRef.current = contentRef.current;
    setIsListening(true);
    setIsExpanded(true);

    const initSession = () => {
      if (!shouldListenRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          let sessionTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript + ' ';
          }
          sessionTranscript = sessionTranscript.trim();

          if (sessionTranscript) {
            const base = baseContentRef.current.trim();
            const fullText = base ? `${base} ${sessionTranscript}` : sessionTranscript;
            setContent(fullText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning/error:', event.error);
          if (event.error === 'no-speech') {
            return;
          }
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechError('Microphone permission was blocked. Please allow microphone access in your browser settings.');
            stopListening();
            return;
          }
          if (event.error === 'network') {
            setSpeechError('Speech service requires internet access to connect to Google Speech servers.');
            stopListening();
            return;
          }
          if (event.error === 'audio-capture') {
            setSpeechError('No microphone detected. Please check your audio input device.');
            stopListening();
            return;
          }
          setSpeechError(`Speech recognition issue: ${event.error}`);
        };

        recognition.onend = () => {
          // Commit current text as the new base for the next segment
          baseContentRef.current = contentRef.current;

          if (shouldListenRef.current) {
            setTimeout(() => {
              if (shouldListenRef.current) {
                initSession();
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition session', err);
        if (shouldListenRef.current) {
          setTimeout(() => {
            if (shouldListenRef.current) initSession();
          }, 300);
        } else {
          setIsListening(false);
        }
      }
    };

    initSession();
  };

  const toggleListening = () => {
    if (isListening || shouldListenRef.current) {
      stopListening();
    } else {
      startRecognition();
    }
  };

  const handlePhotoFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    setIsExpanded(true);
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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedImages = await getImagesFromClipboard(e);
    if (pastedImages.length > 0) {
      e.preventDefault();
      setIsExpanded(true);
      setPhotos((prev) => [...prev, ...pastedImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !title.trim() && photos.length === 0) return;

    if (isListening || shouldListenRef.current) {
      stopListening();
    }

    onCapture({
      title: title.trim(),
      content: content.trim(),
      photos: photos.length > 0 ? photos : undefined,
      notebookId: 'inbox',
      stage: 'catch',
      color: 'paper',
      styleType: 'classic',
      tags: [],
    });

    setTitle('');
    setContent('');
    setPhotos([]);
    setIsExpanded(false);
    setRecentlySaved(true);
    setTimeout(() => setRecentlySaved(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isExpanded) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6">
      {/* Hidden file input for uploading photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handlePhotoFiles(e.target.files);
          // reset input so the same file can be selected again if needed
          e.target.value = '';
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`bg-white/90 backdrop-blur-xs rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-200 ${
          isDraggingOver
            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/40'
            : 'border-[#E4D9C7] hover:border-stone-400/70'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-serif italic text-stone-500">
              {isDraggingOver ? 'Drop photos here to attach' : 'A little space to think.'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#FAF6EF] hover:bg-stone-200/60 text-stone-600 border border-stone-200 transition font-medium cursor-pointer"
              title="Add photos or screenshots to note"
            >
              <ImageIcon size={12} className="text-amber-600" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={onOpenDoodle}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#FAF6EF] hover:bg-stone-200/60 text-stone-600 border border-stone-200 transition font-medium cursor-pointer"
              title="Draw diagram or write with stylus on grid paper"
            >
              <PenTool size={12} className="text-stone-700" />
              <span>Doodle</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {isExpanded && (
            <input
              type="text"
              placeholder="Note title (optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-serif font-medium bg-transparent border-b border-stone-200/80 px-1 py-1 text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-500"
            />
          )}

          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={isExpanded ? 3 : 1}
              value={content}
              onFocus={() => setIsExpanded(true)}
              onChange={(e) => {
                setContent(e.target.value);
                baseContentRef.current = e.target.value;
              }}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to remember today? (Tip: drag or paste photos anytime)"
              className="w-full resize-none text-sm text-stone-800 placeholder:text-stone-400 bg-transparent px-1 py-1 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Photo attachments preview */}
          {(photos.length > 0 || isUploadingPhoto) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              {photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className="group relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300/80 bg-stone-100 shadow-xs"
                >
                  <img
                    src={photoUrl}
                    alt={`Attached photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition opacity-90 group-hover:opacity-100 cursor-pointer"
                    title="Remove photo"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}

              {isUploadingPhoto && (
                <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 animate-pulse">
                  <Loader2 size={16} className="animate-spin text-stone-600" />
                  <span className="text-[9px] mt-1">Adding...</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border border-dashed border-stone-300 hover:border-stone-500 bg-stone-50/50 hover:bg-stone-100/60 flex flex-col items-center justify-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
                title="Add another photo"
              >
                <ImageIcon size={15} />
                <span className="text-[9px] mt-0.5">+ Add</span>
              </button>
            </div>
          )}

          {speechError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 flex items-center justify-between">
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-rose-400 hover:text-rose-700 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              {recentlySaved ? (
                <span className="text-emerald-700 flex items-center gap-1 font-medium animate-in fade-in">
                  <CheckCircle2 size={13} />
                  Saved to Inbox!
                </span>
              ) : isListening ? (
                <span className="text-rose-600 flex items-center gap-1.5 font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Listening in {speechLang.startsWith('en') ? 'English' : speechLang.startsWith('fr') ? 'French' : speechLang}...
                </span>
              ) : (
                <span>
                  Press <kbd className="px-1 py-0.5 rounded-sm bg-stone-100 font-mono text-[10px]">Enter</kbd> to catch instantly
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                title="Attach photo or snapshot"
              >
                <ImageIcon size={13} />
              </button>

              {/* Language Selector */}
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                className="text-[11px] bg-stone-50 border border-stone-200 text-stone-600 rounded-lg px-1.5 py-1 focus:outline-hidden cursor-pointer"
                title="Dictation language (change if dictating in another language)"
              >
                <option value="en-US">🇺🇸 EN</option>
                <option value="fr-FR">🇫🇷 FR</option>
                <option value="ar-SA">🇸🇦 AR</option>
                <option value="es-ES">🇪🇸 ES</option>
              </select>

              {/* Voice Memo Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-full border transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
                title={isListening ? 'Stop dictation' : 'Dictate note with microphone'}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
              </button>

              {isExpanded && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!content.trim() && !title.trim() && photos.length === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#37343C] text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs text-xs font-medium cursor-pointer"
              >
                <span>Catch it</span>
                <Send size={12} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
