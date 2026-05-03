"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCw, Check, X, Volume2, BarChart2 } from 'lucide-react';

export default function VocabularyPage() {
  const [vocabData, setVocabData] = useState([]);
  const [learningState, setLearningState] = useState({});
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/vocabulary');
        if (res.ok) {
          const data = await res.json();
          setVocabData(data);
        }
        
        const savedProgress = localStorage.getItem('mervyn_jp_vocab_progress');
        if (savedProgress) {
          setLearningState(JSON.parse(savedProgress));
        }
      } catch (e) {
        console.error("Lỗi tải dữ liệu", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveProgress = (newState) => {
    setLearningState(newState);
    localStorage.setItem('mervyn_jp_vocab_progress', JSON.stringify(newState));
  };

  const getTodayCards = () => {
    const now = Date.now();
    return vocabData.filter(word => {
      const id = word.kanji ? `${word.kanji}_${word.hiragana}` : word.hiragana;
      const state = learningState[id];
      if (!state) return true;
      return state.nextReview <= now;
    });
  };

  const todayCards = getTodayCards();
  const activeWord = todayCards[currentCardIdx];

  const handleReview = (remembered) => {
    if (!activeWord) return;
    
    const id = activeWord.kanji ? `${activeWord.kanji}_${activeWord.hiragana}` : activeWord.hiragana;
    const currentState = learningState[id] || { interval: 0, count: 0 };
    
    let newInterval = 1;
    if (remembered) {
      if (currentState.interval === 0) newInterval = 1;
      else if (currentState.interval === 1) newInterval = 3;
      else if (currentState.interval === 3) newInterval = 5;
      else if (currentState.interval === 5) newInterval = 7;
      else newInterval = currentState.interval + 7;
    } else {
      newInterval = 0;
    }

    const nextReviewTime = newInterval === 0 ? Date.now() - 1000 : Date.now() + newInterval * 24 * 60 * 60 * 1000;
    
    const newState = {
      ...learningState,
      [id]: {
        interval: newInterval,
        nextReview: nextReviewTime,
        count: currentState.count + 1
      }
    };
    
    saveProgress(newState);
    setIsFlipped(false);
  };

  const handleSpeech = (e) => {
    e.stopPropagation();
    if (!activeWord) return;
    const textToSpeak = activeWord.kanji || activeWord.hiragana;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 px-12 py-6 box-border overflow-hidden">
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-center shrink-0 mb-6">
        <Link href="/learning-japanese" className="inline-flex items-center gap-2 w-[150px] text-slate-500 hover:text-blue-600 font-medium transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </Link>
        <div className="text-center flex-1">
          <h1 className="text-2xl mb-1 text-slate-900 font-semibold tracking-tight">Flashcards Từ Vựng</h1>
          <p className="text-sm text-slate-500 m-0">Spaced Repetition (1, 3, 5, 7 ngày)</p>
        </div>
        <div className="w-[150px] flex justify-end">
          <button 
            onClick={() => setShowStats(!showStats)} 
            className="bg-white border border-slate-200 px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 text-slate-600 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
          >
            <BarChart2 size={16} /> Thống kê
          </button>
        </div>
      </div>

      {showStats ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm max-w-[800px] mx-auto w-full">
          <h2 className="text-2xl text-slate-900 mb-8 font-semibold text-center">Thống kê tiến độ</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-4xl font-extrabold text-blue-600">{vocabData.length}</div>
              <div className="text-sm text-slate-500 mt-2 font-medium">Tổng số từ</div>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-4xl font-extrabold text-emerald-500">{Object.keys(learningState).length}</div>
              <div className="text-sm text-slate-500 mt-2 font-medium">Đã học</div>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-4xl font-extrabold text-amber-500">{todayCards.length}</div>
              <div className="text-sm text-slate-500 mt-2 font-medium">Cần ôn hôm nay</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {todayCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-3xl border border-slate-200">
              <Check size={64} className="text-emerald-500 mb-6" />
              <h2 className="text-2xl text-slate-900 mb-2 font-semibold">Tuyệt vời! Bạn đã học xong bài hôm nay.</h2>
              <p className="text-slate-500 text-base">Hãy quay lại vào ngày mai để ôn tập tiếp nhé.</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 w-full max-w-[1400px] mx-auto">
              
              <div className="text-center mb-4 text-slate-500 text-[15px] font-semibold shrink-0">
                Còn {todayCards.length} thẻ cần ôn tập
              </div>

              {/* FLASHCARD */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full flex-1 bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200 flex items-center justify-center cursor-pointer relative px-16 py-8 transition-transform duration-300 overflow-y-auto ${isFlipped ? 'rotate-0' : ''}`}
              >
                {!isFlipped ? (
                  // MẶT TRƯỚC
                  <div className="text-center">
                    <div className="flex justify-center mb-10 gap-3">
                      <span className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl text-base font-bold uppercase tracking-wide">
                        {activeWord.level || 'N3'} • {activeWord.type}
                      </span>
                      {(() => {
                        if (!activeWord.added_date) return null;
                        const diffTime = Math.abs(new Date() - new Date(activeWord.added_date));
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 3) {
                          return (
                            <span className="px-6 py-2 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl text-base font-bold uppercase tracking-wide">
                              Mới thêm
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    {activeWord.kanji ? (
                      <>
                        <div className="text-[8rem] font-extrabold text-slate-900 tracking-widest leading-tight">{activeWord.kanji}</div>
                        <div className="text-4xl text-slate-500 mt-4 font-medium">{activeWord.hiragana}</div>
                      </>
                    ) : (
                      <div className="text-[7rem] font-extrabold text-slate-900 tracking-widest leading-tight">{activeWord.hiragana}</div>
                    )}
                    <p className="text-lg text-slate-400 mt-16 flex items-center justify-center gap-2 font-medium">
                      <RotateCw size={18} /> Nhấp chuột để lật thẻ
                    </p>
                  </div>
                ) : (
                  // MẶT SAU
                  <div className="flex w-full h-full gap-20 items-center justify-center">
                    
                    {/* CỘT TRÁI: TỪ VỰNG & PHÁT ÂM */}
                    <div className="flex-[0_0_40%] text-center border-r border-dashed border-slate-300 pr-16">
                      <div className="text-3xl text-slate-500 mb-2 font-medium">
                        {activeWord.hiragana}
                      </div>
                      <div className="text-[5rem] font-extrabold text-slate-900 mb-10 leading-tight">
                        {activeWord.kanji || activeWord.hiragana}
                      </div>
                      <button 
                        onClick={handleSpeech}
                        className="bg-blue-50 border-none p-6 rounded-full text-blue-600 cursor-pointer flex items-center justify-center mx-auto transition-all shadow-sm hover:bg-blue-100 hover:scale-105"
                      >
                        <Volume2 size={36} />
                      </button>
                    </div>

                    {/* CỘT PHẢI: NGHĨA & VÍ DỤ */}
                    <div className="flex-[0_0_50%] text-left">
                      <div className="text-[2.5rem] font-bold text-blue-600 mb-10 capitalize leading-tight">
                        {activeWord.meaning}
                      </div>

                      {activeWord.examples && activeWord.examples.length > 0 && (
                        <div className="bg-slate-100 px-10 py-8 rounded-[20px]">
                          <div className="text-lg font-bold text-slate-600 uppercase mb-6 tracking-wide">Ví dụ minh họa:</div>
                          {activeWord.examples.map((ex, idx) => (
                            <div key={idx} className={idx !== activeWord.examples.length - 1 ? 'mb-6' : ''}>
                              <div className="text-xl text-slate-900 font-semibold mb-1.5 leading-relaxed">{ex.ja}</div>
                              <div className="text-lg text-slate-500 leading-relaxed">{ex.vi}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className={`flex justify-center gap-8 mt-6 shrink-0 h-16 transition-opacity duration-200 ${isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <button 
                  onClick={() => handleReview(false)}
                  className="w-[200px] h-full bg-white border-2 border-red-500 rounded-2xl text-red-500 text-xl font-bold cursor-pointer flex items-center justify-center gap-3 transition-all hover:bg-red-50 hover:scale-105"
                >
                  <X size={24} /> Chưa nhớ
                </button>
                <button 
                  onClick={() => handleReview(true)}
                  className="w-[200px] h-full bg-emerald-500 border-none rounded-2xl text-white text-xl font-bold cursor-pointer flex items-center justify-center gap-3 shadow-[0_8px_15px_-3px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-600 hover:scale-105"
                >
                  <Check size={24} /> Đã nhớ
                </button>
              </div>
              
            </div>
          )}
        </>
      )}
    </div>
  );
}
