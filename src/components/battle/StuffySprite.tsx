'use client';

import React from 'react';
import { StuffyState } from '@/types/game';
import { STUFFY_MAP } from '@/data/stuffies';

interface StuffySpriteProps {
  stuffy: StuffyState;
  size?: number;
  isAttacking?: boolean;
  isTakingDamage?: boolean;
  isHealed?: boolean;
  isFacingLeft?: boolean;
  onClick?: () => void;
  selected?: boolean;
  highlightTarget?: boolean;
  isEnemy?: boolean;
}

export const StuffySprite: React.FC<StuffySpriteProps> = ({
  stuffy,
  size = 96,
  isAttacking = false,
  isTakingDamage = false,
  isHealed = false,
  isFacingLeft = false,
  onClick,
  selected = false,
  highlightTarget = false,
  isEnemy = false,
}) => {
  const species = STUFFY_MAP.get(stuffy.speciesId);
  let color = species?.color || '#94a3b8';
  let accent = species?.accentColor || '#64748b';
  let secondary = species?.secondaryColor || '#ffffff';

  if (stuffy.speciesId === 'george') {
    const isAngry = stuffy.georgeMode === 'angry';
    color = isAngry ? '#ef4444' : '#3b82f6';
    accent = isAngry ? '#b91c1c' : '#1d4ed8';
    secondary = isAngry ? '#fca5a5' : '#93c5fd';
  }

  const isUnstuffed = stuffy.isUnstuffed;
  const isBrainDamaged = stuffy.statusEffects.some((s) => s.type === 'brain_damaged');
  const isCrackTrapped = stuffy.statusEffects.some((s) => s.type === 'earthquake_crack');
  const isPoisoned = stuffy.statusEffects.some((s) => s.type === 'poison');
  const isTaunting = stuffy.statusEffects.some((s) => s.type === 'taunt');
  const isOnFire = stuffy.statusEffects.some((s) => s.type === 'fire');
  const isBleedingStuffing = stuffy.statusEffects.some((s) => s.type === 'bleeding_stuffing');
  const isSleeping = stuffy.speciesId === 'big_bear' && stuffy.isAsleep !== false;
  const isColossal = stuffy.speciesId === 'big_bear' || stuffy.speciesId === 'amalgam';

  const effectiveSize = isColossal ? Math.round(size * 1.22) : size;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${selected ? 'ring-4 ring-yellow-400 rounded-lg p-1 scale-105' : ''} ${
        highlightTarget ? 'ring-4 ring-red-500 rounded-lg p-1 animate-pulse' : ''
      }`}
      style={{
        width: effectiveSize,
        height: effectiveSize,
        transform: `${
          isAttacking
            ? isEnemy
              ? 'translateY(36px) scale(1.2)'
              : 'translateY(-36px) scale(1.2)'
            : ''
        } ${isTakingDamage ? 'translateX(-8px) rotate(-8deg) scale(0.92)' : ''} ${
          isHealed ? 'scale(1.15)' : ''
        }`.trim() || undefined,
      }}
    >
      {/* Ground Crack Hazard Indicator */}
      {isCrackTrapped && (
        <div className="absolute -bottom-2 z-10 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500 text-[9px] font-pixel text-amber-300 font-bold shadow-lg flex items-center gap-1 animate-bounce pointer-events-none">
          <span>⚡</span>
          <span>CRACKED</span>
          <span>⚡</span>
        </div>
      )}

      {/* SVG Pixel Artwork */}
      <svg
        viewBox="0 0 32 32"
        className={`w-full h-full drop-shadow-md ${
          isTakingDamage ? 'filter brightness-150 contrast-125' : ''
        } ${isHealed ? 'filter brightness-125 hue-rotate-30' : ''}`}
        style={{
          shapeRendering: 'crispEdges',
          transform: isFacingLeft ? 'scaleX(-1)' : 'none',
        }}
      >
        {isUnstuffed ? (
          // Unstuffed Deflated Plush Graphic
          <g>
            {/* Deflated body puddle */}
            <rect x="4" y="20" width="24" height="8" rx="3" fill={color} opacity="0.8" />
            <rect x="6" y="16" width="20" height="6" rx="2" fill={accent} opacity="0.7" />
            {/* Cotton stuffing leaking out */}
            <circle cx="8" cy="18" r="3" fill="#ffffff" />
            <circle cx="12" cy="16" r="2.5" fill="#f8fafc" />
            <circle cx="23" cy="19" r="3" fill="#ffffff" />
            <circle cx="25" cy="16" r="2" fill="#e2e8f0" />
            {/* Stitches across tear */}
            <line x1="14" y1="18" x2="18" y2="22" stroke="#475569" strokeWidth="1.5" />
            <line x1="18" y1="18" x2="14" y2="22" stroke="#475569" strokeWidth="1.5" />
            {/* X X button eyes */}
            <text x="7" y="24" fontSize="5" fill="#334155" fontFamily="monospace">x</text>
            <text x="21" y="24" fontSize="5" fill="#334155" fontFamily="monospace">x</text>
          </g>
        ) : (
          // Alive / Active Stuffy
          <g>
            {/* Species Specific Features & Body */}
            {renderSpeciesPixelArt(stuffy.speciesId, color, accent, secondary, stuffy)}

            {/* General Plush Stitch Accents */}
            <line x1="15" y1="16" x2="17" y2="16" stroke="#000000" strokeWidth="0.8" opacity="0.3" />
            <line x1="15" y1="20" x2="17" y2="20" stroke="#000000" strokeWidth="0.8" opacity="0.3" />
          </g>
        )}
      </svg>

      {/* Status Overlays */}
      {isBrainDamaged && (
        <div className="absolute -top-3 z-10 text-xs animate-spin font-bold" title="Brain Damaged!">
          💫🌀
        </div>
      )}
      {isPoisoned && (
        <div className="absolute -top-2 -right-1 z-10 text-xs animate-bounce" title="Poisoned!">
          ☠️💨
        </div>
      )}
      {isTaunting && (
        <div className="absolute -top-3 z-10 text-xs animate-pulse font-bold" title="Taunting (Shell Up)!">
          🛡️💢
        </div>
      )}
      {isOnFire && (
        <div className="absolute -top-3 -left-1 z-10 text-xs animate-bounce font-bold" title="ON FIRE! Discarding cards will damage a random ally until extinguished by healing!">
          🔥
        </div>
      )}
      {isBleedingStuffing && (
        <div className="absolute -top-3.5 -left-2 z-10 text-xs animate-pulse font-bold" title="Bleeding Stuffing! Neighbors exposed to poison & cracks!">
          🩸🧵
        </div>
      )}
      {isSleeping && (
        <div className="absolute -top-4 right-0 z-10 text-xs animate-bounce font-bold" title="Sound Asleep / Hibernating! (+15 Shield & +5 HP/turn)">
          💤
        </div>
      )}
    </div>
  );
};

function renderSpeciesPixelArt(
  speciesId: string,
  color: string,
  accent: string,
  secondary: string,
  stuffyObj?: StuffyState
): React.ReactNode {
  switch (speciesId) {
    case 'alex': // Pink Axolotl
      return (
        <g>
          {/* External Gills */}
          <rect x="3" y="8" width="5" height="3" fill={accent} />
          <rect x="2" y="12" width="6" height="3" fill={accent} />
          <rect x="3" y="16" width="5" height="3" fill={accent} />
          <rect x="24" y="8" width="5" height="3" fill={accent} />
          <rect x="24" y="12" width="6" height="3" fill={accent} />
          <rect x="24" y="16" width="5" height="3" fill={accent} />
          {/* Head & Body */}
          <rect x="8" y="7" width="16" height="15" rx="3" fill={color} />
          <rect x="9" y="19" width="14" height="10" rx="3" fill={color} />
          {/* Belly */}
          <rect x="12" y="21" width="8" height="6" fill={secondary} />
          {/* Cute Derp Eyes (facing slightly apart) */}
          <rect x="10" y="11" width="3" height="3" fill="#000000" />
          <rect x="19" y="11" width="3" height="3" fill="#000000" />
          <rect x="10" y="11" width="1" height="1" fill="#ffffff" />
          <rect x="21" y="11" width="1" height="1" fill="#ffffff" />
          {/* Durp Smile */}
          <rect x="14" y="16" width="4" height="2" fill="#be185d" />
          {/* Little stubby paws */}
          <rect x="6" y="23" width="4" height="3" fill={accent} />
          <rect x="22" y="23" width="4" height="3" fill={accent} />
        </g>
      );

    case 'jefe': // Blue Penguin ("Pudge")
      return (
        <g>
          {/* Chubby Penguin Body */}
          <rect x="6" y="8" width="20" height="20" rx="6" fill={color} />
          {/* Big White Pudge Belly */}
          <rect x="10" y="12" width="12" height="15" rx="4" fill={secondary} />
          {/* Flippers */}
          <rect x="3" y="13" width="4" height="10" rx="2" fill={accent} />
          <rect x="25" y="13" width="4" height="10" rx="2" fill={accent} />
          {/* Beak & Eyes */}
          <rect x="10" y="10" width="2" height="3" fill="#0f172a" />
          <rect x="20" y="10" width="2" height="3" fill="#0f172a" />
          <polygon points="14,13 18,13 16,17" fill="#f59e0b" />
          {/* Bow Tie */}
          <polygon points="13,18 19,18 16,19.5" fill="#ef4444" />
          <polygon points="13,21 19,21 16,19.5" fill="#ef4444" />
          {/* Little Orange Feet */}
          <rect x="9" y="28" width="5" height="3" fill="#f59e0b" />
          <rect x="18" y="28" width="5" height="3" fill="#f59e0b" />
        </g>
      );

    case 'finlee': // Orca Whale
      return (
        <g>
          {/* Dorsal Fin */}
          <polygon points="14,4 18,4 16,0" fill={color} />
          {/* Orca Sleek Body */}
          <rect x="4" y="7" width="24" height="18" rx="6" fill={color} />
          {/* White Belly */}
          <rect x="8" y="15" width="16" height="9" rx="3" fill={secondary} />
          {/* Iconic White Eye Patch */}
          <ellipse cx="10" cy="11" rx="3" ry="1.5" fill={secondary} />
          <rect x="9" y="11" width="2" height="2" fill="#000000" />
          {/* Sharp Little Plush Teeth */}
          <polygon points="18,15 19,17 20,15" fill={secondary} />
          <polygon points="21,15 22,17 23,15" fill={secondary} />
          {/* Flippers & Fluke */}
          <rect x="2" y="16" width="4" height="6" fill={accent} />
          <polygon points="27,14 31,10 31,18" fill={color} />
        </g>
      );

    case 'fifi': // Chubby Red Fox
      return (
        <g>
          {/* Fox Ears */}
          <polygon points="8,3 12,3 10,7" fill={color} />
          <polygon points="20,3 24,3 22,7" fill={color} />
          <polygon points="9,4 11,4 10,6" fill="#000000" />
          <polygon points="21,4 23,4 22,6" fill="#000000" />
          {/* Round Body */}
          <circle cx="16" cy="17" r="10" fill={color} />
          {/* Cream Muzzle */}
          <ellipse cx="16" cy="18" rx="5" ry="3.5" fill={secondary} />
          <rect x="15" y="16" width="2" height="2" fill="#000000" />
          {/* Eyes */}
          <rect x="12" y="13" width="2" height="2" fill="#000000" />
          <rect x="18" y="13" width="2" height="2" fill="#000000" />
          {/* Bushy Tail with white tip */}
          <circle cx="26" cy="19" r="5" fill={color} />
          <circle cx="28" cy="19" r="2.5" fill={secondary} />
          {/* Little green gas puff */}
          <circle cx="28" cy="25" r="1.5" fill="#22c55e" opacity="0.6" />
        </g>
      );

    case 'thumper': // Grey Hammerhead Shark
      return (
        <g>
          {/* Hammerhead T-Bar */}
          <rect x="2" y="7" width="28" height="7" rx="2" fill={color} />
          {/* Eyes on outer edges of hammerhead */}
          <circle cx="4" cy="10" r="1.5" fill="#000000" />
          <circle cx="28" cy="10" r="1.5" fill="#000000" />
          {/* Torso */}
          <rect x="9" y="12" width="14" height="15" rx="3" fill={color} />
          <rect x="11" y="15" width="10" height="11" fill={secondary} />
          {/* Dorsal Fin */}
          <polygon points="14,14 18,14 16,8" fill={accent} />
          {/* Boxing/Thumping Gloves */}
          <circle cx="7" cy="22" r="3.5" fill="#ef4444" />
          <circle cx="25" cy="22" r="3.5" fill="#ef4444" />
        </g>
      );

    case 'toothless': // Night Fury Dragon
      return (
        <g>
          {/* Dragon Ears/Nubs */}
          <polygon points="7,5 11,5 9,2" fill={color} />
          <polygon points="21,5 25,5 23,2" fill={color} />
          {/* Black Head & Body */}
          <rect x="6" y="6" width="20" height="20" rx="5" fill={color} />
          {/* Glowing Green Slit Eyes */}
          <ellipse cx="11" cy="12" rx="3" ry="2" fill={accent} />
          <rect x="11" y="11" width="1" height="3" fill="#000000" />
          <ellipse cx="21" cy="12" rx="3" ry="2" fill={accent} />
          <rect x="21" y="11" width="1" height="3" fill="#000000" />
          {/* Wings */}
          <polygon points="2,12 6,10 6,18" fill={secondary} />
          <polygon points="30,12 26,10 26,18" fill={secondary} />
          {/* Plasma Glow */}
          <circle cx="16" cy="18" r="2" fill="#38bdf8" opacity="0.8" />
        </g>
      );

    case 'riolu': // Riolu (Aura Medic)
      return (
        <g>
          {/* Aura Sensors (Headband drops) */}
          <rect x="6" y="8" width="3" height="9" rx="1" fill="#1e293b" />
          <rect x="23" y="8" width="3" height="9" rx="1" fill="#1e293b" />
          {/* Blue Head */}
          <circle cx="16" cy="11" r="7" fill={color} />
          {/* Black Mask */}
          <rect x="11" y="9" width="10" height="4" rx="1" fill="#1e293b" />
          <rect x="12" y="10" width="2" height="2" fill="#ef4444" />
          <rect x="18" y="10" width="2" height="2" fill="#ef4444" />
          {/* Body */}
          <rect x="11" y="17" width="10" height="11" rx="3" fill={color} />
          {/* Medic Cross on Chest */}
          <rect x="15" y="19" width="2" height="6" fill="#ef4444" />
          <rect x="13" y="21" width="6" height="2" fill="#ef4444" />
        </g>
      );

    case 'eevee': // Eevee (Creepy Lasers & Missiles)
      return (
        <g>
          {/* Long Pointy Ears */}
          <polygon points="6,0 11,4 8,9" fill={color} />
          <polygon points="26,0 21,4 24,9" fill={color} />
          {/* Head & Big Cream Collar */}
          <circle cx="16" cy="11" r="6" fill={color} />
          <ellipse cx="16" cy="18" rx="8" ry="4" fill={accent} />
          {/* Creepy Laser Eyes (Glowing Crimson) */}
          <circle cx="13" cy="10" r="1.8" fill="#ef4444" />
          <circle cx="19" cy="10" r="1.8" fill="#ef4444" />
          {/* Tiny Laser Array / Missile Pod on shoulder */}
          <rect x="23" y="16" width="5" height="4" rx="1" fill="#475569" />
          <circle cx="26" cy="18" r="1" fill="#f43f5e" />
          {/* Body */}
          <rect x="11" y="18" width="10" height="10" rx="3" fill={color} />
        </g>
      );

    case 'slugmee': // Yellow Slug (Murder Melodist)
      return (
        <g>
          {/* Eyestalks with eyes */}
          <line x1="12" y1="8" x2="10" y2="4" stroke={accent} strokeWidth="2" />
          <circle cx="10" cy="4" r="2" fill="#ffffff" />
          <circle cx="10" cy="4" r="1" fill="#000000" />
          <line x1="20" y1="8" x2="22" y2="4" stroke={accent} strokeWidth="2" />
          <circle cx="22" cy="4" r="2" fill="#ffffff" />
          <circle cx="22" cy="4" r="1" fill="#000000" />
          {/* Curvy Slug Body */}
          <ellipse cx="16" cy="19" rx="11" ry="8" fill={color} />
          <ellipse cx="16" cy="22" rx="9" ry="4" fill={secondary} />
          {/* Singing Mouth with Note */}
          <circle cx="16" cy="14" r="2" fill="#713f12" />
          <text x="23" y="12" fontSize="6" fill="#ca8a04">♪</text>
        </g>
      );

    case 'beaker': // Yosemite Owl (Wise & Passive Healer)
      return (
        <g>
          {/* Horn Tufts */}
          <polygon points="7,2 11,6 8,9" fill={color} />
          <polygon points="25,2 21,6 24,9" fill={color} />
          {/* Round Body */}
          <circle cx="16" cy="16" r="10" fill={color} />
          {/* Speckled Chest */}
          <ellipse cx="16" cy="19" rx="6" ry="7" fill={secondary} />
          {/* Round Glasses */}
          <circle cx="12" cy="13" r="3.5" fill="none" stroke="#d97706" strokeWidth="1.2" />
          <circle cx="20" cy="13" r="3.5" fill="none" stroke="#d97706" strokeWidth="1.2" />
          <line x1="15.5" y1="13" x2="16.5" y2="13" stroke="#d97706" strokeWidth="1.2" />
          {/* Amber Eyes & Beak */}
          <circle cx="12" cy="13" r="1.5" fill="#f59e0b" />
          <circle cx="20" cy="13" r="1.5" fill="#f59e0b" />
          <polygon points="15,16 17,16 16,19" fill="#f59e0b" />
        </g>
      );

    case 'henry': // Baby Turtle (Potty Tank)
      return (
        <g>
          {/* Big Baby Turtle Shell */}
          <circle cx="16" cy="16" r="11" fill={accent} />
          <circle cx="16" cy="16" r="8" fill={color} />
          {/* Shell Pattern */}
          <polygon points="16,10 20,13 20,19 16,22 12,19 12,13" fill="none" stroke="#14532d" strokeWidth="1" />
          {/* Tiny Baby Flippers */}
          <ellipse cx="6" cy="11" rx="3" ry="2" fill={secondary} />
          <ellipse cx="26" cy="11" rx="3" ry="2" fill={secondary} />
          <ellipse cx="8" cy="23" rx="2.5" ry="1.8" fill={secondary} />
          <ellipse cx="24" cy="23" rx="2.5" ry="1.8" fill={secondary} />
          {/* Baby Head with Wide Eyes */}
          <circle cx="16" cy="8" r="4.5" fill={secondary} />
          <circle cx="14" cy="7" r="1.5" fill="#000000" />
          <circle cx="18" cy="7" r="1.5" fill="#000000" />
          {/* Diaper Pin Badge */}
          <text x="14" y="24" fontSize="6">🧷</text>
        </g>
      );

    case 'dear': // Mini Poison Dart Frog
      return (
        <g>
          {/* Micro Dart Frog Body */}
          <ellipse cx="16" cy="18" rx="8" ry="6" fill={color} />
          {/* Poison Dots */}
          <circle cx="13" cy="16" r="1.2" fill={accent} />
          <circle cx="19" cy="16" r="1.2" fill={accent} />
          <circle cx="16" cy="19" r="1" fill={accent} />
          {/* Bulging Frog Eyes */}
          <circle cx="11" cy="12" r="3" fill={color} />
          <circle cx="11" cy="12" r="1.5" fill="#000000" />
          <circle cx="21" cy="12" r="3" fill={color} />
          <circle cx="21" cy="12" r="1.5" fill="#000000" />
          {/* Suction Cup Feet */}
          <circle cx="7" cy="21" r="2.2" fill={color} />
          <circle cx="25" cy="21" r="2.2" fill={color} />
        </g>
      );

    case 'cole': // Mini Turtle (Toddler Spinner)
      return (
        <g>
          {/* Spinning Turtle Shell */}
          <circle cx="16" cy="16" r="10" fill={color} />
          <circle cx="16" cy="16" r="6" fill={accent} />
          {/* Toddler Cap */}
          <polygon points="12,5 20,5 16,2" fill="#ef4444" />
          <circle cx="16" cy="2" r="1" fill="#ffffff" />
          {/* Head & Eyes */}
          <circle cx="16" cy="8" r="4" fill={secondary} />
          <circle cx="14" cy="8" r="1.2" fill="#000000" />
          <circle cx="18" cy="8" r="1.2" fill="#000000" />
          {/* Spin lines */}
          <path d="M 6 16 A 10 10 0 0 1 26 16" stroke="#facc15" strokeWidth="1" strokeDasharray="2,2" fill="none" />
        </g>
      );

    case 'joann': // Brown Cat (Table Disrupter)
      return (
        <g>
          {/* Pointy Cat Ears */}
          <polygon points="9,4 13,8 8,9" fill={color} />
          <polygon points="23,4 19,8 24,9" fill={color} />
          {/* Sleek Feline Body */}
          <rect x="8" y="9" width="16" height="17" rx="5" fill={color} />
          {/* Amber Sassy Eyes */}
          <ellipse cx="12" cy="13" rx="2" ry="1.5" fill={accent} />
          <rect x="12" y="12.5" width="0.8" height="2" fill="#000000" />
          <ellipse cx="20" cy="13" rx="2" ry="1.5" fill={accent} />
          <rect x="20" y="12.5" width="0.8" height="2" fill="#000000" />
          {/* Nose & Whiskers */}
          <polygon points="15.5,16 16.5,16 16,17" fill="#f43f5e" />
          <line x1="8" y1="16" x2="13" y2="16.5" stroke="#fed7aa" strokeWidth="0.8" />
          <line x1="24" y1="16" x2="19" y2="16.5" stroke="#fed7aa" strokeWidth="0.8" />
          {/* Swatting Paw */}
          <circle cx="24" cy="21" r="3" fill={secondary} />
        </g>
      );

    case 'cidney': // Really Fat Squirrel (Acorn Hoarder)
      return (
        <g>
          {/* Colossal Fluffy Squirrel Tail */}
          <circle cx="25" cy="13" r="7" fill={color} />
          <circle cx="26" cy="17" r="6" fill={color} />
          {/* Massive Chubby Body */}
          <ellipse cx="15" cy="18" rx="10" ry="9" fill={color} />
          <ellipse cx="14" cy="20" rx="7" ry="6" fill={secondary} />
          {/* Puffy Cheeks & Head */}
          <circle cx="14" cy="10" r="5.5" fill={color} />
          <circle cx="11" cy="11" r="1.5" fill="#000000" />
          <circle cx="17" cy="11" r="1.5" fill="#000000" />
          {/* Holding Giant Acorn */}
          <circle cx="14" cy="17" r="3.5" fill={accent} />
          <rect x="12" y="14" width="4" height="2" fill="#78350f" rx="1" />
        </g>
      );

    case 'chanteira': // Fat Dolphin (Tidal Chonker)
      return (
        <g>
          {/* Rotund Dolphin Body */}
          <ellipse cx="16" cy="17" rx="11" ry="8" fill={color} />
          {/* Chubby White Underbelly */}
          <ellipse cx="16" cy="21" rx="8" ry="4" fill={secondary} />
          {/* Curved Snout / Beak */}
          <ellipse cx="7" cy="16" rx="4" ry="2.5" fill={color} />
          {/* Happy Eye */}
          <circle cx="11" cy="14" r="1.5" fill="#000000" />
          {/* Dorsal Fin */}
          <polygon points="17,9 22,9 19,4" fill={accent} />
          {/* Blowhole Steam */}
          <circle cx="14" cy="7" r="1" fill="#e0f2fe" />
          <circle cx="13" cy="5" r="1.5" fill="#bae6fd" />
          {/* Flukes */}
          <polygon points="26,17 31,13 31,21" fill={color} />
        </g>
      );

    case 'dolphy': // Colossal Dolphin (Way Bigger than Chanteira!)
      return (
        <g>
          {/* Titanic Colossal Dolphin Body */}
          <ellipse cx="16" cy="18" rx="14" ry="10" fill={color} />
          {/* Massive Pale Chubby Underbelly */}
          <ellipse cx="16" cy="22" rx="10" ry="5.5" fill={secondary} />
          {/* Extended Dolphin Beak */}
          <ellipse cx="4" cy="17" rx="5" ry="3" fill={color} />
          {/* Serious Ocean Eye */}
          <circle cx="9" cy="15" r="2" fill="#0f172a" />
          <circle cx="8.5" cy="14.5" r="0.7" fill="#ffffff" />
          {/* High Towering Dorsal Fin */}
          <polygon points="15,8 23,8 18,1" fill={accent} />
          {/* Giant Blowhole Tidal Spout */}
          <ellipse cx="13" cy="5" rx="2" ry="3" fill="#38bdf8" opacity="0.85" />
          <circle cx="12" cy="2" r="1.5" fill="#bae6fd" />
          <circle cx="15" cy="3" r="1.2" fill="#e0f2fe" />
          {/* Massive Fluke Tail */}
          <polygon points="29,18 35,10 35,26" fill={color} />
          <polygon points="29,18 33,12 33,24" fill={accent} />
        </g>
      );

    case 'shadow': // Shadow the Hedgehog (Ultimate Lifeform)
      return (
        <g>
          {/* Black Hedgehog Body */}
          <ellipse cx="16" cy="19" rx="7.5" ry="8.5" fill="#0f172a" />
          {/* Iconic Crimson-Streaked Upward Quills */}
          <polygon points="13,13 5,3 15,8" fill="#0f172a" />
          <polygon points="12,11 6,4 14,8" fill="#dc2626" />
          <polygon points="17,11 25,2 19,8" fill="#0f172a" />
          <polygon points="18,10 24,3 19,8" fill="#dc2626" />
          <polygon points="11,15 2,10 13,14" fill="#0f172a" />
          <polygon points="11,15 4,11 12,14" fill="#dc2626" />
          <polygon points="20,15 29,10 18,14" fill="#0f172a" />
          <polygon points="19,15 27,11 18,14" fill="#dc2626" />
          {/* Head */}
          <circle cx="15" cy="13" r="6" fill="#0f172a" />
          {/* White Chest Fluff */}
          <ellipse cx="14" cy="18" rx="4" ry="3" fill="#f8fafc" />
          {/* Piercing Red Eye */}
          <polygon points="10,12 14,11 13,14" fill="#dc2626" />
          <circle cx="12" cy="13" r="0.8" fill="#000000" />
          {/* Golden Inhibitor Wrist Rings */}
          <rect x="8" y="19" width="3" height="2" fill="#eab308" rx="0.5" />
          <rect x="18" y="19" width="3" height="2" fill="#eab308" rx="0.5" />
          {/* Hover Shoes Accent */}
          <rect x="11" y="26" width="4" height="2" fill="#dc2626" rx="1" />
          <rect x="16" y="26" width="4" height="2" fill="#dc2626" rx="1" />
        </g>
      );

    case 'amalgam': // The Stuffy Amalgam (Fused Plush Nightmare)
      return (
        <g>
          {/* Fused Colossal Plush Body with Patchwork */}
          <ellipse cx="16" cy="17" rx="13" ry="11" fill={color} />
          {/* Secondary Chimera Underbelly */}
          <ellipse cx="14" cy="20" rx="9" ry="6" fill={secondary} opacity="0.6" />
          {/* Shark Fin on Left */}
          <polygon points="8,8 14,8 10,2" fill="#475569" />
          {/* Cat Ear on Right */}
          <polygon points="20,10 24,4 17,7" fill="#78350f" />
          {/* Slug Eye Stalk */}
          <line x1="14" y1="10" x2="13" y2="4" stroke="#facc15" strokeWidth="2" />
          <circle cx="13" cy="3" r="2" fill="#facc15" />
          <circle cx="13" cy="3" r="1" fill="#000000" />
          {/* Giant Purple Squirrel Tail */}
          <circle cx="27" cy="13" r="6" fill="#9333ea" />
          {/* Dolphin Fluke on bottom */}
          <polygon points="27,21 31,17 31,25" fill="#0284c7" />
          {/* Glowing Mismatched Eyes */}
          <circle cx="10" cy="13" r="2" fill="#dc2626" />
          <circle cx="18" cy="14" r="2.2" fill="#06b6d4" />
          {/* Unholy Cross Stitches Across Body */}
          <line x1="8" y1="17" x2="12" y2="17" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="10" y1="15" x2="10" y2="19" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="17" y1="21" x2="21" y2="21" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="19" y1="19" x2="19" y2="23" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      );

    case 'spot': // Spot (Put Me in the Zoo - Multicolored Polka Dot Animal)
      return (
        <g>
          {/* Curled Playful Tail */}
          <path d="M 23 23 Q 29 18 27 12 Q 25 8 28 6" stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="27" cy="11" r="1.5" fill="#ef4444" />
          <circle cx="26" cy="16" r="1.3" fill="#3b82f6" />
          {/* Main Body */}
          <ellipse cx="16" cy="18" rx="8" ry="7" fill="#eab308" />
          {/* Paws */}
          <circle cx="11" cy="24" r="2.5" fill="#ca8a04" />
          <circle cx="21" cy="24" r="2.5" fill="#ca8a04" />
          {/* Head */}
          <circle cx="16" cy="11" r="6" fill="#eab308" />
          {/* Round Ears */}
          <circle cx="11" cy="6" r="2.5" fill="#ca8a04" />
          <circle cx="21" cy="6" r="2.5" fill="#ca8a04" />
          <circle cx="11" cy="6" r="1.2" fill="#ef4444" />
          <circle cx="21" cy="6" r="1.2" fill="#3b82f6" />
          {/* Snout & Nose */}
          <ellipse cx="16" cy="12" rx="2.5" ry="1.8" fill="#fef08a" />
          <polygon points="15.2,11.2 16.8,11.2 16,12.2" fill="#1e293b" />
          {/* Big Cheerful Smile */}
          <path d="M 14.5 13 Q 16 14.2 17.5 13" stroke="#1e293b" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          {/* Playful Eyes */}
          <circle cx="14" cy="9.5" r="1.2" fill="#1e293b" />
          <circle cx="18" cy="9.5" r="1.2" fill="#1e293b" />
          <circle cx="13.7" cy="9.2" r="0.4" fill="#ffffff" />
          <circle cx="17.7" cy="9.2" r="0.4" fill="#ffffff" />
          {/* Iconic Multicolored Polka Dots Everywhere! */}
          <circle cx="13" cy="16" r="1.6" fill="#ef4444" /> {/* Red */}
          <circle cx="19" cy="16" r="1.7" fill="#3b82f6" /> {/* Blue */}
          <circle cx="16" cy="20" r="1.8" fill="#22c55e" /> {/* Green */}
          <circle cx="11" cy="19" r="1.4" fill="#a855f7" /> {/* Purple */}
          <circle cx="21" cy="19" r="1.5" fill="#f97316" /> {/* Orange */}
          <circle cx="16" cy="6.5" r="1.3" fill="#ec4899" /> {/* Pink */}
        </g>
      );

    case 'lint_vampire': // The Static Sapper (Strength Draining Boss)
      return (
        <g>
          {/* Swirling Dust & Static Aura */}
          <ellipse cx="16" cy="17" rx="12" ry="10" fill="#334155" opacity="0.9" />
          <circle cx="8" cy="12" r="5" fill="#475569" opacity="0.7" />
          <circle cx="24" cy="14" r="6" fill="#1e293b" opacity="0.8" />
          {/* Crackling Static Sparks */}
          <polygon points="6,6 9,10 7,11 11,15" fill="#38bdf8" />
          <polygon points="25,6 22,9 24,10 21,14" fill="#38bdf8" />
          <polygon points="15,2 17,5 15,6 18,9" fill="#facc15" />
          {/* Glowing Red Vampire Eyes */}
          <circle cx="12" cy="15" r="2.2" fill="#ef4444" />
          <circle cx="20" cy="15" r="2.2" fill="#ef4444" />
          <circle cx="12" cy="15" r="0.8" fill="#ffffff" />
          <circle cx="20" cy="15" r="0.8" fill="#ffffff" />
          {/* Vampire Fangs */}
          <polygon points="13,19 14,23 15,19" fill="#ffffff" />
          <polygon points="17,19 18,23 19,19" fill="#ffffff" />
        </g>
      );

    case 'toxic_slug': // Noxious Slime King (Compounding Poison Boss)
      return (
        <g>
          {/* Slime Trail */}
          <ellipse cx="16" cy="23" rx="14" ry="4" fill="#14532d" />
          {/* Massive Toxic Mollusk Body */}
          <ellipse cx="15" cy="18" rx="11" ry="8" fill="#15803d" />
          {/* Pulsing Spore Bubbles */}
          <circle cx="10" cy="14" r="3.2" fill="#84cc16" />
          <circle cx="19" cy="13" r="3.8" fill="#a3e635" />
          <circle cx="14" cy="11" r="2.5" fill="#bef264" />
          {/* Eye Stalks */}
          <line x1="11" y1="12" x2="9" y2="5" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="12" x2="20" y2="4" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="9" cy="5" r="2.2" fill="#84cc16" />
          <circle cx="20" cy="4" r="2.2" fill="#84cc16" />
          <circle cx="9" cy="5" r="1" fill="#000000" />
          <circle cx="20" cy="4" r="1" fill="#000000" />
          {/* Oozing Drips */}
          <circle cx="7" cy="24" r="1.5" fill="#a3e635" />
          <circle cx="24" cy="24" r="1.8" fill="#84cc16" />
        </g>
      );

    case 'clockwork_nuke': // Doomsday Chrono-Bear (Tactical Nuke Boss)
      return (
        <g>
          {/* Heavy Brass Bear Body */}
          <circle cx="16" cy="18" r="9" fill="#451a03" />
          {/* Round Bear Ears */}
          <circle cx="10" cy="8" r="3.5" fill="#78350f" />
          <circle cx="22" cy="8" r="3.5" fill="#78350f" />
          {/* Head */}
          <circle cx="16" cy="12" r="6" fill="#78350f" />
          {/* Glowing Radioactive Clockwork Core */}
          <circle cx="16" cy="18" r="5" fill="#facc15" />
          <circle cx="16" cy="18" r="4.2" fill="#ea580c" />
          {/* Clock Hands / Hazard Ticking Indicator */}
          <line x1="16" y1="18" x2="16" y2="15" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="18" x2="18.5" y2="18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="16" cy="18" r="1" fill="#000000" />
          {/* Ominous Red Optics */}
          <circle cx="14" cy="11" r="1.2" fill="#ef4444" />
          <circle cx="18" cy="11" r="1.2" fill="#ef4444" />
          {/* Radiation Warning Aura */}
          <polygon points="16,3 17.5,6 14.5,6" fill="#facc15" />
          <polygon points="16,31 17.5,28 14.5,28" fill="#facc15" />
        </g>
      );

    case 'cinder_beast': // Ignis the Cinder Drake (Fire & Burning Boss)
      return (
        <g>
          {/* Dragon Wings with Flame Edges */}
          <polygon points="16,14 4,6 7,18" fill="#ea580c" />
          <polygon points="16,14 28,6 25,18" fill="#ea580c" />
          <polygon points="16,14 5,9 8,16" fill="#fef08a" />
          <polygon points="16,14 27,9 24,16" fill="#fef08a" />
          {/* Searing Crimson Dragon Body */}
          <ellipse cx="16" cy="18" rx="8" ry="7" fill="#b91c1c" />
          {/* Spiked Tail */}
          <path d="M 23 20 Q 28 23 27 28" stroke="#b91c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <polygon points="27,27 30,28 28,31" fill="#f97316" />
          {/* Horned Head */}
          <polygon points="11,8 10,2 13,7" fill="#f97316" />
          <polygon points="21,8 22,2 19,7" fill="#f97316" />
          <circle cx="16" cy="11" r="5.5" fill="#b91c1c" />
          {/* Burning Eyes */}
          <circle cx="14" cy="10" r="1.4" fill="#fef08a" />
          <circle cx="18" cy="10" r="1.4" fill="#fef08a" />
          {/* Snout with Smoldering Embers */}
          <ellipse cx="16" cy="13" rx="2.5" ry="1.5" fill="#7f1d1d" />
          <circle cx="14" cy="15" r="1" fill="#f97316" />
          <circle cx="18" cy="15" r="1" fill="#f97316" />
        </g>
      );

    case 'grave_scavenger': // Scrappy the Graverobber (Plays Discard Pile)
      return (
        <g>
          {/* Heavy Burlap Discard Sack on Back */}
          <circle cx="23" cy="14" r="6" fill="#78350f" opacity="0.9" />
          <line x1="20" y1="11" x2="25" y2="17" stroke="#451a03" strokeWidth="1" />
          <line x1="25" y1="11" x2="20" y2="17" stroke="#451a03" strokeWidth="1" />
          {/* Striped Bandit Tail */}
          <path d="M 9 22 Q 4 20 6 14" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 8 20 Q 5 18 6 16" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Raccoon Body */}
          <ellipse cx="15" cy="18" rx="8" ry="7" fill="#334155" />
          {/* Head with Bandit Mask */}
          <circle cx="15" cy="11" r="5.5" fill="#475569" />
          <ellipse cx="15" cy="10.5" rx="5" ry="2.2" fill="#0f172a" />
          {/* Glowing Sly Eyes */}
          <circle cx="13" cy="10.5" r="1" fill="#facc15" />
          <circle cx="17" cy="10.5" r="1" fill="#facc15" />
          {/* Snout & Whiskers */}
          <polygon points="14,13 16,13 15,14" fill="#020617" />
          {/* Miniature Shovel / Bone */}
          <line x1="7" y1="17" x2="11" y2="24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <polygon points="10,23 13,26 8,26" fill="#64748b" />
        </g>
      );

    case 'mind_puppeteer': // Psychic Mind-Leech (Plays Draw Pile)
      return (
        <g>
          {/* Undulating Psychic Tentacles */}
          <path d="M 10 21 Q 6 26 10 29" stroke="#9333ea" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 14 22 Q 13 28 15 30" stroke="#9333ea" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 18 22 Q 19 28 17 30" stroke="#9333ea" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 22 21 Q 26 26 22 29" stroke="#9333ea" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Pulsing Cerebral Hood */}
          <ellipse cx="16" cy="14" rx="9" ry="8" fill="#581c87" />
          {/* Cerebral Brain Folds */}
          <path d="M 12 11 Q 14 8 16 11 Q 18 8 20 11" stroke="#c084fc" strokeWidth="1.5" fill="none" />
          <path d="M 13 14 Q 16 12 19 14" stroke="#c084fc" strokeWidth="1.2" fill="none" />
          {/* Glowing Psychic Third Eye */}
          <circle cx="16" cy="9" r="2.2" fill="#06b6d4" />
          <circle cx="16" cy="9" r="0.8" fill="#ffffff" />
          {/* Piercing Lower Eyes */}
          <circle cx="12" cy="16" r="1.4" fill="#a855f7" />
          <circle cx="20" cy="16" r="1.4" fill="#a855f7" />
          {/* Mind-Wave Aura */}
          <circle cx="16" cy="14" r="11" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="2,2" fill="none" opacity="0.6" />
        </g>
      );

    case 'aquatic_kraken': // Kraken the Abyssal (All-Aquatic Boss)
      return (
        <g>
          {/* Waving Oceanic Tentacles */}
          <path d="M 8 20 Q 3 24 6 28" stroke="#0f766e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 13 21 Q 11 27 13 30" stroke="#0f766e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 19 21 Q 21 27 19 30" stroke="#0f766e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 24 20 Q 29 24 26 28" stroke="#0f766e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          {/* Deep Sea Mantle */}
          <ellipse cx="16" cy="13" rx="8" ry="9" fill="#0f766e" />
          {/* Teal Glowing Suckers */}
          <circle cx="6" cy="25" r="1" fill="#2dd4bf" />
          <circle cx="12" cy="27" r="1" fill="#2dd4bf" />
          <circle cx="20" cy="27" r="1" fill="#2dd4bf" />
          <circle cx="26" cy="25" r="1" fill="#2dd4bf" />
          {/* Huge Yellow Depth Optics */}
          <circle cx="12" cy="15" r="2.2" fill="#facc15" />
          <circle cx="20" cy="15" r="2.2" fill="#facc15" />
          <circle cx="12" cy="15" r="1" fill="#020617" />
          <circle cx="20" cy="15" r="1" fill="#020617" />
        </g>
      );

    case 'aquatic_ray': // Manta the Oceanic Glider (All-Aquatic Boss)
      return (
        <g>
          {/* Broad Wings */}
          <polygon points="16,8 2,16 16,24 30,16" fill="#0284c7" />
          <polygon points="16,10 5,16 16,22 27,16" fill="#38bdf8" />
          {/* White Belly Keel */}
          <ellipse cx="16" cy="16" rx="4" ry="5" fill="#f0f9ff" />
          {/* Slender Whip Tail */}
          <line x1="16" y1="24" x2="16" y2="31" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          {/* Eye Horns / Cephalic Fins */}
          <polygon points="13,8 14,5 15,8" fill="#0284c7" />
          <polygon points="17,8 18,5 19,8" fill="#0284c7" />
          <circle cx="13" cy="11" r="1" fill="#020617" />
          <circle cx="19" cy="11" r="1" fill="#020617" />
        </g>
      );

    case 'tri_link_alpha': // Aegis the Bonded Shield (Life-Linked Trio)
      return (
        <g>
          {/* Golden Golem Shield Armor */}
          <rect x="8" y="8" width="16" height="18" rx="4" fill="#b45309" />
          <rect x="10" y="10" width="12" height="14" rx="2" fill="#f59e0b" />
          {/* Glowing Runic Eye */}
          <circle cx="16" cy="14" r="3" fill="#fef3c7" />
          <circle cx="16" cy="14" r="1.5" fill="#b45309" />
          {/* Life-Link Chain Link */}
          <circle cx="6" cy="17" r="2.5" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          <circle cx="26" cy="17" r="2.5" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="20" x2="20" y2="20" stroke="#78350f" strokeWidth="2" />
        </g>
      );

    case 'tri_link_beta': // Fang the Bonded Striker (Life-Linked Trio)
      return (
        <g>
          {/* Crimson Feral Wolf Body */}
          <ellipse cx="16" cy="18" rx="8" ry="7" fill="#991b1b" />
          {/* Wolf Ears */}
          <polygon points="10,12 8,5 13,9" fill="#ef4444" />
          <polygon points="22,12 24,5 19,9" fill="#ef4444" />
          {/* Wolf Snout & Fangs */}
          <circle cx="16" cy="13" r="5.5" fill="#991b1b" />
          <polygon points="14,14 18,14 16,18" fill="#fee2e2" />
          {/* Feral Eyes */}
          <circle cx="13" cy="11" r="1.2" fill="#fef08a" />
          <circle cx="19" cy="11" r="1.2" fill="#fef08a" />
          {/* Life-Link Chain */}
          <circle cx="5" cy="18" r="2.2" stroke="#ef4444" strokeWidth="1.5" fill="none" />
          <circle cx="27" cy="18" r="2.2" stroke="#ef4444" strokeWidth="1.5" fill="none" />
        </g>
      );

    case 'tri_link_gamma': // Talon the Bonded Mystic (Life-Linked Trio)
      return (
        <g>
          {/* Mystical Gryphon Wings */}
          <polygon points="16,16 4,10 7,22" fill="#6d28d9" />
          <polygon points="16,16 28,10 25,22" fill="#6d28d9" />
          {/* Gryphon Body */}
          <circle cx="16" cy="18" r="7" fill="#581c87" />
          {/* Head & Mystic Halo */}
          <circle cx="16" cy="11" r="5" fill="#6d28d9" />
          <circle cx="16" cy="6" r="3" stroke="#a855f7" strokeWidth="1.2" fill="none" />
          {/* Golden Curved Beak */}
          <polygon points="14,13 18,13 16,17" fill="#facc15" />
          {/* Mystic Purple Eyes */}
          <circle cx="13" cy="10" r="1.2" fill="#ede9fe" />
          <circle cx="19" cy="10" r="1.2" fill="#ede9fe" />
          {/* Life-Link Chain */}
          <circle cx="6" cy="18" r="2.2" stroke="#a855f7" strokeWidth="1.5" fill="none" />
          <circle cx="26" cy="18" r="2.2" stroke="#a855f7" strokeWidth="1.5" fill="none" />
        </g>
      );

    case 'shadow_hedgehog': // Shadow the Ultimate Lifeform Boss
      return (
        <g>
          {/* Signature Crimson Quills Swept Back */}
          <polygon points="16,12 6,4 12,12" fill="#dc2626" />
          <polygon points="16,12 26,4 20,12" fill="#dc2626" />
          <polygon points="16,12 4,12 11,16" fill="#dc2626" />
          <polygon points="16,12 28,12 21,16" fill="#dc2626" />
          {/* Jet-Black Body */}
          <circle cx="16" cy="18" r="8" fill="#09090b" />
          {/* White Chest Fluff */}
          <circle cx="16" cy="17" r="3.2" fill="#ffffff" />
          {/* Head */}
          <circle cx="16" cy="11" r="6" fill="#09090b" />
          {/* Red Eye Highlights */}
          <ellipse cx="13" cy="11" rx="1.8" ry="2.2" fill="#dc2626" />
          <ellipse cx="19" cy="11" rx="1.8" ry="2.2" fill="#dc2626" />
          <circle cx="13" cy="11" r="0.8" fill="#ffffff" />
          <circle cx="19" cy="11" r="0.8" fill="#ffffff" />
          {/* Hover Shoe Flames */}
          <polygon points="11,26 9,30 13,29" fill="#f97316" />
          <polygon points="21,26 19,29 23,30" fill="#f97316" />
        </g>
      );

    case 'mirror_mimic': // The Mirror Doppelganger Boss
      return (
        <g>
          {/* Reflective Chrome Diamond Form */}
          <polygon points="16,4 28,16 16,28 4,16" fill="#94a3b8" />
          <polygon points="16,7 25,16 16,25 7,16" fill="#e2e8f0" />
          {/* Mirrored Facets */}
          <line x1="16" y1="7" x2="16" y2="25" stroke="#475569" strokeWidth="1" />
          <line x1="7" y1="16" x2="25" y2="16" stroke="#475569" strokeWidth="1" />
          {/* Shimmer Sparkles */}
          <polygon points="12,12 13,10 14,12 16,13 14,14 13,16 12,14 10,13" fill="#ffffff" />
          <polygon points="20,20 21,19 22,20 23,21 22,22 21,23 20,22 19,21" fill="#ffffff" />
        </g>
      );

    case 'fluff_gorgon': // The Fluff Devourer Boss
      return (
        <g>
          {/* Colossal Stitched Maw */}
          <circle cx="16" cy="17" r="11" fill="#164e63" />
          {/* Gaping Cotton Gullet */}
          <ellipse cx="16" cy="18" rx="8" ry="6" fill="#083344" />
          {/* Unstitched Teeth / Fangs */}
          <polygon points="10,14 12,17 14,14" fill="#06b6d4" />
          <polygon points="15,14 17,17 19,14" fill="#06b6d4" />
          <polygon points="12,22 14,19 16,22" fill="#06b6d4" />
          <polygon points="17,22 19,19 21,22" fill="#06b6d4" />
          {/* Whirling Loose Fluff */}
          <circle cx="16" cy="18" r="2.5" fill="#f8fafc" opacity="0.6" />
          <circle cx="12" cy="8" r="1.5" fill="#06b6d4" />
          <circle cx="20" cy="8" r="1.5" fill="#06b6d4" />
        </g>
      );

    case 'volt_colossus': // Surge the Thunder Golem Boss
      return (
        <g>
          {/* Heavy Armored Body */}
          <rect x="7" y="10" width="18" height="16" rx="4" fill="#ca8a04" />
          {/* Central Tesla Spark Core */}
          <circle cx="16" cy="18" r="4.5" fill="#facc15" />
          <circle cx="16" cy="18" r="2" fill="#ffffff" />
          {/* Copper Tesla Coils on Shoulders */}
          <rect x="4" y="6" width="4" height="8" rx="1" fill="#b45309" />
          <rect x="24" y="6" width="4" height="8" rx="1" fill="#b45309" />
          {/* Electric Arcs */}
          <polygon points="5,4 8,2 7,5 10,4" fill="#38bdf8" />
          <polygon points="27,4 24,2 25,5 22,4" fill="#38bdf8" />
          {/* Golem Optic Visor */}
          <line x1="11" y1="12" x2="21" y2="12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );

    case 'george': { // Octopus George (Angry: Red, Happy: Blue)
      const isAngry = stuffyObj?.georgeMode === 'angry';
      return (
        <g>
          {/* Bulbous Octopus Head */}
          <ellipse cx="16" cy="11" rx="9" ry="8" fill={color} />
          {/* Forehead highlight */}
          <ellipse cx="13" cy="7" rx="3" ry="1.5" fill={secondary} opacity="0.6" />
          
          {/* 8 Curled Tentacles */}
          <path d="M 8 16 Q 4 20 5 26 Q 7 28 8 24" fill={accent} />
          <path d="M 11 17 Q 8 22 9 27 Q 11 29 12 25" fill={color} />
          <path d="M 13 18 Q 11 24 13 28 Q 15 29 15 25" fill={accent} />
          <path d="M 15 18 Q 14 24 16 28 Q 17 29 17 25" fill={color} />
          <path d="M 17 18 Q 18 24 18 28 Q 19 29 19 25" fill={color} />
          <path d="M 19 18 Q 21 24 19 28 Q 17 29 17 25" fill={accent} />
          <path d="M 21 17 Q 24 22 23 27 Q 21 29 20 25" fill={color} />
          <path d="M 24 16 Q 28 20 27 26 Q 25 28 24 24" fill={accent} />

          {/* Little Suction Cups */}
          <circle cx="5" cy="24" r="1" fill={secondary} />
          <circle cx="9" cy="25" r="1" fill={secondary} />
          <circle cx="13" cy="26" r="1" fill={secondary} />
          <circle cx="19" cy="26" r="1" fill={secondary} />
          <circle cx="23" cy="25" r="1" fill={secondary} />
          <circle cx="27" cy="24" r="1" fill={secondary} />

          {/* Expressive Eyes & Mood Expression */}
          {isAngry ? (
            <>
              {/* Angry slanted eyes and brows */}
              <line x1="10" y1="9" x2="14" y2="11" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="9" x2="18" y2="11" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2" fill="#ffffff" />
              <circle cx="12" cy="12" r="1" fill="#000000" />
              <circle cx="20" cy="12" r="2" fill="#ffffff" />
              <circle cx="20" cy="12" r="1" fill="#000000" />
              {/* Angry gritting mouth */}
              <line x1="13" y1="16" x2="19" y2="16" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
              {/* Small rage vein */}
              <polygon points="23,5 25,3 24,6 26,5" fill="#ef4444" />
            </>
          ) : (
            <>
              {/* Happy curved eyes and smile */}
              <circle cx="12" cy="11" r="2.5" fill="#ffffff" />
              <circle cx="12" cy="11" r="1.3" fill="#000000" />
              <circle cx="13" cy="10" r="0.6" fill="#ffffff" />
              <circle cx="20" cy="11" r="2.5" fill="#ffffff" />
              <circle cx="20" cy="11" r="1.3" fill="#000000" />
              <circle cx="21" cy="10" r="0.6" fill="#ffffff" />
              {/* Cute rosy cheeks */}
              <ellipse cx="9" cy="14" rx="1.5" ry="1" fill="#f472b6" opacity="0.6" />
              <ellipse cx="23" cy="14" rx="1.5" ry="1" fill="#f472b6" opacity="0.6" />
              {/* Happy smiling mouth */}
              <path d="M 14 14 Q 16 16 18 14" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
            </>
          )}
        </g>
      );
    }

    case 'sluger': { // Heavyweight Brawler Slug
      return (
        <g>
          {/* Eyestalks with determined angle */}
          <line x1="12" y1="9" x2="9" y2="4" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="9" cy="4" r="2.2" fill="#ffffff" />
          <circle cx="9" cy="4" r="1.2" fill="#000000" />
          <line x1="20" y1="9" x2="23" y2="4" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="23" cy="4" r="2.2" fill="#ffffff" />
          <circle cx="23" cy="4" r="1.2" fill="#000000" />

          {/* Heavy Emerald Slime Body */}
          <ellipse cx="16" cy="19" rx="12" ry="8" fill={color} />
          <ellipse cx="16" cy="22" rx="10" ry="4" fill={secondary} />

          {/* Tough Brawler Face */}
          <line x1="8" y1="3" x2="11" y2="5" stroke="#064e3b" strokeWidth="1.2" />
          <line x1="24" y1="3" x2="21" y2="5" stroke="#064e3b" strokeWidth="1.2" />
          {/* Smirk grin */}
          <line x1="14" y1="15" x2="18" y2="16" stroke="#064e3b" strokeWidth="1.5" strokeLinecap="round" />

          {/* Red Boxing Wraps on slug hands / sides */}
          <circle cx="6" cy="17" r="3.5" fill="#ef4444" />
          <circle cx="6" cy="17" r="2" fill="#b91c1c" />
          <circle cx="26" cy="17" r="3.5" fill="#ef4444" />
          <circle cx="26" cy="17" r="2" fill="#b91c1c" />
        </g>
      );
    }

    case 'spike': { // Porcupine with bleeding stuffing quills
      return (
        <g>
          {/* Porcupine Body */}
          <ellipse cx="16" cy="19" rx="10" ry="8" fill={color} />
          <ellipse cx="16" cy="22" rx="8" ry="4" fill={accent} opacity="0.6" />

          {/* Sharp Quills radiating out */}
          <polygon points="6,15 1,11 6,13" fill={secondary} />
          <polygon points="9,11 5,5 11,9" fill={accent} />
          <polygon points="14,9 12,3 16,8" fill={secondary} />
          <polygon points="18,9 20,3 20,8" fill={secondary} />
          <polygon points="23,11 27,5 21,9" fill={accent} />
          <polygon points="26,15 31,11 26,13" fill={secondary} />
          <polygon points="25,19 30,19 25,21" fill={accent} />

          {/* Porcupine Snout & Nose */}
          <ellipse cx="10" cy="19" rx="3.5" ry="2.5" fill={color} />
          <circle cx="7" cy="19" r="1.3" fill="#000000" />

          {/* Button Eye */}
          <circle cx="12" cy="16" r="1.5" fill="#000000" />
          <circle cx="12.5" cy="15.5" r="0.6" fill="#ffffff" />

          {/* Felt Stitches / Bleeding Stuffing mark */}
          <line x1="16" y1="16" x2="19" y2="19" stroke="#b91c1c" strokeWidth="1.2" />
          <line x1="19" y1="16" x2="16" y2="19" stroke="#b91c1c" strokeWidth="1.2" />
        </g>
      );
    }

    case 'umbreon': { // Dark / Psychic Pokémon Eeveelution
      return (
        <g>
          {/* Sleek Dark Body */}
          <ellipse cx="16" cy="20" rx="8" ry="6.5" fill="#18181b" />
          <ellipse cx="16" cy="14" rx="6.5" ry="5.5" fill="#27272a" />

          {/* Long Pointy Ears with Golden Rings */}
          <polygon points="10,12 4,1 12,9" fill="#18181b" />
          <ellipse cx="7" cy="5" rx="2" ry="1" fill="#facc15" />
          <polygon points="22,12 28,1 20,9" fill="#18181b" />
          <ellipse cx="25" cy="5" rx="2" ry="1" fill="#facc15" />

          {/* Golden Forehead Ring */}
          <ellipse cx="16" cy="11" rx="2" ry="1.2" fill="none" stroke="#facc15" strokeWidth="1" />

          {/* Red Glowing Cat Eyes */}
          <ellipse cx="13" cy="14" rx="1.6" ry="2" fill="#ef4444" />
          <circle cx="13" cy="14" r="0.8" fill="#000000" />
          <circle cx="13.4" cy="13.5" r="0.4" fill="#ffffff" />
          <ellipse cx="19" cy="14" rx="1.6" ry="2" fill="#ef4444" />
          <circle cx="19" cy="14" r="0.8" fill="#000000" />
          <circle cx="19.4" cy="13.5" r="0.4" fill="#ffffff" />

          {/* Sleek Snout */}
          <polygon points="15.5,16.5 16.5,16.5 16,17.2" fill="#71717a" />

          {/* Legs with Ring Bands */}
          <rect x="11" y="24" width="3" height="4" rx="1" fill="#18181b" />
          <rect x="11" y="25" width="3" height="1" fill="#facc15" />
          <rect x="18" y="24" width="3" height="4" rx="1" fill="#18181b" />
          <rect x="18" y="25" width="3" height="1" fill="#facc15" />

          {/* Bushy Tail with Golden Ring */}
          <path d="M 22 20 Q 28 17 26 12 Q 23 15 21 19" fill="#18181b" />
          <rect x="23.5" y="14.5" width="2" height="1.2" fill="#facc15" />
        </g>
      );
    }

    case 'pinky_bear': { // Pink Bear - Guardian of Secret Candy Stash
      return (
        <g>
          {/* Round Bear Ears */}
          <circle cx="9" cy="8" r="3" fill="#f472b6" />
          <circle cx="9" cy="8" r="1.8" fill="#fbcfe8" />
          <circle cx="23" cy="8" r="3" fill="#f472b6" />
          <circle cx="23" cy="8" r="1.8" fill="#fbcfe8" />

          {/* Bear Head and Body */}
          <ellipse cx="16" cy="20" rx="9" ry="7.5" fill="#f472b6" />
          <circle cx="16" cy="13" r="6.5" fill="#f472b6" />

          {/* Soft Snout */}
          <ellipse cx="16" cy="14.5" rx="3" ry="2.2" fill="#fdf2f8" />
          <ellipse cx="16" cy="13.8" rx="1.2" ry="0.8" fill="#be185d" />

          {/* Button Eyes & Sparkle */}
          <circle cx="13" cy="12" r="1.4" fill="#000000" />
          <circle cx="13.4" cy="11.6" r="0.5" fill="#ffffff" />
          <circle cx="19" cy="12" r="1.4" fill="#000000" />
          <circle cx="19.4" cy="11.6" r="0.5" fill="#ffffff" />

          {/* Rosy Cheeks */}
          <circle cx="11" cy="15" r="1.2" fill="#fb7185" opacity="0.7" />
          <circle cx="21" cy="15" r="1.2" fill="#fb7185" opacity="0.7" />

          {/* Secret Candy Stash held safely in paws */}
          <rect x="13" y="19" width="6" height="4" rx="1" fill="#ec4899" />
          <polygon points="11,19 13,21 11,23" fill="#f43f5e" />
          <polygon points="21,19 19,21 21,23" fill="#f43f5e" />
          <circle cx="16" cy="21" r="1" fill="#ffffff" />
        </g>
      );
    }

    case 'big_bear': { // Colossal Amalgam-sized Slumbering Bear
      const isSleeping = stuffyObj?.isAsleep !== false;
      return (
        <g>
          {/* Round Fluffy Bear Ears */}
          <circle cx="6" cy="8" r="3.5" fill="#78350f" />
          <circle cx="6" cy="8" r="2" fill="#b45309" />
          <circle cx="26" cy="8" r="3.5" fill="#78350f" />
          <circle cx="26" cy="8" r="2" fill="#b45309" />

          {/* Colossal Slumbering Bear Bulk */}
          <ellipse cx="16" cy="19" rx="13" ry="10" fill="#78350f" />
          <ellipse cx="16" cy="21" rx="9" ry="7" fill="#92400e" />

          {/* Bear Snout */}
          <ellipse cx="16" cy="17" rx="4" ry="2.8" fill="#b45309" />
          <ellipse cx="16" cy="16" rx="1.8" ry="1.1" fill="#451a03" />

          {isSleeping ? (
            <>
              {/* Sleeping Cap */}
              <polygon points="9,9 18,2 24,7" fill="#3b82f6" />
              <circle cx="18" cy="2" r="1.5" fill="#ffffff" />
              {/* Closed Snoozing Eyes */}
              <path d="M 11 13 Q 13 15 15 13" fill="none" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 17 13 Q 19 15 21 13" fill="none" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              {/* Snooze Bubble */}
              <circle cx="22" cy="12" r="1.5" fill="#93c5fd" opacity="0.75" />
              <circle cx="24" cy="10" r="2.2" fill="#93c5fd" opacity="0.6" />
            </>
          ) : (
            <>
              {/* Awakened Fierce Roaring Face */}
              <circle cx="12" cy="13" r="1.8" fill="#ffffff" />
              <circle cx="12" cy="13" r="1" fill="#dc2626" />
              <circle cx="20" cy="13" r="1.8" fill="#ffffff" />
              <circle cx="20" cy="13" r="1" fill="#dc2626" />
              {/* Open Roaring Maw */}
              <ellipse cx="16" cy="19" rx="2.5" ry="2" fill="#451a03" />
              <polygon points="15,18 16,19 15,19" fill="#ffffff" />
              <polygon points="17,18 16,19 17,19" fill="#ffffff" />
            </>
          )}
        </g>
      );
    }

    case 'allie': { // Allie the Alligator Plush
      return (
        <g>
          {/* Scaly Tail extending back */}
          <path d="M 4 21 Q 1 18 3 14 Q 5 17 8 20 Z" fill="#15803d" />
          <polygon points="2,16 3,14 4,16" fill="#14532d" />
          <polygon points="5,18 6,16 7,18" fill="#14532d" />

          {/* Gator Dorsal Ridges / Spines */}
          <polygon points="10,10 11,7 13,10" fill="#14532d" />
          <polygon points="14,9 15,6 17,9" fill="#14532d" />
          <polygon points="18,9 19,6 21,9" fill="#14532d" />

          {/* Main Alligator Body */}
          <ellipse cx="15" cy="18" rx="9" ry="6.5" fill="#15803d" />
          {/* Lime Green Soft Plush Underbelly */}
          <ellipse cx="15" cy="20" rx="6.5" ry="3.5" fill="#86efac" />

          {/* Alligator Snout & Jaws */}
          <rect x="18" y="14" width="10" height="5.5" rx="2" fill="#166534" />
          {/* Nostril bumps */}
          <circle cx="26" cy="14" r="1.2" fill="#14532d" />
          <circle cx="26" cy="14" r="0.5" fill="#052e16" />

          {/* Toothy Felt Gator Grin */}
          <polygon points="20,19 21,17.5 22,19" fill="#ffffff" />
          <polygon points="23,19 24,17.5 25,19" fill="#ffffff" />
          <polygon points="26,19 27,17.5 28,19" fill="#ffffff" />
          {/* Lower Jaw Line */}
          <rect x="19" y="19" width="8" height="2" rx="1" fill="#14532d" />

          {/* Gator Eyes (Prominent Head Bulges) */}
          <circle cx="16" cy="11.5" r="3" fill="#166534" />
          <circle cx="16" cy="11.5" r="2.2" fill="#eab308" />
          <ellipse cx="16" cy="11.5" rx="0.7" ry="1.8" fill="#14532d" />
          <circle cx="15.3" cy="10.8" r="0.6" fill="#ffffff" />

          {/* Gator Feet & Felt Claws */}
          <ellipse cx="10" cy="23.5" rx="2.5" ry="1.5" fill="#14532d" />
          <polygon points="8,24 8.5,25 9,24" fill="#fef08a" />
          <polygon points="10,24 10.5,25 11,24" fill="#fef08a" />
          <ellipse cx="19" cy="23.5" rx="2.5" ry="1.5" fill="#14532d" />
          <polygon points="17,24 17.5,25 18,24" fill="#fef08a" />
          <polygon points="19,24 19.5,25 20,24" fill="#fef08a" />
        </g>
      );
    }

    default:
      return (
        <rect x="6" y="6" width="20" height="20" rx="4" fill={color} />
      );
  }
}
