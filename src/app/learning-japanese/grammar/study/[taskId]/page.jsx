"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Terminal, Clock, CheckSquare, AlertTriangle, PenTool, Database, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function GrammarStudySessionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { taskId } = params;
  const isPracticeMode = searchParams.get('mode') === 'practice';

  const [taskInfo, setTaskInfo] = useState(null);
  const [grammars, setGrammars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Phase State
  // 'LOADING' -> 'INPUT_PHASE' -> 'PRACTICE_PHASE' -> 'DONE'
  const [phase, setPhase] = useState('LOADING'); 

  // ----- INPUT PHASE STATE -----
  const [inputForms, setInputForms] = useState([]);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const [isSavingInput, setIsSavingInput] = useState(false);

  // ----- PRACTICE PHASE STATE -----
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [userJaSentence, setUserJaSentence] = useState('');
  const [userViMeaning, setUserViMeaning] = useState('');
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);
  const [results, setResults] = useState([]);

  // Fetch task and grammars
  useEffect(() => {
    fetch(`/api/grammar/study?taskId=${taskId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTaskInfo(data.taskInfo);
          setGrammars(data.data);
          
          if (data.data.length === 0) {
            // New task, no items -> INPUT PHASE
            const draftKey = `grammar_draft_${taskId}`;
            const savedDraft = localStorage.getItem(draftKey);
            let initial;
            if (savedDraft) {
              try {
                initial = JSON.parse(savedDraft);
                if (initial.length !== data.taskInfo.quota) {
                  const diff = data.taskInfo.quota - initial.length;
                  if (diff > 0) {
                    initial = [...initial, ...Array.from({ length: diff }, () => ({ patternSyntax: '', meaning: '', nuance: '' }))];
                  } else if (diff < 0) {
                    initial = initial.slice(0, data.taskInfo.quota);
                  }
                }
              } catch (e) {
                initial = null;
              }
            }
            if (!initial) {
              initial = Array.from({ length: data.taskInfo.quota }, () => ({
                patternSyntax: '', meaning: '', nuance: ''
              }));
            }
            setInputForms(initial);
            setCurrentInputIndex(0);
            setPhase('INPUT_PHASE');
          } else {
            // Has items -> PRACTICE PHASE
            setPhase('PRACTICE_PHASE');
          }
        } else {
          setPhase('DONE'); // Error or not found
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
        setPhase('DONE');
      });
  }, [taskId]);

  // Timer for Practice Phase
  useEffect(() => {
    if (phase !== 'PRACTICE_PHASE' || grammars.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, currentIndex, grammars.length]);

  // ----- HANDLERS FOR INPUT PHASE -----
  const handleInputChange = (index, field, value) => {
    const newForms = [...inputForms];
    newForms[index][field] = value;
    setInputForms(newForms);
    localStorage.setItem(`grammar_draft_${taskId}`, JSON.stringify(newForms));
  };

  const handleSubmitInput = async () => {
    // Validate the final slide just in case
    const currentForm = inputForms[currentInputIndex];
    if (!currentForm.patternSyntax.trim() || !currentForm.meaning.trim()) {
      alert("Vui lòng điền đầy đủ Cấu trúc và Ý nghĩa trước khi lưu!");
      return;
    }

    setIsSavingInput(true);
    try {
      const res = await fetch('/api/grammar/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          grammars: inputForms
        })
      });
      if (res.ok) {
        localStorage.removeItem(`grammar_draft_${taskId}`);
        // Complete input phase
        setPhase('DONE');
      } else {
        alert("Lỗi khi lưu ngữ pháp mới.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối.");
    } finally {
      setIsSavingInput(false);
    }
  };

  // ----- HANDLERS FOR PRACTICE PHASE -----
  const renderLiveSyntax = (text) => {
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

  const handleScore = (score) => {
    if (!userJaSentence.trim() && score > 1) {
      alert("Hãy nhập một câu ví dụ tiếng Nhật trước khi tự chấm điểm!");
      return;
    }

    const finalScore = (timeLeft === 0 && score === 4) ? 3 : score;
    
    const newResults = [...results, { 
      grammarId: grammars[currentIndex].id, 
      score: finalScore,
      jaSentence: userJaSentence,
      viMeaning: userViMeaning
    }];
    
    if (currentIndex < grammars.length - 1) {
      setResults(newResults);
      setCurrentIndex(prev => prev + 1);
      setUserJaSentence('');
      setUserViMeaning('');
      setTimeLeft(30);
    } else {
      setResults(newResults);
      setPhase('DONE');
      submitPracticeResults(newResults);
    }
  };

  const submitPracticeResults = async (finalResults) => {
    if (isPracticeMode) {
      router.push('/learning-japanese/goals');
      return;
    }

    setIsSubmittingPractice(true);
    try {
      const res = await fetch('/api/grammar/study/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          results: finalResults
        })
      });
      if (res.ok) {
        router.push('/learning-japanese/goals');
      } else {
        alert("Failed to save progress.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  // ----- RENDERERS -----
  if (isLoading || phase === 'LOADING') {
    return (
      <div className="h-screen bg-[#09090b] text-emerald-500 font-mono flex items-center justify-center">
        <span className="animate-pulse">Loading Grammar Data...</span>
      </div>
    );
  }

  if (phase === 'DONE') {
    return (
      <div className="h-screen bg-[#09090b] text-emerald-500 font-mono flex flex-col items-center justify-center p-6 text-center">
        <CheckSquare size={48} className="mb-4 text-emerald-400" />
        <h1 className="text-2xl font-bold uppercase mb-2">{t('study.complete.title')}</h1>
        <p className="text-neutral-400 mb-8">
          {inputForms.length > 0 && results.length === 0 
            ? `Đã phân tích và lưu thành công ${inputForms.length} cấu trúc ngữ pháp.`
            : `${t('study.complete.desc')} ${results.length} cấu trúc ngữ pháp.`}
        </p>
        {isSubmittingPractice ? (
          <span className="animate-pulse flex items-center gap-2"><Database size={16} /> Syncing to Database...</span>
        ) : (
          <button 
            onClick={() => router.push('/learning-japanese/goals')}
            className="px-6 py-2 border border-emerald-500 hover:bg-emerald-500 hover:text-black uppercase font-bold"
          >
            {t('study.complete.return')}
          </button>
        )}
      </div>
    );
  }

  if (phase === 'INPUT_PHASE') {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
        <div className="w-full max-w-2xl flex justify-between items-center text-sm border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase">
            <Database size={16} /> Grammar_Parser_Terminal
          </div>
          <div className="text-neutral-500 flex flex-col items-end gap-1">
            <span className="text-xs">TASK: <span className="text-emerald-400">{taskInfo?.title}</span></span>
            <span className="text-amber-500 text-[10px] uppercase font-bold">Input Required</span>
          </div>
        </div>

        <div className="w-full max-w-2xl mb-6">
          <p className="text-neutral-400 text-sm mb-2 uppercase">
            {'>'} Phát hiện task ngữ pháp mới. Vui lòng nhập dữ liệu để nạp vào DB.
          </p>
          <p className="text-xs text-amber-500/80 mb-6 border-l border-amber-500/50 pl-2">
            Mẹo: Bọc phần công thức trong dấu ngoặc nhọn để highlight. Ví dụ: "{`{Động từ thể Te} + もいいですか`}"
          </p>

          <div className="border border-neutral-800 bg-neutral-900/30 p-6 relative min-h-[300px] flex flex-col justify-between shadow-xl shadow-black/50">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-emerald-500 font-bold text-sm uppercase flex items-center gap-2">
                  <PenTool size={16} /> Structure [{currentInputIndex + 1}/{inputForms.length}]
                </h3>
                {/* Progress bar miniature */}
                <div className="flex gap-1">
                  {inputForms.map((_, idx) => (
                    <div key={idx} className={`h-1.5 w-6 rounded-full ${idx === currentInputIndex ? 'bg-emerald-500' : idx < currentInputIndex ? 'bg-emerald-900' : 'bg-neutral-800'}`}></div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs text-neutral-500 uppercase">Cú pháp (Pattern Syntax) *</label>
                    <span className="text-[10px] text-emerald-500/70 uppercase">Live Preview Active</span>
                  </div>
                  <input
                    type="text"
                    value={inputForms[currentInputIndex]?.patternSyntax || ''}
                    onChange={e => handleInputChange(currentInputIndex, 'patternSyntax', e.target.value)}
                    placeholder="e.g. {V-te} + もいいですか"
                    className="w-full bg-[#09090b] border border-neutral-800 text-emerald-300 p-3 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                  />
                  {inputForms[currentInputIndex]?.patternSyntax && (
                    <div className="mt-3 p-4 bg-black border border-emerald-500/30 text-center flex flex-wrap justify-center items-center min-h-[60px]">
                      {renderLiveSyntax(inputForms[currentInputIndex].patternSyntax)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase mb-2">Ý nghĩa (Meaning) *</label>
                  <input
                    type="text"
                    value={inputForms[currentInputIndex]?.meaning || ''}
                    onChange={e => handleInputChange(currentInputIndex, 'meaning', e.target.value)}
                    placeholder="e.g. Làm ~ có được không?"
                    className="w-full bg-[#09090b] border border-neutral-800 text-slate-300 p-3 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase mb-2">Bối cảnh/Nuance (Tùy chọn)</label>
                  <input
                    type="text"
                    value={inputForms[currentInputIndex]?.nuance || ''}
                    onChange={e => handleInputChange(currentInputIndex, 'nuance', e.target.value)}
                    placeholder="e.g. Dùng khi xin phép làm gì đó."
                    className="w-full bg-[#09090b] border border-neutral-800 text-slate-400 p-3 focus:border-emerald-500 focus:outline-none font-mono text-sm italic"
                  />
                </div>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-800">
              <button
                onClick={() => setCurrentInputIndex(Math.max(0, currentInputIndex - 1))}
                disabled={currentInputIndex === 0}
                className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 disabled:opacity-20 uppercase text-xs font-bold transition-colors"
              >
                [ PREVIOUS ]
              </button>
              
              {currentInputIndex < inputForms.length - 1 ? (
                <button
                  onClick={() => {
                    const form = inputForms[currentInputIndex];
                    if (!form.patternSyntax.trim() || !form.meaning.trim()) {
                      alert("Vui lòng nhập đủ Cú pháp và Ý nghĩa trước khi tiếp tục.");
                      return;
                    }
                    setCurrentInputIndex(currentInputIndex + 1);
                  }}
                  className="px-6 py-2 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black uppercase text-xs font-bold transition-colors"
                >
                  [ NEXT ]
                </button>
              ) : (
                <button
                  onClick={handleSubmitInput}
                  disabled={isSavingInput}
                  className={`px-6 py-2 border flex justify-center items-center gap-2 uppercase font-bold text-xs transition-colors ${
                    isSavingInput 
                      ? 'border-neutral-700 text-neutral-500 bg-neutral-900 cursor-not-allowed'
                      : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black'
                  }`}
                >
                  {isSavingInput ? (
                    <><Loader2 size={14} className="animate-spin" /> COMPILLING...</>
                  ) : (
                    <><Save size={14} /> WRITE_TO_DATABASE</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- PRACTICE PHASE RENDER ---
  const currentGrammar = grammars[currentIndex];

  return (
    <div className="h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col items-center p-4 selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Top Header */}
      <div className="w-full max-w-4xl flex justify-between items-center text-sm border-b border-neutral-800 pb-4 mb-6">
        <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase">
          <Terminal size={16} /> Generative_Grammar_Room {isPracticeMode && <span className="text-amber-500 ml-2">{t('study.practice_mode')}</span>}
        </div>
        <div className="text-neutral-500 flex flex-col items-end gap-1">
          <span className="text-xs">TASK_ID: <span className="text-neutral-400 select-all">{taskId}</span></span>
          <span className="text-emerald-400 font-bold">
            {t('study.stats.progress')}: [{currentIndex + 1}/{grammars.length}]
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl flex flex-col flex-1 min-h-0">
        
        {/* Timer Bar */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <Clock size={16} className={timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'} />
          <div className="flex-1 h-2 bg-neutral-900 border border-neutral-800">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
          <span className={`w-10 text-right font-bold ${timeLeft <= 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Prompt Card */}
        <div className="border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col mb-6 shadow-xl shadow-emerald-900/5 shrink-0">
          <div className="text-xs text-amber-500 font-bold uppercase mb-4 flex items-center gap-2">
            <AlertTriangle size={14} /> System_Prompt
          </div>
          
          <div className="py-4 px-6 border border-emerald-500/30 bg-black mb-4 flex items-center justify-center text-center">
            {renderLiveSyntax(currentGrammar?.patternSyntax)}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
            <div className="border-l-2 border-emerald-500 pl-3">
              <span className="text-neutral-500 block text-[10px] uppercase">Ý nghĩa (Meaning)</span>
              <span className="text-emerald-300 font-bold">{currentGrammar?.meaning}</span>
            </div>
            {currentGrammar?.nuance && (
              <div className="border-l-2 border-amber-500 pl-3 md:text-right">
                <span className="text-neutral-500 block text-[10px] uppercase">Bối cảnh (Context)</span>
                <span className="text-amber-300 italic">{currentGrammar?.nuance}</span>
              </div>
            )}
          </div>
        </div>

        {/* Generative Input */}
        <div className="flex-1 flex flex-col border border-neutral-800 bg-black p-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-50"></div>
          
          <h3 className="text-emerald-500 uppercase font-bold text-sm mb-6 flex items-center gap-2">
            <PenTool size={16} /> Execute_Generation
          </h3>
          <p className="text-neutral-400 text-xs mb-4">Hãy tự đặt một câu ví dụ **HOÀN TOÀN MỚI** sử dụng cấu trúc ngữ pháp trên. Bạn có {timeLeft}s để hoàn thành tác vụ này.</p>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-[10px] text-emerald-500/70 uppercase mb-1">Ví dụ Tiếng Nhật (Bắt buộc)</label>
              <textarea
                value={userJaSentence}
                onChange={e => setUserJaSentence(e.target.value)}
                placeholder="Nhập câu tiếng Nhật..."
                className="w-full bg-[#09090b] border border-emerald-500/30 text-emerald-300 p-4 focus:border-emerald-500 focus:outline-none font-mono text-sm h-24 resize-none"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-[10px] text-neutral-500 uppercase mb-1">Dịch nghĩa Tiếng Việt (Tùy chọn)</label>
              <input
                type="text"
                value={userViMeaning}
                onChange={e => setUserViMeaning(e.target.value)}
                placeholder="Dịch nghĩa câu của bạn..."
                className="w-full bg-[#09090b] border border-neutral-800 text-slate-300 p-3 focus:border-neutral-500 focus:outline-none font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Score Controls */}
        <div className="mt-6 flex flex-wrap justify-between gap-2 shrink-0">
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

      </div>
    </div>
  );
}
