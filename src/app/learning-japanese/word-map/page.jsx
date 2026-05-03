"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquareQuote, Lightbulb, PlayCircle, BookOpen, Search, Edit3, Save, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';

function generateMapData(vocabulary) {
  const mapData = [];
  
  // Nạp toàn bộ từ vựng (không phân biệt danh từ hay động từ)
  vocabulary.forEach(word => {
    mapData.push({
      id: word.id,
      title: `${word.meaning} (${word.kanji || word.hiragana})`,
      center: word,
      examples: word.examples || [],
      added_date: word.added_date || null
    });
  });
  
  return mapData;
}

export default function WordMapPage() {
  const [mapData, setMapData] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editExamples, setEditExamples] = useState([]);

  const loadData = () => {
    setIsLoading(true);
    fetch('/api/vocabulary')
      .then(res => res.json())
      .then(data => {
        const generated = generateMapData(data);
        setMapData(generated);
        if (generated.length > 0 && !activeId) {
          setActiveId(generated[0].id);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMapData = mapData.filter(map => 
    map.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (map.center.kanji && map.center.kanji.includes(searchQuery)) || 
    (map.center.hiragana && map.center.hiragana.includes(searchQuery))
  );

  const activeMap = mapData.find(m => m.id === activeId);

  const startEdit = () => {
    // Clone examples for editing
    const cloned = activeMap.examples.map(ex => ({
      ja: ex.ja || '',
      vi: ex.vi || ''
    }));
    setEditExamples(cloned);
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Filter out empty examples
    const validExamples = editExamples.filter(ex => ex.ja.trim() !== '' && ex.vi.trim() !== '');

    try {
      const response = await fetch('/api/vocabulary/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: activeId,
          examples: validExamples
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        loadData(); // Reload map to reflect changes
      } else {
        alert('Lỗi lưu dữ liệu: ' + data.error);
      }
    } catch (e) {
      alert('Lỗi kết nối.');
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-slate-500">Đang phân tích kho câu giao tiếp...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-slate-50 font-sans text-slate-900 px-8 py-12">
      <div className="max-w-[1500px] mx-auto w-full">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Link href="/learning-japanese" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors mb-3 w-fit">
              <ArrowLeft size={16} /> Quay lại Dashboard
            </Link>
            <h1 className="text-3xl font-semibold mb-2 text-slate-900 flex items-center gap-3 tracking-tight">
              <MessageSquareQuote size={28} className="text-indigo-500" />
              Sơ Đồ Câu Giao Tiếp (Học Bồi)
            </h1>
            <p className="text-[15px] text-slate-500">Nhìn mặt chữ, nhớ ngay câu hoàn chỉnh để áp dụng ngay vào thực tế.</p>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            Kho dữ liệu hiện có: <strong className="text-indigo-600">{mapData.length}</strong> từ vựng!
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* LEFT: TOPIC SELECTOR */}
          <div className="w-full xl:w-96 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[700px]">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 font-semibold text-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500" /> Danh sách Từ vựng
              </div>
            </div>
            
            <div className="p-3 border-b border-slate-200 shrink-0 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm Kanji, Hiragana hoặc Nghĩa..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
              {filteredMapData.map(map => (
                <button
                  key={map.id}
                  onClick={() => {
                    setActiveId(map.id);
                    setIsEditing(false);
                  }}
                  className={`px-5 py-4 text-left transition-colors border-b border-slate-100 last:border-0 hover:bg-blue-50/50 ${
                    activeId === map.id 
                      ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-l-blue-500' 
                      : 'text-slate-600 font-normal border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[1.05rem] font-bold mb-1 flex items-center">
                        {map.center.kanji || map.center.hiragana}
                        {(() => {
                           if (!map.added_date) return null;
                           const diffTime = Math.abs(new Date() - new Date(map.added_date));
                           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                           if (diffDays <= 3) {
                             return <span className="bg-emerald-100 text-emerald-700 text-[0.65rem] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-2 border border-emerald-200">Mới</span>;
                           }
                           return null;
                        })()}
                      </div>
                      <div className="text-[0.8rem] opacity-80">{map.title.replace(`(${map.center.kanji || map.center.hiragana})`, '')}</div>
                    </div>
                    <div className="shrink-0 bg-slate-200/60 text-slate-500 text-[0.7rem] px-2 py-0.5 rounded-full font-bold">
                      {map.examples.length} câu
                    </div>
                  </div>
                </button>
              ))}
              {filteredMapData.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">Không tìm thấy từ vựng nào phù hợp.</div>
              )}
            </div>
          </div>

          {/* RIGHT: MAP VISUALIZATION / EDITOR */}
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-10 shadow-sm min-h-[700px] overflow-hidden flex flex-col relative">
            
            {activeMap && (
              <>
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Học câu với từ: <span className="text-indigo-600">{activeMap.center.kanji || activeMap.center.hiragana}</span>
                  </h2>
                  {!isEditing ? (
                    <button onClick={startEdit} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                      <Edit3 size={16} /> Quản lý mẫu câu
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                        <X size={16} /> Hủy
                      </button>
                      <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                        <Save size={16} /> Lưu Thay Đổi
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  /* --- MAP VIEW --- */
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    
                    {/* Hướng dẫn ngắn */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex gap-3 items-start">
                      <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 leading-relaxed">
                        <strong>Mục tiêu: Học bồi thực chiến.</strong> Hãy đọc to từng câu tiếng Nhật bên dưới để luyện phản xạ. Chỉ học những câu thông dụng trong giao tiếp hằng ngày. Bỏ qua các phân tích trợ từ phức tạp!
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center lg:items-start pb-10">
                      {/* CENTRAL NODE */}
                      <div className="shrink-0 w-64 lg:sticky lg:top-0 flex flex-col justify-center z-20">
                        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 text-center border-4 border-white">
                          <div className="text-[2.5rem] font-bold mb-2 leading-tight">{activeMap.center.kanji || activeMap.center.hiragana}</div>
                          {activeMap.center.kanji && (
                            <div className="text-lg font-medium opacity-90 mb-4">{activeMap.center.hiragana}</div>
                          )}
                          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold tracking-wide">
                            {activeMap.center.meaning}
                          </div>
                        </div>
                      </div>

                      {/* BRANCHES WRAPPER */}
                      <div className="flex-1 lg:ml-4 flex items-stretch mt-8 lg:mt-0 w-full">
                        {/* Connecting Bridge (Only visible on desktop) */}
                        <div className="hidden lg:block w-10 h-[3px] bg-slate-200 self-center"></div>
                        
                        {/* Vertical Spine */}
                        <div className="hidden lg:block border-l-[3px] border-slate-200 py-6 relative"></div>

                        <div className="flex flex-col gap-6 w-full lg:-ml-[3px] py-6">
                          {activeMap.examples.length === 0 && (
                            <div className="ml-10 text-slate-400 font-medium bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                              Chưa có mẫu câu giao tiếp nào. Hãy bấm <strong>Quản lý mẫu câu</strong> để thêm câu!
                            </div>
                          )}

                          {activeMap.examples.map((ex, idx) => (
                            <div key={idx} className="flex items-center group relative w-full">
                              
                              {/* Connector horizontal line */}
                              <div className="hidden lg:block w-10 h-[3px] bg-slate-200 group-hover:bg-indigo-400 transition-colors shrink-0"></div>
                              
                              {/* Sentence Card */}
                              <div className="flex-1 bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm group-hover:border-indigo-300 group-hover:shadow-md transition-all ml-0 lg:ml-0 w-full">
                                <div className="text-xl font-bold text-slate-800 mb-3 leading-relaxed tracking-wide">
                                  {ex.ja}
                                </div>
                                <div className="text-[1.05rem] text-slate-600 font-medium flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <PlayCircle size={20} className="text-emerald-500 mt-0.5 shrink-0 opacity-80" />
                                  <span className="leading-snug">{ex.vi}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                ) : (
                  /* --- EDIT VIEW --- */
                  <div className="flex-1 overflow-auto custom-scrollbar pr-4 pb-10">
                    <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 mb-6 text-sm text-indigo-800 flex items-start gap-3">
                       <Lightbulb size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                       <p>
                         <strong>Không giới hạn số lượng câu ví dụ!</strong><br/>
                         Hãy nhập những câu giao tiếp thường dùng nhất trong cuộc sống hằng ngày. Nếu câu nào quá ít dùng, hãy mạnh dạn xóa bỏ để tiết kiệm bộ nhớ não bộ.
                       </p>
                    </div>

                    <div className="space-y-5">
                      {editExamples.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-white border-2 border-slate-200 p-5 rounded-2xl relative shadow-sm hover:border-indigo-200 transition-colors">
                          <button 
                            onClick={() => {
                              const newEx = [...editExamples];
                              newEx.splice(exIdx, 1);
                              setEditExamples(newEx);
                            }}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1 transition-colors"
                            title="Xóa câu này"
                          >
                            <Trash2 size={20} />
                          </button>
                          
                          <div className="flex flex-col gap-4 pr-10">
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Câu tiếng Nhật hoàn chỉnh</label>
                              <textarea 
                                value={ex.ja} 
                                onChange={(e) => {
                                  const newEx = [...editExamples];
                                  newEx[exIdx].ja = e.target.value;
                                  setEditExamples(newEx);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[1.1rem] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                placeholder="Ví dụ: 電車に乗って、会社へ行く。"
                                rows="2"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Nghĩa tiếng Việt</label>
                              <input 
                                value={ex.vi} 
                                onChange={(e) => {
                                  const newEx = [...editExamples];
                                  newEx[exIdx].vi = e.target.value;
                                  setEditExamples(newEx);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Ví dụ: Lên tàu điện rồi đi đến công ty."
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button 
                        onClick={() => {
                          setEditExamples([...editExamples, { ja: '', vi: '' }]);
                        }}
                        className="w-full py-5 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl text-indigo-500 font-bold hover:bg-indigo-50 hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 text-lg"
                      >
                        <Plus size={24} /> Thêm câu giao tiếp mới
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
