'use client';

import React, { useState, useEffect, useRef } from 'react';
import { executeAdminCommand, CommandExecutionResult } from '@/utils/adminCommands';
import { getAllItemCatalog, grantItemToInventory, ItemTemplate, getStuffyComputedStats } from '@/data/items';
import { ALL_ESPERS } from '@/data/espers';
import { getStuffyBaseSpeed } from '@/data/stuffies';
import { useCampaignStore } from '@/store/campaignStore';
import { GameItem, ItemCategory, ItemRarity, Esper, StuffyState } from '@/types/game';
import { sound } from '@/utils/audio';

const ADMIN_PASSWORD = 'Benrealcreator';
const AUTH_STORAGE_KEY = 'ben_admin_auth_v37';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArmory?: () => void;
  onOpenShop?: () => void;
  onOpenReward?: () => void;
}

interface ConsoleEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
  timestamp: string;
}

const CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: 'helmet', label: 'Helmet', icon: '🪖' },
  { id: 'chestplate', label: 'Chestplate', icon: '🛡️' },
  { id: 'gloves', label: 'Gloves', icon: '🧤' },
  { id: 'sword', label: 'Sword', icon: '⚔️' },
  { id: 'offhand', label: 'Offhand', icon: '⏱️' },
  { id: 'pendant', label: 'Pendant', icon: '📿' },
];

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string }> = {
  common: { border: 'border-slate-500', bg: 'bg-slate-900/80', text: 'text-slate-300' },
  uncommon: { border: 'border-emerald-500', bg: 'bg-emerald-950/60', text: 'text-emerald-400' },
  rare: { border: 'border-cyan-500', bg: 'bg-cyan-950/60', text: 'text-cyan-300' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-950/60', text: 'text-purple-300' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-950/60', text: 'text-yellow-300' },
};

