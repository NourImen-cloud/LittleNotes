import React, { useState, useRef } from 'react';
import type { Note } from '../types';
import { Send, Sparkles, CheckCircle2, Mic, MicOff, PenTool } from 'lucide-react';

interface Props {
  onCapture: (noteData: Partial<Note>) => void;
  onOpenTemplates: () => void;
  onOpenDoodle: () => void;
}

export const QuickCapture: React.FC<Props> = ({
  onCapture,
  onOpenTemplates,
  onOpenDoodle,
}) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech-to-text is supported in Chrome, Edge, and Safari browsers.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsExpanded(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onCapture({
      title: title.trim(),
      content: content.trim(),
      notebookId: 'inbox',
      stage: 'catch',
      color: 'paper',
      styleType: 'classic',
      tags: [],
    });

    setTitle('');
    setContent('');
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
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-4 sm:p-5 shadow-sm border border-[#E4D9C7] hover:border-stone-400/70 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-serif italic text-stone-500">
              A little space to think.
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenDoodle}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#FAF6EF] hover:bg-stone-200/60 text-stone-600 border border-stone-200 transition font-medium cursor-pointer"
              title="Draw diagram or write with stylus on grid paper"
            >
              <PenTool size={12} className="text-stone-700" />
              <span>Doodle</span>
            </button>

            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#FAF6EF] hover:bg-[#E7DDF8] text-stone-600 hover:text-stone-900 border border-stone-200 transition font-medium cursor-pointer"
            >
              <Sparkles size={12} className="text-purple-500" />
              <span>Templates</span>
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
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to remember today? "
              className="w-full resize-none text-sm text-stone-800 placeholder:text-stone-400 bg-transparent px-1 py-1 focus:outline-hidden leading-relaxed"
            />
          </div>

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
                  Listening... speak your thought
                </span>
              ) : (
                <span>
                  Press <kbd className="px-1 py-0.5 rounded-sm bg-stone-100 font-mono text-[10px]">Enter</kbd> to catch instantly
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Memo Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-full border transition cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
                title={isListening ? 'Stop recording voice' : 'Dictate voice memo (15-sec capture)'}
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
                disabled={!content.trim() && !title.trim()}
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
