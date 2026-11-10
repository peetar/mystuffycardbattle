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
  const isFrozen = stuffy.statusEffects.some((s) => s.type === 'freeze');
  const isShocked = stuffy.statusEffects.some((s) => s.type === 'shock');
  const isSleeping = stuffy.speciesId === 'big_bear' && stuffy.isAsleep !== false;
  const isColossal = stuffy.speciesId === 'big_bear' || stuffy.speciesId === 'amalgam';

  const effectiveSize = isColossal ? Math.round(size * 1.22) : size;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center transition-all duration-200 select-none ${
        !isUnstuffed && !isAttacking && !isTakingDamage ? 'pixel-sprite-idle pixel-sprite-hover' : ''
      } ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${
        selected ? 'ring-4 ring-yellow-400 rounded-lg p-1 scale-105' : ''
      } ${
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

      {/* SVG Pixel Artwork (Retro 64x64 Scaled Pixel Sprite v4.6) */}
      <svg
        viewBox="0 0 32 32"
        className={`w-full h-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] ${
          isTakingDamage ? 'filter brightness-150 contrast-125' : ''
        } ${isHealed ? 'filter brightness-125 hue-rotate-30' : ''} ${
          !isUnstuffed && !isTakingDamage && !isAttacking ? 'hover:scale-105 transition-transform' : ''
        }`}
        style={{
          imageRendering: 'pixelated',
          shapeRendering: 'crispEdges',
          transform: isFacingLeft ? 'scaleX(-1)' : 'none',
        }}
      >
        {/* Retro 2D Pixel Shadow Pedestal Plate (Stepped 16-bit pixel base) */}
        <ellipse cx="16" cy="30" rx="9" ry="1.8" fill="#000000" opacity="0.4" />
        <rect x="9" y="29" width="14" height="2" fill="#020617" opacity="0.35" />
        <rect x="11" y="28" width="10" height="4" fill="#020617" opacity="0.25" />
        <rect x="7" y="30" width="18" height="1" fill="#020617" opacity="0.2" />

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
      {isFrozen && (
        <div className="absolute -top-3 left-0 z-10 text-xs animate-pulse font-bold" title="Frozen! Speed halved (-50%)!">
          ❄️🧊
        </div>
      )}
      {isShocked && (
        <div className="absolute -top-3.5 right-1 z-10 text-xs animate-bounce font-bold" title="Shocked! Cannot play cards for 1 turn!">
          ⚡🔋
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
    case 'alex': // Pink Axolotl - Retro 64x64 Pixel Art
      return (
        <g>
          {/* External Gills - Stepped Pixel Frills with dark outline */}
          {/* Left Gills */}
          <rect x="2" y="7" width="6" height="3" fill="#831843" />
          <rect x="3" y="8" width="5" height="2" fill={accent} />
          <rect x="1" y="11" width="7" height="3" fill="#831843" />
          <rect x="2" y="12" width="6" height="2" fill={accent} />
          <rect x="2" y="15" width="6" height="3" fill="#831843" />
          <rect x="3" y="16" width="5" height="2" fill={accent} />
          {/* Right Gills */}
          <rect x="24" y="7" width="6" height="3" fill="#831843" />
          <rect x="24" y="8" width="5" height="2" fill={accent} />
          <rect x="24" y="11" width="7" height="3" fill="#831843" />
          <rect x="24" y="12" width="6" height="2" fill={accent} />
          <rect x="24" y="15" width="6" height="3" fill="#831843" />
          <rect x="24" y="16" width="5" height="2" fill={accent} />

          {/* Dark Body Outline */}
          <rect x="7" y="6" width="18" height="22" fill="#831843" />
          <rect x="8" y="5" width="16" height="2" fill="#831843" />

          {/* Stepped Pink Axolotl Head & Body */}
          <rect x="8" y="7" width="16" height="19" fill={color} />
          {/* Highlight Top Rim */}
          <rect x="9" y="7" width="14" height="2" fill="#fbcfe8" />
          {/* Deep Shadow Lower Body */}
          <rect x="8" y="23" width="16" height="3" fill={accent} />

          {/* Soft Cream Belly Patch */}
          <rect x="11" y="19" width="10" height="7" fill={secondary} />
          <rect x="12" y="18" width="8" height="2" fill={secondary} />

          {/* Cute Derp Eyes with White Specular Glint */}
          <rect x="9" y="11" width="3" height="3" fill="#0f172a" />
          <rect x="9" y="11" width="1" height="1" fill="#ffffff" />
          <rect x="20" y="11" width="3" height="3" fill="#0f172a" />
          <rect x="22" y="11" width="1" height="1" fill="#ffffff" />

          {/* Rosy Cheeks */}
          <rect x="8" y="14" width="2" height="2" fill="#f43f5e" opacity="0.65" />
          <rect x="22" y="14" width="2" height="2" fill="#f43f5e" opacity="0.65" />

          {/* Cute Derp Smile */}
          <rect x="14" y="15" width="4" height="1.5" fill="#9d174d" />
          <rect x="15" y="16.5" width="2" height="1" fill="#9d174d" />

          {/* Stubby Pixel Paws */}
          <rect x="6" y="21" width="4" height="3" fill="#831843" />
          <rect x="7" y="22" width="3" height="2" fill={accent} />
          <rect x="22" y="21" width="4" height="3" fill="#831843" />
          <rect x="22" y="22" width="3" height="2" fill={accent} />
        </g>
      );

    case 'jefe': // Blue Penguin ("Pudge") - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Dark Pixel Outline / Silhouette */}
          <rect x="7" y="6" width="18" height="2" fill="#032541" />
          <rect x="5" y="8" width="22" height="20" fill="#032541" />
          <rect x="4" y="11" width="24" height="15" fill="#032541" />

          {/* Stepped Sky-Blue Outer Coat */}
          <rect x="6" y="8" width="20" height="19" fill={color} />
          {/* Highlight Top Rim */}
          <rect x="8" y="7" width="16" height="2" fill="#7dd3fc" />
          {/* Shadow Underside & Flippers */}
          <rect x="6" y="24" width="20" height="3" fill={accent} />
          <rect x="4" y="13" width="3" height="9" fill={accent} />
          <rect x="25" y="13" width="3" height="9" fill={accent} />

          {/* Stepped White Pudge Belly */}
          <rect x="10" y="11" width="12" height="15" fill={secondary} />
          <rect x="11" y="10" width="10" height="2" fill={secondary} />
          <rect x="9" y="13" width="14" height="11" fill={secondary} />
          {/* Belly Shadow Rim */}
          <rect x="10" y="23" width="12" height="3" fill="#cbd5e1" />

          {/* Retro Pixel Eyes (2x3 dark with 1x1 specular shine) */}
          <rect x="10" y="10" width="2" height="3" fill="#0f172a" />
          <rect x="10" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="20" y="10" width="2" height="3" fill="#0f172a" />
          <rect x="20" y="10" width="1" height="1" fill="#ffffff" />

          {/* Stepped Golden Beak with highlight */}
          <rect x="14" y="12" width="4" height="2" fill="#fbbf24" />
          <rect x="15" y="14" width="2" height="2" fill="#d97706" />

          {/* Red Pixel Bow Tie */}
          <rect x="13" y="17" width="2" height="3" fill="#ef4444" />
          <rect x="17" y="17" width="2" height="3" fill="#ef4444" />
          <rect x="15" y="18" width="2" height="1.5" fill="#b91c1c" />

          {/* Stepped Orange Feet */}
          <rect x="8" y="27" width="5" height="2" fill="#d97706" />
          <rect x="9" y="28" width="5" height="2" fill="#f59e0b" />
          <rect x="19" y="27" width="5" height="2" fill="#d97706" />
          <rect x="18" y="28" width="5" height="2" fill="#f59e0b" />
        </g>
      );

    case 'finlee': // Orca Whale - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Dorsal Fin with Dark Outline & Slate Highlight */}
          <rect x="14" y="2" width="4" height="7" fill="#020617" />
          <rect x="15" y="3" width="2" height="6" fill={color} />
          <rect x="14" y="3" width="1" height="5" fill="#475569" />

          {/* Dark Body Outline */}
          <rect x="3" y="6" width="26" height="20" fill="#020617" />
          <rect x="2" y="9" width="28" height="14" fill="#020617" />

          {/* Sleek Orca Midnight-Navy Body */}
          <rect x="4" y="7" width="24" height="17" fill={color} />
          {/* Slate Blue Highlight Along Spine */}
          <rect x="6" y="7" width="20" height="2" fill="#334155" />

          {/* White Underbelly Plate */}
          <rect x="7" y="14" width="18" height="9" fill={secondary} />
          <rect x="9" y="21" width="14" height="3" fill="#cbd5e1" />

          {/* Iconic White Eye Patch with Pupil */}
          <rect x="7" y="10" width="5" height="3" fill={secondary} />
          <rect x="8" y="10" width="2" height="2" fill="#0f172a" />
          <rect x="8" y="10" width="1" height="1" fill="#ffffff" />

          {/* Sharp Pixel Teeth */}
          <rect x="15" y="14" width="1" height="2" fill="#ffffff" />
          <rect x="17" y="14" width="1" height="2" fill="#ffffff" />
          <rect x="19" y="14" width="1" height="2" fill="#ffffff" />
          <rect x="21" y="14" width="1" height="2" fill="#ffffff" />

          {/* Flippers and Tail Fluke */}
          <rect x="1" y="15" width="4" height="5" fill={accent} />
          <rect x="26" y="11" width="5" height="4" fill={color} />
          <rect x="28" y="9" width="3" height="8" fill={color} />
        </g>
      );

    case 'fifi': // Chubby Red Fox - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Fox Ears Outline & Inner Tufts */}
          <rect x="7" y="3" width="6" height="6" fill="#7c2d12" />
          <rect x="19" y="3" width="6" height="6" fill="#7c2d12" />
          <rect x="8" y="4" width="4" height="4" fill={color} />
          <rect x="20" y="4" width="4" height="4" fill={color} />
          <rect x="9" y="5" width="2" height="2" fill="#fff7ed" />
          <rect x="21" y="5" width="2" height="2" fill="#fff7ed" />

          {/* Dark Body Outline */}
          <rect x="5" y="8" width="22" height="20" fill="#7c2d12" />
          <rect x="6" y="7" width="20" height="21" fill="#7c2d12" />

          {/* Russet Fur Body */}
          <rect x="6" y="8" width="20" height="18" fill={color} />
          {/* Warm Amber Highlight on forehead */}
          <rect x="9" y="8" width="14" height="2" fill="#fdba74" />
          {/* Deep Shadow underside */}
          <rect x="6" y="23" width="20" height="3" fill="#c2410c" />

          {/* Cream Muzzle */}
          <rect x="11" y="15" width="10" height="7" fill={secondary} />
          <rect x="13" y="14" width="6" height="2" fill={secondary} />
          {/* Black Button Nose */}
          <rect x="15" y="15" width="2" height="2" fill="#0f172a" />

          {/* Retro Pixel Eyes with Glint */}
          <rect x="10" y="11" width="3" height="3" fill="#0f172a" />
          <rect x="10" y="11" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="11" width="3" height="3" fill="#0f172a" />
          <rect x="19" y="11" width="1" height="1" fill="#ffffff" />

          {/* Bushy Curved Tail with White Tip */}
          <rect x="23" y="15" width="6" height="8" fill="#7c2d12" />
          <rect x="24" y="16" width="5" height="6" fill={color} />
          <rect x="26" y="15" width="4" height="4" fill="#ffffff" />

          {/* Little Green Stink Gas Puff */}
          <rect x="27" y="23" width="3" height="3" fill="#22c55e" opacity="0.8" />
          <rect x="29" y="21" width="2" height="2" fill="#86efac" opacity="0.8" />
        </g>
      );

    case 'thumper': // Grey Hammerhead Shark - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Hammerhead T-Bar Outline & Form */}
          <rect x="1" y="6" width="30" height="9" fill="#0f172a" />
          <rect x="2" y="7" width="28" height="7" fill={color} />
          <rect x="3" y="7" width="26" height="2" fill="#94a3b8" />

          {/* Eyes on Outer Edges of T-Bar */}
          <rect x="3" y="9" width="2" height="3" fill="#0f172a" />
          <rect x="3" y="9" width="1" height="1" fill="#ffffff" />
          <rect x="27" y="9" width="2" height="3" fill="#0f172a" />
          <rect x="28" y="9" width="1" height="1" fill="#ffffff" />

          {/* Torso with Dark Outline */}
          <rect x="8" y="12" width="16" height="16" fill="#0f172a" />
          <rect x="9" y="13" width="14" height="14" fill={color} />
          {/* Light Grey Belly */}
          <rect x="11" y="15" width="10" height="10" fill={secondary} />
          <rect x="12" y="21" width="8" height="3" fill="#94a3b8" />

          {/* Dorsal Fin */}
          <rect x="14" y="3" width="4" height="5" fill="#0f172a" />
          <rect x="15" y="4" width="2" height="4" fill={accent} />

          {/* Bright Red Pixel Boxing / Thumping Gloves */}
          <rect x="4" y="18" width="6" height="7" fill="#991b1b" />
          <rect x="5" y="19" width="4" height="5" fill="#ef4444" />
          <rect x="5" y="19" width="2" height="2" fill="#fca5a5" />

          <rect x="22" y="18" width="6" height="7" fill="#991b1b" />
          <rect x="23" y="19" width="4" height="5" fill="#ef4444" />
          <rect x="23" y="19" width="2" height="2" fill="#fca5a5" />
        </g>
      );

    case 'toothless': // Night Fury Dragon - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Curved Dragon Horns */}
          <rect x="6" y="2" width="4" height="6" fill="#020617" />
          <rect x="22" y="2" width="4" height="6" fill="#020617" />
          <rect x="7" y="3" width="2" height="4" fill="#334155" />
          <rect x="23" y="3" width="2" height="4" fill="#334155" />

          {/* Sleek Obsidian Dragon Head & Body */}
          <rect x="5" y="6" width="22" height="21" fill="#020617" />
          <rect x="6" y="7" width="20" height="19" fill={color} />
          {/* Dark Charcoal Highlight on Crown */}
          <rect x="9" y="7" width="14" height="2" fill="#1e293b" />

          {/* Glowing Green Feline Slit Eyes */}
          <rect x="9" y="11" width="4" height="4" fill="#10b981" />
          <rect x="10" y="11" width="2" height="4" fill="#000000" />
          <rect x="10" y="11" width="1" height="1" fill="#ffffff" />

          <rect x="19" y="11" width="4" height="4" fill="#10b981" />
          <rect x="20" y="11" width="2" height="4" fill="#000000" />
          <rect x="20" y="11" width="1" height="1" fill="#ffffff" />

          {/* Stepped Dragon Wings */}
          <rect x="1" y="11" width="5" height="9" fill="#020617" />
          <rect x="2" y="12" width="3" height="7" fill="#1e293b" />
          <rect x="26" y="11" width="5" height="9" fill="#020617" />
          <rect x="27" y="12" width="3" height="7" fill="#1e293b" />

          {/* Cyan Plasma Sparks */}
          <rect x="15" y="18" width="2" height="2" fill="#38bdf8" />
        </g>
      );

    case 'riolu': // Riolu (Aura Medic) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Headband Aura Sensors */}
          <rect x="5" y="7" width="3" height="10" fill="#020617" />
          <rect x="6" y="8" width="2" height="8" fill="#1e293b" />
          <rect x="24" y="7" width="3" height="10" fill="#020617" />
          <rect x="24" y="8" width="2" height="8" fill="#1e293b" />

          {/* Blue Canine Head & Body */}
          <rect x="8" y="5" width="16" height="22" fill="#020617" />
          <rect x="9" y="6" width="14" height="20" fill={color} />
          {/* Light Blue Crown Highlight */}
          <rect x="11" y="6" width="10" height="2" fill="#60a5fa" />

          {/* Black Bandit Eye Mask */}
          <rect x="8" y="9" width="16" height="5" fill="#0f172a" />
          {/* Piercing Crimson Pupils */}
          <rect x="11" y="10" width="3" height="3" fill="#ef4444" />
          <rect x="12" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="18" y="10" width="3" height="3" fill="#ef4444" />
          <rect x="19" y="10" width="1" height="1" fill="#ffffff" />

          {/* Medic Cross on Chest */}
          <rect x="15" y="18" width="2" height="6" fill="#ef4444" />
          <rect x="13" y="20" width="6" height="2" fill="#ef4444" />
        </g>
      );

    case 'eevee': // Eevee (Creepy Lasers & Missiles) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Long Stepped Ears */}
          <rect x="5" y="1" width="5" height="9" fill="#78350f" />
          <rect x="6" y="2" width="3" height="7" fill={color} />
          <rect x="22" y="1" width="5" height="9" fill="#78350f" />
          <rect x="23" y="2" width="3" height="7" fill={color} />

          {/* Head & Body with Outline */}
          <rect x="8" y="6" width="16" height="21" fill="#78350f" />
          <rect x="9" y="7" width="14" height="19" fill={color} />

          {/* Big Fluffy Cream Collar Ruff */}
          <rect x="6" y="16" width="20" height="6" fill="#fef08a" />
          <rect x="8" y="15" width="16" height="2" fill="#fef08a" />
          <rect x="7" y="21" width="18" height="2" fill="#eab308" />

          {/* Creepy Crimson Laser Eyes */}
          <rect x="11" y="10" width="3" height="3" fill="#ef4444" />
          <rect x="11" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="18" y="10" width="3" height="3" fill="#ef4444" />
          <rect x="18" y="10" width="1" height="1" fill="#ffffff" />

          {/* Shoulder Laser Missile Array */}
          <rect x="22" y="14" width="6" height="5" fill="#1e293b" />
          <rect x="24" y="15" width="2" height="2" fill="#f43f5e" />
        </g>
      );

    case 'slugmee': // Yellow Slug (Murder Melodist) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Eyestalks with Bead Eyes */}
          <rect x="10" y="4" width="2" height="7" fill="#78350f" />
          <rect x="10" y="3" width="3" height="3" fill="#0f172a" />
          <rect x="10" y="3" width="1" height="1" fill="#ffffff" />

          <rect x="17" y="4" width="2" height="7" fill="#78350f" />
          <rect x="16" y="3" width="3" height="3" fill="#0f172a" />
          <rect x="16" y="3" width="1" height="1" fill="#ffffff" />

          {/* Slug Body Dark Outline */}
          <rect x="4" y="11" width="24" height="16" fill="#78350f" />
          <rect x="3" y="18" width="26" height="9" fill="#78350f" />

          {/* Yellow Slug Body */}
          <rect x="5" y="12" width="22" height="13" fill={color} />
          <rect x="4" y="19" width="24" height="7" fill={color} />
          {/* Top Mucus Highlight */}
          <rect x="7" y="12" width="18" height="2" fill="#fef08a" />
          {/* Underside Amber Shadow */}
          <rect x="4" y="23" width="24" height="3" fill="#d97706" />

          {/* Slime Droplets along foot */}
          <rect x="2" y="25" width="2" height="2" fill="#84cc16" opacity="0.8" />
          <rect x="28" y="25" width="2" height="2" fill="#84cc16" opacity="0.8" />

          {/* Musical Melodist Pixel Notes */}
          <rect x="23" y="5" width="2" height="5" fill="#ec4899" />
          <rect x="23" y="5" width="4" height="2" fill="#ec4899" />
          <rect x="25" y="7" width="2" height="4" fill="#ec4899" />
          <rect x="22" y="9" width="3" height="2" fill="#ec4899" />
          <rect x="26" y="10" width="3" height="2" fill="#ec4899" />
        </g>
      );

    case 'beaker': // Yosemite Owl (Wise & Passive Healer) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Feather Horn Tufts with Outline */}
          <rect x="5" y="2" width="4" height="6" fill="#451a03" />
          <rect x="6" y="3" width="2" height="4" fill={color} />
          <rect x="23" y="2" width="4" height="6" fill="#451a03" />
          <rect x="24" y="3" width="2" height="4" fill={color} />

          {/* Round Feathered Owl Body with Dark Outline */}
          <rect x="6" y="6" width="20" height="21" fill="#451a03" />
          <rect x="5" y="9" width="22" height="16" fill="#451a03" />
          <rect x="7" y="7" width="18" height="19" fill={color} />
          {/* Top Crown Highlight */}
          <rect x="9" y="7" width="14" height="2" fill="#d97706" />

          {/* Speckled Cream Chest */}
          <rect x="10" y="16" width="12" height="10" fill={secondary} />
          <rect x="12" y="17" width="2" height="2" fill="#78350f" />
          <rect x="18" y="17" width="2" height="2" fill="#78350f" />
          <rect x="15" y="20" width="2" height="2" fill="#78350f" />

          {/* Giant Round Owl Goggles / Eyes */}
          <rect x="8" y="10" width="7" height="6" fill="#b45309" />
          <rect x="9" y="11" width="5" height="4" fill="#fef08a" />
          <rect x="11" y="12" width="2" height="3" fill="#0f172a" />
          <rect x="11" y="12" width="1" height="1" fill="#ffffff" />

          <rect x="17" y="10" width="7" height="6" fill="#b45309" />
          <rect x="18" y="11" width="5" height="4" fill="#fef08a" />
          <rect x="19" y="12" width="2" height="3" fill="#0f172a" />
          <rect x="19" y="12" width="1" height="1" fill="#ffffff" />

          {/* Golden Orange Beak */}
          <rect x="15" y="14" width="2" height="3" fill="#f59e0b" />
          <rect x="15" y="17" width="2" height="1" fill="#d97706" />

          {/* Wing Flaps */}
          <rect x="4" y="12" width="3" height="10" fill="#78350f" />
          <rect x="25" y="12" width="3" height="10" fill="#78350f" />
        </g>
      );

    case 'henry': // Baby Turtle (Potty Tank) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Turtle Shell Dark Outline */}
          <rect x="5" y="8" width="22" height="18" fill="#064e3b" />
          <rect x="6" y="7" width="20" height="20" fill="#064e3b" />

          {/* Deep Forest Green Shell */}
          <rect x="6" y="8" width="20" height="18" fill={accent} />
          {/* Hexagonal Plate Highlights */}
          <rect x="11" y="10" width="10" height="4" fill={color} />
          <rect x="9" y="14" width="14" height="6" fill={color} />
          <rect x="12" y="11" width="8" height="2" fill="#86efac" />
          <rect x="10" y="15" width="12" height="2" fill="#86efac" />

          {/* Stubby Turtle Feet */}
          <rect x="3" y="11" width="4" height="4" fill="#14532d" />
          <rect x="4" y="12" width="3" height="2" fill={secondary} />
          <rect x="25" y="11" width="4" height="4" fill="#14532d" />
          <rect x="25" y="12" width="3" height="2" fill={secondary} />
          <rect x="4" y="22" width="4" height="4" fill="#14532d" />
          <rect x="24" y="22" width="4" height="4" fill="#14532d" />

          {/* Baby Head Peeking Out */}
          <rect x="11" y="4" width="10" height="7" fill="#064e3b" />
          <rect x="12" y="5" width="8" height="5" fill={secondary} />
          {/* Cute Wide Baby Eyes */}
          <rect x="13" y="6" width="2" height="3" fill="#0f172a" />
          <rect x="13" y="6" width="1" height="1" fill="#ffffff" />
          <rect x="17" y="6" width="2" height="3" fill="#0f172a" />
          <rect x="17" y="6" width="1" height="1" fill="#ffffff" />

          {/* Diaper Pin Badge on Shell */}
          <rect x="14" y="21" width="4" height="2" fill="#facc15" />
          <rect x="15" y="20" width="2" height="4" fill="#facc15" />
        </g>
      );

    case 'dear': // Mini Poison Dart Frog - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Dark Body Outline */}
          <rect x="7" y="11" width="18" height="14" fill="#0c4a6e" />
          <rect x="8" y="10" width="16" height="16" fill="#0c4a6e" />

          {/* Electric Neon Cyan Body */}
          <rect x="8" y="11" width="16" height="13" fill={color} />
          {/* Top Highlight */}
          <rect x="10" y="11" width="12" height="2" fill="#bae6fd" />
          {/* Underside Shadow */}
          <rect x="8" y="21" width="16" height="3" fill="#0284c7" />

          {/* Bulging Frog Eyes on Top */}
          <rect x="8" y="6" width="6" height="6" fill="#0c4a6e" />
          <rect x="9" y="7" width="4" height="4" fill="#bef264" />
          <rect x="10" y="8" width="2" height="2" fill="#0f172a" />
          <rect x="10" y="8" width="1" height="1" fill="#ffffff" />

          <rect x="18" y="6" width="6" height="6" fill="#0c4a6e" />
          <rect x="19" y="7" width="4" height="4" fill="#bef264" />
          <rect x="20" y="8" width="2" height="2" fill="#0f172a" />
          <rect x="20" y="8" width="1" height="1" fill="#ffffff" />

          {/* Toxic Black Speckles */}
          <rect x="11" y="14" width="2" height="2" fill="#0f172a" />
          <rect x="19" y="14" width="2" height="2" fill="#0f172a" />
          <rect x="15" y="17" width="2" height="2" fill="#0f172a" />

          {/* Splayed Suction Pad Feet */}
          <rect x="4" y="20" width="4" height="4" fill={color} />
          <rect x="24" y="20" width="4" height="4" fill={color} />
        </g>
      );

    case 'cole': // Mini Turtle (Toddler Spinner) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Spun Shell Outline */}
          <rect x="6" y="8" width="20" height="18" fill="#064e3b" />
          <rect x="7" y="9" width="18" height="16" fill={color} />
          <rect x="11" y="12" width="10" height="10" fill={accent} />

          {/* Motion Blur Pixel Accents */}
          <rect x="3" y="15" width="3" height="2" fill="#facc15" />
          <rect x="26" y="15" width="3" height="2" fill="#facc15" />

          {/* Head with Toddler Cap */}
          <rect x="11" y="4" width="10" height="7" fill="#064e3b" />
          <rect x="12" y="6" width="8" height="4" fill={secondary} />
          <rect x="10" y="3" width="12" height="2" fill="#ef4444" />
          <rect x="15" y="2" width="2" height="2" fill="#ffffff" />

          {/* Spunky Eyes */}
          <rect x="13" y="7" width="2" height="2" fill="#0f172a" />
          <rect x="17" y="7" width="2" height="2" fill="#0f172a" />
        </g>
      );

    case 'joann': // Brown Cat (Table Disrupter) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Pointed Cat Ears */}
          <rect x="7" y="3" width="5" height="6" fill="#381a0e" />
          <rect x="8" y="4" width="3" height="4" fill={color} />
          <rect x="9" y="5" width="1" height="2" fill="#f472b6" />

          <rect x="20" y="3" width="5" height="6" fill="#381a0e" />
          <rect x="21" y="4" width="3" height="4" fill={color} />
          <rect x="22" y="5" width="1" height="2" fill="#f472b6" />

          {/* Sleek Feline Body with Dark Outline */}
          <rect x="7" y="8" width="18" height="19" fill="#381a0e" />
          <rect x="8" y="9" width="16" height="17" fill={color} />
          {/* Warm Mocha Crown Highlight */}
          <rect x="10" y="9" width="12" height="2" fill="#a16207" />

          {/* Piercing Emerald Sassy Eyes */}
          <rect x="10" y="12" width="3" height="3" fill="#15803d" />
          <rect x="11" y="12" width="1" height="3" fill="#000000" />
          <rect x="10" y="12" width="1" height="1" fill="#ffffff" />

          <rect x="19" y="12" width="3" height="3" fill="#15803d" />
          <rect x="20" y="12" width="1" height="3" fill="#000000" />
          <rect x="19" y="12" width="1" height="1" fill="#ffffff" />

          {/* Nose and Whiskers */}
          <rect x="15" y="15" width="2" height="1.5" fill="#f43f5e" />
          <rect x="6" y="15" width="4" height="1" fill="#fed7aa" />
          <rect x="22" y="15" width="4" height="1" fill="#fed7aa" />

          {/* Swatting Paw & Tail */}
          <rect x="22" y="20" width="5" height="4" fill={secondary} />
          <rect x="4" y="21" width="4" height="3" fill="#381a0e" />
        </g>
      );

    case 'cidney': // Really Fat Squirrel (Acorn Hoarder) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Colossal Fluffy Tail with Outline */}
          <rect x="20" y="4" width="10" height="18" fill="#451a03" />
          <rect x="21" y="5" width="8" height="16" fill={color} />
          <rect x="23" y="6" width="4" height="12" fill="#d97706" />

          {/* Massive Spherical Body Outline */}
          <rect x="4" y="8" width="22" height="20" fill="#451a03" />
          <rect x="5" y="9" width="20" height="18" fill={color} />
          {/* Underside Shadow */}
          <rect x="5" y="23" width="20" height="4" fill="#78350f" />

          {/* White Chubby Tummy Bib */}
          <rect x="8" y="14" width="13" height="12" fill={secondary} />
          <rect x="9" y="13" width="11" height="2" fill={secondary} />

          {/* Puffy Cheeks & Retro Eyes */}
          <rect x="8" y="10" width="3" height="3" fill="#0f172a" />
          <rect x="8" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="16" y="10" width="3" height="3" fill="#0f172a" />
          <rect x="16" y="10" width="1" height="1" fill="#ffffff" />

          {/* Golden Pixel Acorn in Paws */}
          <rect x="11" y="17" width="6" height="5" fill="#ca8a04" />
          <rect x="12" y="16" width="4" height="2" fill="#78350f" />
        </g>
      );

    case 'cow': // Plump Spotted Bovine - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Chubby Cow Body Outline */}
          <rect x="4" y="8" width="24" height="19" fill="#0f172a" />
          <rect x="5" y="9" width="22" height="17" fill={color} />

          {/* Large Black Patches / Spots */}
          <rect x="6" y="10" width="7" height="6" fill="#0f172a" />
          <rect x="18" y="14" width="7" height="7" fill="#0f172a" />
          <rect x="10" y="20" width="6" height="5" fill="#0f172a" />

          {/* Little Horns & Floppy Ears */}
          <rect x="9" y="5" width="2" height="3" fill="#fef08a" />
          <rect x="21" y="5" width="2" height="3" fill="#fef08a" />
          <rect x="6" y="8" width="4" height="3" fill="#e2e8f0" />
          <rect x="22" y="8" width="4" height="3" fill="#e2e8f0" />

          {/* Friendly Eyes */}
          <rect x="10" y="10" width="3" height="3" fill="#0f172a" />
          <rect x="10" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="10" width="3" height="3" fill="#0f172a" />
          <rect x="19" y="10" width="1" height="1" fill="#ffffff" />

          {/* Pink Muzzle with Nostrils */}
          <rect x="11" y="14" width="10" height="5" fill="#fbcfe8" />
          <rect x="13" y="16" width="1" height="1" fill="#be185d" />
          <rect x="18" y="16" width="1" height="1" fill="#be185d" />

          {/* Golden Collar Bell */}
          <rect x="14" y="19" width="4" height="3" fill="#f59e0b" />
          <rect x="15" y="20" width="2" height="2" fill="#78350f" />
        </g>
      );

    case 'chanteira': // Fat Dolphin (Tidal Chonker) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Dorsal Fin with Outline */}
          <rect x="16" y="4" width="5" height="5" fill="#0c4a6e" />
          <rect x="17" y="5" width="3" height="4" fill={accent} />

          {/* Rotund Body Dark Outline */}
          <rect x="4" y="9" width="24" height="17" fill="#0c4a6e" />
          <rect x="5" y="10" width="22" height="15" fill={color} />
          {/* Highlight Top Spine */}
          <rect x="7" y="10" width="18" height="2" fill="#7dd3fc" />

          {/* White Underbelly */}
          <rect x="7" y="17" width="17" height="7" fill={secondary} />

          {/* Dolphin Snout */}
          <rect x="2" y="13" width="4" height="4" fill={color} />

          {/* Happy Eye */}
          <rect x="8" y="12" width="2" height="3" fill="#0f172a" />
          <rect x="8" y="12" width="1" height="1" fill="#ffffff" />

          {/* Blowhole Steam Spark */}
          <rect x="13" y="6" width="2" height="3" fill="#bae6fd" />

          {/* Tail Flukes */}
          <rect x="26" y="13" width="5" height="8" fill={color} />
        </g>
      );

    case 'dolphy': // Colossal Dolphin - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Towering Dorsal Fin */}
          <rect x="15" y="1" width="6" height="8" fill="#082f49" />
          <rect x="16" y="2" width="4" height="7" fill={accent} />

          {/* Titanic Body Outline */}
          <rect x="2" y="8" width="28" height="20" fill="#082f49" />
          <rect x="3" y="9" width="26" height="18" fill={color} />
          {/* Cyan Highlight Spine */}
          <rect x="5" y="9" width="22" height="2" fill="#38bdf8" />

          {/* Massive Pale Underbelly */}
          <rect x="5" y="17" width="22" height="9" fill={secondary} />

          {/* Extended Dolphin Beak */}
          <rect x="1" y="13" width="4" height="5" fill={color} />

          {/* Serious Ocean Eye */}
          <rect x="8" y="12" width="3" height="3" fill="#0f172a" />
          <rect x="8" y="12" width="1" height="1" fill="#ffffff" />

          {/* Giant Blowhole Tidal Spout */}
          <rect x="12" y="3" width="3" height="5" fill="#38bdf8" />
          <rect x="11" y="1" width="5" height="2" fill="#bae6fd" />

          {/* Massive Fluke Tail */}
          <rect x="28" y="10" width="4" height="14" fill={accent} />
        </g>
      );

    case 'shadow': // Shadow the Hedgehog - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Upward Swept Quills with Crimson Stripes */}
          <rect x="4" y="2" width="6" height="10" fill="#020617" />
          <rect x="5" y="3" width="3" height="8" fill="#dc2626" />

          <rect x="22" y="2" width="6" height="10" fill="#020617" />
          <rect x="23" y="3" width="3" height="8" fill="#dc2626" />

          <rect x="2" y="9" width="6" height="8" fill="#020617" />
          <rect x="3" y="10" width="3" height="6" fill="#dc2626" />

          <rect x="24" y="9" width="6" height="8" fill="#020617" />
          <rect x="25" y="10" width="3" height="6" fill="#dc2626" />

          {/* Body and Head Outline */}
          <rect x="7" y="7" width="18" height="20" fill="#020617" />
          <rect x="8" y="8" width="16" height="18" fill="#0f172a" />

          {/* White Chest Fluff */}
          <rect x="11" y="16" width="10" height="6" fill="#f8fafc" />

          {/* Piercing Ruby-Red Eyes */}
          <rect x="9" y="11" width="4" height="3" fill="#dc2626" />
          <rect x="10" y="11" width="1" height="3" fill="#000000" />
          <rect x="9" y="11" width="1" height="1" fill="#ffffff" />

          <rect x="19" y="11" width="4" height="3" fill="#dc2626" />
          <rect x="20" y="11" width="1" height="3" fill="#000000" />
          <rect x="19" y="11" width="1" height="1" fill="#ffffff" />

          {/* Golden Inhibitor Wrist Rings */}
          <rect x="5" y="18" width="4" height="3" fill="#eab308" />
          <rect x="23" y="18" width="4" height="3" fill="#eab308" />

          {/* Hover Shoes Accent */}
          <rect x="9" y="26" width="5" height="3" fill="#dc2626" />
          <rect x="18" y="26" width="5" height="3" fill="#dc2626" />
        </g>
      );

    case 'amalgam': // The Stuffy Amalgam (Fused Plush Nightmare) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Fused Colossal Patchwork Body Outline */}
          <rect x="3" y="6" width="26" height="22" fill="#0f172a" />

          {/* Patch 1: Penguin Blue (Top-Left) */}
          <rect x="4" y="7" width="12" height="10" fill="#38bdf8" />
          {/* Patch 2: Dino/Frog Green (Top-Right) */}
          <rect x="16" y="7" width="12" height="10" fill="#16a34a" />
          {/* Patch 3: Purple Squirrel (Bottom-Left) */}
          <rect x="4" y="17" width="12" height="10" fill="#9333ea" />
          {/* Patch 4: Fox Orange (Bottom-Right) */}
          <rect x="16" y="17" width="12" height="10" fill="#ea580c" />

          {/* Shark Fin on Left */}
          <rect x="1" y="6" width="4" height="6" fill="#475569" />
          {/* Cat Ear on Right */}
          <rect x="24" y="2" width="5" height="6" fill="#78350f" />

          {/* Slug Eyestalk on Head */}
          <rect x="11" y="2" width="2" height="5" fill="#facc15" />
          <rect x="10" y="1" width="3" height="3" fill="#0f172a" />
          <rect x="10" y="1" width="1" height="1" fill="#ffffff" />

          {/* Mismatched Glowing Eyes */}
          <rect x="7" y="10" width="4" height="4" fill="#dc2626" />
          <rect x="7" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="20" y="10" width="4" height="4" fill="#06b6d4" />
          <rect x="20" y="10" width="1" height="1" fill="#ffffff" />

          {/* Heavy White Pixel Cross Stitches Across Seams */}
          <rect x="15" y="8" width="2" height="18" fill="#ffffff" />
          <rect x="5" y="16" width="22" height="2" fill="#ffffff" />
          <rect x="13" y="10" width="6" height="2" fill="#0f172a" />
          <rect x="13" y="22" width="6" height="2" fill="#0f172a" />
          <rect x="9" y="14" width="2" height="6" fill="#0f172a" />
          <rect x="21" y="14" width="2" height="6" fill="#0f172a" />
        </g>
      );

    case 'spot': // Spot (Put Me in the Zoo) - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Floppy Ears with Dark Outline */}
          <rect x="5" y="5" width="5" height="9" fill="#78350f" />
          <rect x="6" y="6" width="3" height="7" fill="#ca8a04" />
          <rect x="22" y="5" width="5" height="9" fill="#78350f" />
          <rect x="23" y="6" width="3" height="7" fill="#ca8a04" />

          {/* Dark Body Outline */}
          <rect x="6" y="7" width="20" height="20" fill="#78350f" />
          <rect x="7" y="6" width="18" height="22" fill="#78350f" />

          {/* Golden Yellow Body */}
          <rect x="7" y="8" width="18" height="18" fill={color} />
          {/* Top Rim Highlight */}
          <rect x="9" y="8" width="14" height="2" fill="#fef08a" />
          {/* Underside Shadow */}
          <rect x="7" y="23" width="18" height="3" fill="#ca8a04" />

          {/* Muzzle with Dark Nose */}
          <rect x="12" y="16" width="8" height="6" fill="#fef9c3" />
          <rect x="15" y="16" width="2" height="2" fill="#0f172a" />

          {/* Retro Pixel Eyes */}
          <rect x="10" y="11" width="3" height="3" fill="#0f172a" />
          <rect x="10" y="11" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="11" width="3" height="3" fill="#0f172a" />
          <rect x="19" y="11" width="1" height="1" fill="#ffffff" />

          {/* Iconic Multicolored Pixel Spots (Red, Blue, Green, Purple) */}
          {/* Red spots */}
          <rect x="8" y="12" width="2" height="2" fill="#ef4444" />
          <rect x="18" y="21" width="3" height="2" fill="#ef4444" />
          {/* Sapphire Blue spots */}
          <rect x="21" y="13" width="3" height="2" fill="#3b82f6" />
          <rect x="9" y="20" width="2" height="3" fill="#3b82f6" />
          {/* Emerald Green spots */}
          <rect x="14" y="9" width="3" height="2" fill="#10b981" />
          <rect x="13" y="23" width="2" height="2" fill="#10b981" />
          {/* Violet spots */}
          <rect x="9" y="16" width="2" height="2" fill="#a855f7" />
          <rect x="21" y="18" width="2" height="2" fill="#a855f7" />
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

    case 'tyrant': { // Tyrant the T-Rex Dino Plush (Thump & Jump)
      return (
        <g>
          {/* Dino Tail with Spikes */}
          <path d="M 5 21 Q 1 18 2 12 Q 5 16 8 19 Z" fill="#16a34a" />
          <polygon points="2,14 3,12 4,14" fill="#15803d" />
          <polygon points="5,16 6,14 7,16" fill="#15803d" />

          {/* Heavy Stomper Body */}
          <ellipse cx="15" cy="18" rx="8" ry="7" fill="#16a34a" />
          {/* Pale Lime Plush Underbelly */}
          <ellipse cx="16" cy="19" rx="5" ry="4.5" fill="#bbf7d0" />

          {/* Big T-Rex Head & Snout */}
          <rect x="14" y="8" width="13" height="8" rx="3" fill="#16a34a" />
          {/* Nostrils */}
          <circle cx="25" cy="10" r="0.9" fill="#15803d" />

          {/* Sharp Felt Dino Teeth */}
          <polygon points="18,16 19,14 20,16" fill="#ffffff" />
          <polygon points="21,16 22,14 23,16" fill="#ffffff" />
          <polygon points="24,16 25,14 26,16" fill="#ffffff" />

          {/* Fierce Eyes */}
          <circle cx="18" cy="10.5" r="2.2" fill="#eab308" />
          <circle cx="18" cy="10.5" r="1.1" fill="#000000" />
          <circle cx="17.5" cy="10" r="0.5" fill="#ffffff" />

          {/* Tiny Cute Dino Arms */}
          <path d="M 19 18 Q 22 19 21 21" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Massive Stomper Legs & Claws (Thump & Jump) */}
          <rect x="8" y="21" width="5" height="6" rx="2" fill="#15803d" />
          <polygon points="7,27 8.5,28.5 10,27" fill="#fef08a" />
          <polygon points="11,27 12.5,28.5 14,27" fill="#fef08a" />
          <rect x="16" y="21" width="5" height="6" rx="2" fill="#15803d" />
          <polygon points="15,27 16.5,28.5 18,27" fill="#fef08a" />
          <polygon points="19,27 20.5,28.5 22,27" fill="#fef08a" />
          {/* Dust puffs from stomping */}
          <circle cx="6" cy="27" r="1.2" fill="#ca8a04" opacity="0.6" />
          <circle cx="23" cy="27" r="1.2" fill="#ca8a04" opacity="0.6" />
        </g>
      );
    }

    case 'unicorn': { // Unicorn: All white, pink feet, purple hair, rainbow horn
      return (
        <g>
          {/* Purple Flowing Tail */}
          <path d="M 4 19 Q 0 17 2 24 Q 5 22 6 20 Z" fill="#a855f7" />

          {/* Pure White Plush Body */}
          <ellipse cx="15" cy="18" rx="8" ry="6.5" fill="#ffffff" />
          <ellipse cx="14" cy="18" rx="6.5" ry="5" fill="#f8fafc" />

          {/* Cute Pink Hooves / Feet */}
          <rect x="9" y="22" width="3.5" height="6" rx="1.5" fill="#ffffff" />
          <rect x="9" y="26" width="3.5" height="2" fill="#ec4899" />
          <rect x="17" y="22" width="3.5" height="6" rx="1.5" fill="#ffffff" />
          <rect x="17" y="26" width="3.5" height="2" fill="#ec4899" />

          {/* White Head & Soft Muzzle */}
          <circle cx="21" cy="13" r="5.5" fill="#ffffff" />
          <ellipse cx="24" cy="15" rx="3" ry="2.2" fill="#fdf2f8" />
          <circle cx="25" cy="14.5" r="0.6" fill="#ec4899" />

          {/* Sparkling Big Anime Eyes */}
          <circle cx="21" cy="12" r="2.2" fill="#6366f1" />
          <circle cx="21" cy="12" r="1.4" fill="#0f172a" />
          <circle cx="20.5" cy="11.2" r="0.8" fill="#ffffff" />
          <circle cx="21.8" cy="12.5" r="0.4" fill="#ffffff" />

          {/* Flowing Purple Mane */}
          <path d="M 16 9 Q 19 6 21 8 Q 18 11 16 13 Z" fill="#a855f7" />
          <path d="M 14 12 Q 17 10 18 13 Z" fill="#c084fc" />

          {/* Spiral Rainbow Horn */}
          <polygon points="21,8 24,0 23,8" fill="#ef4444" />
          <polygon points="21.5,6 23.8,1.5 22.8,6" fill="#f59e0b" />
          <polygon points="22,4 23.6,3 22.6,4" fill="#10b981" />
          <polygon points="22.5,2 23.4,4.5 22.8,2" fill="#3b82f6" />
          <polygon points="23,0 24,0 23.5,1.5" fill="#a855f7" />

          {/* Sparkles */}
          <polygon points="26,4 27,2 28,4 27,6" fill="#fef08a" />
          <polygon points="12,14 13,12 14,14 13,16" fill="#f472b6" />
        </g>
      );
    }

    case 'grumpy_rhino': { // Grumpy Rhino: Very grumpy slate grey rhino
      return (
        <g>
          {/* Heavy Armored Body */}
          <ellipse cx="15" cy="18" rx="9" ry="7" fill="#64748b" />
          <ellipse cx="14" cy="19" rx="7" ry="5" fill="#475569" />

          {/* Sturdy Short Legs */}
          <rect x="8" y="21" width="5" height="6" rx="2" fill="#334155" />
          <rect x="17" y="21" width="5" height="6" rx="2" fill="#334155" />

          {/* Grumpy Head with Heavy Jowls */}
          <rect x="15" y="11" width="11" height="9" rx="3" fill="#64748b" />

          {/* Large Curved Rhino Horn */}
          <path d="M 24 15 Q 29 13 30 7 Q 27 10 25 13 Z" fill="#334155" />
          {/* Secondary smaller horn */}
          <polygon points="22,12 24,9 23,12" fill="#475569" />

          {/* Furrowed Angry Eyebrows & Glaring Eyes */}
          <line x1="17" y1="12" x2="21" y2="13.5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="19" cy="14.5" r="1.4" fill="#f59e0b" />
          <circle cx="19" cy="14.5" r="0.7" fill="#000000" />

          {/* Grumpy Down-Turned Scowl */}
          <path d="M 21 18 Q 23 16 25 18" stroke="#1e293b" strokeWidth="1.4" fill="none" />
          {/* Steamy snort from nostrils */}
          <circle cx="26" cy="16" r="0.8" fill="#cbd5e1" opacity="0.7" />
        </g>
      );
    }

    case 'farty_lama': { // Farty Lama: Iconic Fortnite Pinata Llama with gas
      return (
        <g>
          {/* Pinata Tail Fringe */}
          <rect x="3" y="16" width="3" height="4" fill="#06b6d4" />
          <rect x="2" y="18" width="3" height="4" fill="#9333ea" />

          {/* Magenta & Cyan Striped Pinata Body */}
          <rect x="6" y="14" width="14" height="10" rx="3" fill="#9333ea" />
          <rect x="6" y="16" width="14" height="2.5" fill="#06b6d4" />
          <rect x="6" y="21" width="14" height="2.5" fill="#06b6d4" />

          {/* Long Llama Neck & Head */}
          <rect x="15" y="6" width="5.5" height="11" fill="#9333ea" />
          <rect x="14" y="4" width="9" height="7" rx="2" fill="#06b6d4" />
          <rect x="19" y="6" width="5" height="5" rx="1.5" fill="#9333ea" />

          {/* Tall Llama Ears */}
          <polygon points="15,4 16,0 17.5,4" fill="#06b6d4" />
          <polygon points="18,4 19.5,0 21,4" fill="#9333ea" />

          {/* Googly Funny Pinata Eyes */}
          <circle cx="17.5" cy="6.5" r="2.2" fill="#ffffff" />
          <circle cx="18" cy="6.5" r="1.1" fill="#000000" />

          {/* Bridle & Yellow Pinata Tassels */}
          <line x1="16" y1="9" x2="22" y2="9" stroke="#facc15" strokeWidth="1.2" />
          <circle cx="16" cy="9" r="1" fill="#facc15" />

          {/* Llama Legs */}
          <rect x="8" y="23" width="3" height="6" fill="#9333ea" />
          <rect x="15" y="23" width="3" height="6" fill="#06b6d4" />

          {/* Farty Green Gas Clouds (Just like Fifi!) */}
          <circle cx="3" cy="22" r="2" fill="#22c55e" opacity="0.75" />
          <circle cx="1" cy="20" r="1.5" fill="#84cc16" opacity="0.8" />
          <circle cx="4" cy="25" r="1.2" fill="#22c55e" opacity="0.6" />
        </g>
      );
    }

    case 'dolpher': { // Dolpher: Older female grey dolphin matriarch
      return (
        <g>
          {/* Mature Grey Dolphin Body */}
          <ellipse cx="16" cy="17" rx="11" ry="6.5" fill="#4b5563" />
          {/* Pearl Soft Underbelly */}
          <ellipse cx="16" cy="19.5" rx="8" ry="3.5" fill="#e5e7eb" />

          {/* Dorsal Fin with soft rose accent tip */}
          <path d="M 14 11 Q 16 4 19 8 Q 17 11 15 11 Z" fill="#4b5563" />
          <polygon points="16,6 18,7 17,9" fill="#f43f5e" />

          {/* Flukes / Dolphin Tail */}
          <polygon points="5,17 1,12 1,22" fill="#4b5563" />

          {/* Dolphin Snout & Gentle Smile */}
          <rect x="23" y="16" width="6" height="3" rx="1.5" fill="#4b5563" />
          <line x1="24" y1="18" x2="28" y2="18" stroke="#1f2937" strokeWidth="0.8" />

          {/* Kind Matriarch Eye */}
          <circle cx="21" cy="14" r="2" fill="#111827" />
          <circle cx="20.5" cy="13.5" r="0.7" fill="#ffffff" />
          <path d="M 19 12 Q 21 11 23 12" stroke="#f43f5e" strokeWidth="1" fill="none" />

          {/* Blowhole Mist */}
          <ellipse cx="19" cy="11" rx="1.2" ry="0.6" fill="#374151" />
          <circle cx="19" cy="8" r="0.8" fill="#38bdf8" opacity="0.6" />
          <circle cx="18" cy="6" r="1.2" fill="#38bdf8" opacity="0.5" />

          {/* Flippers */}
          <ellipse cx="16" cy="20" rx="3.5" ry="1.8" fill="#374151" transform="rotate(20 16 20)" />
        </g>
      );
    }

    case 'dolphim': { // Dolphim: Smaller, lighter grey smart dolphin
      return (
        <g>
          {/* Sleek Light Silver Grey Body */}
          <ellipse cx="16" cy="17" rx="9" ry="5.5" fill="#9ca3af" />
          {/* Bright Silver Belly */}
          <ellipse cx="16" cy="19" rx="6.5" ry="2.8" fill="#f3f4f6" />

          {/* Sleek Aerodynamic Dorsal Fin */}
          <path d="M 14 12 Q 17 6 18 9 Q 16 12 15 12 Z" fill="#9ca3af" />

          {/* Speedy Dolphin Flukes */}
          <polygon points="7,17 3,13 3,21" fill="#9ca3af" />

          {/* Compact Smart Snout */}
          <rect x="22" y="16" width="5" height="2.5" rx="1.2" fill="#9ca3af" />

          {/* Clever Sparkle Eyes (High IQ) */}
          <circle cx="20" cy="14" r="1.8" fill="#0284c7" />
          <circle cx="20" cy="14" r="1" fill="#0f172a" />
          <circle cx="19.5" cy="13.5" r="0.6" fill="#ffffff" />

          {/* Sonar Calculation Rings */}
          <circle cx="24" cy="14" r="3" stroke="#38bdf8" strokeWidth="0.8" fill="none" opacity="0.7" />
          <circle cx="26" cy="14" r="5" stroke="#38bdf8" strokeWidth="0.6" fill="none" opacity="0.4" />

          {/* Sleek Flippers */}
          <ellipse cx="15" cy="19.5" rx="3" ry="1.4" fill="#6b7280" transform="rotate(25 15 19.5)" />
        </g>
      );
    }

    case 'stone_blob':
    case 'wild_stuffy':
    default:
      return (
        <g>
          {/* Ground Contact Shadow */}
          <ellipse cx="16" cy="24" rx="10" ry="2.5" fill="#1e293b" opacity="0.6" />

          {/* Main Stone Blob Contour (Organic rounded boulder silhouette) */}
          <path
            d="M 8 23 C 4 20, 4 12, 8 7 C 12 3, 20 3, 24 7 C 28 12, 28 20, 24 23 C 20 25.5, 12 25.5, 8 23 Z"
            fill={color || '#64748b'}
          />

          {/* Chiseled Granite Highlight / Upper Surface */}
          <path
            d="M 9 9 C 12 5, 19 5, 22 9 C 24.5 12, 24 15, 21 14 C 18 13, 11 13, 9 9 Z"
            fill="#94a3b8"
            opacity="0.8"
          />
          <ellipse cx="14" cy="8" rx="4" ry="2" fill="#cbd5e1" opacity="0.5" />

          {/* Natural Stone Faultlines & Cracks */}
          <path
            d="M 11 10 L 13 13 L 12 16"
            stroke="#334155"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 21 17 L 19 19 L 20 22"
            stroke="#334155"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />

          {/* Moss & Lichen Accent Spots */}
          <circle cx="8" cy="17" r="1.8" fill="#15803d" opacity="0.85" />
          <circle cx="9.5" cy="18.5" r="1.2" fill="#22c55e" opacity="0.85" />
          <circle cx="23" cy="13" r="1.5" fill="#15803d" opacity="0.75" />

          {/* Glowing Gemlike Stone Eyes */}
          <circle cx="11.5" cy="14" r="2.4" fill="#0f172a" />
          <circle cx="19.5" cy="14" r="2.4" fill="#0f172a" />
          <circle cx="11.5" cy="14" r="1.5" fill="#38bdf8" />
          <circle cx="19.5" cy="14" r="1.5" fill="#38bdf8" />
          <circle cx="12.2" cy="13.3" r="0.6" fill="#ffffff" />
          <circle cx="20.2" cy="13.3" r="0.6" fill="#ffffff" />

          {/* Stony Smile / Mouth Crevice */}
          <path
            d="M 14 18 Q 15.5 19.5 17 18"
            stroke="#0f172a"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sturdy Stone Pebble Base Feet */}
          <ellipse cx="9" cy="23.5" rx="2.5" ry="1.5" fill="#475569" />
          <ellipse cx="23" cy="23.5" rx="2.5" ry="1.5" fill="#475569" />
        </g>
      );
  }
}
