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
  const color = species?.color || '#94a3b8';
  const accent = species?.accentColor || '#64748b';
  const secondary = species?.secondaryColor || '#ffffff';

  const isUnstuffed = stuffy.isUnstuffed;
  const isBrainDamaged = stuffy.statusEffects.some((s) => s.type === 'brain_damaged');
  const isCrackTrapped = stuffy.statusEffects.some((s) => s.type === 'earthquake_crack');
  const isPoisoned = stuffy.statusEffects.some((s) => s.type === 'poison');
  const isTaunting = stuffy.statusEffects.some((s) => s.type === 'taunt');

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${selected ? 'ring-4 ring-yellow-400 rounded-lg p-1 scale-105' : ''} ${
        highlightTarget ? 'ring-4 ring-red-500 rounded-lg p-1 animate-pulse' : ''
      }`}
      style={{
        width: size,
        height: size,
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
            {renderSpeciesPixelArt(stuffy.speciesId, color, accent, secondary)}

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
    </div>
  );
};

function renderSpeciesPixelArt(
  speciesId: string,
  color: string,
  accent: string,
  secondary: string
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

    default:
      return (
        <rect x="6" y="6" width="20" height="20" rx="4" fill={color} />
      );
  }
}
