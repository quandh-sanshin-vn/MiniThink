"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Info, X, Volume2, VolumeX, Music, Terminal, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_SETTINGS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};

const PROFILES = [
  { id: 'default', name: 'Mặc định (25/5/15)', values: { pomodoro: 25, shortBreak: 5, longBreak: 15 } },
  { id: 'deepwork', name: 'Tập trung sâu (50/10/30)', values: { pomodoro: 50, shortBreak: 10, longBreak: 30 } },
  { id: 'quick', name: 'Nhịp độ nhanh (15/3/10)', values: { pomodoro: 15, shortBreak: 3, longBreak: 10 } }
];

// Web Audio API Synthesis for alerts
const playAlertSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  if (type === 'pomodoro') {
    // Work end - 3 sharp beeps to wake you up
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    
    gainNode.gain.setTargetAtTime(0.5, ctx.currentTime, 0.02);
    gainNode.gain.setTargetAtTime(0, ctx.currentTime + 0.1, 0.02);
    
    gainNode.gain.setTargetAtTime(0.5, ctx.currentTime + 0.2, 0.02);
    gainNode.gain.setTargetAtTime(0, ctx.currentTime + 0.3, 0.02);
    
    gainNode.gain.setTargetAtTime(0.5, ctx.currentTime + 0.4, 0.02);
    gainNode.gain.setTargetAtTime(0, ctx.currentTime + 0.5, 0.02);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } else {
    // Break end - soft double chime
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    
    gainNode.gain.setTargetAtTime(0.4, ctx.currentTime, 0.05);
    gainNode.gain.setTargetAtTime(0, ctx.currentTime + 0.4, 0.1);
    
    osc.frequency.setValueAtTime(750, ctx.currentTime + 0.5);
    gainNode.gain.setTargetAtTime(0.4, ctx.currentTime + 0.5, 0.05);
    gainNode.gain.setTargetAtTime(0, ctx.currentTime + 1.2, 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  }
};

let audioCtx = null;
let bgAudioNode = null;

// Synthesize continuous background noise for breaks (fallback)
const toggleBgNoise = (play, volume) => {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  // If pausing or switching, fade out
  if (!play) {
    if (bgAudioNode) {
      bgAudioNode.gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
      const currentSource = bgAudioNode.source;
      setTimeout(() => {
        try {
          currentSource.stop();
          currentSource.disconnect();
        } catch(e) {}
      }, 600);
      bgAudioNode = null;
    }
    return;
  }
  
  if (bgAudioNode) return; // Already playing

  const bufferSize = audioCtx.sampleRate * 2; // 2 sec buffer
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = buffer.getChannelData(0);
  
  // Pink noise (sounds like soft wind/waves)
  let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
  for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
  }
  
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.setTargetAtTime(volume, audioCtx.currentTime, 1); // fade in
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
  
  bgAudioNode = { source, gainNode };
};

