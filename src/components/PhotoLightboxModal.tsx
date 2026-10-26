import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  photoUrl: string | null;
  title?: string;
  onClose: () => void;
}

const PhotoLightboxContent: React.FC<{
  photoUrl: string;
  title?: string;
  onClose: () => void;
}> = ({ photoUrl, title, onClose }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `photo-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl flex items-center justify-between py-2 px-4 bg-stone-900/80 border border-stone-800 rounded-2xl text-stone-200"
      >
        <span className="text-sm font-medium truncate max-w-[280px] sm:max-w-md text-stone-300">
          {title || 'Photo Preview'}
        </span>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono text-stone-400 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Reset zoom"
          >
            <RotateCcw size={15} />
          </button>

          <div className="h-4 w-px bg-stone-700 mx-1" />

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 transition cursor-pointer"
            title="Download image"
          >
            <Download size={16} />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition ml-1 cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 w-full max-w-4xl flex items-center justify-center p-2 overflow-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="transition-transform duration-150 ease-out cursor-default"
          style={{ transform: `scale(${scale})` }}
        >
          <img
            src={photoUrl}
            alt={title || 'Attached photo'}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-stone-800"
          />
        </div>
      </div>

      {/* Bottom hint */}
      <div className="text-[11px] text-stone-400 pb-1">
        Click anywhere outside or press Esc to close
      </div>
    </div>
  );
};

export const PhotoLightboxModal: React.FC<Props> = ({
  isOpen,
  photoUrl,
  title,
  onClose,
}) => {
  if (!isOpen || !photoUrl) return null;

  return (
    <PhotoLightboxContent
      photoUrl={photoUrl}
      title={title}
      onClose={onClose}
    />
  );
};
