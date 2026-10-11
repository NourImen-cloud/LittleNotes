import React from 'react';
import type { KawaiiSticker } from '../types';


export const StickerBadge: React.FC<{ sticker?: KawaiiSticker; className?: string }> = ({
  sticker,
  className = 'w-7 h-7',
}) => {
  if (!sticker || sticker === 'none') return null;

  switch (sticker) {
    case 'panda':
      return (
        <span className={`inline-block ${className}`} title="Cozy Panda">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
            {/* Bamboo branch behind */}
            <path d="M6 32C10 24 16 18 24 14" stroke="#4B7A54" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14 20C18 17 22 19 25 18" stroke="#719C79" strokeWidth="2" strokeLinecap="round" />
            {/* Panda head */}
            <circle cx="20" cy="20" r="10" fill="#FFFFFF" stroke="#37343C" strokeWidth="1.5" />
            {/* Ears */}
            <circle cx="12" cy="12" r="3.5" fill="#37343C" />
            <circle cx="28" cy="12" r="3.5" fill="#37343C" />
            {/* Eyes */}
            <ellipse cx="16" cy="19" rx="2" ry="2.6" fill="#37343C" />
            <ellipse cx="24" cy="19" rx="2" ry="2.6" fill="#37343C" />
            <circle cx="16.5" cy="18.5" r="0.7" fill="#FFFFFF" />
            <circle cx="24.5" cy="18.5" r="0.7" fill="#FFFFFF" />
            {/* Nose & Mouth */}
            <ellipse cx="20" cy="23" rx="1.5" ry="1.2" fill="#37343C" />
            {/* Cheeks */}
            <circle cx="14" cy="22" r="1.5" fill="#F4A7B9" opacity="0.6" />
            <circle cx="26" cy="22" r="1.5" fill="#F4A7B9" opacity="0.6" />
          </svg>
        </span>
      );

    case 'duck':
      return (
        <span className={`inline-block ${className}`} title="Little Duck">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
            {/* Duck Body */}
            <ellipse cx="18" cy="22" rx="9" ry="7" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
            {/* Duck Head */}
            <circle cx="21" cy="15" r="6" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
            {/* Beak */}
            <path d="M26 15C29 16 30 18 26 19Z" fill="#F97316" />
            {/* Eye */}
            <circle cx="22" cy="14" r="1" fill="#37343C" />
            {/* Cheek blush */}
            <circle cx="19.5" cy="17" r="1.2" fill="#FB7185" opacity="0.6" />
            {/* Water ripple */}
            <path d="M8 29C14 27 22 27 28 29" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      );

    case 'cat':
      return (
        <span className={`inline-block ${className}`} title="Teacup Kitty">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
            {/* Teacup bottom */}
            <path d="M10 21C10 27 15 30 20 30C25 30 30 27 30 21H10Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
            <path d="M30 23C32 23 33 24 33 25.5C33 27 32 28 30 28" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
            {/* Kitty head peeking */}
            <circle cx="20" cy="16" r="7" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.2" />
            {/* Cat Ears */}
            <polygon points="14,12 16,7 19,10" fill="#FDBA74" stroke="#EA580C" strokeWidth="1" />
            <polygon points="21,10 24,7 26,12" fill="#FDBA74" stroke="#EA580C" strokeWidth="1" />
            {/* Eyes */}
            <circle cx="17.5" cy="15.5" r="0.9" fill="#37343C" />
            <circle cx="22.5" cy="15.5" r="0.9" fill="#37343C" />
            {/* Nose & whiskers */}
            <circle cx="20" cy="17.5" r="0.8" fill="#F43F5E" />
            <line x1="14" y1="17" x2="11" y2="16.5" stroke="#37343C" strokeWidth="0.8" />
            <line x1="26" y1="17" x2="29" y2="16.5" stroke="#37343C" strokeWidth="0.8" />
          </svg>
        </span>
      );

    case 'strawberry':
      return (
        <span className={`inline-block ${className}`} title="Sweet Strawberry">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
            {/* Strawberry berry */}
            <path
              d="M18 10C24 10 27 16 25 24C23 29 19 32 18 32C17 32 13 29 11 24C9 16 12 10 18 10Z"
              fill="#F43F5E"
              stroke="#BE123C"
              strokeWidth="1.5"
            />
            {/* Leaf crown */}
            <path d="M18 10L14 7M18 10L22 7M18 10L18 5M18 10L12 11M18 10L24 11" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
            {/* Seeds */}
            <circle cx="15" cy="16" r="0.8" fill="#FEF08A" />
            <circle cx="21" cy="16" r="0.8" fill="#FEF08A" />
            <circle cx="18" cy="20" r="0.8" fill="#FEF08A" />
            <circle cx="15" cy="24" r="0.8" fill="#FEF08A" />
            <circle cx="21" cy="24" r="0.8" fill="#FEF08A" />
          </svg>
        </span>
      );

    case 'robot':
      return (
        <span className={`inline-block ${className}`} title="Study Bot">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
            {/* Antenna */}
            <line x1="18" y1="9" x2="18" y2="5" stroke="#71717A" strokeWidth="1.5" />
            <circle cx="18" cy="4" r="1.5" fill="#EF4444" />
            {/* Head */}
            <rect x="11" y="9" width="14" height="13" rx="3" fill="#E4E4E7" stroke="#52525B" strokeWidth="1.5" />
            {/* Red Headphones */}
            <rect x="8" y="12" width="3" height="7" rx="1.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            <rect x="25" y="12" width="3" height="7" rx="1.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            {/* Screen eyes */}
            <ellipse cx="15" cy="15" rx="1.5" ry="2" fill="#3B82F6" />
            <ellipse cx="21" cy="15" rx="1.5" ry="2" fill="#3B82F6" />
            {/* Smile */}
            <path d="M15 19C16.5 20.2 19.5 20.2 21 19" stroke="#52525B" strokeWidth="1.2" strokeLinecap="round" />
            {/* Body */}
            <path d="M13 22H23V29H13Z" fill="#D4D4D8" stroke="#52525B" strokeWidth="1.5" />
          </svg>
        </span>
      );

    case 'carrot':
      return (
        <span className={`inline-block ${className}`} title="Sweet Carrot">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
            {/* Carrot top leaves */}
            <path d="M22 10L27 6M22 10L25 4M22 10L20 5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
            {/* Carrot cone */}
            <path d="M22 10L11 26C10 27.5 12 29 13.5 28L25 15C26 13.5 24 11 22 10Z" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            {/* Stripes */}
            <line x1="16" y1="19" x2="19" y2="18" stroke="#FED7AA" strokeWidth="1" />
            <line x1="13" y1="24" x2="16" y2="23" stroke="#FED7AA" strokeWidth="1" />
          </svg>
        </span>
      );

    default:
      return null;
  }
};