export default function PomodoroTimer() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Playlist States
  const [pomodoroPlaylist, setPomodoroPlaylist] = useState([]);
  const [breakPlaylist, setBreakPlaylist] = useState([]);
  const [currentPomodoroSongIndex, setCurrentPomodoroSongIndex] = useState(0);
  const [currentBreakSongIndex, setCurrentBreakSongIndex] = useState(0);

  // Fetch playlist on mount
  useEffect(() => {
    fetch('/api/music')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.pomodoro && data.pomodoro.length > 0) setPomodoroPlaylist(data.pomodoro);
          if (data.breakTime && data.breakTime.length > 0) setBreakPlaylist(data.breakTime);
        }
      })
      .catch(e => console.log('Không tìm thấy danh sách nhạc'));
  }, []);

  const currentPomodoroSongName = pomodoroPlaylist.length > 0 
    ? pomodoroPlaylist[currentPomodoroSongIndex].replace(/\.[^/.]+$/, "") 
    : 'Tập trung hoàn toàn';
    
  const currentBreakSongName = breakPlaylist.length > 0
    ? breakPlaylist[currentBreakSongIndex].replace(/\.[^/.]+$/, "")
    : 'Tiếng gió biển. Thư giãn mắt.';

  // Dynamic MODES based on user settings
  const MODES = {
    POMODORO: { 
      id: 'pomodoro', 
      label: 'Pomodoro', 
      minutes: settings.pomodoro, 
      color: '#10b981', /* Emerald */
      desc: pomodoroPlaylist.length > 0 ? `[PLAYING] ${currentPomodoroSongName}` : '> TẬP TRUNG HOÀN TOÀN',
    },
    SHORT_BREAK: { 
      id: 'shortBreak', 
      label: 'Short Break', 
      minutes: settings.shortBreak, 
      color: '#f59e0b', /* Amber */
      desc: breakPlaylist.length > 0 ? `[PLAYING] ${currentBreakSongName}` : '> NGHỈ NGẮN. THƯ GIÃN MẮT.',
    },
    LONG_BREAK: { 
      id: 'longBreak', 
      label: 'Long Break', 
      minutes: settings.longBreak, 
      color: '#3b82f6', /* Blue */
      desc: breakPlaylist.length > 0 ? `[PLAYING] ${currentBreakSongName}` : '> NGHỈ DÀI. ĐI DẠO.',
    },
  };

  const [currentModeId, setCurrentModeId] = useState('pomodoro');
  const currentMode = Object.values(MODES).find(m => m.id === currentModeId);
  
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  const timerRef = useRef(null);
  const pomodoroAudioRef = useRef(null);
  const breakAudioRef = useRef(null);

  // Sync timeLeft when settings change (if not currently running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(currentMode.minutes * 60);
    }
  }, [settings, currentModeId]);

  // Handle Background Audio Transitions
  useEffect(() => {
    if (isRunning && soundEnabled) {
      if (currentModeId === 'pomodoro') {
        // Pause Break sounds
        toggleBgNoise(false);
        if (breakAudioRef.current) breakAudioRef.current.pause();
        
        // Play Pomodoro Music
        if (pomodoroAudioRef.current) {
          pomodoroAudioRef.current.volume = 0.5;
          pomodoroAudioRef.current.play().catch(e => console.warn('Autoplay blocked:', e));
        }
      } else {
        // Pause Pomodoro sound
        if (pomodoroAudioRef.current) pomodoroAudioRef.current.pause();
        
        // Play Break Music
        if (breakPlaylist.length > 0) {
          toggleBgNoise(false); // Make sure synth noise is off
          if (breakAudioRef.current) {
            breakAudioRef.current.volume = 0.5;
            breakAudioRef.current.play().catch(e => console.warn('Autoplay blocked:', e));
          }
        } else {
          // Fallback to synth pink noise if no break music folder exists/has files
          toggleBgNoise(true, 0.6);
        }
      }
    } else {
      // Pause everything
      if (pomodoroAudioRef.current) pomodoroAudioRef.current.pause();
      if (breakAudioRef.current) breakAudioRef.current.pause();
      toggleBgNoise(false);
    }
  }, [isRunning, currentModeId, soundEnabled, currentPomodoroSongIndex, currentBreakSongIndex]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, currentModeId]);

  const handleTimerComplete = () => {
    // Play alert sound locally generated
    if (soundEnabled) {
      playAlertSound(currentModeId);
    }
    
    if (currentModeId === 'pomodoro') {
      setSessions(s => s + 1);
      // Auto switch to random break song when starting next time
      playRandomBreakSong();
    }
  };

  const switchMode = (modeId) => {
    setCurrentModeId(modeId);
    setIsRunning(false);
    // When switching to break manually, pick a random song if not picked already
    if (modeId !== 'pomodoro' && breakPlaylist.length > 1) {
       // Optional: shuffle here too, but to keep it simple, we just leave it unless they skip.
    }
  };

  const toggleTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentMode.minutes * 60);
    if (currentModeId === 'pomodoro' && pomodoroAudioRef.current) {
      pomodoroAudioRef.current.currentTime = 0; 
    } else if (currentModeId !== 'pomodoro' && breakAudioRef.current) {
      breakAudioRef.current.currentTime = 0;
    }
  };

  const applyProfile = (profile) => {
    setSettings(profile.values);
    setShowSettings(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const playNextPomodoroSong = () => {
    if (pomodoroPlaylist.length > 0) {
      setCurrentPomodoroSongIndex(prev => (prev + 1) % pomodoroPlaylist.length);
    }
  };

  const playRandomBreakSong = () => {
    if (breakPlaylist.length > 0) {
      const randomIndex = Math.floor(Math.random() * breakPlaylist.length);
      setCurrentBreakSongIndex(randomIndex);
    }
  };

  const selectSong = (type, index) => {
    if (type === 'pomodoro') {
      setCurrentPomodoroSongIndex(index);
    } else {
      setCurrentBreakSongIndex(index);
    }
    setShowMusicMenu(false);
  };

  const radius = 116; 
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = currentMode.minutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * circumference;

  // Determine current audio sources
  const pomodoroSrc = pomodoroPlaylist.length > 0 
    ? `/music/porodomo/${encodeURIComponent(pomodoroPlaylist[currentPomodoroSongIndex])}` 
    : '/pomodoro.mp3';

  const breakSrc = breakPlaylist.length > 0 
    ? `/music/break-time/${encodeURIComponent(breakPlaylist[currentBreakSongIndex])}` 
    : '';

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
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col p-4 md:p-8 selection:bg-emerald-500/30">
      {/* Local Audio Elements */}
      <audio ref={pomodoroAudioRef} src={pomodoroSrc} onEnded={playNextPomodoroSong} />
      <audio ref={breakAudioRef} src={breakSrc} onEnded={playRandomBreakSong} />

      <div className="w-full max-w-6xl mx-auto flex flex-col h-full items-center justify-center">
        
        {/* Navigation */}
        <div className="w-full flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-neutral-500 hover:text-emerald-400 transition-colors uppercase text-xs tracking-widest border border-neutral-800 bg-black px-4 py-2 hover:border-emerald-500/50">
            <ChevronLeft size={16} /> [ RETURN_HOME ]
          </Link>
          <div className="flex items-center gap-2 text-emerald-500">
            <Terminal size={18} />
            <h1 className="text-sm font-bold uppercase tracking-widest">SYS.MERVYN_TIMER</h1>
          </div>
        </div>

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
                  > Pomodoro_Tracks
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
                  > Break_Tracks
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
              <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3">> Quick_Profiles</h4>
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
