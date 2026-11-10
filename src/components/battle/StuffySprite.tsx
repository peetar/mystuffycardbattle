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
        <rect x="7" y="29" width="18" height="2" fill="#000000" opacity="0.4" />
        <rect x="9" y="28" width="14" height="4" fill="#020617" opacity="0.35" />
        <rect x="11" y="27" width="10" height="5" fill="#020617" opacity="0.25" />

        {isUnstuffed ? (
          // Unstuffed Deflated Plush Graphic (Stepped Pixel Art)
          <g>
            {/* Deflated body puddle */}
            <rect x="4" y="21" width="24" height="7" fill={color} opacity="0.8" />
            <rect x="6" y="19" width="20" height="5" fill={accent} opacity="0.7" />
            {/* Cotton stuffing leaking out (Pixel Puffs) */}
            <rect x="7" y="16" width="4" height="4" fill="#ffffff" />
            <rect x="11" y="15" width="4" height="3" fill="#f8fafc" />
            <rect x="21" y="17" width="4" height="4" fill="#ffffff" />
            <rect x="24" y="15" width="3" height="3" fill="#e2e8f0" />
            {/* Stitches across tear */}
            <rect x="15" y="18" width="2" height="2" fill="#475569" />
            <rect x="17" y="20" width="2" height="2" fill="#475569" />
            {/* X X button eyes */}
            <text x="7" y="25" fontSize="5" fill="#334155" fontFamily="monospace">x</text>
            <text x="21" y="25" fontSize="5" fill="#334155" fontFamily="monospace">x</text>
          </g>
        ) : (
          // Alive / Active Stuffy
          <g>
            {/* Species Specific Features & Body */}
            {renderSpeciesPixelArt(stuffy.speciesId, color, accent, secondary, stuffy)}

            {/* General Plush Stitch Accents (Pixel Ticks) */}
            <rect x="15" y="16" width="2" height="1" fill="#000000" opacity="0.3" />
            <rect x="15" y="20" width="2" height="1" fill="#000000" opacity="0.3" />
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

    case 'lint_vampire': // The Static Sapper - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Swirling Shadow Cloak & Aura */}
          <rect x="5" y="10" width="22" height="18" fill="#0f172a" />
          <rect x="7" y="8" width="18" height="2" fill="#0f172a" />
          <rect x="9" y="6" width="14" height="2" fill="#0f172a" />
          {/* Cloak Midtones */}
          <rect x="7" y="11" width="18" height="15" fill="#1e293b" />
          <rect x="8" y="9" width="16" height="2" fill="#334155" />
          <rect x="10" y="7" width="12" height="2" fill="#475569" />
          {/* Vampire Torso & High Collar Wings */}
          <rect x="5" y="6" width="3" height="7" fill="#334155" />
          <rect x="24" y="6" width="3" height="7" fill="#334155" />
          <rect x="6" y="7" width="2" height="5" fill="#64748b" />
          <rect x="24" y="7" width="2" height="5" fill="#64748b" />
          {/* Vest / Ascott */}
          <rect x="13" y="14" width="6" height="8" fill="#7f1d1d" />
          <rect x="14" y="15" width="4" height="5" fill="#b91c1c" />
          <rect x="15" y="16" width="2" height="2" fill="#facc15" />
          {/* Pale Vampire Face */}
          <rect x="11" y="9" width="10" height="7" fill="#cbd5e1" />
          <rect x="12" y="8" width="8" height="1" fill="#cbd5e1" />
          <rect x="12" y="10" width="8" height="5" fill="#f1f5f9" />
          {/* Widow's Peak Hair */}
          <rect x="11" y="7" width="10" height="2" fill="#020617" />
          <rect x="15" y="9" width="2" height="2" fill="#020617" />
          {/* Glowing Red Eyes with Specular Highlights */}
          <rect x="12" y="11" width="3" height="2" fill="#ef4444" />
          <rect x="17" y="11" width="3" height="2" fill="#ef4444" />
          <rect x="12" y="11" width="1" height="1" fill="#ffffff" />
          <rect x="17" y="11" width="1" height="1" fill="#ffffff" />
          {/* Stepped White Vampire Fangs */}
          <rect x="13" y="14" width="1" height="3" fill="#ffffff" />
          <rect x="18" y="14" width="1" height="3" fill="#ffffff" />
          {/* Static Electric Spark Pixels */}
          <rect x="4" y="4" width="2" height="2" fill="#38bdf8" />
          <rect x="6" y="3" width="1" height="3" fill="#7dd3fc" />
          <rect x="26" y="5" width="2" height="2" fill="#38bdf8" />
          <rect x="25" y="7" width="1" height="2" fill="#7dd3fc" />
          <rect x="3" y="17" width="2" height="2" fill="#facc15" />
          <rect x="27" y="18" width="2" height="2" fill="#facc15" />
          <rect x="15" y="27" width="2" height="2" fill="#38bdf8" />
        </g>
      );

    case 'toxic_slug': // Noxious Slime King - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Slime Trail Base */}
          <rect x="2" y="24" width="28" height="5" fill="#052e16" />
          <rect x="3" y="23" width="26" height="5" fill="#14532d" />
          <rect x="5" y="25" width="22" height="2" fill="#15803d" />
          <rect x="1" y="26" width="3" height="2" fill="#84cc16" />
          <rect x="28" y="26" width="3" height="2" fill="#84cc16" />
          {/* Massive Toxic Mollusk Body */}
          <rect x="5" y="13" width="22" height="11" fill="#052e16" />
          <rect x="6" y="12" width="20" height="11" fill="#15803d" />
          <rect x="8" y="10" width="16" height="12" fill="#16a34a" />
          <rect x="9" y="9" width="13" height="5" fill="#22c55e" />
          {/* Pulsing Spore Bubbles / Pustules */}
          <rect x="8" y="12" width="4" height="4" fill="#84cc16" />
          <rect x="9" y="13" width="2" height="2" fill="#bef264" />
          <rect x="17" y="11" width="5" height="4" fill="#84cc16" />
          <rect x="18" y="12" width="3" height="2" fill="#bef264" />
          <rect x="13" y="14" width="3" height="3" fill="#a3e635" />
          <rect x="14" y="15" width="1" height="1" fill="#facc15" />
          {/* Stepped Eye Stalks */}
          <rect x="8" y="4" width="4" height="6" fill="#052e16" />
          <rect x="9" y="5" width="2" height="5" fill="#16a34a" />
          <rect x="20" y="3" width="4" height="7" fill="#052e16" />
          <rect x="21" y="4" width="2" height="6" fill="#16a34a" />
          {/* Bulbous Eyes on Stalks */}
          <rect x="7" y="2" width="6" height="5" fill="#052e16" />
          <rect x="8" y="3" width="4" height="3" fill="#bef264" />
          <rect x="9" y="4" width="2" height="2" fill="#020617" />
          <rect x="9" y="4" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="1" width="6" height="5" fill="#052e16" />
          <rect x="20" y="2" width="4" height="3" fill="#bef264" />
          <rect x="21" y="3" width="2" height="2" fill="#020617" />
          <rect x="21" y="3" width="1" height="1" fill="#ffffff" />
          {/* Dripping Acid Pixels */}
          <rect x="7" y="27" width="2" height="3" fill="#a3e635" />
          <rect x="23" y="27" width="2" height="4" fill="#84cc16" />
        </g>
      );

    case 'clockwork_nuke': // Doomsday Chrono-Bear - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Heavy Brass Plating Outline */}
          <rect x="7" y="6" width="18" height="22" fill="#451a03" />
          {/* Bear Cog Ears */}
          <rect x="5" y="4" width="5" height="5" fill="#451a03" />
          <rect x="6" y="5" width="3" height="3" fill="#b45309" />
          <rect x="22" y="4" width="5" height="5" fill="#451a03" />
          <rect x="23" y="5" width="3" height="3" fill="#b45309" />
          {/* Main Bear Armor Hull */}
          <rect x="8" y="7" width="16" height="20" fill="#78350f" />
          <rect x="9" y="8" width="14" height="8" fill="#92400e" />
          {/* Ominous Red Sensor Optics */}
          <rect x="10" y="10" width="3" height="2" fill="#dc2626" />
          <rect x="19" y="10" width="3" height="2" fill="#dc2626" />
          <rect x="11" y="10" width="1" height="1" fill="#fca5a5" />
          <rect x="20" y="10" width="1" height="1" fill="#fca5a5" />
          {/* Central Radioactive Reactor Core */}
          <rect x="10" y="16" width="12" height="10" fill="#1c1917" />
          <rect x="11" y="17" width="10" height="8" fill="#eab308" />
          <rect x="12" y="18" width="8" height="6" fill="#facc15" />
          {/* Clock Hands / Countdown Dial */}
          <rect x="15" y="19" width="2" height="3" fill="#ffffff" />
          <rect x="16" y="21" width="3" height="1" fill="#ffffff" />
          <rect x="15" y="21" width="2" height="1" fill="#000000" />
          {/* Stepped Hazard Stripes & Radiation Spikes */}
          <rect x="15" y="2" width="2" height="3" fill="#facc15" />
          <rect x="14" y="3" width="4" height="1" fill="#facc15" />
          <rect x="9" y="27" width="3" height="3" fill="#451a03" />
          <rect x="20" y="27" width="3" height="3" fill="#451a03" />
          <rect x="10" y="28" width="2" height="2" fill="#78350f" />
          <rect x="20" y="28" width="2" height="2" fill="#78350f" />
          <rect x="8" y="17" width="1" height="6" fill="#facc15" />
          <rect x="23" y="17" width="1" height="6" fill="#facc15" />
        </g>
      );

    case 'cinder_beast': // Ignis the Cinder Drake - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Stepped Dragon Wings */}
          <rect x="2" y="7" width="8" height="9" fill="#7f1d1d" />
          <rect x="3" y="8" width="6" height="7" fill="#dc2626" />
          <rect x="4" y="9" width="4" height="4" fill="#f97316" />
          <rect x="22" y="7" width="8" height="9" fill="#7f1d1d" />
          <rect x="23" y="8" width="6" height="7" fill="#dc2626" />
          <rect x="24" y="9" width="4" height="4" fill="#f97316" />
          {/* Dragon Horns */}
          <rect x="9" y="3" width="2" height="5" fill="#ea580c" />
          <rect x="8" y="2" width="2" height="2" fill="#facc15" />
          <rect x="21" y="3" width="2" height="5" fill="#ea580c" />
          <rect x="22" y="2" width="2" height="2" fill="#facc15" />
          {/* Dragon Skull & Body Silhouette */}
          <rect x="8" y="6" width="16" height="20" fill="#7f1d1d" />
          <rect x="9" y="7" width="14" height="18" fill="#b91c1c" />
          <rect x="11" y="8" width="10" height="7" fill="#dc2626" />
          {/* Glowing Amber Slit Eyes */}
          <rect x="11" y="10" width="3" height="2" fill="#fef08a" />
          <rect x="18" y="10" width="3" height="2" fill="#fef08a" />
          <rect x="12" y="10" width="1" height="2" fill="#b45309" />
          <rect x="19" y="10" width="1" height="2" fill="#b45309" />
          {/* Snout with Smoldering Nostrils */}
          <rect x="13" y="13" width="6" height="3" fill="#7f1d1d" />
          <rect x="14" y="14" width="1" height="1" fill="#f97316" />
          <rect x="17" y="14" width="1" height="1" fill="#f97316" />
          {/* Spiked Tail */}
          <rect x="24" y="20" width="5" height="3" fill="#7f1d1d" />
          <rect x="27" y="23" width="3" height="4" fill="#b91c1c" />
          <rect x="28" y="26" width="3" height="3" fill="#ea580c" />
          <rect x="29" y="28" width="2" height="2" fill="#facc15" />
          {/* Venting Ember Pixels */}
          <rect x="6" y="20" width="2" height="2" fill="#f97316" />
          <rect x="14" y="22" width="4" height="4" fill="#ea580c" />
          <rect x="15" y="23" width="2" height="2" fill="#fef08a" />
        </g>
      );

    case 'grave_scavenger': // Scrappy the Graverobber - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Heavy Burlap Discard Sack */}
          <rect x="20" y="8" width="9" height="11" fill="#451a03" />
          <rect x="21" y="9" width="7" height="9" fill="#78350f" />
          <rect x="22" y="10" width="5" height="6" fill="#92400e" />
          <rect x="23" y="12" width="3" height="1" fill="#fbbf24" />
          {/* Striped Raccoon Tail */}
          <rect x="2" y="18" width="6" height="9" fill="#0f172a" />
          <rect x="3" y="20" width="4" height="2" fill="#94a3b8" />
          <rect x="3" y="24" width="4" height="2" fill="#94a3b8" />
          {/* Raccoon Body & Head Outline */}
          <rect x="7" y="6" width="15" height="21" fill="#0f172a" />
          <rect x="8" y="7" width="13" height="19" fill="#334155" />
          <rect x="10" y="8" width="9" height="8" fill="#475569" />
          {/* Bandit Mask */}
          <rect x="8" y="9" width="13" height="4" fill="#020617" />
          {/* Sly Amber Eyes */}
          <rect x="10" y="10" width="2" height="2" fill="#facc15" />
          <rect x="17" y="10" width="2" height="2" fill="#facc15" />
          <rect x="11" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="17" y="10" width="1" height="1" fill="#ffffff" />
          {/* Snout & Whiskers */}
          <rect x="13" y="13" width="3" height="2" fill="#cbd5e1" />
          <rect x="14" y="13" width="1" height="1" fill="#020617" />
          {/* Gravedigger Shovel */}
          <rect x="5" y="12" width="2" height="13" fill="#64748b" />
          <rect x="4" y="23" width="4" height="5" fill="#475569" />
          <rect x="5" y="24" width="2" height="3" fill="#cbd5e1" />
        </g>
      );

    case 'mind_puppeteer': // Psychic Mind-Leech - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Pulsing Cerebral Brain-Hood */}
          <rect x="6" y="5" width="20" height="14" fill="#3b0764" />
          <rect x="7" y="6" width="18" height="12" fill="#581c87" />
          <rect x="9" y="4" width="14" height="3" fill="#3b0764" />
          <rect x="10" y="5" width="12" height="3" fill="#6b21a8" />
          {/* Brain Fissure Highlights */}
          <rect x="9" y="8" width="4" height="2" fill="#c084fc" />
          <rect x="19" y="8" width="4" height="2" fill="#c084fc" />
          <rect x="11" y="10" width="3" height="2" fill="#d8b4fe" />
          <rect x="18" y="10" width="3" height="2" fill="#d8b4fe" />
          {/* Glowing Psychic Third Eye Optic */}
          <rect x="14" y="6" width="4" height="4" fill="#0891b2" />
          <rect x="15" y="7" width="2" height="2" fill="#22d3ee" />
          <rect x="15" y="7" width="1" height="1" fill="#ffffff" />
          {/* Piercing Hypnotic Lower Eyes */}
          <rect x="9" y="13" width="3" height="2" fill="#a855f7" />
          <rect x="20" y="13" width="3" height="2" fill="#a855f7" />
          <rect x="10" y="13" width="1" height="1" fill="#ffffff" />
          <rect x="21" y="13" width="1" height="1" fill="#ffffff" />
          {/* Undulating Psychic Tentacles */}
          <rect x="8" y="19" width="3" height="8" fill="#7e22ce" />
          <rect x="7" y="25" width="3" height="3" fill="#9333ea" />
          <rect x="12" y="19" width="3" height="9" fill="#581c87" />
          <rect x="13" y="26" width="3" height="3" fill="#9333ea" />
          <rect x="17" y="19" width="3" height="9" fill="#581c87" />
          <rect x="16" y="26" width="3" height="3" fill="#9333ea" />
          <rect x="21" y="19" width="3" height="8" fill="#7e22ce" />
          <rect x="22" y="25" width="3" height="3" fill="#9333ea" />
          {/* Psychic Wave Particles */}
          <rect x="4" y="7" width="2" height="2" fill="#c084fc" />
          <rect x="26" y="7" width="2" height="2" fill="#c084fc" />
          <rect x="3" y="16" width="2" height="2" fill="#e9d5ff" />
          <rect x="27" y="16" width="2" height="2" fill="#e9d5ff" />
        </g>
      );

    case 'aquatic_kraken': // Kraken the Abyssal - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Deep Sea Mantle Contour */}
          <rect x="8" y="5" width="16" height="15" fill="#042f2e" />
          <rect x="9" y="6" width="14" height="13" fill="#0f766e" />
          <rect x="11" y="4" width="10" height="3" fill="#042f2e" />
          <rect x="12" y="5" width="8" height="3" fill="#14b8a6" />
          {/* Huge Yellow Abyssal Optics */}
          <rect x="9" y="13" width="5" height="4" fill="#042f2e" />
          <rect x="10" y="14" width="3" height="2" fill="#facc15" />
          <rect x="11" y="14" width="1" height="2" fill="#020617" />
          <rect x="18" y="13" width="5" height="4" fill="#042f2e" />
          <rect x="19" y="14" width="3" height="2" fill="#facc15" />
          <rect x="19" y="14" width="1" height="2" fill="#020617" />
          {/* Stepped Abyssal Tentacles */}
          <rect x="6" y="19" width="4" height="9" fill="#0f766e" />
          <rect x="4" y="25" width="4" height="4" fill="#115e59" />
          <rect x="11" y="19" width="3" height="10" fill="#0f766e" />
          <rect x="10" y="27" width="3" height="3" fill="#115e59" />
          <rect x="18" y="19" width="3" height="10" fill="#0f766e" />
          <rect x="19" y="27" width="3" height="3" fill="#115e59" />
          <rect x="22" y="19" width="4" height="9" fill="#0f766e" />
          <rect x="24" y="25" width="4" height="4" fill="#115e59" />
          {/* Teal Glowing Suction Cups */}
          <rect x="5" y="23" width="2" height="2" fill="#2dd4bf" />
          <rect x="11" y="25" width="2" height="2" fill="#2dd4bf" />
          <rect x="19" y="25" width="2" height="2" fill="#2dd4bf" />
          <rect x="25" y="23" width="2" height="2" fill="#2dd4bf" />
          <rect x="6" y="27" width="1" height="1" fill="#ccfbf1" />
          <rect x="25" y="27" width="1" height="1" fill="#ccfbf1" />
        </g>
      );

    case 'aquatic_ray': // Manta the Oceanic Glider - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Broad Ray Wings */}
          <rect x="1" y="13" width="30" height="7" fill="#0c4a6e" />
          <rect x="3" y="11" width="26" height="9" fill="#0284c7" />
          <rect x="6" y="9" width="20" height="12" fill="#0369a1" />
          <rect x="10" y="7" width="12" height="15" fill="#38bdf8" />
          {/* White Keel Belly */}
          <rect x="12" y="11" width="8" height="9" fill="#f0f9ff" />
          <rect x="13" y="12" width="6" height="7" fill="#ffffff" />
          {/* Slender Whip Tail */}
          <rect x="15" y="22" width="2" height="9" fill="#0284c7" />
          <rect x="15" y="26" width="1" height="5" fill="#38bdf8" />
          {/* Cephalic Horn Fins */}
          <rect x="11" y="5" width="2" height="4" fill="#0284c7" />
          <rect x="19" y="5" width="2" height="4" fill="#0284c7" />
          {/* Eyes */}
          <rect x="10" y="9" width="2" height="2" fill="#020617" />
          <rect x="20" y="9" width="2" height="2" fill="#020617" />
          <rect x="10" y="9" width="1" height="1" fill="#ffffff" />
          <rect x="21" y="9" width="1" height="1" fill="#ffffff" />
        </g>
      );

    case 'tri_link_alpha': // Aegis the Bonded Shield - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Massive Golden Shield Chassis */}
          <rect x="6" y="6" width="20" height="21" fill="#78350f" />
          <rect x="7" y="7" width="18" height="19" fill="#b45309" />
          <rect x="8" y="8" width="16" height="17" fill="#f59e0b" />
          <rect x="10" y="10" width="12" height="13" fill="#fbbf24" />
          {/* Golden Studs / Corner Rivets */}
          <rect x="8" y="8" width="2" height="2" fill="#fef3c7" />
          <rect x="22" y="8" width="2" height="2" fill="#fef3c7" />
          <rect x="8" y="23" width="2" height="2" fill="#78350f" />
          <rect x="22" y="23" width="2" height="2" fill="#78350f" />
          {/* Glowing Runic Optic */}
          <rect x="13" y="13" width="6" height="6" fill="#78350f" />
          <rect x="14" y="14" width="4" height="4" fill="#fef3c7" />
          <rect x="15" y="15" width="2" height="2" fill="#b45309" />
          {/* Interlocking Life-Link Chain Links */}
          <rect x="2" y="15" width="4" height="4" fill="#78350f" />
          <rect x="3" y="16" width="2" height="2" fill="#fde68a" />
          <rect x="26" y="15" width="4" height="4" fill="#78350f" />
          <rect x="27" y="16" width="2" height="2" fill="#fde68a" />
        </g>
      );

    case 'tri_link_beta': // Fang the Bonded Striker - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Crimson Feral Wolf Body */}
          <rect x="7" y="7" width="18" height="20" fill="#450a0a" />
          <rect x="8" y="8" width="16" height="18" fill="#991b1b" />
          <rect x="10" y="9" width="12" height="10" fill="#b91c1c" />
          {/* Pointed Wolf Ears */}
          <rect x="7" y="3" width="4" height="5" fill="#450a0a" />
          <rect x="8" y="4" width="2" height="3" fill="#ef4444" />
          <rect x="21" y="3" width="4" height="5" fill="#450a0a" />
          <rect x="22" y="4" width="2" height="3" fill="#ef4444" />
          {/* Feral Amber Eyes */}
          <rect x="10" y="11" width="3" height="2" fill="#fef08a" />
          <rect x="19" y="11" width="3" height="2" fill="#fef08a" />
          <rect x="11" y="11" width="1" height="2" fill="#78350f" />
          <rect x="20" y="11" width="1" height="2" fill="#78350f" />
          {/* Snarl Snout & Gleaming Fangs */}
          <rect x="12" y="14" width="8" height="5" fill="#7f1d1d" />
          <rect x="14" y="14" width="4" height="2" fill="#1c1917" />
          <rect x="13" y="17" width="2" height="3" fill="#ffffff" />
          <rect x="17" y="17" width="2" height="3" fill="#ffffff" />
          {/* Life-Link Chain Links */}
          <rect x="2" y="16" width="4" height="4" fill="#450a0a" />
          <rect x="3" y="17" width="2" height="2" fill="#fca5a5" />
          <rect x="26" y="16" width="4" height="4" fill="#450a0a" />
          <rect x="27" y="17" width="2" height="2" fill="#fca5a5" />
        </g>
      );

    case 'tri_link_gamma': // Talon the Bonded Mystic - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Gryphon Plumage Wings */}
          <rect x="2" y="9" width="7" height="12" fill="#3b0764" />
          <rect x="3" y="10" width="5" height="10" fill="#6d28d9" />
          <rect x="23" y="9" width="7" height="12" fill="#3b0764" />
          <rect x="24" y="10" width="5" height="10" fill="#6d28d9" />
          {/* Gryphon Body */}
          <rect x="8" y="8" width="16" height="19" fill="#3b0764" />
          <rect x="9" y="9" width="14" height="17" fill="#581c87" />
          <rect x="10" y="10" width="12" height="9" fill="#7e22ce" />
          {/* Ethereal Halo above Head */}
          <rect x="11" y="2" width="10" height="2" fill="#c084fc" />
          <rect x="13" y="1" width="6" height="1" fill="#e9d5ff" />
          {/* Curved Golden Beak */}
          <rect x="13" y="14" width="6" height="5" fill="#b45309" />
          <rect x="14" y="14" width="4" height="4" fill="#facc15" />
          <rect x="15" y="18" width="2" height="2" fill="#facc15" />
          {/* Mystic Violet Eyes */}
          <rect x="11" y="11" width="2" height="2" fill="#ede9fe" />
          <rect x="19" y="11" width="2" height="2" fill="#ede9fe" />
          <rect x="11" y="11" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="11" width="1" height="1" fill="#ffffff" />
          {/* Life-Link Chain Links */}
          <rect x="2" y="16" width="4" height="4" fill="#3b0764" />
          <rect x="3" y="17" width="2" height="2" fill="#d8b4fe" />
          <rect x="26" y="16" width="4" height="4" fill="#3b0764" />
          <rect x="27" y="17" width="2" height="2" fill="#d8b4fe" />
        </g>
      );

    case 'shadow_hedgehog': // Shadow the Ultimate Lifeform - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Signature Crimson Quills Swept Back */}
          <rect x="3" y="3" width="7" height="6" fill="#09090b" />
          <rect x="4" y="4" width="5" height="4" fill="#dc2626" />
          <rect x="22" y="3" width="7" height="6" fill="#09090b" />
          <rect x="23" y="4" width="5" height="4" fill="#dc2626" />
          <rect x="1" y="9" width="8" height="6" fill="#09090b" />
          <rect x="2" y="10" width="6" height="4" fill="#dc2626" />
          <rect x="23" y="9" width="8" height="6" fill="#09090b" />
          <rect x="24" y="10" width="6" height="4" fill="#dc2626" />
          {/* Jet-Black Head & Body */}
          <rect x="8" y="7" width="16" height="19" fill="#09090b" />
          <rect x="9" y="8" width="14" height="17" fill="#18181b" />
          {/* Fluffy White Chest Fur */}
          <rect x="13" y="16" width="6" height="6" fill="#f8fafc" />
          <rect x="14" y="17" width="4" height="4" fill="#ffffff" />
          {/* Fierce Ruby-Red Eyes */}
          <rect x="10" y="10" width="4" height="3" fill="#dc2626" />
          <rect x="18" y="10" width="4" height="3" fill="#dc2626" />
          <rect x="11" y="10" width="2" height="2" fill="#ef4444" />
          <rect x="19" y="10" width="2" height="2" fill="#ef4444" />
          <rect x="11" y="10" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="10" width="1" height="1" fill="#ffffff" />
          {/* Tan Muzzle */}
          <rect x="13" y="13" width="6" height="3" fill="#fed7aa" />
          <rect x="15" y="13" width="2" height="1" fill="#09090b" />
          {/* Gold Inhibitor Ring Cuffs */}
          <rect x="7" y="19" width="2" height="3" fill="#facc15" />
          <rect x="23" y="19" width="2" height="3" fill="#facc15" />
          {/* Rocket Hover-Shoe Jet Flames */}
          <rect x="8" y="26" width="5" height="4" fill="#ea580c" />
          <rect x="9" y="27" width="3" height="3" fill="#facc15" />
          <rect x="19" y="26" width="5" height="4" fill="#ea580c" />
          <rect x="20" y="27" width="3" height="3" fill="#facc15" />
        </g>
      );

    case 'mirror_mimic': // The Mirror Doppelganger - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Faceted Chrome Diamond Form */}
          <rect x="14" y="2" width="4" height="4" fill="#0f172a" />
          <rect x="11" y="5" width="10" height="4" fill="#0f172a" />
          <rect x="8" y="8" width="16" height="4" fill="#0f172a" />
          <rect x="5" y="11" width="22" height="10" fill="#0f172a" />
          <rect x="8" y="20" width="16" height="4" fill="#0f172a" />
          <rect x="11" y="23" width="10" height="4" fill="#0f172a" />
          <rect x="14" y="26" width="4" height="4" fill="#0f172a" />
          {/* Prismatic Shimmer Facets */}
          <rect x="12" y="6" width="8" height="6" fill="#e2e8f0" />
          <rect x="7" y="12" width="8" height="8" fill="#94a3b8" />
          <rect x="17" y="12" width="8" height="8" fill="#cbd5e1" />
          <rect x="12" y="20" width="8" height="6" fill="#64748b" />
          <rect x="13" y="13" width="6" height="6" fill="#ffffff" />
          {/* Prismatic Color Sheen Pixels */}
          <rect x="9" y="9" width="2" height="2" fill="#38bdf8" />
          <rect x="21" y="9" width="2" height="2" fill="#c084fc" />
          <rect x="9" y="21" width="2" height="2" fill="#4ade80" />
          <rect x="21" y="21" width="2" height="2" fill="#f43f5e" />
          {/* Corner Sparkle Glints */}
          <rect x="2" y="15" width="3" height="2" fill="#ffffff" />
          <rect x="3" y="14" width="1" height="4" fill="#ffffff" />
          <rect x="27" y="15" width="3" height="2" fill="#ffffff" />
          <rect x="28" y="14" width="1" height="4" fill="#ffffff" />
        </g>
      );

    case 'fluff_gorgon': // The Fluff Devourer - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Colossal Stitched Maw Contour */}
          <rect x="5" y="5" width="22" height="22" fill="#083344" />
          <rect x="6" y="6" width="20" height="20" fill="#164e63" />
          <rect x="8" y="7" width="16" height="18" fill="#0e7490" />
          {/* Gaping Cotton Void Gullet */}
          <rect x="9" y="10" width="14" height="12" fill="#020617" />
          {/* Jagged Unstitched Cyan Teeth */}
          <rect x="10" y="9" width="2" height="3" fill="#22d3ee" />
          <rect x="14" y="9" width="2" height="3" fill="#22d3ee" />
          <rect x="18" y="9" width="2" height="3" fill="#22d3ee" />
          <rect x="11" y="19" width="2" height="3" fill="#67e8f9" />
          <rect x="15" y="19" width="2" height="3" fill="#67e8f9" />
          <rect x="19" y="19" width="2" height="3" fill="#67e8f9" />
          {/* Whirling Fluff & Thread Pixels */}
          <rect x="12" y="14" width="3" height="3" fill="#f8fafc" />
          <rect x="17" y="15" width="2" height="2" fill="#38bdf8" />
          <rect x="2" y="11" width="2" height="2" fill="#67e8f9" />
          <rect x="28" y="12" width="2" height="2" fill="#67e8f9" />
          <rect x="4" y="23" width="2" height="2" fill="#f8fafc" />
          <rect x="26" y="22" width="2" height="2" fill="#f8fafc" />
        </g>
      );

    case 'volt_colossus': // Surge the Thunder Golem - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Heavy Armored Body */}
          <rect x="6" y="7" width="20" height="21" fill="#713f12" />
          <rect x="7" y="8" width="18" height="19" fill="#a16207" />
          <rect x="9" y="10" width="14" height="15" fill="#ca8a04" />
          {/* Copper Tesla Coils on Shoulders */}
          <rect x="3" y="5" width="4" height="9" fill="#78350f" />
          <rect x="4" y="6" width="2" height="7" fill="#b45309" />
          <rect x="4" y="7" width="2" height="1" fill="#facc15" />
          <rect x="4" y="10" width="2" height="1" fill="#facc15" />
          <rect x="25" y="5" width="4" height="9" fill="#78350f" />
          <rect x="26" y="6" width="2" height="7" fill="#b45309" />
          <rect x="26" y="7" width="2" height="1" fill="#facc15" />
          <rect x="26" y="10" width="2" height="1" fill="#facc15" />
          {/* Golem Optic Visor */}
          <rect x="10" y="11" width="12" height="3" fill="#0f172a" />
          <rect x="11" y="12" width="10" height="1" fill="#38bdf8" />
          <rect x="15" y="12" width="2" height="1" fill="#ffffff" />
          {/* Central Arc Core */}
          <rect x="13" y="17" width="6" height="6" fill="#713f12" />
          <rect x="14" y="18" width="4" height="4" fill="#facc15" />
          <rect x="15" y="19" width="2" height="2" fill="#ffffff" />
          {/* Electric Lightning Arcs */}
          <rect x="4" y="2" width="2" height="3" fill="#38bdf8" />
          <rect x="5" y="3" width="3" height="1" fill="#67e8f9" />
          <rect x="25" y="2" width="2" height="3" fill="#38bdf8" />
          <rect x="23" y="3" width="3" height="1" fill="#67e8f9" />
        </g>
      );

    case 'george': { // Octopus George - Retro 64x64 Pixel Art
      const isAngry = stuffyObj?.georgeMode === 'angry';
      const outlineColor = isAngry ? '#7f1d1d' : '#1e3a8a';
      const highlightColor = isAngry ? '#fca5a5' : '#93c5fd';
      const shadowColor = isAngry ? '#991b1b' : '#1d4ed8';

      return (
        <g>
          {/* Bulbous Head Dark Outline */}
          <rect x="6" y="5" width="20" height="17" fill={outlineColor} />
          <rect x="5" y="7" width="22" height="13" fill={outlineColor} />

          {/* Bulbous Head Body */}
          <rect x="7" y="6" width="18" height="14" fill={color} />
          {/* Head Top Specular Highlight */}
          <rect x="9" y="6" width="14" height="2" fill={highlightColor} />
          {/* Underside Shadow */}
          <rect x="7" y="18" width="18" height="3" fill={shadowColor} />

          {/* Curled Tentacles */}
          <rect x="3" y="20" width="26" height="8" fill={outlineColor} />
          <rect x="4" y="21" width="4" height="6" fill={color} />
          <rect x="10" y="21" width="4" height="6" fill={color} />
          <rect x="18" y="21" width="4" height="6" fill={color} />
          <rect x="24" y="21" width="4" height="6" fill={color} />
          {/* Suction Cups */}
          <rect x="5" y="25" width="2" height="2" fill="#ffffff" />
          <rect x="11" y="25" width="2" height="2" fill="#ffffff" />
          <rect x="19" y="25" width="2" height="2" fill="#ffffff" />
          <rect x="25" y="25" width="2" height="2" fill="#ffffff" />

          {/* Expressive Eyes */}
          {isAngry ? (
            <>
              {/* Fierce Angled Brows */}
              <rect x="9" y="9" width="5" height="2" fill="#7f1d1d" />
              <rect x="18" y="9" width="5" height="2" fill="#7f1d1d" />
              {/* Glowing Yellow Wrath Eyes */}
              <rect x="10" y="11" width="3" height="3" fill="#facc15" />
              <rect x="11" y="12" width="1" height="2" fill="#000000" />
              <rect x="19" y="11" width="3" height="3" fill="#facc15" />
              <rect x="20" y="12" width="1" height="2" fill="#000000" />
              {/* Gritting Teeth */}
              <rect x="13" y="16" width="6" height="2" fill="#ffffff" />
              <rect x="15" y="16" width="1" height="2" fill="#7f1d1d" />
            </>
          ) : (
            <>
              {/* Cheerful Retro Eyes */}
              <rect x="9" y="10" width="4" height="4" fill="#0f172a" />
              <rect x="9" y="10" width="2" height="2" fill="#ffffff" />
              <rect x="19" y="10" width="4" height="4" fill="#0f172a" />
              <rect x="19" y="10" width="2" height="2" fill="#ffffff" />
              {/* Rosy Cheeks & Smile */}
              <rect x="7" y="14" width="2" height="2" fill="#f472b6" />
              <rect x="23" y="14" width="2" height="2" fill="#f472b6" />
              <rect x="14" y="15" width="4" height="2" fill="#1e3a8a" />
            </>
          )}
        </g>
      );
    }

    case 'sluger': { // Heavyweight Brawler Slug - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Eyestalks with determined angle */}
          <rect x="9" y="4" width="3" height="8" fill="#064e3b" />
          <rect x="9" y="3" width="3" height="3" fill="#ffffff" />
          <rect x="10" y="4" width="1" height="2" fill="#000000" />

          <rect x="20" y="4" width="3" height="8" fill="#064e3b" />
          <rect x="20" y="3" width="3" height="3" fill="#ffffff" />
          <rect x="21" y="4" width="1" height="2" fill="#000000" />

          {/* Heavy Emerald Slime Body Outline */}
          <rect x="3" y="11" width="26" height="16" fill="#064e3b" />
          <rect x="4" y="12" width="24" height="14" fill={color} />
          {/* Underside Shadow */}
          <rect x="4" y="22" width="24" height="4" fill="#047857" />

          {/* Grinning Brawler Mouth */}
          <rect x="13" y="16" width="6" height="2" fill="#064e3b" />

          {/* Red Boxing Wraps on sides */}
          <rect x="3" y="16" width="5" height="6" fill="#dc2626" />
          <rect x="4" y="17" width="3" height="4" fill="#ef4444" />
          <rect x="24" y="16" width="5" height="6" fill="#dc2626" />
          <rect x="25" y="17" width="3" height="4" fill="#ef4444" />
        </g>
      );
    }

    case 'spike': { // Porcupine - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Sharp Quills Radiating Out */}
          <rect x="4" y="11" width="3" height="4" fill="#78350f" />
          <rect x="8" y="7" width="3" height="5" fill="#78350f" />
          <rect x="14" y="4" width="4" height="5" fill="#78350f" />
          <rect x="20" y="7" width="3" height="5" fill="#78350f" />
          <rect x="25" y="11" width="3" height="4" fill="#78350f" />

          {/* Porcupine Body Outline */}
          <rect x="6" y="10" width="20" height="17" fill="#451a03" />
          <rect x="7" y="11" width="18" height="15" fill={color} />
          <rect x="7" y="22" width="18" height="3" fill={accent} />

          {/* Porcupine Snout & Nose */}
          <rect x="10" y="18" width="6" height="4" fill="#d97706" />
          <rect x="9" y="19" width="2" height="2" fill="#0f172a" />

          {/* Button Eye with Glint */}
          <rect x="12" y="14" width="3" height="3" fill="#0f172a" />
          <rect x="12" y="14" width="1" height="1" fill="#ffffff" />

          {/* Bleeding Stuffing Quills Mark */}
          <rect x="17" y="15" width="2" height="6" fill="#dc2626" />
          <rect x="15" y="17" width="6" height="2" fill="#dc2626" />
        </g>
      );
    }

    case 'umbreon': { // Dark Pokémon - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Long Pointy Ears with Golden Rings */}
          <rect x="5" y="1" width="5" height="10" fill="#09090b" />
          <rect x="6" y="2" width="3" height="8" fill="#18181b" />
          <rect x="6" y="5" width="3" height="2" fill="#facc15" />

          <rect x="22" y="1" width="5" height="10" fill="#09090b" />
          <rect x="23" y="2" width="3" height="8" fill="#18181b" />
          <rect x="23" y="5" width="3" height="2" fill="#facc15" />

          {/* Sleek Dark Body Outline */}
          <rect x="7" y="8" width="18" height="19" fill="#09090b" />
          <rect x="8" y="9" width="16" height="17" fill="#18181b" />

          {/* Golden Forehead Ring */}
          <rect x="14" y="9" width="4" height="3" fill="#facc15" />
          <rect x="15" y="10" width="2" height="1" fill="#18181b" />

          {/* Glowing Red Cat Eyes */}
          <rect x="10" y="12" width="3" height="3" fill="#ef4444" />
          <rect x="11" y="12" width="1" height="3" fill="#000000" />
          <rect x="10" y="12" width="1" height="1" fill="#ffffff" />

          <rect x="19" y="12" width="3" height="3" fill="#ef4444" />
          <rect x="20" y="12" width="1" height="3" fill="#000000" />
          <rect x="19" y="12" width="1" height="1" fill="#ffffff" />

          {/* Golden Leg Bands */}
          <rect x="9" y="23" width="4" height="2" fill="#facc15" />
          <rect x="19" y="23" width="4" height="2" fill="#facc15" />
        </g>
      );
    }

    case 'pinky_bear': { // Pink Bear - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Round Bear Ears */}
          <rect x="6" y="5" width="6" height="6" fill="#be185d" />
          <rect x="7" y="6" width="4" height="4" fill="#f472b6" />
          <rect x="8" y="7" width="2" height="2" fill="#fbcfe8" />

          <rect x="20" y="5" width="6" height="6" fill="#be185d" />
          <rect x="21" y="6" width="4" height="4" fill="#f472b6" />
          <rect x="22" y="7" width="2" height="2" fill="#fbcfe8" />

          {/* Bear Body Outline */}
          <rect x="6" y="9" width="20" height="18" fill="#be185d" />
          <rect x="7" y="10" width="18" height="16" fill={color} />
          {/* Highlight Crown */}
          <rect x="9" y="10" width="14" height="2" fill="#fbcfe8" />

          {/* Soft Muzzle with Nose */}
          <rect x="12" y="15" width="8" height="5" fill="#fdf2f8" />
          <rect x="15" y="15" width="2" height="2" fill="#be185d" />

          {/* Button Eyes with Sparkle */}
          <rect x="10" y="12" width="3" height="3" fill="#0f172a" />
          <rect x="10" y="12" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="12" width="3" height="3" fill="#0f172a" />
          <rect x="19" y="12" width="1" height="1" fill="#ffffff" />

          {/* Secret Candy Stash in Paws */}
          <rect x="13" y="19" width="6" height="4" fill="#ec4899" />
          <rect x="11" y="20" width="2" height="2" fill="#f43f5e" />
          <rect x="19" y="20" width="2" height="2" fill="#f43f5e" />
          <rect x="15" y="20" width="2" height="2" fill="#ffffff" />
        </g>
      );
    }

    case 'big_bear': { // Colossal Bear - Retro 64x64 Pixel Art
      const isSleeping = stuffyObj?.isAsleep !== false;
      return (
        <g>
          {/* Round Ears */}
          <rect x="4" y="5" width="6" height="6" fill="#451a03" />
          <rect x="5" y="6" width="4" height="4" fill="#78350f" />
          <rect x="22" y="5" width="6" height="6" fill="#451a03" />
          <rect x="23" y="6" width="4" height="4" fill="#78350f" />

          {/* Colossal Bulk Outline */}
          <rect x="3" y="8" width="26" height="20" fill="#451a03" />
          <rect x="4" y="9" width="24" height="18" fill={color} />
          {/* Underside Shadow */}
          <rect x="4" y="23" width="24" height="4" fill="#451a03" />

          {/* Snout with Dark Nose */}
          <rect x="11" y="16" width="10" height="6" fill="#b45309" />
          <rect x="14" y="16" width="4" height="2" fill="#451a03" />

          {isSleeping ? (
            <>
              {/* Sleeping Cap */}
              <rect x="9" y="3" width="8" height="4" fill="#3b82f6" />
              <rect x="14" y="1" width="3" height="2" fill="#ffffff" />
              {/* Closed Snooze Eyes */}
              <rect x="9" y="13" width="4" height="1" fill="#451a03" />
              <rect x="19" y="13" width="4" height="1" fill="#451a03" />
              {/* Snooze Bubble */}
              <rect x="23" y="10" width="3" height="3" fill="#93c5fd" opacity="0.8" />
            </>
          ) : (
            <>
              {/* Roaring Eyes */}
              <rect x="9" y="12" width="3" height="3" fill="#dc2626" />
              <rect x="9" y="12" width="1" height="1" fill="#ffffff" />
              <rect x="20" y="12" width="3" height="3" fill="#dc2626" />
              <rect x="20" y="12" width="1" height="1" fill="#ffffff" />
              {/* Open Roaring Jaw */}
              <rect x="13" y="19" width="6" height="3" fill="#451a03" />
              <rect x="14" y="19" width="1" height="1" fill="#ffffff" />
              <rect x="17" y="19" width="1" height="1" fill="#ffffff" />
            </>
          )}
        </g>
      );
    }

    case 'allie': { // Allie the Alligator Plush - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Scaly Tail Extending Back */}
          <rect x="2" y="17" width="5" height="4" fill="#14532d" />
          <rect x="1" y="15" width="2" height="2" fill="#15803d" />

          {/* Gator Dorsal Ridges */}
          <rect x="9" y="8" width="3" height="3" fill="#14532d" />
          <rect x="14" y="7" width="3" height="3" fill="#14532d" />
          <rect x="19" y="8" width="3" height="3" fill="#14532d" />

          {/* Gator Body Outline */}
          <rect x="5" y="10" width="22" height="16" fill="#14532d" />
          <rect x="6" y="11" width="20" height="14" fill="#15803d" />

          {/* Soft Lime Belly */}
          <rect x="8" y="17" width="14" height="6" fill="#86efac" />

          {/* Extended Gator Snout & Toothy Grin */}
          <rect x="18" y="14" width="10" height="5" fill="#166534" />
          <rect x="20" y="18" width="2" height="1" fill="#ffffff" />
          <rect x="23" y="18" width="2" height="1" fill="#ffffff" />
          <rect x="26" y="18" width="2" height="1" fill="#ffffff" />

          {/* Bulging Gator Eyes */}
          <rect x="14" y="9" width="4" height="4" fill="#eab308" />
          <rect x="15" y="10" width="1" height="3" fill="#14532d" />
          <rect x="14" y="9" width="1" height="1" fill="#ffffff" />
        </g>
      );
    }

    case 'tyrant': { // Tyrant the T-Rex Dino Plush - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Dino Tail with Spikes */}
          <rect x="2" y="18" width="5" height="4" fill="#15803d" />
          <rect x="3" y="16" width="2" height="2" fill="#14532d" />

          {/* T-Rex Heavy Body Outline */}
          <rect x="6" y="9" width="18" height="17" fill="#14532d" />
          <rect x="7" y="10" width="16" height="15" fill="#16a34a" />

          {/* Pale Lime Underbelly */}
          <rect x="9" y="16" width="10" height="7" fill="#bbf7d0" />

          {/* T-Rex Snout & Sharp Teeth */}
          <rect x="16" y="7" width="11" height="8" fill="#15803d" />
          <rect x="19" y="14" width="2" height="2" fill="#ffffff" />
          <rect x="22" y="14" width="2" height="2" fill="#ffffff" />
          <rect x="25" y="14" width="2" height="2" fill="#ffffff" />

          {/* Fierce Amber Dino Eyes */}
          <rect x="17" y="9" width="3" height="3" fill="#eab308" />
          <rect x="18" y="9" width="1" height="3" fill="#000000" />
          <rect x="17" y="9" width="1" height="1" fill="#ffffff" />

          {/* Tiny Front Arms */}
          <rect x="18" y="17" width="3" height="2" fill="#14532d" />

          {/* Stomper Legs & Claws */}
          <rect x="8" y="23" width="5" height="5" fill="#14532d" />
          <rect x="7" y="27" width="2" height="1" fill="#fef08a" />
          <rect x="10" y="27" width="2" height="1" fill="#fef08a" />
          <rect x="16" y="23" width="5" height="5" fill="#14532d" />
          <rect x="15" y="27" width="2" height="1" fill="#fef08a" />
          <rect x="18" y="27" width="2" height="1" fill="#fef08a" />
        </g>
      );
    }

    case 'unicorn': { // Unicorn - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Purple Flowing Tail */}
          <rect x="2" y="16" width="4" height="7" fill="#a855f7" />
          <rect x="1" y="19" width="3" height="5" fill="#c084fc" />

          {/* Pure White Body Outline */}
          <rect x="6" y="10" width="18" height="16" fill="#cbd5e1" />
          <rect x="7" y="11" width="16" height="14" fill="#ffffff" />

          {/* Pink Hooves */}
          <rect x="8" y="23" width="4" height="5" fill="#ec4899" />
          <rect x="18" y="23" width="4" height="5" fill="#ec4899" />

          {/* White Head & Soft Muzzle */}
          <rect x="15" y="8" width="9" height="9" fill="#ffffff" />
          <rect x="21" y="12" width="4" height="4" fill="#fdf2f8" />
          <rect x="23" y="13" width="1" height="1" fill="#ec4899" />

          {/* Big Sparkling Anime Eyes */}
          <rect x="17" y="10" width="3" height="3" fill="#6366f1" />
          <rect x="17" y="10" width="1" height="1" fill="#ffffff" />

          {/* Flowing Purple Mane */}
          <rect x="13" y="6" width="4" height="8" fill="#a855f7" />
          <rect x="11" y="9" width="3" height="5" fill="#c084fc" />

          {/* Spiral Rainbow Horn */}
          <rect x="19" y="5" width="2" height="3" fill="#ef4444" />
          <rect x="20" y="3" width="2" height="2" fill="#f59e0b" />
          <rect x="21" y="1" width="2" height="2" fill="#10b981" />
          <rect x="22" y="0" width="1" height="1" fill="#3b82f6" />
        </g>
      );
    }

    case 'grumpy_rhino': { // Grumpy Rhino - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Heavy Armored Body Outline */}
          <rect x="5" y="10" width="22" height="16" fill="#334155" />
          <rect x="6" y="11" width="20" height="14" fill="#64748b" />
          <rect x="6" y="21" width="20" height="3" fill="#475569" />

          {/* Sturdy Short Legs */}
          <rect x="8" y="24" width="4" height="4" fill="#334155" />
          <rect x="18" y="24" width="4" height="4" fill="#334155" />

          {/* Grumpy Head & Jowls */}
          <rect x="15" y="9" width="11" height="9" fill="#64748b" />

          {/* Large Curved Rhino Horn */}
          <rect x="23" y="7" width="5" height="5" fill="#334155" />
          <rect x="25" y="4" width="3" height="4" fill="#e2e8f0" />

          {/* Furrowed Brow & Glaring Eyes */}
          <rect x="16" y="11" width="5" height="1.5" fill="#0f172a" />
          <rect x="17" y="13" width="2" height="2" fill="#f59e0b" />
          <rect x="18" y="13" width="1" height="2" fill="#000000" />

          {/* Down-Turned Scowl */}
          <rect x="19" y="16" width="4" height="1.5" fill="#1e293b" />
        </g>
      );
    }

    case 'farty_lama': { // Farty Lama - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Magenta & Cyan Striped Pinata Body */}
          <rect x="5" y="13" width="16" height="11" fill="#9333ea" />
          <rect x="5" y="15" width="16" height="2" fill="#06b6d4" />
          <rect x="5" y="19" width="16" height="2" fill="#06b6d4" />

          {/* Tall Llama Neck & Head */}
          <rect x="15" y="6" width="6" height="10" fill="#9333ea" />
          <rect x="14" y="4" width="9" height="6" fill="#06b6d4" />

          {/* Llama Ears */}
          <rect x="15" y="1" width="2" height="4" fill="#06b6d4" />
          <rect x="19" y="1" width="2" height="4" fill="#9333ea" />

          {/* Googly Pinata Eyes */}
          <rect x="17" y="6" width="3" height="3" fill="#ffffff" />
          <rect x="18" y="7" width="1" height="1" fill="#000000" />

          {/* Legs */}
          <rect x="8" y="23" width="3" height="5" fill="#9333ea" />
          <rect x="16" y="23" width="3" height="5" fill="#06b6d4" />

          {/* Farty Green Gas Clouds */}
          <rect x="1" y="21" width="4" height="4" fill="#22c55e" opacity="0.8" />
          <rect x="3" y="19" width="3" height="3" fill="#84cc16" opacity="0.8" />
        </g>
      );
    }

    case 'dolpher': { // Dolpher - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Dorsal Fin with Rose Accent */}
          <rect x="15" y="5" width="4" height="6" fill="#374151" />
          <rect x="16" y="5" width="2" height="2" fill="#f43f5e" />

          {/* Mature Grey Dolphin Body Outline */}
          <rect x="4" y="10" width="24" height="15" fill="#1f2937" />
          <rect x="5" y="11" width="22" height="13" fill="#4b5563" />
          {/* Pearl Soft Underbelly */}
          <rect x="7" y="17" width="17" height="6" fill="#e5e7eb" />

          {/* Snout with Matriarch Smile */}
          <rect x="23" y="14" width="5" height="4" fill="#4b5563" />
          <rect x="24" y="17" width="4" height="1" fill="#111827" />

          {/* Kind Matriarch Eye */}
          <rect x="20" y="13" width="3" height="3" fill="#111827" />
          <rect x="20" y="13" width="1" height="1" fill="#ffffff" />
        </g>
      );
    }

    case 'dolphim': { // Dolphim - Retro 64x64 Pixel Art
      return (
        <g>
          {/* Sleek Aerodynamic Dorsal Fin */}
          <rect x="14" y="6" width="4" height="6" fill="#4b5563" />

          {/* Sleek Light Silver Grey Body Outline */}
          <rect x="5" y="11" width="22" height="13" fill="#4b5563" />
          <rect x="6" y="12" width="20" height="11" fill="#9ca3af" />
          {/* Bright Silver Belly */}
          <rect x="8" y="17" width="15" height="5" fill="#f3f4f6" />

          {/* Smart Dolphin Snout */}
          <rect x="22" y="14" width="5" height="3" fill="#9ca3af" />

          {/* Clever Sparkle Eyes */}
          <rect x="19" y="13" width="3" height="3" fill="#0284c7" />
          <rect x="19" y="13" width="1" height="1" fill="#ffffff" />

          {/* Sonar Calculation Ring Pixels */}
          <rect x="24" y="11" width="1" height="1" fill="#38bdf8" />
          <rect x="26" y="13" width="1" height="1" fill="#38bdf8" />
        </g>
      );
    }

    case 'stone_blob':
    case 'wild_stuffy':
    default:
      return (
        <g>
          {/* Ground Contact Shadow */}
          <rect x="6" y="26" width="20" height="3" fill="#0f172a" opacity="0.6" />
          <rect x="8" y="25" width="16" height="4" fill="#0f172a" opacity="0.4" />

          {/* Stepped Boulder Contour Silhouette */}
          <rect x="6" y="9" width="20" height="17" fill="#1e293b" />
          <rect x="8" y="6" width="16" height="20" fill="#1e293b" />
          <rect x="10" y="4" width="12" height="22" fill="#1e293b" />

          {/* Main Stone Base & Midtones */}
          <rect x="7" y="10" width="18" height="15" fill={color || '#64748b'} />
          <rect x="9" y="7" width="14" height="18" fill={color || '#64748b'} />
          <rect x="11" y="5" width="10" height="20" fill={color || '#64748b'} />

          {/* Chiseled Granite Highlights */}
          <rect x="11" y="6" width="8" height="4" fill="#94a3b8" />
          <rect x="8" y="10" width="4" height="3" fill="#cbd5e1" />
          <rect x="9" y="8" width="2" height="2" fill="#f1f5f9" />

          {/* Natural Stone Faultlines & Cracks */}
          <rect x="11" y="12" width="1" height="4" fill="#334155" />
          <rect x="12" y="15" width="2" height="1" fill="#334155" />
          <rect x="19" y="18" width="3" height="1" fill="#334155" />
          <rect x="21" y="19" width="1" height="4" fill="#334155" />

          {/* Moss & Lichen Accent Spots */}
          <rect x="8" y="18" width="3" height="3" fill="#15803d" />
          <rect x="9" y="19" width="1" height="1" fill="#22c55e" />
          <rect x="22" y="13" width="2" height="3" fill="#15803d" />
          <rect x="22" y="14" width="1" height="1" fill="#4ade80" />

          {/* Gemlike Stone Eyes with Highlights */}
          <rect x="10" y="13" width="4" height="4" fill="#0f172a" />
          <rect x="11" y="14" width="2" height="2" fill="#38bdf8" />
          <rect x="11" y="14" width="1" height="1" fill="#ffffff" />
          <rect x="18" y="13" width="4" height="4" fill="#0f172a" />
          <rect x="19" y="14" width="2" height="2" fill="#38bdf8" />
          <rect x="19" y="14" width="1" height="1" fill="#ffffff" />

          {/* Stony Smile Crevice */}
          <rect x="14" y="19" width="4" height="1" fill="#0f172a" />

          {/* Stepped Stone Pebble Feet */}
          <rect x="7" y="24" width="5" height="3" fill="#475569" />
          <rect x="20" y="24" width="5" height="3" fill="#475569" />
        </g>
      );
  }
}
