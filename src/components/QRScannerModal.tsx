import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { X, Camera, AlertCircle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import type { Note, Notebook } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (data: { notes: Note[]; notebooks: Notebook[] }) => void;
  onPairCode: (code: string) => void;
}

export const QRScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportData,
  onPairCode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsSuccess(false);
    setCameraError(null);

    let isScanning = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          requestAnimationFrame(scanFrame);
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. You can allow camera access in browser settings or upload a QR image.'
            : 'Unable to access camera on this device. You can upload a photo of the QR code instead.'
        );
      }
    }

    function scanFrame() {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleScannedResult(code.data);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }

    startCamera();

    return () => {
      isScanning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleScannedResult = (scannedText: string) => {
    if (!scannedText) return;

    // 1. Direct Beamed Data payload
    if (scannedText.startsWith('littlenotes:beam:')) {
      try {
        const rawJson = decodeURIComponent(scannedText.replace('littlenotes:beam:', ''));
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed.notes)) {
          setIsSuccess(true);
          onImportData({
            notes: parsed.notes,
            notebooks: Array.isArray(parsed.notebooks) ? parsed.notebooks : [],
          });
          setTimeout(() => {
            onClose();
          }, 1200);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse beamed notes payload', err);
      }
    }

    // 2. URL containing ?sync=LN-XXXX
    try {
      if (scannedText.includes('sync=')) {
        const url = new URL(scannedText);
        const code = url.searchParams.get('sync');
        if (code) {
          setIsSuccess(true);
          onPairCode(code.trim().toUpperCase());
          setTimeout(() => {
            onClose();
          }, 1200);
          return;
        }
      }
    } catch {}

    // 3. Raw sync code e.g. "LN-XXXX"
    if (/^LN-[A-Z0-9]{4}$/i.test(scannedText.trim())) {
      setIsSuccess(true);
      onPairCode(scannedText.trim().toUpperCase());
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    alert(`Scanned content: ${scannedText.slice(0, 60)}...\nNot a recognized LittleNotes sync code.`);
  };

  const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleScannedResult(code.data);
        } else {
          alert('Could not find a valid QR code in this image.');
        }
      }
    };
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6EF] border border-[#DFCDB3] rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200/80 bg-white/60">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-purple-700" />
            <span className="font-serif font-bold text-stone-800 text-sm">
              Scan LittleNotes QR Code
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner border border-stone-800">
            {cameraError ? (
              <div className="p-4 text-center text-xs text-rose-300 space-y-2">
                <AlertCircle size={28} className="mx-auto text-rose-400" />
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ImageIcon size={13} />
                  <span>Upload QR Image</span>
                </button>
              </div>
            ) : isSuccess ? (
              <div className="flex flex-col items-center justify-center text-emerald-400 space-y-2 animate-in zoom-in-90 duration-200">
                <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
                <span className="text-sm font-semibold text-white">Imported Successfully!</span>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Frame */}
                <div className="absolute inset-8 border-2 border-purple-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  <div className="w-full h-0.5 bg-purple-400 shadow-[0_0_8px_#A855F7] animate-pulse" />
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-stone-500 text-center mt-3 max-w-xs">
            Point your camera at the QR code on your PC screen to instantly beam your notes.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileScan}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200/80 bg-white/60 flex items-center justify-between text-xs text-stone-500">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer font-medium"
          >
            <ImageIcon size={13} />
            <span>Upload Image</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium transition cursor-pointer text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
