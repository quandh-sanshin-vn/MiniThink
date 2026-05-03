"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Layers, Database, CheckSquare, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ConsolidateStudyPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { taskId } = params;
  const isPracticeMode = searchParams.get('mode') === 'practice';

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [results, setResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/consolidate/study?taskId=${taskId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setCards(data.data);
        } else {
          setIsDone(true);
        }
      })
      .catch(err => console.error(err));
  }, [taskId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDone || cards.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(true);
      } else if (isFlipped) {
        if (e.key === '1') handleScore(1);
        else if (e.key === '2') handleScore(2);
        else if (e.key === '3') handleScore(3);
        else if (e.key === '4') handleScore(4);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, isDone, cards.length]);

  const handleScore = (score) => {
    const currentCard = cards[currentIndex];
    const newResults = [...results, { progressId: currentCard.progressId, score }];
    
    if (currentIndex < cards.length - 1) {
      setResults(newResults);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setResults(newResults);
      setIsDone(true);
      submitResults(newResults);
    }
  };

  const submitResults = async (finalResults) => {
    if (isPracticeMode) {
      router.push('/learning-japanese/goals');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consolidate/study/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, results: finalResults })
      });
      if (res.ok) {
        router.push('/learning-japanese/goals');
      } else {
        alert("Lỗi lưu tiến độ");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSyntax = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{.*?\})/g);
    return parts.map((part, idx) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const content = part.slice(1, -1);
        return (
          <span key={idx} className="inline-block bg-emerald-500 text-black font-bold px-2 py-0.5 mx-1 uppercase text-sm border border-emerald-500">
            {content}
          </span>
        );
      }
      return <span key={idx} className="text-white text-lg">{part}</span>;
    });
  };

  if (cards.length === 0 && !isDone) {
    return (
      <div className="h-screen bg-[#09090b] text-emerald-500 font-mono flex items-center justify-center">
        <span className="animate-pulse">Loading Deep Review Data...</span>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="h-screen bg-[#09090b] text-emerald-500 font-mono flex flex-col items-center justify-center p-6">
        <CheckSquare size={48} className="mb-4 text-emerald-400" />
        <h1 className="text-2xl font-bold uppercase mb-2">Quá Trình Dọn Nợ Hoàn Tất</h1>
        <p className="text-neutral-400 mb-8">Đã thanh toán {results.length} items quá hạn.</p>
        {isSubmitting ? (
          <span className="animate-pulse flex items-center gap-2"><Database size={16}/> Syncing Database...</span>
        ) : (
          <button 
            onClick={() => router.push('/learning-japanese/goals')}
            className="px-6 py-2 border border-emerald-500 hover:bg-emerald-500 hover:text-black uppercase font-bold"
          >
            [ RETURN TO TERMINAL ]
          </button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col items-center p-4 md:p-8 overflow-hidden selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl flex justify-between items-center text-sm border-b border-neutral-800 pb-4 mb-8">
        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase">
          <Layers size={16} /> Consolidate_Room
          {isPracticeMode && <span className="text-amber-500 ml-2">[PRACTICE]</span>}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-neutral-500">TYPE: <span className="text-emerald-400 uppercase">{currentCard.itemType}</span></span>
          <span className="text-emerald-500 font-bold">[{currentIndex + 1}/{cards.length}]</span>
        </div>
      </div>

      {/* CARD */}
      <div className="w-full max-w-2xl flex-1 flex flex-col relative">
        <div className="border border-neutral-800 bg-black flex-1 flex flex-col items-center justify-center p-8 text-center shadow-xl shadow-black/50 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-30"></div>
          
          {currentCard.itemType === 'grammar' ? (
             <div className="text-2xl md:text-3xl font-bold mb-6 flex flex-wrap justify-center items-center">
                {renderSyntax(currentCard.front)}
             </div>
          ) : (
             <h2 className="text-6xl md:text-8xl font-black text-white tracking-widest mb-6">
                {currentCard.front}
             </h2>
          )}

          {!isFlipped ? (
            <button 
              onClick={() => setIsFlipped(true)}
              className="mt-8 px-6 py-3 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black uppercase text-xs font-bold transition-colors animate-pulse"
            >
              [ PRESS SPACE TO FLIP ]
            </button>
          ) : (
            <div className="w-full mt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-neutral-800 pt-8">
              <span className="text-emerald-400 font-bold text-xl md:text-2xl mb-2">
                {currentCard.backTitle}
              </span>
              
              <span className="text-neutral-400 text-sm md:text-base max-w-lg mb-6">
                {currentCard.backMeaning}
              </span>
              
              {currentCard.examples && currentCard.examples.length > 0 && (
                <div className="w-full max-w-lg bg-neutral-900/50 border border-neutral-800 p-4 text-left text-xs mb-8 space-y-3">
                  <div className="text-amber-500 font-bold uppercase flex items-center gap-2 mb-2">
                    <AlertTriangle size={12}/> DATA_LOGS
                  </div>
                  {currentCard.examples.map((ex, i) => (
                    <div key={i} className="border-l border-emerald-500/30 pl-2">
                      <p className="text-emerald-300">{ex.ja}</p>
                      <p className="text-neutral-500">{ex.vi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className={`mt-8 grid grid-cols-4 gap-2 md:gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button onClick={() => handleScore(1)} className="border border-rose-500/30 bg-[#09090b] hover:bg-rose-500 hover:text-black text-rose-500 py-3 uppercase font-bold transition-colors text-[10px] md:text-sm flex flex-col items-center">
            <span className="text-lg md:text-xl mb-1">[1]</span>
            {t('study.stats.alarming')} (0)
          </button>
          <button onClick={() => handleScore(2)} className="border border-amber-500/30 bg-[#09090b] hover:bg-amber-500 hover:text-black text-amber-500 py-3 uppercase font-bold transition-colors text-[10px] md:text-sm flex flex-col items-center">
            <span className="text-lg md:text-xl mb-1">[2]</span>
            {t('study.stats.bad')} (2)
          </button>
          <button onClick={() => handleScore(3)} className="border border-blue-500/30 bg-[#09090b] hover:bg-blue-500 hover:text-black text-blue-500 py-3 uppercase font-bold transition-colors text-[10px] md:text-sm flex flex-col items-center">
            <span className="text-lg md:text-xl mb-1">[3]</span>
            {t('study.stats.memorized')} (3)
          </button>
          <button onClick={() => handleScore(4)} className="border border-emerald-500/30 bg-[#09090b] hover:bg-emerald-500 hover:text-black text-emerald-500 py-3 uppercase font-bold transition-colors text-[10px] md:text-sm flex flex-col items-center">
            <span className="text-lg md:text-xl mb-1">[4]</span>
            {t('study.stats.perfect')} (4)
          </button>
        </div>
      </div>
    </div>
  );
}
