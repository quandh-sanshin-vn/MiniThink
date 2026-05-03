"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Terminal, Clock, CheckSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function StudySessionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { taskId } = params;
  const isPracticeMode = searchParams.get('mode') === 'practice';

  const [vocabs, setVocabs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [results, setResults] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);

  // Fetch Vocabs
  useEffect(() => {
    fetch(`/api/study/vocab?taskId=${taskId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setVocabs(data.data);
        } else {
          // If no vocab, just auto submit or show error
          setIsDone(true);
        }
      })
      .catch(err => console.error(err));
  }, [taskId]);

  // Timer
  useEffect(() => {
    if (isRevealed || isDone || vocabs.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isRevealed, isDone, vocabs.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDone || vocabs.length === 0) return;
      
      if (!isRevealed && e.code === 'Space') {
        e.preventDefault();
        setIsRevealed(true);
      } else if (isRevealed) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          handleScore(Number(e.key));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isDone, vocabs.length, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScore = (score) => {
    // If timer reached 0, max score is 3 (Memorized, not Perfect)
    const finalScore = (timeLeft === 0 && score === 4) ? 3 : score;
    
    const newResults = [...results, { itemId: vocabs[currentIndex].id, qualityScore: finalScore }];
    
    if (currentIndex < vocabs.length - 1) {
      setResults(newResults);
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setTimeLeft(10);
    } else {
      setResults(newResults);
      setIsDone(true);
      submitResults(newResults);
    }
  };

  const submitResults = async (finalResults) => {
    if (isPracticeMode) {
      // In practice mode, skip API submission to prevent messing up SRS
      // We don't push router here anymore, let the user see the stats and click the return button
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/study/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          results: finalResults
        })
      });
      if (!res.ok) {
        alert("Failed to save progress.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (vocabs.length === 0 && !isDone) {
    return (
      <div className="h-screen bg-[#09090b] text-emerald-500 font-mono flex items-center justify-center">
        <span className="animate-pulse">Loading Vocabulary Data...</span>
      </div>
    );
  }

  if (isDone) {
    const perfectItems = results.filter(r => r.qualityScore === 4).map(r => vocabs.find(v => v.id === r.itemId)).filter(Boolean);
    const memorizedItems = results.filter(r => r.qualityScore === 3).map(r => vocabs.find(v => v.id === r.itemId)).filter(Boolean);
    const badItems = results.filter(r => r.qualityScore === 2).map(r => vocabs.find(v => v.id === r.itemId)).filter(Boolean);
    const alarmingItems = results.filter(r => r.qualityScore === 1).map(r => vocabs.find(v => v.id === r.itemId)).filter(Boolean);

    const statConfig = {
      4: { label: t('study.stats.perfect').toUpperCase(), items: perfectItems, color: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'hover:bg-emerald-500/10' },
      3: { label: t('study.stats.memorized').toUpperCase(), items: memorizedItems, color: 'text-blue-500', border: 'border-blue-500/30', bg: 'hover:bg-blue-500/10' },
      2: { label: t('study.stats.bad').toUpperCase(), items: badItems, color: 'text-amber-500', border: 'border-amber-500/30', bg: 'hover:bg-amber-500/10' },
      1: { label: t('study.stats.alarming').toUpperCase(), items: alarmingItems, color: 'text-rose-500', border: 'border-rose-500/30', bg: 'hover:bg-rose-500/10' },
    };

    return (
      <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col items-center mt-10">
          <CheckSquare size={48} className="mb-4 text-emerald-400" />
          <h1 className="text-2xl font-bold uppercase mb-2 text-emerald-500">{t('study.complete.title')}</h1>
          <p className="text-neutral-400 mb-8">{t('study.complete.desc')} {results.length} {t('study.complete.items')}</p>
          
          {/* STATS OVERVIEW */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[4, 3, 2, 1].map(key => (
              <button 
                key={key}
                onClick={() => setSelectedStat(selectedStat === key ? null : key)}
                className={`p-4 border ${statConfig[key].border} ${statConfig[key].bg} flex flex-col items-center justify-center transition-colors ${selectedStat === key ? 'bg-neutral-800' : 'bg-black'}`}
              >
                <span className={`text-3xl font-black mb-1 ${statConfig[key].color}`}>{statConfig[key].items.length}</span>
                <span className={`text-xs uppercase ${statConfig[key].color}`}>{statConfig[key].label}</span>
              </button>
            ))}
          </div>

          {/* DETAIL LIST */}
          {selectedStat && (
            <div className="w-full border border-neutral-800 bg-black p-4 mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className={`text-lg font-bold mb-4 uppercase ${statConfig[selectedStat].color}`}>
                -- {statConfig[selectedStat].label} ({statConfig[selectedStat].items.length}) --
              </h3>
              {statConfig[selectedStat].items.length === 0 ? (
                <div className="text-neutral-600 text-sm py-4 text-center">Không có dữ liệu.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 uppercase">
                        <th className="pb-2 px-2">STT</th>
                        <th className="pb-2 px-2">Kanji</th>
                        <th className="pb-2 px-2">Hiragana</th>
                        <th className="pb-2 px-2">Nghĩa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statConfig[selectedStat].items.map((item, idx) => (
                        <tr key={item.id} className="border-b border-neutral-900 hover:bg-neutral-900/50">
                          <td className="py-3 px-2 text-neutral-600">{(idx + 1).toString().padStart(2, '0')}</td>
                          <td className="py-3 px-2 font-bold text-white text-lg">{item.kanji}</td>
                          <td className="py-3 px-2 text-emerald-400">{item.hiragana}</td>
                          <td className="py-3 px-2 text-neutral-400">{item.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {isSubmitting ? (
            <span className="animate-pulse text-emerald-500 mt-4">Syncing to Database...</span>
          ) : (
            <button 
              onClick={() => router.push('/learning-japanese/goals')}
              className="px-8 py-3 border border-emerald-500 hover:bg-emerald-500 hover:text-black uppercase font-bold text-emerald-500 transition-colors mt-4"
            >
              {t('study.complete.return')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentVocab = vocabs[currentIndex];

  return (
    <div className="h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-sm border-b border-neutral-800">
        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase">
          <Terminal size={16} /> Focus_Study_Room {isPracticeMode && <span className="text-amber-500 ml-2">{t('study.practice_mode')}</span>}
        </div>
        <div className="text-neutral-500 flex flex-col items-end gap-1">
          <span className="text-xs">TASK_ID: <span className="text-neutral-400 select-all">{taskId}</span></span>
          <span className="text-emerald-400 font-bold">
            {t('study.stats.progress')}: [{currentIndex + 1}/{vocabs.length}]
          </span>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="w-full max-w-2xl flex flex-col">
        
        {/* Timer Bar */}
        <div className="flex items-center gap-4 mb-8">
          <Clock size={16} className={timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'} />
          <div className="flex-1 h-2 bg-neutral-900 border border-neutral-800">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>
          <span className={`w-8 text-right font-bold ${timeLeft <= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Card */}
        <div className="min-h-[400px] border border-neutral-800 bg-black p-10 flex flex-col relative shadow-2xl shadow-emerald-900/5">
          
          {/* Front (Question) */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-widest mb-4">
              {currentVocab.kanji}
            </h2>
            {!isRevealed && (
              <p className="text-neutral-600 mt-8 animate-pulse text-sm uppercase">
                &gt; {t('study.card.flip')}
              </p>
            )}
          </div>

          {/* Back (Answer) */}
          {isRevealed && (
            <div className="border-t border-dashed border-neutral-800 pt-8 mt-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-emerald-400 text-2xl font-bold mb-1">{currentVocab.hiragana}</p>
                  <p className="text-slate-300 text-xl">{currentVocab.meaning}</p>
                </div>
                <span className="text-neutral-600 uppercase text-xs border border-neutral-800 px-2 py-1">
                  {currentVocab.type} | {currentVocab.level}
                </span>
              </div>
              
              {/* Examples Map */}
              {currentVocab.examples && currentVocab.examples.length > 0 && (
                <div className="space-y-4">
                  <div className="text-xs uppercase text-emerald-500/50 mb-2 font-bold tracking-widest">
                    -- Example Map --
                  </div>
                  {currentVocab.examples.map((ex, idx) => (
                    <div key={idx} className="bg-neutral-900/50 p-3 border-l-2 border-emerald-500/30 text-sm">
                      <p className="text-emerald-300 font-bold mb-1">{ex.ja}</p>
                      <p className="text-neutral-400">{ex.vi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col items-center">
          {!isRevealed ? (
            <button 
              onClick={() => setIsRevealed(true)}
              className="w-full max-w-xs border border-emerald-500/50 hover:bg-emerald-900/20 text-emerald-400 py-3 uppercase font-bold transition-colors md:hidden"
            >
              {t('study.card.flip')}
            </button>
          ) : (
            <div className="w-full flex flex-wrap justify-between gap-2">
              <button onClick={() => handleScore(1)} className="flex-1 min-w-[100px] border border-rose-500/30 hover:bg-rose-500 hover:text-black text-rose-500 py-3 uppercase font-bold transition-colors text-xs md:text-sm flex flex-col items-center">
                <span className="text-xl mb-1">[1]</span>
                {t('study.stats.alarming')} (0)
              </button>
              <button onClick={() => handleScore(2)} className="flex-1 min-w-[100px] border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-500 py-3 uppercase font-bold transition-colors text-xs md:text-sm flex flex-col items-center">
                <span className="text-xl mb-1">[2]</span>
                {t('study.stats.bad')} (2)
              </button>
              <button onClick={() => handleScore(3)} className="flex-1 min-w-[100px] border border-blue-500/30 hover:bg-blue-500 hover:text-black text-blue-500 py-3 uppercase font-bold transition-colors text-xs md:text-sm flex flex-col items-center">
                <span className="text-xl mb-1">[3]</span>
                {t('study.stats.memorized')} (3)
              </button>
              <button onClick={() => handleScore(4)} className="flex-1 min-w-[100px] border border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-500 py-3 uppercase font-bold transition-colors text-xs md:text-sm flex flex-col items-center">
                <span className="text-xl mb-1">[4]</span>
                {t('study.stats.perfect')} (4)
              </button>
            </div>
          )}
          {timeLeft === 0 && isRevealed && (
            <div className="mt-4 flex items-center gap-2 text-rose-500 text-xs uppercase animate-pulse">
              <AlertTriangle size={14} /> Time limit exceeded. Max score capped at [3].
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
