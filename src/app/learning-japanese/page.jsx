"use client";
import React from 'react';
import Link from 'next/link';
import { Layers, MessageCircle, Library, Sparkles, Network, Target, Terminal } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const FEATURES = [
  {
    title: 'sys.goals_metrics',
    desc: 'Lập kế hoạch học đan xen, đo lường "Độ chín" của kiến thức qua tốc độ phản xạ và đặt câu thực tế.',
    icon: Target,
    href: '/learning-japanese/goals'
  },
  {
    title: 'sys.vocab_engine',
    desc: 'Flashcard tối giản, thuật toán Spaced Repetition (1/3/5/7 ngày) và trộn tỷ lệ từ vựng (N4, N3, N2) để rèn luyện trí nhớ.',
    icon: Layers,
    href: '/learning-japanese/vocabulary'
  },
  {
    title: 'sys.grammar_core',
    desc: 'Hiểu cấu trúc câu qua các ví dụ thực tế. Cấu trúc được bôi đậm điểm ngữ pháp quan trọng, không có lý thuyết rườm rà.',
    icon: Library,
    href: '/learning-japanese/grammar'
  },
  {
    title: 'sys.conversations',
    desc: 'Mô phỏng hội thoại giao tiếp thực tế theo từng chủ đề. Tích hợp âm thanh đọc câu và chế độ luyện phản xạ ẩn Rōmaji.',
    icon: MessageCircle,
    href: '/learning-japanese/conversation'
  },
  {
    title: 'sys.word_map',
    desc: 'Học từ vựng theo cụm (Collocations). Phương pháp hình ảnh giúp não bộ tự động liên kết nhanh các từ để ghép thành câu cơ bản.',
    icon: Network,
    href: '/learning-japanese/word-map'
  },
  {
    title: 'sys.data_parser',
    desc: 'Công cụ nhập liệu thông minh từ sách PDF. Ứng dụng Hybrid AI để bóc tách từ vựng, ngữ pháp tiếng Nhật và lưu vào Data.',
    icon: Sparkles,
    href: '/learning-japanese/creator'
  }
];

export default function ModulesPage() {
  const { t } = useLanguage();

  return (
    <div className="h-full overflow-auto bg-[#09090b] font-mono text-slate-300 p-8 md:p-12 selection:bg-emerald-500/30 custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full">
        
        <div className="mb-12 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <Terminal size={24} />
            <h1 className="text-2xl font-bold uppercase tracking-widest">{t('dash.title')}</h1>
          </div>
          <p className="text-neutral-500 text-sm uppercase">{t('dash.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link 
                key={idx} 
                href={feat.href} 
                className="group border border-neutral-800 bg-black p-6 flex flex-col items-start hover:border-emerald-500 transition-all duration-300 relative overflow-hidden"
              >
                {/* Glitch/Hover effect background */}
                <div className="absolute inset-0 bg-emerald-500/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                
                <div className="relative z-10 w-full flex flex-col h-full">
                  <div className="text-neutral-600 mb-6 group-hover:text-emerald-500 transition-colors">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  
                  <h2 className="text-[1rem] font-bold mb-3 text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-neutral-600 group-hover:text-emerald-500">&gt;</span> {feat.title}
                  </h2>
                  
                  <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors flex-1">
                    {feat.desc}
                  </p>
                  
                  <div className="mt-8 flex items-center text-[10px] font-bold text-neutral-700 uppercase group-hover:text-emerald-500 transition-colors">
                    {t('dash.btn.initiate')}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
      </div>
    </div>
  );
}
