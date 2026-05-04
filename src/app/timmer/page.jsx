"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Info, X, Volume2, VolumeX, Music, Terminal, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ModuleHeader from '@/components/ModuleHeader';

import { useTimer, PROFILES } from '@/components/TimerContext';

export default function PomodoroTimer() {
  const {
    settings, setSettings,
    soundEnabled, setSoundEnabled,
    pomodoroPlaylist, breakPlaylist,
    currentPomodoroSongIndex, currentBreakSongIndex,
    currentModeId, currentMode, MODES,
    timeLeft, isRunning, sessions,
    switchMode, toggleTimer, resetTimer, applyProfile, selectSong, formatTime
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  const radius = 116; 
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = currentMode.minutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * circumference;

  const getColorClasses = (id, isActive) => {
    if (!isActive) return "border-neutral-800 bg-[#09090b] text-neutral-500 hover:border-neutral-600 hover:text-slate-300";
    if (id === 'pomodoro') return "border-emerald-500 bg-emerald-500/10 text-emerald-500";
    if (id === 'shortBreak') return "border-amber-500 bg-amber-500/10 text-amber-500";
    if (id === 'longBreak') return "border-blue-500 bg-blue-500/10 text-blue-500";
  };

  const getActiveColorHex = (id) => {
    if (id === 'pomodoro') return '#10b981';
    if (id === 'shortBreak') return '#f59e0b';
    if (id === 'longBreak') return '#3b82f6';
    return '#10b981';
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col selection:bg-emerald-500/30">
      <ModuleHeader title="MERVYN_TIMER" />
      
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Main Timer UI */}
        <div className="w-full max-w-md bg-black border border-neutral-800 p-8 shadow-2xl flex flex-col items-center">
          
          <div className="w-full flex gap-2 mb-6">
            {Object.values(MODES).map((mode) => (
              <button
                key={mode.id}
                className={`flex-1 py-2 text-[10px] sm:text-xs uppercase font-bold border transition-colors ${getColorClasses(mode.id, currentModeId === mode.id)}`}
                onClick={() => switchMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="w-full bg-[#09090b] border border-neutral-800 p-3 mb-8 flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-neutral-600" />
              <span className="truncate max-w-[200px]" title={currentMode.desc}>{currentMode.desc}</span>
            </div>
            {isRunning && <span className="text-emerald-500 animate-pulse">[ ACTIVE ]</span>}
          </div>

          <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r={radius} fill="none" strokeWidth="2" className="stroke-neutral-900" />
              <circle
                cx="120" cy="120" r={radius}
                fill="none"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                className="transition-all duration-1000 ease-linear"
                stroke={getActiveColorHex(currentModeId)}
                strokeLinecap="square"
              />
            </svg>
            <div className="text-6xl font-light tracking-tighter text-slate-200 z-10 font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button className="p-3 border border-neutral-800 bg-[#09090b] text-neutral-400 hover:text-slate-200 hover:border-neutral-600 transition-colors" onClick={() => setShowSettings(true)} title="Settings">
               <Settings size={20} />
            </button>

            <button className="p-3 border border-neutral-800 bg-[#09090b] text-neutral-400 hover:text-slate-200 hover:border-neutral-600 transition-colors" onClick={() => setShowMusicMenu(true)} title="Music">
               <Music size={20} />
            </button>
            
            <button 
              className={`p-4 border font-bold flex items-center justify-center transition-colors ${isRunning ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'}`}
              onClick={toggleTimer}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            <button className="p-3 border border-neutral-800 bg-[#09090b] text-neutral-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors" onClick={resetTimer} title="Reset">
              <RotateCcw size={20} />
            </button>

            <button className={`p-3 border transition-colors ${soundEnabled ? 'border-neutral-800 bg-[#09090b] text-neutral-400 hover:text-slate-200 hover:border-neutral-600' : 'border-rose-500/30 bg-rose-500/5 text-rose-500'}`} onClick={() => setSoundEnabled(!soundEnabled)} title="Sound Toggle">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          {sessions > 0 && (
            <div className="mt-8 text-xs text-neutral-600 border border-neutral-800 px-4 py-1 uppercase tracking-widest">
              Completed_Cycles: <span className="text-emerald-500 font-bold">{sessions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Music Playlist Modal */}
      {showMusicMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-neutral-700 w-full max-w-md p-6 flex flex-col shadow-2xl relative">
            <button className="absolute top-4 right-4 text-neutral-500 hover:text-rose-500 transition-colors" onClick={() => setShowMusicMenu(false)}>
              <X size={20} />
            </button>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Music size={16} /> Audio_Interface
            </h3>
            
            <div className="overflow-y-auto max-h-[60vh] custom-scrollbar pr-2 space-y-6">
              <div>
                <div className="text-[10px] text-emerald-500 uppercase tracking-widest mb-3 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 inline-block">
                  &gt; Pomodoro_Tracks
                </div>
                <div className="flex flex-col gap-2">
                  {pomodoroPlaylist.length === 0 ? (
                    <p className="text-xs text-neutral-600 italic border border-dashed border-neutral-800 p-4 text-center">Directory empty: /music/porodomo/</p>
                  ) : (
                    pomodoroPlaylist.map((song, index) => {
                      const isActive = currentModeId === 'pomodoro' && currentPomodoroSongIndex === index;
                      return (
                        <button 
                          key={`pom-${index}`} 
                          className={`flex items-center gap-3 p-3 text-xs border transition-colors text-left ${isActive ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-bold' : 'border-neutral-800 bg-black text-slate-400 hover:border-neutral-600 hover:text-slate-200'}`}
                          onClick={() => selectSong('pomodoro', index)}
                        >
                          <Music size={14} className={isActive ? 'text-emerald-500' : 'text-neutral-600'} />
                          <span className="truncate flex-1 uppercase">{song.replace(/\.[^/.]+$/, "")}</span>
                          {isActive && isRunning && <span className="text-[10px] text-emerald-500 animate-pulse">PLAYING</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-blue-500 uppercase tracking-widest mb-3 border border-blue-500/30 bg-blue-500/10 px-2 py-1 inline-block">
                  &gt; Break_Tracks
                </div>
                <div className="flex flex-col gap-2">
                  {breakPlaylist.length === 0 ? (
                    <p className="text-xs text-neutral-600 italic border border-dashed border-neutral-800 p-4 text-center">Directory empty: /music/break-time/</p>
                  ) : (
                    breakPlaylist.map((song, index) => {
                      const isActive = currentModeId !== 'pomodoro' && currentBreakSongIndex === index;
                      return (
                        <button 
                          key={`brk-${index}`} 
                          className={`flex items-center gap-3 p-3 text-xs border transition-colors text-left ${isActive ? 'border-blue-500/50 bg-blue-500/5 text-blue-400 font-bold' : 'border-neutral-800 bg-black text-slate-400 hover:border-neutral-600 hover:text-slate-200'}`}
                          onClick={() => selectSong('break', index)}
                        >
                          <Music size={14} className={isActive ? 'text-blue-500' : 'text-neutral-600'} />
                          <span className="truncate flex-1 uppercase">{song.replace(/\.[^/.]+$/, "")}</span>
                          {isActive && isRunning && <span className="text-[10px] text-blue-500 animate-pulse">PLAYING</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-neutral-700 w-full max-w-md p-6 flex flex-col shadow-2xl relative">
            <button className="absolute top-4 right-4 text-neutral-500 hover:text-rose-500 transition-colors" onClick={() => setShowSettings(false)}>
              <X size={20} />
            </button>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Settings size={16} /> System_Config
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-emerald-500 uppercase tracking-widest">Pomodoro</label>
                <input 
                  type="number" 
                  value={settings.pomodoro}
                  onChange={(e) => setSettings({...settings, pomodoro: parseInt(e.target.value) || 1})}
                  min="1"
                  className="bg-black border border-neutral-800 text-slate-200 p-2 focus:outline-none focus:border-emerald-500 font-mono text-center"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-amber-500 uppercase tracking-widest">Short_Break</label>
                <input 
                  type="number" 
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 1})}
                  min="1"
                  className="bg-black border border-neutral-800 text-slate-200 p-2 focus:outline-none focus:border-amber-500 font-mono text-center"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-blue-500 uppercase tracking-widest">Long_Break</label>
                <input 
                  type="number" 
                  value={settings.longBreak}
                  onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 1})}
                  min="1"
                  className="bg-black border border-neutral-800 text-slate-200 p-2 focus:outline-none focus:border-blue-500 font-mono text-center"
                />
              </div>
            </div>

            <div>
              <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3">&gt; Quick_Profiles</h4>
              <div className="flex flex-col gap-2">
                {PROFILES.map(profile => (
                  <button 
                    key={profile.id} 
                    className="p-3 text-xs bg-black border border-neutral-800 text-slate-400 hover:text-slate-200 hover:border-neutral-500 transition-colors text-left uppercase" 
                    onClick={() => applyProfile(profile)}
                  >
                    {profile.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