export default function AdminPanelModal({
  isOpen,
  onClose,
  onOpenArmory,
  onOpenShop,
  onOpenReward,
}: AdminPanelModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'console' | 'item_spawner' | 'esper_spawner'>('console');

  // Console state
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<ConsoleEntry[]>([
    {
      id: 'init_1',
      type: 'output',
      text: '🛠️ Ben Stuffy Card Battle - Tester Admin Terminal initialized (v3.8).\nType "/.help" to see available commands.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Item Spawner state
  const [itemCatalog, setItemCatalog] = useState<GameItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [recentlyGranted, setRecentlyGranted] = useState<string | null>(null);

  // Esper Spawner state
  const [selectedEsperToInfuse, setSelectedEsperToInfuse] = useState<Esper | null>(null);
  const [esperSearch, setEsperSearch] = useState<string>('');
  const [recentlyInfused, setRecentlyInfused] = useState<string | null>(null);

  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const { activeParty, bench, infuseEsperIntoStuffy, runActive } = useCampaignStore();

  // Check persisted authentication on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Initialize Item Catalog when opened
  useEffect(() => {
    if (isOpen) {
      setItemCatalog(getAllItemCatalog());
    }
  }, [isOpen]);

  // Scroll to bottom of console
  useEffect(() => {
    if (activeTab === 'console') {
      consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Focus command input on open
  useEffect(() => {
    if (isOpen && isAuthenticated && activeTab === 'console') {
      setTimeout(() => commandInputRef.current?.focus(), 100);
    }
  }, [isOpen, isAuthenticated, activeTab]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sound.playRewardSound();
      setIsAuthenticated(true);
      setPasswordError('');
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      }
    } else {
      sound.playCrackSound();
      setPasswordError('❌ Invalid password. Access denied.');
      setPasswordInput('');
    }
  };

  const handleLockAdmin = () => {
    sound.playClickSound();
    setIsAuthenticated(false);
    setPasswordInput('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    sound.playClickSound();
    const time = new Date().toLocaleTimeString();
    const inputEntry: ConsoleEntry = {
      id: `in_${Date.now()}_${Math.random()}`,
      type: 'input',
      text: `> ${cmd}`,
      timestamp: time,
    };

    const res: CommandExecutionResult = executeAdminCommand(cmd);

    const outputEntry: ConsoleEntry = {
      id: `out_${Date.now()}_${Math.random()}`,
      type: res.success ? 'success' : 'error',
      text: res.message,
      timestamp: time,
    };

    if (res.action === 'clear_console') {
      setLogs([]);
    } else {
      setLogs((prev) => [...prev, inputEntry, outputEntry]);
    }

    if (res.action === 'open_item_panel') {
      setActiveTab('item_spawner');
    } else if (res.action === 'open_esper_panel') {
      setActiveTab('esper_spawner');
    } else if (res.action === 'open_shop') {
      onOpenShop?.();
    } else if (res.action === 'open_rewards') {
      onOpenReward?.();
    }

    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);
    setCommandInput('');
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(commandHistory.length - 1, historyIndex + 1);
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setCommandInput(commandHistory[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const handleGrantItem = (item: GameItem) => {
    sound.playRewardSound();
    const granted = grantItemToInventory(item);
    setRecentlyGranted(granted.name);
    setTimeout(() => setRecentlyGranted(null), 3500);

    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: `grant_${Date.now()}`,
        type: 'success',
        text: `🎁 [ADMIN ITEM GRANTED] "${granted.name}" (+${granted.value} ${granted.attribute.toUpperCase()}) was delivered to your Armory!`,
        timestamp: time,
      },
    ]);
  };

  const handleInfuseEsper = (stuffyInstanceId: string) => {
    if (!selectedEsperToInfuse) return;
    const target = [...activeParty, ...bench].find((s) => s.instanceId === stuffyInstanceId);
    if (!target) return;
    if ((target.espers || []).length >= 5) {
      setRecentlyInfused(`⚠️ ${target.name} has reached the maximum limit of 5 Espers!`);
      setTimeout(() => setRecentlyInfused(null), 3500);
      return;
    }

    sound.playRewardSound();
    infuseEsperIntoStuffy(selectedEsperToInfuse, stuffyInstanceId);
    setRecentlyInfused(`✨ ${selectedEsperToInfuse.name} infused into ${target.name}!`);
    setTimeout(() => setRecentlyInfused(null), 3500);

    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: `esper_${Date.now()}`,
        type: 'success',
        text: `🔮 [ADMIN ESPER INFUSED] "${selectedEsperToInfuse.name}" bonded with ${target.name}!`,
        timestamp: time,
      },
    ]);
    setSelectedEsperToInfuse(null);
  };

  // Filtered item list
  const filteredItems = itemCatalog.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
    if (itemSearch.trim()) {
      const q = itemSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.attribute.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered espers list
  const filteredEspers = ALL_ESPERS.filter((esper) => {
    if (esperSearch.trim()) {
      const q = esperSearch.toLowerCase();
      return (
        esper.name.toLowerCase().includes(q) ||
        esper.title.toLowerCase().includes(q) ||
        esper.description.toLowerCase().includes(q) ||
        esper.element.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden animate-fadeIn select-none">
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-emerald-500/80 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl shadow-emerald-950/60 overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/40 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🛠️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-lg md:text-xl text-emerald-400 font-extrabold tracking-wide">
                  BEN TESTER ADMIN PANEL
                </h2>
                <span className="text-[10px] font-pixel bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                  v3.8
                </span>
                {isAuthenticated && (
                  <span className="text-[10px] font-pixel bg-emerald-950 border border-emerald-400 text-emerald-300 px-2 py-0.5 rounded-full">
                    🔓 AUTHORIZED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Live debug console for commands (/.heal, /.damage, /.gold, /.item, /.esper, /.shop)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLockAdmin}
                className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-600 cursor-pointer"
                title="Lock admin panel"
              >
                🔒 LOCK
              </button>
            )}
            <button
              onClick={() => {
                sound.playClickSound();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center border border-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Password Authentication Gate */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="max-w-md w-full bg-slate-950/90 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl">
              <span className="text-5xl block mb-3">🔐</span>
              <h3 className="font-pixel text-base text-yellow-300 font-bold mb-1">
                TESTER AUTHENTICATION REQUIRED
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Please enter the Creator Admin Password to access debug commands.
              </p>

              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Enter Admin Password..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  autoFocus
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl px-4 py-3 text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-center tracking-widest text-sm"
                />

                {passwordError && (
                  <div className="text-rose-400 text-xs font-bold animate-shake">
                    {passwordError}
                  </div>
                )}

                <button
                  type="submit"
                  className="font-pixel text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-6 rounded-xl border border-emerald-300 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  🔓 UNLOCK ADMIN ACCESS
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Sub-Header */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-pixel">
                  ACTIVE VIEW: <span className="text-emerald-300 uppercase">{activeTab.replace('_', ' ')}</span>
                </span>
                {activeTab !== 'console' && (
                  <button
                    onClick={() => {
                      sound.playClickSound();
                      setActiveTab('console');
                    }}
                    className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-1 rounded-lg border border-slate-600 flex items-center gap-1 cursor-pointer ml-3"
                  >
                    <span>←</span>
                    <span>RETURN TO CONSOLE</span>
                  </button>
                )}
              </div>

              {onOpenArmory && (
                <button
                  onClick={() => {
                    sound.playClickSound();
                    onOpenArmory();
                  }}
                  className="font-pixel text-[10px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>🧰</span>
                  <span>OPEN ARMORY</span>
                </button>
              )}
            </div>

            {/* TAB 1: COMMAND CONSOLE */}
            {activeTab === 'console' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-3">
                {/* Terminal Output Window */}
                <div className="flex-1 bg-black/90 border border-emerald-500/40 rounded-2xl p-4 overflow-y-auto flex flex-col gap-2 font-mono text-xs shadow-inner">
                  {logs.map((entry) => (
                    <div
                      key={entry.id}
                      className={`whitespace-pre-wrap leading-relaxed ${
                        entry.type === 'input'
                          ? 'text-cyan-400 font-bold border-l-2 border-cyan-500 pl-2'
                          : entry.type === 'success'
                          ? 'text-emerald-300 pl-2'
                          : entry.type === 'error'
                          ? 'text-rose-400 pl-2'
                          : 'text-slate-300 pl-2'
                      }`}
                    >
                      <span className="text-[10px] text-slate-600 mr-2">[{entry.timestamp}]</span>
                      {entry.text}
                    </div>
                  ))}
                  <div ref={consoleBottomRef} />
                </div>

                {/* Terminal Input Line */}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-black border-2 border-emerald-500/70 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-400">
                    <span className="text-emerald-400 font-bold mr-2 text-sm">&gt;</span>
                    <input
                      ref={commandInputRef}
                      type="text"
                      placeholder="Type command e.g. /.heal 50 cow, /.damage 30 all, /.gold 500 add, /.item, /.esper, /.shop..."
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={handleCommandKeyDown}
                      className="flex-1 bg-transparent text-emerald-300 placeholder:text-slate-600 outline-none text-xs font-mono"
                    />
                  </div>
                  <button
                    onClick={() => executeCommand(commandInput)}
                    className="font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl border border-emerald-300 transition-all active:scale-95 cursor-pointer"
                  >
                    RUN ↵
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ITEM SPAWNER (5-Column Grid, exactly 100 items per type) */}
            {activeTab === 'item_spawner' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-3">
                {/* Toast Notification */}
                {recentlyGranted && (
                  <div className="bg-emerald-950 border border-emerald-400 text-emerald-300 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-lg animate-bounce">
                    <span>🎁 <strong>{recentlyGranted}</strong> has been granted and added to your Armory!</span>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">ADDED</span>
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  {/* Category Pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      All Types ({itemCatalog.length})
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Rarity & Search */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <select
                      value={selectedRarity}
                      onChange={(e) => setSelectedRarity(e.target.value as any)}
                      className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="all">All Rarities</option>
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Search 600 items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Items Grid: 5-by-whatever layout (grid-cols-5) */}
                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pr-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleGrantItem(item)}
                      className={`p-2.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-102 active:scale-98 group ${
                        RARITY_COLORS[item.rarity].bg
                      } ${RARITY_COLORS[item.rarity].border} shadow-md`}
                      title="Click to grant this item to your inventory"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-pixel text-[8px] uppercase tracking-wider text-slate-400">
                            {item.category}
                          </span>
                          <span className={`font-pixel text-[8px] uppercase font-bold ${RARITY_COLORS[item.rarity].text}`}>
                            {item.rarity}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                          <div className="text-left min-w-0">
                            <h5 className={`font-pixel text-[11px] font-bold leading-tight truncate ${RARITY_COLORS[item.rarity].text}`}>
                              {item.name}
                            </h5>
                            <span className="font-mono text-[9px] text-emerald-400 font-bold">
                              {item.attribute === 'speed' ? `+${item.value} Spd` : `+${item.value}% ${item.attribute.slice(0, 4).toUpperCase()}`}
                            </span>
                          </div>
                        </div>

                        <p className="font-mono text-[9px] text-slate-400 line-clamp-2 text-left mb-1.5">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[9px] text-emerald-300 font-bold group-hover:text-white transition-colors">
                          + GRANT
                        </span>
                        <span className="text-xs">🎁</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ESPER SPAWNER (Campaign Only) */}
            {activeTab === 'esper_spawner' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-3">
                {/* Toast Notification */}
                {recentlyInfused && (
                  <div className="bg-fuchsia-950 border border-fuchsia-400 text-fuchsia-200 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-lg animate-bounce">
                    <span>{recentlyInfused}</span>
                    <span className="text-[10px] bg-fuchsia-500 text-slate-950 font-bold px-2 py-0.5 rounded">INFUSED</span>
                  </div>
                )}

                {/* Sub-Header / Search */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl animate-pulse">🔮</span>
                    <div>
                      <h4 className="font-pixel text-xs text-fuchsia-300 font-bold">
                        CAMPAIGN ESPER INJECTOR (20 MYTHICAL SPIRITS)
                      </h4>
                      <p className="font-sans text-[10px] text-slate-400">
                        Click any Esper to bond it permanently with an active campaign stuffy.
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Search espers..."
                    value={esperSearch}
                    onChange={(e) => setEsperSearch(e.target.value)}
                    className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none placeholder:text-slate-600"
                  />
                </div>

                {/* 5-Column Grid of Espers */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pr-1">
                  {filteredEspers.map((esper) => (
                    <div
                      key={esper.id}
                      onClick={() => {
                        sound.playClickSound();
                        setSelectedEsperToInfuse(esper);
                      }}
                      className="p-3 rounded-2xl border-2 border-fuchsia-500/60 bg-gradient-to-b from-purple-950/70 to-slate-950 flex flex-col justify-between cursor-pointer transition-all hover:scale-102 hover:border-fuchsia-400 shadow-md group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{esper.icon}</span>
                          <span className="font-pixel text-[8px] uppercase tracking-wider text-fuchsia-300 bg-fuchsia-950 px-1.5 py-0.5 rounded border border-fuchsia-500/40 font-bold">
                            {esper.element}
                          </span>
                        </div>

                        <h5 className="font-pixel text-xs text-fuchsia-200 font-bold leading-tight">
                          {esper.name}
                        </h5>
                        <p className="text-[10px] text-fuchsia-300/70 italic mb-1.5">{esper.title}</p>
                        <p className="text-[9px] text-slate-300 line-clamp-2 mb-2">{esper.description}</p>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {esper.boost.speed && <span className="text-[8px] font-mono bg-cyan-950 text-cyan-300 px-1 py-0.5 rounded">+{esper.boost.speed} Spd</span>}
                          {esper.boost.maxHp && <span className="text-[8px] font-mono bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded">+{esper.boost.maxHp} HP</span>}
                          {esper.boost.startShield && <span className="text-[8px] font-mono bg-blue-950 text-blue-300 px-1 py-0.5 rounded">+{esper.boost.startShield} Shld</span>}
                          {esper.boost.damageBonus && <span className="text-[8px] font-mono bg-rose-950 text-rose-300 px-1 py-0.5 rounded">+{esper.boost.damageBonus} Dmg</span>}
                          {esper.boost.freezeChance && <span className="text-[8px] font-mono bg-sky-950 text-sky-300 px-1 py-0.5 rounded">+{esper.boost.freezeChance}% Frz</span>}
                          {esper.boost.burnChance && <span className="text-[8px] font-mono bg-amber-950 text-amber-300 px-1 py-0.5 rounded">+{esper.boost.burnChance}% Brn</span>}
                          {esper.boost.shockChance && <span className="text-[8px] font-mono bg-yellow-950 text-yellow-300 px-1 py-0.5 rounded">+{esper.boost.shockChance}% Shk</span>}
                          {esper.boost.stunChance && <span className="text-[8px] font-mono bg-purple-950 text-purple-300 px-1 py-0.5 rounded">+{esper.boost.stunChance}% Stn</span>}
                        </div>

                        <div className="pt-2 border-t border-fuchsia-900/60 flex items-center justify-between">
                          <span className="font-pixel text-[9px] text-fuchsia-300 font-bold group-hover:text-white">
                            + INFUSE ESPER
                          </span>
                          <span className="text-xs">🔮</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal to pick which stuffy gets this Esper */}
                {selectedEsperToInfuse && (
                  <div
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedEsperToInfuse(null)}
                  >
                    <div
                      className="bg-slate-900 border-2 border-fuchsia-500 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{selectedEsperToInfuse.icon}</span>
                        <div>
                          <h3 className="font-pixel text-sm text-fuchsia-300 font-bold">
                            {selectedEsperToInfuse.name}
                          </h3>
                          <p className="text-xs text-slate-400">Choose a stuffy to infuse this Esper into:</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 my-4 max-h-60 overflow-y-auto pr-1">
                        {[...activeParty, ...bench].map((s) => {
                          const esperCount = (s.espers || []).length;
                          const isMaxed = esperCount >= 5;
                          const baseSpd = s.baseSpeed ?? getStuffyBaseSpeed(s.speciesId);
                          const currentSpeed = s.speed ?? getStuffyComputedStats(s.speciesId, baseSpd).speed;

                          return (
                            <button
                              key={s.instanceId}
                              disabled={isMaxed}
                              onClick={() => handleInfuseEsper(s.instanceId)}
                              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                isMaxed
                                  ? 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                                  : 'bg-slate-950 hover:bg-fuchsia-950/40 border-slate-700 hover:border-fuchsia-400 cursor-pointer group'
                              }`}
                            >
                              <div>
                                <div className="font-pixel text-xs text-yellow-300 font-bold group-hover:text-yellow-200">
                                  {s.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {s.currentHp}/{s.maxHp} HP • <span className="text-cyan-300 font-bold">{currentSpeed} Speed⚡</span> •{' '}
                                  <span className={isMaxed ? 'text-amber-400 font-bold' : 'text-fuchsia-300'}>
                                    {esperCount}/5 Espers {isMaxed ? '(MAX)' : ''}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`font-pixel text-[10px] font-bold px-2 py-1 rounded border ${
                                  isMaxed
                                    ? 'bg-slate-800 text-slate-500 border-slate-700'
                                    : 'text-fuchsia-400 group-hover:text-fuchsia-300 bg-fuchsia-950/80 border-fuchsia-500/40'
                                }`}
                              >
                                {isMaxed ? 'MAXED' : 'INFUSE ➔'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedEsperToInfuse(null)}
                          className="font-pixel text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
