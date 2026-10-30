import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';
import { startAmbientRain, stopAmbientRain, playGentleChime } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyTimerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break' | 'oneHour' | 'twoHour' | 'custom'>('focus');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Directly editable Hours and Minutes
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(25);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      playGentleChime();
      alert(timerMode === 'break' ? '🌿 Rest finished! Ready to capture more thoughts?' : '🍵 Study session complete! Time to take a breather.');
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, timerMode]);

  const applyDuration = (hours: number, minutes: number, mode: 'focus' | 'break' | 'oneHour' | 'twoHour' | 'custom') => {
    setIsActive(false);
    setTimerMode(mode);
    const validHours = Math.max(0, Math.min(12, Math.floor(hours || 0)));
    const validMins = Math.max(0, Math.min(59, Math.floor(minutes || 0)));
    const totalSecs = Math.max(60, validHours * 3600 + validMins * 60);

    setInputHours(validHours);
    setInputMinutes(validMins);
    setTotalSeconds(totalSecs);
    setSecondsLeft(totalSecs);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    applyDuration(isNaN(val) ? 0 : val, inputMinutes, 'custom');
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    applyDuration(inputHours, isNaN(val) ? 0 : val, 'custom');
  };

  const selectPreset = (type: 'focus' | 'break' | 'oneHour' | 'twoHour') => {
    if (type === 'focus') applyDuration(0, 25, 'focus');
    else if (type === 'break') applyDuration(0, 5, 'break');
    else if (type === 'oneHour') applyDuration(1, 0, 'oneHour');
    else if (type === 'twoHour') applyDuration(2, 0, 'twoHour');
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(totalSeconds);
  };

  const toggleRain = () => {
    if (isAmbientPlaying) {
      stopAmbientRain();
      setIsAmbientPlaying(false);
    } else {
      startAmbientRain(0.12);
      setIsAmbientPlaying(true);
    }
  };

  if (!isOpen) return null;

  const displayHours = Math.floor(secondsLeft / 3600);
  const displayMinutes = Math.floor((secondsLeft % 3600) / 60);
  const displaySeconds = secondsLeft % 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const getModeLabel = () => {
    if (timerMode === 'focus') return '25m Focus Session';
    if (timerMode === 'break') return '5m Rest Break';
    if (timerMode === 'oneHour') return '1 Hour Study Block';
    if (timerMode === 'twoHour') return '2 Hours Deep Focus';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}Custom Session`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF6EF] rounded-3xl shadow-2xl border border-[#E0D5C3] overflow-hidden flex flex-col max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E8DFC9] flex items-center justify-between bg-white/70 sticky top-0 z-10 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍵</span>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#37343C]">Study Café Timer</h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Set exact hours and minutes for gentle, pressure-free focus
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isAmbientPlaying) {
                stopAmbientRain();
                setIsAmbientPlaying(false);
              }
              onClose();
            }}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-center">
          {/* Quick 1-click Preset Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-stone-200/80">
            {(
              [
                { id: 'focus', label: '25m Work', icon: '🍵' },
                { id: 'break', label: '5m Rest', icon: '🍡' },
                { id: 'oneHour', label: '1h Study', icon: '📖' },
                { id: 'twoHour', label: '2h Deep', icon: '🎯' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                className={`py-1.5 px-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  timerMode === preset.id
                    ? 'bg-[#37343C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Direct Hours & Minutes Setter */}
          <div className="bg-white/95 p-3 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-purple-600" />
                <span>Set Exact Time Directly:</span>
              </span>
              {isActive && (
                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Timer Running
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              {/* Hours input */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-400">
                <input
                  type="number"
                  min="0"
                  max="12"
                  disabled={isActive}
                  value={inputHours}
                  onChange={handleHoursChange}
                  className="w-10 text-center font-mono font-bold text-base text-stone-800 bg-transparent focus:outline-hidden disabled:opacity-40"
                  title="Directly enter hours (e.g. 2 for 2 hours)"
                />
                <span className="text-xs text-stone-500 font-semibold font-serif">hours</span>
              </div>

              <span className="text-xl font-bold text-stone-400 font-mono">:</span>

              {/* Minutes input */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-400">
                <input
                  type="number"
                  min="0"
                  max="59"
                  disabled={isActive}
                  value={inputMinutes}
                  onChange={handleMinutesChange}
                  className="w-10 text-center font-mono font-bold text-base text-stone-800 bg-transparent focus:outline-hidden disabled:opacity-40"
                  title="Directly enter minutes (0-59)"
                />
                <span className="text-xs text-stone-500 font-semibold font-serif">mins</span>
              </div>
            </div>
          </div>

          {/* Circular Countdown Dial */}
          <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center rounded-full bg-white border-4 border-[#E8DFC9] shadow-inner my-2">
            <div
              className="absolute inset-0 rounded-full border-4 border-amber-600/70 transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${progressPercent > 25 ? '100% 0%' : '50% 0%'}, ${
                  progressPercent > 50 ? '100% 100%' : progressPercent > 25 ? '100% 0%' : '50% 0%'
                }, ${
                  progressPercent > 75
                    ? '0% 100%'
                    : progressPercent > 50
                    ? '100% 100%'
                    : '50% 0%'
                }, ${progressPercent >= 100 ? '0% 0%' : '50% 0%'})`,
              }}
            />
            <span className="text-3xl sm:text-4xl font-mono font-bold text-stone-800 tracking-wider">
              {displayHours > 0
                ? `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`
                : `${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`}
            </span>
            <span className="text-[11px] text-stone-600 mt-1 uppercase font-serif tracking-wider px-2 truncate max-w-[170px]">
              {getModeLabel()}
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-white border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={toggleTimer}
              className="px-6 py-3 rounded-2xl bg-[#37343C] hover:bg-stone-800 text-white font-medium flex items-center gap-2 shadow-sm transition cursor-pointer text-sm"
            >
              {isActive ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
              <span>{isActive ? 'Pause' : 'Start Timer'}</span>
            </button>

            <button
              onClick={toggleRain}
              className={`p-3 rounded-2xl border transition cursor-pointer shadow-2xs ${
                isAmbientPlaying
                  ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
              title={isAmbientPlaying ? 'Mute Café Rain' : 'Play Café Rain'}
              aria-label="Toggle ambient rain sounds"
            >
              {isAmbientPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* Ambient sound helper */}
          <div className="text-xs text-stone-600 flex items-center justify-center gap-1.5 pt-1">
            <Sparkles size={12} className="text-amber-500" />
            <span>
              {isAmbientPlaying
                ? '🌧️ Gentle café rain playing in background'
                : 'Click speaker for soothing café rain sounds'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
