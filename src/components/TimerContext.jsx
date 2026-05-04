"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext(null);

export const useTimer = () => useContext(TimerContext);

const DEFAULT_SETTINGS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};

export const PROFILES = [
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

export function TimerProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Playlist States
  const [pomodoroPlaylist, setPomodoroPlaylist] = useState([]);
  const [breakPlaylist, setBreakPlaylist] = useState([]);
  const [currentPomodoroSongIndex, setCurrentPomodoroSongIndex] = useState(0);
  const [currentBreakSongIndex, setCurrentBreakSongIndex] = useState(0);

  const [currentModeId, setCurrentModeId] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.pomodoro * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [targetEndTime, setTargetEndTime] = useState(null);
  
  const [autoplayFailed, setAutoplayFailed] = useState(false);

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

  const currentMode = Object.values(MODES).find(m => m.id === currentModeId) || MODES.POMODORO;
  
  const timerRef = useRef(null);
  const pomodoroAudioRef = useRef(null);
  const breakAudioRef = useRef(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedStr = localStorage.getItem('mervyn_timer_state');
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved.settings) setSettings(saved.settings);
        if (saved.soundEnabled !== undefined) setSoundEnabled(saved.soundEnabled);
        if (saved.currentModeId) setCurrentModeId(saved.currentModeId);
        if (saved.sessions) setSessions(saved.sessions);
        if (saved.currentPomodoroSongIndex !== undefined) setCurrentPomodoroSongIndex(saved.currentPomodoroSongIndex);
        if (saved.currentBreakSongIndex !== undefined) setCurrentBreakSongIndex(saved.currentBreakSongIndex);
        
        let newTimeLeft = saved.timeLeft;
        let newIsRunning = saved.isRunning;
        let newTargetEndTime = saved.targetEndTime;

        // If it was running, calculate how much time has passed
        if (saved.isRunning && saved.targetEndTime) {
          const remaining = Math.round((saved.targetEndTime - Date.now()) / 1000);
          if (remaining > 0) {
            newTimeLeft = remaining;
          } else {
            // It finished while we were away
            newTimeLeft = 0;
            newIsRunning = false;
            newTargetEndTime = null;
            // NOTE: We do not trigger handleTimerComplete sound here as it could be hours later.
            if (saved.currentModeId === 'pomodoro') {
              setSessions(s => saved.sessions ? saved.sessions + 1 : 1);
            }
          }
        } else {
           // Not running, just restore timeLeft or use default if invalid
           if (saved.timeLeft === undefined || saved.timeLeft < 0) {
              const modeMinutes = saved.settings ? saved.settings[saved.currentModeId] : DEFAULT_SETTINGS.pomodoro;
              newTimeLeft = modeMinutes * 60;
           }
        }
        
        setTimeLeft(newTimeLeft);
        setIsRunning(newIsRunning);
        setTargetEndTime(newTargetEndTime);
      } catch (e) {
        console.error('Failed to parse timer state:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state to LocalStorage whenever important things change
  useEffect(() => {
    if (!isLoaded) return;
    const stateToSave = {
      settings,
      soundEnabled,
      currentModeId,
      timeLeft,
      isRunning,
      sessions,
      targetEndTime,
      currentPomodoroSongIndex,
      currentBreakSongIndex
    };
    localStorage.setItem('mervyn_timer_state', JSON.stringify(stateToSave));
  }, [settings, soundEnabled, currentModeId, timeLeft, isRunning, sessions, targetEndTime, currentPomodoroSongIndex, currentBreakSongIndex, isLoaded]);

  // Sync timeLeft when settings change (if not currently running)
  useEffect(() => {
    if (isLoaded && !isRunning) {
      setTimeLeft(currentMode.minutes * 60);
    }
  }, [settings, currentModeId, isLoaded]);

  // Handle Background Audio Transitions
  useEffect(() => {
    if (!isLoaded) return;
    
    const handleAutoplayError = (e) => {
      console.warn('Autoplay blocked. Waiting for user interaction:', e);
      setAutoplayFailed(true);
    };

    if (isRunning && soundEnabled) {
      if (currentModeId === 'pomodoro') {
        // Pause Break sounds
        toggleBgNoise(false);
        if (breakAudioRef.current) breakAudioRef.current.pause();
        
        // Play Pomodoro Music
        if (pomodoroAudioRef.current) {
          pomodoroAudioRef.current.volume = 0.5;
          const playPromise = pomodoroAudioRef.current.play();
          if (playPromise !== undefined) {
             playPromise.catch(handleAutoplayError);
          }
        }
      } else {
        // Pause Pomodoro sound
        if (pomodoroAudioRef.current) pomodoroAudioRef.current.pause();
        
        // Play Break Music
        if (breakPlaylist.length > 0) {
          toggleBgNoise(false); // Make sure synth noise is off
          if (breakAudioRef.current) {
            breakAudioRef.current.volume = 0.5;
            const playPromise = breakAudioRef.current.play();
            if (playPromise !== undefined) {
               playPromise.catch(handleAutoplayError);
            }
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
  }, [isRunning, currentModeId, soundEnabled, currentPomodoroSongIndex, currentBreakSongIndex, isLoaded]);

  // Attempt to recover from blocked autoplay on first user interaction
  useEffect(() => {
    if (!autoplayFailed || !isRunning || !soundEnabled) return;

    const resumeAudio = () => {
      setAutoplayFailed(false);
      if (currentModeId === 'pomodoro' && pomodoroAudioRef.current) {
        pomodoroAudioRef.current.play().catch(()=>{});
      } else if (currentModeId !== 'pomodoro' && breakAudioRef.current) {
        breakAudioRef.current.play().catch(()=>{});
      }
    };

    window.addEventListener('click', resumeAudio, { once: true });
    window.addEventListener('keydown', resumeAudio, { once: true });

    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
  }, [autoplayFailed, isRunning, soundEnabled, currentModeId]);

  useEffect(() => {
    if (isRunning && targetEndTime) {
      timerRef.current = setInterval(() => {
        const remaining = Math.round((targetEndTime - Date.now()) / 1000);
        
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimeLeft(0);
          setIsRunning(false);
          setTargetEndTime(null);
          handleTimerComplete();
        } else {
          setTimeLeft(remaining);
        }
      }, 500); // 500ms interval for more responsive update
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, targetEndTime, currentModeId]);

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
    setTargetEndTime(null);
  };

  const toggleTimer = () => {
    if (timeLeft > 0) {
      if (!isRunning) {
        // Starting
        setTargetEndTime(Date.now() + timeLeft * 1000);
        setIsRunning(true);
      } else {
        // Pausing
        setIsRunning(false);
        setTargetEndTime(null);
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTargetEndTime(null);
    setTimeLeft(currentMode.minutes * 60);
    if (currentModeId === 'pomodoro' && pomodoroAudioRef.current) {
      pomodoroAudioRef.current.currentTime = 0; 
    } else if (currentModeId !== 'pomodoro' && breakAudioRef.current) {
      breakAudioRef.current.currentTime = 0;
    }
  };

  const applyProfile = (profile) => {
    setSettings(profile.values);
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
  };

  // Determine current audio sources
  const pomodoroSrc = pomodoroPlaylist.length > 0 
    ? `/music/porodomo/${encodeURIComponent(pomodoroPlaylist[currentPomodoroSongIndex])}` 
    : '/pomodoro.mp3';

  const breakSrc = breakPlaylist.length > 0 
    ? `/music/break-time/${encodeURIComponent(breakPlaylist[currentBreakSongIndex])}` 
    : '';

  const value = {
    settings, setSettings,
    soundEnabled, setSoundEnabled,
    pomodoroPlaylist, breakPlaylist,
    currentPomodoroSongIndex, currentBreakSongIndex,
    currentModeId, currentMode, MODES,
    timeLeft, isRunning, sessions,
    switchMode, toggleTimer, resetTimer, applyProfile, selectSong, formatTime,
    autoplayFailed
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      
      {/* Global Indicator for Blocked Autoplay */}
      {autoplayFailed && isRunning && soundEnabled && (
        <div className="fixed bottom-4 right-4 bg-amber-500/10 border border-amber-500 text-amber-500 px-4 py-3 text-xs font-mono z-[9999] shadow-lg flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          &gt; TRÌNH DUYỆT CHẶN PHÁT NHẠC. CLICK CHUỘT ĐỂ TIẾP TỤC.
        </div>
      )}

      {/* Global Audio Elements */}
      <audio ref={pomodoroAudioRef} src={pomodoroSrc} onEnded={playNextPomodoroSong} />
      <audio ref={breakAudioRef} src={breakSrc} onEnded={playRandomBreakSong} />
    </TimerContext.Provider>
  );
}
