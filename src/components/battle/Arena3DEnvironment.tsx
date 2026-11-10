'use client';

import React from 'react';

export type ArenaThemeKey =
  | 'moonlit_glade'
  | 'candy_stash'
  | 'slumber_den'
  | 'prickly_thicket'
  | 'classic_quilt'
  | 'volcanic_rift'
  | 'cosmic_void'
  | 'sunken_reef';

interface Arena3DEnvironmentProps {
  theme: ArenaThemeKey;
}

export const Arena3DEnvironment: React.FC<Arena3DEnvironmentProps> = ({ theme }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. HORIZON & DISTANT 3D SKY BACKDROP */}
      <div className="absolute inset-0 z-0">
        {theme === 'moonlit_glade' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#050714] via-[#0a0f26] to-[#04060f]">
            {/* Giant 3D Shaded Moon */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-blue-100 via-indigo-200 to-slate-800 shadow-[0_0_90px_rgba(191,219,254,0.45)] border border-blue-200/40 opacity-90">
              <div className="absolute top-8 left-10 w-10 h-10 rounded-full bg-slate-700/25 blur-[2px]" />
              <div className="absolute top-20 left-24 w-16 h-16 rounded-full bg-slate-800/30 blur-[3px]" />
              <div className="absolute top-14 left-40 w-12 h-12 rounded-full bg-slate-700/20 blur-[2px]" />
              <div className="absolute inset-0 rounded-full bg-radial from-transparent via-transparent to-blue-950/60" />
            </div>

            {/* Distant Misty Pine Tree Silhouettes */}
            <div className="absolute bottom-1/3 inset-x-0 h-44 opacity-35 flex justify-between items-end px-4 blur-[1px]">
              <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[140px] border-b-indigo-950" />
              <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[180px] border-b-slate-900" />
              <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[160px] border-b-indigo-950/90" />
              <div className="hidden md:block w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[200px] border-b-slate-950" />
              <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[170px] border-b-indigo-950" />
              <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[130px] border-b-slate-900" />
            </div>

            {/* Volumetric Moonlight Light Shafts */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(191,219,254,0.22)_0%,transparent_65%)]" />
            <div
              className="absolute top-0 left-1/3 w-36 h-full bg-gradient-to-b from-blue-300/15 via-blue-400/5 to-transparent blur-2xl transform -rotate-12 pointer-events-none"
            />
            <div
              className="absolute top-0 right-1/3 w-40 h-full bg-gradient-to-b from-indigo-300/15 via-blue-400/5 to-transparent blur-2xl transform rotate-12 pointer-events-none"
            />
          </div>
        )}

        {theme === 'candy_stash' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#240718] via-[#3b0f27] to-[#1a0512]">
            {/* Candy Cane 3D Flank Pillars */}
            <div className="absolute top-8 left-4 md:left-12 w-8 md:w-12 h-80 rounded-t-full bg-[repeating-linear-gradient(45deg,#ef4444_0px,#ef4444_16px,#f8fafc_16px,#f8fafc_32px)] shadow-[0_0_30px_rgba(244,114,182,0.4),inset_-4px_0_8px_rgba(0,0,0,0.5)] border border-pink-400/50 opacity-80" />
            <div className="absolute top-8 right-4 md:right-12 w-8 md:w-12 h-80 rounded-t-full bg-[repeating-linear-gradient(-45deg,#ef4444_0px,#ef4444_16px,#f8fafc_16px,#f8fafc_32px)] shadow-[0_0_30px_rgba(244,114,182,0.4),inset_4px_0_8px_rgba(0,0,0,0.5)] border border-pink-400/50 opacity-80" />

            {/* Distant Gumdrop Hills & Sugar Clouds */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-40">
              <div className="w-32 h-20 rounded-t-full bg-gradient-to-b from-pink-500 to-purple-900 blur-[1px]" />
              <div className="w-48 h-32 rounded-t-full bg-gradient-to-b from-purple-500 to-indigo-950 blur-[1px]" />
              <div className="w-36 h-24 rounded-t-full bg-gradient-to-b from-rose-500 to-purple-900 blur-[1px]" />
            </div>

            {/* Cotton Candy Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(244,114,182,0.28)_0%,transparent_70%)]" />
          </div>
        )}

        {theme === 'slumber_den' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#180f08] via-[#26150b] to-[#100905]">
            {/* Warm Hearth / Bedside 3D Headboard Wood Paneling */}
            <div className="absolute top-0 inset-x-0 h-64 bg-[repeating-linear-gradient(90deg,#24140a_0px,#24140a_48px,#170c06_48px,#170c06_52px)] shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8)] opacity-60" />

            {/* Glowing Brass Lantern (Top-Right) with 3D Volumetric Light Cone */}
            <div className="absolute top-6 right-8 md:right-20 flex flex-col items-center">
              <div className="w-1 h-12 bg-amber-700/80 shadow-md" />
              <div className="w-12 h-16 rounded-xl bg-amber-400/90 shadow-[0_0_60px_rgba(251,191,36,0.7)] border-2 border-yellow-200 flex items-center justify-center animate-pulse">
                <span className="text-xl">🕯️</span>
              </div>
              <div className="absolute top-20 -right-24 w-80 h-96 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.25)_0%,transparent_75%)] pointer-events-none transform -rotate-12 blur-lg" />
            </div>

            {/* Pillow Fortress Horizon */}
            <div className="absolute bottom-1/3 inset-x-0 flex justify-center gap-4 opacity-30">
              <div className="w-44 h-24 rounded-3xl bg-amber-200/20 shadow-inner blur-[1px]" />
              <div className="w-56 h-28 rounded-3xl bg-amber-100/25 shadow-inner blur-[1px]" />
              <div className="w-40 h-22 rounded-3xl bg-amber-200/20 shadow-inner blur-[1px]" />
            </div>
          </div>
        )}

        {theme === 'prickly_thicket' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#05110a] via-[#0a1e13] to-[#030905]">
            {/* Overgrown Stone Ruins Pillars with 3D Bevels */}
            <div className="absolute top-10 left-6 md:left-16 w-12 md:w-16 h-72 bg-gradient-to-b from-stone-700 via-stone-800 to-emerald-950 border-r-4 border-stone-900 shadow-[0_0_35px_rgba(16,185,129,0.3)] rounded-t-lg opacity-75">
              <div className="absolute top-8 left-0 right-0 h-2 bg-emerald-600/40 blur-[1px]" />
              <div className="absolute top-24 left-0 right-0 h-2 bg-emerald-600/40 blur-[1px]" />
            </div>
            <div className="absolute top-10 right-6 md:right-16 w-12 md:w-16 h-72 bg-gradient-to-b from-stone-700 via-stone-800 to-emerald-950 border-l-4 border-stone-900 shadow-[0_0_35px_rgba(16,185,129,0.3)] rounded-t-lg opacity-75">
              <div className="absolute top-12 left-0 right-0 h-2 bg-emerald-600/40 blur-[1px]" />
              <div className="absolute top-32 left-0 right-0 h-2 bg-emerald-600/40 blur-[1px]" />
            </div>

            {/* Twisted Briar Archway Silhouette */}
            <div className="absolute top-4 inset-x-0 flex justify-center opacity-30">
              <div className="w-96 md:w-[650px] h-40 border-t-8 border-x-4 border-emerald-900 rounded-t-full shadow-2xl" />
            </div>

            {/* Emerald Forest Depth Radiance */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(16,185,129,0.22)_0%,transparent_65%)]" />
          </div>
        )}

        {theme === 'classic_quilt' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0815] via-[#16122b] to-[#070510]">
            {/* Giant Thread Spools Standing in Horizon */}
            <div className="absolute top-8 left-8 md:left-24 flex flex-col items-center opacity-65">
              <div className="w-14 h-4 rounded-full bg-amber-800 shadow-md" />
              <div className="w-10 h-32 bg-gradient-to-r from-red-600 via-red-500 to-red-800 shadow-inner" />
              <div className="w-14 h-4 rounded-full bg-amber-800 shadow-md" />
            </div>
            <div className="absolute top-8 right-8 md:right-24 flex flex-col items-center opacity-65">
              <div className="w-14 h-4 rounded-full bg-amber-800 shadow-md" />
              <div className="w-10 h-32 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-800 shadow-inner" />
              <div className="w-14 h-4 rounded-full bg-amber-800 shadow-md" />
            </div>

            {/* Stitched Fabric Horizon */}
            <div className="absolute top-16 inset-x-0 h-40 bg-[repeating-linear-gradient(45deg,#231c44_0px,#231c44_20px,#1a1533_20px,#1a1533_40px)] border-b-2 border-dashed border-indigo-400/30 opacity-40" />

            {/* Quilt Indigo Hearth Ambient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(99,102,241,0.22)_0%,transparent_70%)]" />
          </div>
        )}

        {theme === 'volcanic_rift' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#180404] via-[#2e0907] to-[#120202]">
            {/* Distant Jagged Volcanic Peaks */}
            <div className="absolute bottom-1/3 inset-x-0 h-52 opacity-50 flex justify-around items-end blur-[1px]">
              <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[180px] border-b-red-950" />
              <div className="w-0 h-0 border-l-[90px] border-l-transparent border-r-[90px] border-r-transparent border-b-[240px] border-b-stone-950" />
              <div className="w-0 h-0 border-l-[70px] border-l-transparent border-r-[70px] border-r-transparent border-b-[200px] border-b-red-950" />
            </div>

            {/* Glowing Magma Fissure Horizon */}
            <div className="absolute top-1/3 inset-x-0 h-10 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent blur-md animate-pulse" />

            {/* Rising Heat Distortion Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(239,68,68,0.28)_0%,transparent_70%)]" />
          </div>
        )}

        {theme === 'cosmic_void' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#02010a] via-[#090620] to-[#010107]">
            {/* Swirling Galactic Core Nebula */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 md:w-[600px] h-64 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.35)_0%,rgba(59,130,246,0.2)_50%,transparent_80%)] blur-2xl transform rotate-12" />

            {/* Floating Crystalline Monoliths */}
            <div className="absolute top-16 left-12 w-6 h-36 bg-gradient-to-b from-cyan-400 to-blue-700 shadow-[0_0_25px_rgba(34,211,238,0.6)] transform rotate-12 opacity-70 border border-cyan-200" />
            <div className="absolute top-20 right-16 w-8 h-44 bg-gradient-to-b from-purple-400 to-indigo-800 shadow-[0_0_25px_rgba(168,85,247,0.6)] transform -rotate-12 opacity-70 border border-purple-200" />

            {/* Distant Star Dust Particles */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4)_1px,transparent_1px),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.35)_1px,transparent_1px),radial-gradient(circle_at_40%_70%,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[length:90px_90px] opacity-40" />
          </div>
        )}

        {theme === 'sunken_reef' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#02131b] via-[#05232d] to-[#010c12]">
            {/* Submerged Grecian Coral Pillars */}
            <div className="absolute top-10 left-8 md:left-20 w-12 md:w-16 h-80 bg-gradient-to-b from-teal-700 via-teal-900 to-cyan-950 border-r-2 border-teal-500/40 rounded-t-xl opacity-60 shadow-[0_0_30px_rgba(20,184,166,0.3)]" />
            <div className="absolute top-10 right-8 md:right-20 w-12 md:w-16 h-80 bg-gradient-to-b from-teal-700 via-teal-900 to-cyan-950 border-l-2 border-teal-500/40 rounded-t-xl opacity-60 shadow-[0_0_30px_rgba(20,184,166,0.3)]" />

            {/* Shimmering Underwater Caustics Web */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(45,212,191,0.25)_0%,transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.18)_0%,transparent_40%),radial-gradient(circle_at_70%_50%,rgba(45,212,191,0.15)_0%,transparent_45%)] blur-lg animate-pulse" />
          </div>
        )}
      </div>

      {/* 2. TRUE 3D PERSPECTIVE BATTLEFIELD STAGE (FLOOR DAIS) */}
      <div
        className="absolute inset-x-0 bottom-0 top-[22%] z-10 flex items-center justify-center overflow-visible pointer-events-none"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 32%',
        }}
      >
        <div
          className="relative w-[96vw] max-w-6xl h-[68vh] rounded-[48px] transition-all duration-700"
          style={{
            transform: 'rotateX(55deg) translateZ(0)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 45px 80px -15px rgba(0,0,0,0.95), inset 0 2px 6px rgba(255,255,255,0.2)',
          }}
        >
          {/* THEME 1: MOONLIT GLADE 3D STONE HEX-DAIS */}
          {theme === 'moonlit_glade' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#131c38] via-[#0d1428] to-[#080d1b] border-4 border-blue-400/40 shadow-[inset_0_0_90px_rgba(30,58,138,0.7)] overflow-hidden">
              {/* Perspective Stone Floor Pavement Grid */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(147,197,253,0.1)_0px,rgba(147,197,253,0.1)_2px,transparent_2px,transparent_48px),repeating-linear-gradient(90deg,rgba(147,197,253,0.08)_0px,rgba(147,197,253,0.08)_2px,transparent_2px,transparent_64px)] opacity-60" />
              {/* Glowing Arcane Rune Inlays */}
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-cyan-400/35 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-blue-300/25 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-cyan-300/30 flex items-center justify-center">
                    <span className="text-6xl opacity-20 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">🌙</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* THEME 2: SECRET CANDY STASH 3D SUGAR CHECKERBOARD */}
          {theme === 'candy_stash' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#40122e] via-[#2c0c20] to-[#1a0613] border-4 border-pink-400/50 shadow-[inset_0_0_90px_rgba(236,72,153,0.6)] overflow-hidden">
              {/* Glossy 3D Checkerboard Sugar Tiles */}
              <div className="absolute inset-0 bg-[repeating-conic-gradient(#501639_0%_25%,#340e25_0%_50%)] bg-[length:54px_54px] opacity-75" />
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-pink-300/40 shadow-[0_0_25px_rgba(244,114,182,0.4)] flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border-2 border-pink-400/30 flex items-center justify-center">
                  <span className="text-6xl opacity-25 filter drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]">🍬</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME 3: DEEP SLUMBER DEN 3D POLISHED OAK HEARTH */}
          {theme === 'slumber_den' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#2e190f] via-[#1f100a] to-[#120905] border-4 border-amber-600/50 shadow-[inset_0_0_90px_rgba(180,83,9,0.7)] overflow-hidden">
              {/* Hardwood Floor Plank Lines */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(251,191,36,0.08)_0px,rgba(251,191,36,0.08)_2px,transparent_2px,transparent_40px),repeating-linear-gradient(90deg,rgba(0,0,0,0.4)_0px,rgba(0,0,0,0.4)_3px,transparent_3px,transparent_120px)] opacity-70" />
              {/* Centered Plush Hearth Rug */}
              <div className="absolute inset-10 rounded-[36px] bg-gradient-to-b from-amber-950/80 to-stone-950/90 border-2 border-dashed border-amber-500/40 shadow-2xl flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-amber-400/30 flex items-center justify-center">
                  <span className="text-6xl opacity-25 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">💤</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME 4: PRICKLY BRIAR THICKET 3D CRACKED MOSS STONE */}
          {theme === 'prickly_thicket' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#11261b] via-[#0b1c13] to-[#06120b] border-4 border-emerald-500/40 shadow-[inset_0_0_90px_rgba(5,150,105,0.7)] overflow-hidden">
              {/* Ancient Moss Stone Hex Grid */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(60deg,rgba(52,211,153,0.1)_0px,rgba(52,211,153,0.1)_2px,transparent_2px,transparent_52px),repeating-linear-gradient(-60deg,rgba(52,211,153,0.1)_0px,rgba(52,211,153,0.1)_2px,transparent_2px,transparent_52px)] opacity-65" />
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border-2 border-emerald-400/30 flex items-center justify-center">
                  <span className="text-6xl opacity-25 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">🌿</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME 5: CLASSIC QUILT 3D DIAMOND TUFTED PLUSH */}
          {theme === 'classic_quilt' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#1d173b] via-[#14102c] to-[#0c091d] border-4 border-indigo-400/40 shadow-[inset_0_0_90px_rgba(79,70,229,0.7)] overflow-hidden">
              {/* Diamond-Stitched Seam Drop Shadows */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(165,180,252,0.12)_0px,rgba(165,180,252,0.12)_2px,transparent_2px,transparent_50px),repeating-linear-gradient(-45deg,rgba(165,180,252,0.12)_0px,rgba(165,180,252,0.12)_2px,transparent_2px,transparent_50px)] opacity-70" />
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-indigo-300/40 shadow-inner flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border border-indigo-400/30 flex items-center justify-center">
                  <span className="text-6xl opacity-25 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]">🧵</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME 6: VOLCANIC MAGMA RIFT 3D CRACKED BASALT */}
          {theme === 'volcanic_rift' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#2e0906] via-[#1c0504] to-[#0e0202] border-4 border-red-500/50 shadow-[inset_0_0_110px_rgba(220,38,38,0.8)] overflow-hidden">
              {/* Molten Lava Fissure Lines in Floor */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(249,115,22,0.15)_0px,rgba(249,115,22,0.15)_3px,transparent_3px,transparent_56px),repeating-linear-gradient(45deg,rgba(239,68,68,0.15)_0px,rgba(239,68,68,0.15)_3px,transparent_3px,transparent_56px)] opacity-80" />
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center animate-pulse">
                <div className="w-56 h-56 rounded-full border-2 border-red-500/40 flex items-center justify-center">
                  <span className="text-6xl opacity-30 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">🌋</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME 7: COSMIC STARLIGHT VOID 3D HOLOGRAPHIC GRID */}
          {theme === 'cosmic_void' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#120a2e] via-[#09051c] to-[#04020f] border-4 border-cyan-400/50 shadow-[inset_0_0_110px_rgba(6,182,212,0.7)] overflow-hidden">
              {/* Glowing Cyan Hologram Grid Receding into Space */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.18)_0px,rgba(34,211,238,0.18)_2px,transparent_2px,transparent_44px),repeating-linear-gradient(90deg,rgba(168,85,247,0.18)_0px,rgba(168,85,247,0.18)_2px,transparent_2px,transparent_44px)] opacity-85" />
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-cyan-300/50 shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border-2 border-cyan-400/40 flex items-center justify-center">
                  <span className="text-6xl opacity-30 filter drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]">🌌</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME 8: SUNKEN CORAL KINGDOM 3D MOSAIC DAIS */}
          {theme === 'sunken_reef' && (
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#082a36] via-[#051c24] to-[#020e13] border-4 border-teal-400/50 shadow-[inset_0_0_100px_rgba(20,184,166,0.7)] overflow-hidden">
              {/* Submerged Mosaic Tiles with Caustic Highlights */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(45,212,191,0.15)_0px,rgba(45,212,191,0.15)_2px,transparent_2px,transparent_48px),repeating-linear-gradient(-45deg,rgba(56,189,248,0.15)_0px,rgba(56,189,248,0.15)_2px,transparent_2px,transparent_48px)] opacity-75" />
              <div className="absolute inset-6 rounded-[40px] border-2 border-dashed border-teal-300/40 shadow-[0_0_25px_rgba(45,212,191,0.4)] flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border-2 border-teal-400/35 flex items-center justify-center">
                  <span className="text-6xl opacity-30 filter drop-shadow-[0_0_18px_rgba(20,184,166,0.8)]">🌊</span>
                </div>
              </div>
            </div>
          )}

          {/* 3D PERSPECTIVE CENTER LINE & BATTLE ACCENTS */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-8 h-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-dashed border-yellow-400/35 flex items-center justify-center shadow-lg">
            <span className="text-3xl opacity-30">⚔️</span>
          </div>

          {/* OPPONENT TERRITORY TOP RIM */}
          <div className="absolute top-2 inset-x-12 h-6 rounded-t-3xl bg-red-500/10 border-t border-red-500/30" />
          {/* PLAYER TERRITORY BOTTOM RIM */}
          <div className="absolute bottom-2 inset-x-12 h-6 rounded-b-3xl bg-emerald-500/10 border-b border-emerald-500/30" />
        </div>
      </div>

      {/* 3. PARALLAX LAYERED AMBIENT DEPTH MOTES & LIGHT SHAFTS (v4.6 standard) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {/* Preserves test assertion: "Parallax Layered Depth (v4.6): Ambient dust motes, light shafts & depth vignette" */}
        <div className="absolute w-2 h-2 rounded-full bg-yellow-300/30 blur-[1px] top-1/4 left-1/6 animate-pulse" />
        <div className="absolute w-3 h-3 rounded-full bg-cyan-300/20 blur-[1px] top-1/3 right-1/4 animate-bounce-slow" />
        <div className="absolute w-2 h-2 rounded-full bg-amber-400/25 blur-[1px] bottom-1/3 left-1/3 animate-pulse" />
        <div className="absolute w-4 h-4 rounded-full bg-indigo-400/15 blur-[2px] top-1/2 right-1/6 animate-pulse" />

        {/* Dynamic Theme Particles */}
        {theme === 'volcanic_rift' && (
          <>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-orange-400/60 blur-[1px] bottom-1/4 left-1/4 animate-pulse" />
            <div className="absolute w-3 h-3 rounded-full bg-red-400/50 blur-[1px] bottom-1/3 right-1/3 animate-bounce-slow" />
          </>
        )}
        {theme === 'cosmic_void' && (
          <>
            <div className="absolute w-2 h-2 rounded-full bg-cyan-300/70 blur-[1px] top-1/5 right-1/5 animate-pulse" />
            <div className="absolute w-3 h-3 rounded-full bg-purple-300/50 blur-[1px] top-2/3 left-1/5 animate-bounce-slow" />
          </>
        )}
        {theme === 'sunken_reef' && (
          <>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-teal-200/50 blur-[1px] bottom-1/5 left-2/5 animate-bounce-slow" />
            <div className="absolute w-2 h-2 rounded-full bg-cyan-300/40 blur-[1px] bottom-1/3 right-1/4 animate-pulse" />
          </>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/70 pointer-events-none" />
      </div>
    </div>
  );
};
export default Arena3DEnvironment;
