"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export default function CreatorPage() {
  const router = useRouter();
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  
  // PDF Config
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [previewPage, setPreviewPage] = useState(1);
  
  // AI Config
  const [apiKey, setApiKey] = useState('');
  const [bookType, setBookType] = useState('vocabulary');
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [totalTokens, setTotalTokens] = useState({ prompt: 0, completion: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/books/list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.files) {
          setPdfs(data.files);
          if (data.files.length > 0) setSelectedPdf(data.files[0]);
        }
      });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (aiResult && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [aiResult, saveSuccess]);

  useEffect(() => {
    const s = parseInt(startPage);
    if (!isNaN(s) && s > 0) setPreviewPage(s);
  }, [startPage]);

  useEffect(() => {
    if (!selectedPdf) return;
    const loadBackgroundPdf = async () => {
      try {
        const loadingTask = pdfjs.getDocument(`/${selectedPdf}`);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
      } catch (e) {
        console.error("Lỗi tải PDF nền:", e);
      }
    };
    loadBackgroundPdf();
  }, [selectedPdf]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setTotalPages(numPages);
    setAiError('');
  };

  const processPageWithAI = async (base64Img) => {
    const systemPrompt = `Bạn là chuyên gia ngôn ngữ tiếng Nhật xuất sắc. Nhiệm vụ TỐI QUAN TRỌNG của bạn là trích xuất 100% TẤT CẢ các từ vựng xuất hiện trong BỨC ẢNH chụp trang sách này.
QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG BỎ SÓT TỪ NÀO. Sách có bao nhiêu từ vựng chính, phải trích xuất đủ bấy nhiêu object.
2. Cực kỳ cẩn thận với Furigana nhỏ li ti và nét chữ Kanji. Đảm bảo chính xác 100% như trong sách.
3. Dịch nghĩa tiếng Việt bám sát ngữ cảnh.
4. BẮT BUỘC sinh ra mảng "examples" gồm 2-3 câu ví dụ giao tiếp thực tế cho mỗi từ vựng. Đảm bảo câu ngắn gọn, thông dụng trong đời sống hằng ngày (Học bồi).
5. Trả về DUY NHẤT một MẢNG JSON hợp lệ. Không chứa markdown (\`\`\`json), không giải thích.

Cấu trúc mỗi object:
{
  "kanji": "...", // Nếu không có kanji thì để trống
  "hiragana": "...", // Cách đọc (Bắt buộc)
  "meaning": "...", // Ý nghĩa tiếng Việt chi tiết
  "type": "verb", // Loại từ: noun, verb, adjective, adverb...
  "level": "N3",
  "examples": [
    {
      "ja": "電車に乗って、会社へ行く。",
      "vi": "Lên tàu rồi đi đến công ty."
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: "text", text: "Trích xuất từ vựng thành mảng JSON." },
              { type: "image_url", image_url: { url: base64Img, detail: "high" } }
            ] 
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    let text = data.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return { data: JSON.parse(text), usage: data.usage };
    } catch (e) {
      console.error("JSON parse failed for a page", text);
      return { data: [], usage: data.usage }; 
    }
  };

  const handleRunBatchAI = async () => {
    if (aiResult && !saveSuccess) {
      if (!window.confirm('Bạn có kết quả JSON của lần quét trước CHƯA LƯU! Việc quét tiếp sẽ làm mất dữ liệu đó. Bạn có chắc chắn muốn bỏ qua và quét mới?')) {
        return;
      }
    }

    setAiError('');
    setAiResult('');
    setTotalTokens({ prompt: 0, completion: 0 });

    if (!apiKey) return setAiError('Vui lòng nhập OpenAI API Key.');
    if (!pdfDoc) return setAiError('File PDF chưa sẵn sàng.');

    const s = parseInt(startPage);
    const e = parseInt(endPage);

    if (isNaN(s) || isNaN(e) || s < 1 || e < s || e > totalPages) {
      return setAiError('Phạm vi trang không hợp lệ.');
    }

    setIsProcessing(true);
    let allVocabs = [];
    let cumulativeTokens = { prompt: 0, completion: 0 };

    try {
      for (let p = s; p <= e; p++) {
        setProgressMsg(`Đang xử lý trang ${p}/${e} ...`);
        
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        const { data, usage } = await processPageWithAI(dataUrl);
        
        if (Array.isArray(data)) {
          const dataWithPage = data.map(item => ({ ...item, source_page: p }));
          allVocabs = [...allVocabs, ...dataWithPage];
        }

        cumulativeTokens.prompt += usage.prompt_tokens;
        cumulativeTokens.completion += usage.completion_tokens;
        setTotalTokens({ ...cumulativeTokens });
      }

      setAiResult(JSON.stringify(allVocabs, null, 2));
      setProgressMsg('Hoàn tất!');
    } catch (error) {
      setAiError('Lỗi trong quá trình quét: ' + error.message);
      setProgressMsg('Quá trình bị gián đoạn.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveData = async () => {
    if (!aiResult) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bookType,
          data: aiResult
        })
      });
      const resData = await response.json();
      if (resData.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Lỗi lưu data: " + resData.error);
      }
    } catch (e) {
      alert("Lỗi kết nối khi lưu data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    if (aiResult && !saveSuccess) {
      if (!window.confirm('Bạn chưa Lưu Data! Nếu rời đi, dữ liệu vừa quét sẽ bị mất vĩnh viễn. Bạn có chắc chắn muốn thoát?')) return;
    }
    router.push('/learning-japanese');
  };

  const costEst = ((totalTokens.prompt / 1000000 * 0.150) + (totalTokens.completion / 1000000 * 0.600)).toFixed(5);

  return (
    <div className="h-full overflow-auto p-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-baseline gap-4 mb-8">
        <a href="#" onClick={handleGoBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </a>
        <h1 className="text-2xl font-semibold text-slate-900 m-0">Data Parser</h1>
        <span className="text-sm text-slate-500">Trích xuất thông minh bằng GPT-4o-mini</span>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-8 items-start">
        
        {/* LEFT: SETTINGS PANEL */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nguồn Dữ Liệu</label>
            <select 
              value={selectedPdf} 
              onChange={e => setSelectedPdf(e.target.value)}
              className="w-full mt-2 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {pdfs.length === 0 && <option>Không có file</option>}
              {pdfs.map(pdf => <option key={pdf} value={pdf}>{pdf.split('/').pop()}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Phạm Vi Quét (Trang)</label>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="number" 
                value={startPage}
                onChange={e => setStartPage(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Từ"
              />
              <span className="text-slate-500 text-sm">đến</span>
              <input 
                type="number" 
                value={endPage}
                onChange={e => setEndPage(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Đến"
              />
            </div>
            {totalPages > 0 && <div className="text-[11px] text-slate-400 mt-1.5">Tổng số: {totalPages} trang</div>}
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">API Configuration</label>
            <input 
              type="password" 
              placeholder="OpenAI API Key (sk-...)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full mt-2 mb-3 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={bookType} 
              onChange={e => setBookType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="vocabulary">Từ vựng (Vocabulary)</option>
              <option value="grammar">Ngữ pháp (Grammar)</option>
            </select>
          </div>

          <button 
            onClick={handleRunBatchAI} 
            disabled={isProcessing}
            className={`w-full p-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              isProcessing 
                ? 'bg-slate-400 text-white cursor-wait' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'
            }`}
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {isProcessing ? 'Đang trích xuất...' : 'Bắt đầu quét'}
          </button>

          {aiError && (
            <div className="text-red-500 text-xs mt-4 flex gap-1.5 items-start">
              <AlertCircle size={14} className="shrink-0 mt-[1px]" /> 
              <span>{aiError}</span>
            </div>
          )}
          {progressMsg && (
            <div className="text-blue-600 text-sm mt-4 font-medium text-center">
              {progressMsg}
            </div>
          )}
          
          {(totalTokens.prompt > 0) && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex justify-between mb-1">
                <span>Tokens:</span> 
                <span className="font-medium text-slate-700">{totalTokens.prompt + totalTokens.completion}</span>
              </div>
              <div className="flex justify-between">
                <span>Ước tính:</span> 
                <span className="text-emerald-500 font-semibold">~${costEst}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: WORKSPACE (PREVIEW & JSON) */}
        <div className="flex flex-col gap-6 min-h-[800px]">
          
          {/* PDF Preview */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-[400px] flex flex-col shadow-sm">
            <div className="text-xs font-medium text-slate-600 mb-3">Bản xem trước (Trang {previewPage})</div>
            <div className="flex-1 overflow-auto flex justify-center bg-slate-200 rounded-lg p-4">
              {selectedPdf && (
                <Document file={`/${selectedPdf}`} onLoadSuccess={onDocumentLoadSuccess} loading={<span className="text-xs text-slate-500">Đang tải...</span>}>
                  <Page pageNumber={previewPage} width={300} renderTextLayer={false} renderAnnotationLayer={false} loading={null} />
                </Document>
              )}
            </div>
          </div>

          {/* JSON Output */}
          <div className="bg-white rounded-xl border border-slate-200 flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-900">Kết quả JSON</span>
              {aiResult && (
                <button 
                  onClick={handleSaveData}
                  disabled={isSaving || saveSuccess}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    saveSuccess 
                      ? 'bg-emerald-500 text-white' 
                      : isSaving 
                        ? 'text-slate-400 cursor-wait' 
                        : 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : (saveSuccess ? <CheckCircle2 size={14} /> : <Save size={14} />)}
                  {isSaving ? 'Đang lưu...' : (saveSuccess ? 'Đã lưu thành công!' : 'Lưu Data')}
                </button>
              )}
            </div>
            <textarea 
              readOnly 
              value={aiResult} 
              placeholder="Dữ liệu trích xuất sẽ hiển thị tại đây..."
              className="flex-1 p-5 border-none outline-none bg-slate-900 text-sky-400 text-sm font-mono resize-none"
            />
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}
