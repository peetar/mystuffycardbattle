'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/audio';

interface BugReportModalProps {
  onClose: () => void;
  currentPhase?: string;
  roomId?: string;
  contextInfo?: {
    screen?: string;
    roomId?: string;
    turnNumber?: number;
    activeSide?: string;
    combatLogs?: string[];
  };
}

export default function BugReportModal({ onClose, currentPhase, roomId, contextInfo }: BugReportModalProps) {
  const [description, setDescription] = useState('');
  const [reproSteps, setReproSteps] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const diagnosticsData = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    screen: currentPhase || contextInfo?.screen || 'Main Screen',
    roomId: roomId || contextInfo?.roomId || 'Offline / Local',
    turnNumber: contextInfo?.turnNumber ?? 'N/A',
    activeSide: contextInfo?.activeSide || 'N/A',
    recentLogs: contextInfo?.combatLogs?.slice(-10) || [],
    description,
    reproSteps,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      const existingRaw = localStorage.getItem('ben_stuffy_bug_reports');
      const reports = existingRaw ? JSON.parse(existingRaw) : [];
      reports.push({
        id: `bug_${Date.now()}`,
        ...diagnosticsData,
      });
      localStorage.setItem('ben_stuffy_bug_reports', JSON.stringify(reports));
    } catch (err) {
      console.error('Failed to save bug report locally:', err);
    }

    sound.playClickSound();
    setSubmitted(true);
  };

  const handleCopy = () => {
    sound.playClickSound();
    navigator.clipboard.writeText(JSON.stringify(diagnosticsData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playClickSound();
    const blob = new Blob([JSON.stringify(diagnosticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stuffy_bug_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-4 border-red-500 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative text-left max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🐛</span>
            <h2 className="font-pixel text-base md:text-lg text-red-400 font-bold tracking-wider">
              SUBMIT BUG REPORT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            CLOSE [✖️]
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <span className="text-5xl animate-bounce">🎉</span>
            <h3 className="font-pixel text-lg text-emerald-400 font-bold">
              BUG REPORT RECORDED!
            </h3>
            <p className="font-mono text-xs text-slate-300 max-w-md">
              Thank you for reporting this issue! Diagnostics and error logs have been captured.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCopy}
                className="font-pixel text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-200 px-4 py-2 rounded-xl border border-indigo-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                {copied ? '✅ COPIED TO CLIPBOARD' : '📋 COPY DIAGNOSTICS JSON'}
              </button>
              <button
                onClick={onClose}
                className="font-pixel text-xs bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-5 py-2 rounded-xl shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                CONTINUE PLAYING
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-1">
            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              Encountered a glitch, stuck turn, or card bug? Submit your report below to help fix it quickly!
            </p>

            <div>
              <label className="font-pixel text-xs text-yellow-300 block mb-1">
                WHAT HAPPENED? *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Played card during turn 3, and enemy refused to attack or cards covered buttons..."
                required
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="font-pixel text-xs text-slate-400 block mb-1">
                REPRODUCTION STEPS / DETAILS (OPTIONAL)
              </label>
              <textarea
                value={reproSteps}
                onChange={(e) => setReproSteps(e.target.value)}
                placeholder="e.g. 1. Drafted George and Thumper. 2. Entered combat. 3. Tapped George..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            {/* Auto-Captured Diagnostics Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
              <span className="font-pixel text-[9px] text-slate-400 font-bold block mb-1">
                ⚙️ AUTO-CAPTURED ENVIRONMENT DIAGNOSTICS:
              </span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px] text-slate-400">
                <div>Phase: <span className="text-yellow-300">{diagnosticsData.screen}</span></div>
                <div>Room: <span className="text-yellow-300">{diagnosticsData.roomId}</span></div>
                <div>Turn: <span className="text-yellow-300">{String(diagnosticsData.turnNumber)}</span></div>
                <div>Active: <span className="text-yellow-300">{diagnosticsData.activeSide}</span></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-600 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Copy diagnostics to clipboard"
                >
                  {copied ? '✅ COPIED' : '📋 COPY JSON'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-600 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Download diagnostics file"
                >
                  💾 DOWNLOAD
                </button>
              </div>

              <button
                type="submit"
                disabled={!description.trim()}
                className={`font-pixel text-xs px-5 py-2.5 rounded-xl border-2 font-bold shadow-lg transition-all ${
                  description.trim()
                    ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 cursor-pointer hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                🚀 SUBMIT REPORT
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
