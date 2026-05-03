"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Info, X, Volume2, VolumeX, Music } from 'lucide-react';
import './timmer.css';

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
      color: '#2563eb', /* Blue */
      colorAlpha: 'rgba(37, 99, 235, 0.2)', 
      desc: pomodoroPlaylist.length > 0 ? `Đang phát: ${currentPomodoroSongName}` : 'Tập trung hoàn toàn.',
    },
    SHORT_BREAK: { 
      id: 'shortBreak', 
      label: 'Short Break', 
      minutes: settings.shortBreak, 
      color: '#64748b', /* Gray */
      colorAlpha: 'rgba(100, 116, 139, 0.2)', 
      desc: breakPlaylist.length > 0 ? `Đang phát: ${currentBreakSongName}` : 'Tiếng gió biển. Thư giãn mắt.',
    },
    LONG_BREAK: { 
      id: 'longBreak', 
      label: 'Long Break', 
      minutes: settings.longBreak, 
      color: '#0f172a', /* Black */
      colorAlpha: 'rgba(15, 23, 42, 0.2)', 
      desc: breakPlaylist.length > 0 ? `Đang phát: ${currentBreakSongName}` : 'Nghỉ ngơi tự do. Đi dạo 1 chút.',
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

  useEffect(() => {
    document.documentElement.style.setProperty('--active-color', currentMode.color);
    document.documentElement.style.setProperty('--active-color-alpha', currentMode.colorAlpha);
  }, [currentMode]);

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

  return (
    <div className="timmer-container">
      {/* Local Audio Elements */}
      <audio 
        ref={pomodoroAudioRef} 
        src={pomodoroSrc} 
        onEnded={playNextPomodoroSong} 
      />
      <audio 
        ref={breakAudioRef} 
        src={breakSrc} 
        onEnded={playRandomBreakSong} 
      />

      <div className="timer-card" style={{ '--active-color': currentMode.color, '--active-color-alpha': currentMode.colorAlpha }}>
        
        <div className="header-info">
          <h2>Mervyn Timer</h2>
          <span className="subtitle">Minimalist & Focus</span>
        </div>

        <div className="mode-selector">
          {Object.values(MODES).map((mode) => (
            <button
              key={mode.id}
              className={`mode-btn ${currentModeId === mode.id ? 'active' : ''}`}
              onClick={() => switchMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="mode-desc">
          <Info size={14} className="info-icon" />
          <span className="truncate-text" title={currentMode.desc}>{currentMode.desc}</span>
        </div>

        <div className={`timer-display ${isRunning ? 'running' : ''}`}>
          <svg className="timer-circle" viewBox="0 0 240 240">
            <circle className="bg" cx="120" cy="120" r={radius} />
            <circle
              className="progress"
              cx="120" cy="120" r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={progress}
            />
          </svg>
          <div className="time-text">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="controls">
          <button className="control-btn secondary" onClick={() => setShowSettings(true)} title="Cài đặt">
             <Settings />
             <span className="tooltip-text">Cài đặt</span>
          </button>

          <button className="control-btn secondary" onClick={() => setShowMusicMenu(true)} title="Chọn nhạc nền">
             <Music />
             <span className="tooltip-text">Nhạc nền</span>
          </button>
          
          <button className="control-btn play-pause" onClick={toggleTimer} title={isRunning ? 'Tạm dừng' : 'Bắt đầu'}>
            {isRunning ? <Pause /> : <Play style={{ marginLeft: '4px' }} />}
            <span className="tooltip-text">{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
          </button>
          
          <button className="control-btn secondary" onClick={resetTimer} title="Làm mới lại">
            <RotateCcw />
            <span className="tooltip-text">Làm mới</span>
          </button>

          <button className={`control-btn secondary ${!soundEnabled ? 'muted' : ''}`} onClick={() => setSoundEnabled(!soundEnabled)} title="Âm thanh">
            {soundEnabled ? <Volume2 /> : <VolumeX />}
            <span className="tooltip-text">{soundEnabled ? 'Tắt âm' : 'Bật âm'}</span>
          </button>
        </div>

        {sessions > 0 && (
          <div className="session-info">
            Số chu kỳ hoàn thành: {sessions}
          </div>
        )}
      </div>

      {/* Music Playlist Modal */}
      {showMusicMenu && (
        <div className="modal-overlay">
          <div className="modal-content music-modal">
            <button className="close-btn" onClick={() => setShowMusicMenu(false)}>
              <X size={20} />
            </button>
            <h3>Danh sách bài hát</h3>
            
            <div className="music-list-container">
              {/* Pomodoro Music Section */}
              <div className="music-section-title">Nhạc Pomodoro (Phát tuần tự)</div>
              <div className="music-list">
                {pomodoroPlaylist.length === 0 ? (
                  <p className="empty-music">Chưa có nhạc trong public/music/porodomo.</p>
                ) : (
                  pomodoroPlaylist.map((song, index) => (
                    <button 
                      key={`pom-${index}`} 
                      className={`music-item-btn ${currentModeId === 'pomodoro' && currentPomodoroSongIndex === index ? 'active' : ''}`}
                      onClick={() => selectSong('pomodoro', index)}
                    >
                      <Music size={14} className="music-icon" />
                      <span className="song-name">{song.replace(/\.[^/.]+$/, "")}</span>
                      {currentModeId === 'pomodoro' && currentPomodoroSongIndex === index && isRunning && (
                        <div className="playing-indicator">
                          <span className="bar"></span><span className="bar"></span><span className="bar"></span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Break Music Section */}
              <div className="music-section-title" style={{ marginTop: '1.5rem' }}>Nhạc Break (Phát ngẫu nhiên)</div>
              <div className="music-list">
                {breakPlaylist.length === 0 ? (
                  <p className="empty-music">Chưa có nhạc trong public/music/break-time.</p>
                ) : (
                  breakPlaylist.map((song, index) => (
                    <button 
                      key={`brk-${index}`} 
                      className={`music-item-btn ${currentModeId !== 'pomodoro' && currentBreakSongIndex === index ? 'active' : ''}`}
                      onClick={() => selectSong('break', index)}
                    >
                      <Music size={14} className="music-icon" />
                      <span className="song-name">{song.replace(/\.[^/.]+$/, "")}</span>
                      {currentModeId !== 'pomodoro' && currentBreakSongIndex === index && isRunning && (
                        <div className="playing-indicator">
                          <span className="bar"></span><span className="bar"></span><span className="bar"></span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowSettings(false)}>
              <X size={20} />
            </button>
            <h3>Cài đặt Thời gian (Phút)</h3>
            
            <div className="settings-grid">
              <div className="setting-item">
                <label>Pomodoro</label>
                <input 
                  type="number" 
                  value={settings.pomodoro}
                  onChange={(e) => setSettings({...settings, pomodoro: parseInt(e.target.value) || 1})}
                  min="1"
                />
              </div>
              <div className="setting-item">
                <label>Short Break</label>
                <input 
                  type="number" 
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 1})}
                  min="1"
                />
              </div>
              <div className="setting-item">
                <label>Long Break</label>
                <input 
                  type="number" 
                  value={settings.longBreak}
                  onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 1})}
                  min="1"
                />
              </div>
            </div>

            <div className="profiles-section">
              <h4>Profiles Nhanh</h4>
              <div className="profile-buttons">
                {PROFILES.map(profile => (
                  <button key={profile.id} className="profile-btn" onClick={() => applyProfile(profile)}>
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
