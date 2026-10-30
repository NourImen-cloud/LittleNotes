import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { startAmbientRain, stopAmbientRain, playGentleChime } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyTimerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break' | 'deep' | 'custom'>('focus');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

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
      alert(timerMode === 'break' ? '🌿 Rest finished! Ready to capture more thoughts?' : '🍵 Focus session complete! Time for a rest.');
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, timerMode]);

  const selectPreset = (type: 'focus' | 'break' | 'deep') => {
    setTimerMode(type);
    setIsActive(false);
    const secs = type === 'focus' ? 25 * 60 : type === 'break' ? 5 * 60 : 50 * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const setCustomMinutes = (mins: number) => {
    const valid = Math.max(1, Math.min(180, mins));
    setIsActive(false);
    setTimerMode('custom');
    const secs = valid * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const adjustMinutes = (delta: number) => {
    const currentMins = Math.round(secondsLeft / 60);
    setCustomMinutes(currentMins + delta);
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

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF6EF] rounded-3xl shadow-2xl border border-[#E0D5C3] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍵</span>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#37343C]">Study Café Timer</h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Gentle focus without high pressure
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
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preset switch */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 text-center">
          <div className="flex justify-center gap-1.5 sm:gap-2 bg-white/80 p-1.5 rounded-2xl border border-stone-200/80">
            {(
              [
                { id: 'focus', label: '25m Work', icon: '🍵' },
                { id: 'break', label: '5m Rest', icon: '🍡' },
                { id: 'deep', label: '50m Deep', icon: '📖' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  timerMode === preset.id
                    ? 'bg-[#37343C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                <span>{preset.icon}</span> <span className="ml-0.5">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Duration Stepper & Input */}
          <div className="flex items-center justify-between bg-white/90 p-2 px-3 rounded-2xl border border-stone-200/90 text-xs shadow-2xs">
            <span className="text-stone-500 font-medium text-[11px]">
              {isActive ? '⏱️ Running' : '✏️ Set Duration:'}
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                disabled={isActive}
                onClick={() => adjustMinutes(-5)}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-lg text-stone-700 font-semibold transition text-xs cursor-pointer"
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                disabled={isActive}
                onClick={() => adjustMinutes(-1)}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-lg text-stone-700 font-semibold transition text-xs cursor-pointer"
                title="Subtract 1 minute"
              >
                -1m
              </button>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-lg">
                <input
                  type="number"
                  min="1"
                  max="180"
                  disabled={isActive}
                  value={Math.max(1, Math.round(totalSeconds / 60))}
                  onChange={(e) => setCustomMinutes(Number(e.target.value) || 1)}
                  className="w-10 text-center font-mono font-bold text-xs text-stone-800 bg-transparent focus:outline-hidden disabled:opacity-50"
                  title="Type custom minutes (1-180)"
                />
                <span className="text-[10px] text-stone-400 font-mono">min</span>
              </div>
              <button
                type="button"
                disabled={isActive}
                onClick={() => adjustMinutes(1)}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-lg text-stone-700 font-semibold transition text-xs cursor-pointer"
                title="Add 1 minute"
              >
                +1m
              </button>
              <button
                type="button"
                disabled={isActive}
                onClick={() => adjustMinutes(5)}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-lg text-stone-700 font-semibold transition text-xs cursor-pointer"
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>
          </div>

          {/* Big timer circle */}
          <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center rounded-full bg-white border-4 border-[#E8DFC9] shadow-inner">
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
            <span className="text-4xl font-mono font-bold text-stone-800 tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-stone-600 mt-1 uppercase font-serif tracking-widest">
              {timerMode === 'focus'
                ? '25m Work Focus'
                : timerMode === 'break'
                ? '5m Rest Break'
                : timerMode === 'deep'
                ? '50m Deep Study'
                : `${Math.round(totalSeconds / 60)}m Custom Focus`}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-white border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={toggleTimer}
              className="px-6 py-3 rounded-2xl bg-[#37343C] hover:bg-stone-800 text-white font-medium flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              {isActive ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
              <span>{isActive ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={toggleRain}
              className={`p-3 rounded-2xl border transition cursor-pointer ${
                isAmbientPlaying
                  ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
              title={isAmbientPlaying ? 'Mute Café Rain' : 'Play Café Rain'}
            >
              {isAmbientPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* Ambient sound helper */}
          <div className="text-xs text-stone-600 flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>
              {isAmbientPlaying
                ? '🌧️ Gentle café rain audio playing in background'
                : 'Click speaker for soothing café rain sounds'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
