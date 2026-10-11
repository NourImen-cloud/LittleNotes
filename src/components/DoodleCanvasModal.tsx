import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, Highlighter, Eraser } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveDoodle: (dataUrl: string) => void;
  initialDoodle?: string;
}

export const DoodleCanvasModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveDoodle,
  initialDoodle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState('#37343C');
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialDoodle) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialDoodle;
    }
  }, [isOpen, initialDoodle]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 6;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color + '55'; // Alpha transparency
      ctx.lineWidth = strokeWidth * 5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
    }

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDoodle(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FAF6EF] rounded-3xl shadow-2xl border border-[#E0D5C3] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header directly inspired by tablet stylus toolbar in mockup */}
        <div className="px-5 py-3 border-b border-[#E8DFC9] flex flex-wrap items-center justify-between gap-3 bg-white/70">
          <div className="flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <h3 className="text-base font-serif font-semibold text-[#37343C]">
              Doodle & Sketch Canvas
            </h3>
          </div>

          {/* Tools */}
          <div className="flex items-center gap-1.5 bg-[#FAF6EF] p-1 rounded-2xl border border-stone-200">
            <button
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded-xl transition ${
                tool === 'pen' ? 'bg-[#37343C] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Fine Pen"
            >
              <PenTool size={15} />
            </button>
            <button
              onClick={() => setTool('highlighter')}
              className={`p-1.5 rounded-xl transition ${
                tool === 'highlighter' ? 'bg-[#37343C] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Soft Highlighter"
            >
              <Highlighter size={15} />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded-xl transition ${
                tool === 'eraser' ? 'bg-[#37343C] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Eraser"
            >
              <Eraser size={15} />
            </button>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-1.5">
            {['#37343C', '#F43F5E', '#3B82F6', '#22C55E', '#EAB308'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('pen');
                }}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border-2 transition ${
                  color === c && tool !== 'eraser' ? 'scale-125 border-stone-900 ring-2 ring-stone-400' : 'border-white'
                }`}
              />
            ))}
          </div>

          {/* Stroke thickness */}
          <div className="flex items-center gap-1 bg-[#FAF6EF] p-1 rounded-2xl border border-stone-200 text-xs">
            {[
              { label: 'Fine', width: 1.5 },
              { label: 'Med', width: 3 },
              { label: 'Bold', width: 6 },
            ].map((sw) => (
              <button
                key={sw.label}
                onClick={() => setStrokeWidth(sw.width)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  strokeWidth === sw.width ? 'bg-[#37343C] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {sw.label}
              </button>
            ))}
          </div>



          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawing Surface on Grid Paper */}
        <div className="p-4 bg-[#F2ECE0]/40 flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-80 rounded-2xl bg-white border border-[#E5DAC8] grid-paper-bg cursor-crosshair shadow-inner touch-none"
          />
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#E8DFC9] flex items-center justify-between bg-white/70">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition"
          >
            <RotateCcw size={13} />
            <span>Clear Canvas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#37343C] text-white rounded-xl text-xs font-medium hover:bg-stone-800 shadow-xs cursor-pointer"
            >
              <Check size={14} />
              <span>Attach Sketch to Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
