'use client';

import React, { useState, useEffect, useRef } from 'react';
import { executeAdminCommand, CommandExecutionResult } from '@/utils/adminCommands';
import { getAllItemCatalog, grantItemToInventory, getItemInventory, ItemTemplate, HELMET_TEMPLATES, CHESTPLATE_TEMPLATES, GLOVES_TEMPLATES, SWORD_TEMPLATES, OFFHAND_TEMPLATES, PENDANT_ELEMENTS } from '@/data/items';
import { GameItem, ItemCategory, ItemRarity } from '@/types/game';
import { sound } from '@/utils/audio';

const ADMIN_PASSWORD = 'Benrealcreator';
const AUTH_STORAGE_KEY = 'ben_admin_auth_v37';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArmory?: () => void;
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

export default function AdminPanelModal({ isOpen, onClose, onOpenArmory }: AdminPanelModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'console' | 'item_spawner'>('console');

  // Console state
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<ConsoleEntry[]>([
    {
      id: 'init_1',
      type: 'output',
      text: '🛠️ Ben Stuffy Card Battle - Tester Admin Terminal initialized.\nType "/.help" to see available commands.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Item Spawner state
  const [itemCatalog, setItemCatalog] = useState<GameItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [recentlyGranted, setRecentlyGranted] = useState<string | null>(null);

  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-emerald-500/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-emerald-950/60 overflow-hidden font-mono">
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
                  v3.7
                </span>
                {isAuthenticated && (
                  <span className="text-[10px] font-pixel bg-emerald-950 border border-emerald-400 text-emerald-300 px-2 py-0.5 rounded-full">
                    🔓 AUTHORIZED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Live debug commands (/.heal, /.damage, /.item) &amp; Item Spawner for testing
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
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center border border-slate-600 transition-all hover:scale-105 active:scale-95"
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
                Please enter the Creator Admin Password to access debug commands and item injection.
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
            {/* Nav Tabs */}
            <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800 bg-slate-950/50">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sound.playClickSound();
                    setActiveTab('console');
                  }}
                  className={`font-pixel text-xs px-4 py-2 rounded-t-xl border-t border-x transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'console'
                      ? 'bg-slate-900 border-emerald-500 text-emerald-300 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>💻</span>
                  <span>COMMAND CONSOLE</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClickSound();
                    setActiveTab('item_spawner');
                  }}
                  className={`font-pixel text-xs px-4 py-2 rounded-t-xl border-t border-x transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'item_spawner'
                      ? 'bg-slate-900 border-emerald-500 text-emerald-300 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>📦</span>
                  <span>ITEM SPAWNER (/.item)</span>
                </button>
              </div>

              {onOpenArmory && (
                <button
                  onClick={() => {
                    sound.playClickSound();
                    onOpenArmory();
                  }}
                  className="font-pixel text-[10px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 px-3 py-1.5 rounded-lg mb-1 flex items-center gap-1 cursor-pointer"
                >
                  <span>🧰</span>
                  <span>OPEN ARMORY</span>
                </button>
              )}
            </div>

            {/* TAB 1: COMMAND CONSOLE */}
            {activeTab === 'console' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-3">
                {/* Quick Command Pills */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-500 font-bold self-center">QUICK:</span>
                  <button
                    onClick={() => executeCommand('/.item')}
                    className="bg-slate-950 hover:bg-slate-800 border border-emerald-600/60 text-emerald-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.item
                  </button>
                  <button
                    onClick={() => executeCommand('/.heal 50 all')}
                    className="bg-slate-950 hover:bg-slate-800 border border-green-600/60 text-green-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.heal 50 all
                  </button>
                  <button
                    onClick={() => executeCommand('/.heal 100 cow')}
                    className="bg-slate-950 hover:bg-slate-800 border border-green-600/60 text-green-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.heal 100 cow
                  </button>
                  <button
                    onClick={() => executeCommand('/.damage 30 all')}
                    className="bg-slate-950 hover:bg-slate-800 border border-rose-600/60 text-rose-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.damage 30 all
                  </button>
                  <button
                    onClick={() => executeCommand('/.gold 500')}
                    className="bg-slate-950 hover:bg-slate-800 border border-amber-600/60 text-amber-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.gold 500
                  </button>
                  <button
                    onClick={() => executeCommand('/.crackers 7')}
                    className="bg-slate-950 hover:bg-slate-800 border border-cyan-600/60 text-cyan-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.crackers 7
                  </button>
                  <button
                    onClick={() => executeCommand('/.help')}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-600 text-slate-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    /.help
                  </button>
                  <button
                    onClick={() => executeCommand('/.clear')}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer ml-auto"
                  >
                    Clear
                  </button>
                </div>

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
                      placeholder="Type command e.g. /.heal 50 cow, /.damage 25 jefe, /.item..."
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={handleCommandKeyDown}
                      className="flex-1 bg-transparent text-emerald-300 placeholder:text-slate-600 outline-none text-xs"
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

            {/* TAB 2: ITEM SPAWNER (/.item) */}
            {activeTab === 'item_spawner' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4">
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
                      All Types
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
                      placeholder="Search items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Items Grid (Click on an item to grant it!) */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleGrantItem(item)}
                      className={`p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-103 active:scale-97 group ${
                        RARITY_COLORS[item.rarity].bg
                      } ${RARITY_COLORS[item.rarity].border} shadow-md`}
                      title="Click to give this item to yourself"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-pixel text-[9px] uppercase tracking-wider text-slate-400">
                            {item.category}
                          </span>
                          <span className={`font-pixel text-[9px] uppercase font-bold ${RARITY_COLORS[item.rarity].text}`}>
                            {item.rarity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                          <div className="text-left">
                            <h5 className={`font-pixel text-xs font-bold leading-tight ${RARITY_COLORS[item.rarity].text}`}>
                              {item.name}
                            </h5>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold">
                              {item.attribute === 'speed' ? `+${item.value} Speed` : `+${item.value}% ${item.attribute.toUpperCase()}`}
                            </span>
                          </div>
                        </div>

                        <p className="font-mono text-[10px] text-slate-400 line-clamp-2 text-left mb-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-300 font-bold group-hover:text-white transition-colors">
                          + CLICK TO GRANT
                        </span>
                        <span className="text-xs">🎁</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
