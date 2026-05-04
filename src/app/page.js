"use client";

import Link from 'next/link';
import { Terminal, Clock, CheckSquare, ChevronRight } from 'lucide-react';
import ModuleHeader from '@/components/ModuleHeader';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col">
      <ModuleHeader />
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* HEADER */}
        <div className="mb-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-3 border border-emerald-500/30 bg-emerald-500/5 px-6 py-2 mb-6">
            <Terminal className="text-emerald-500" size={24} />
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase">
              {t('home.title')}
            </h1>
          </div>
          <p className="text-neutral-400 text-sm md:text-base uppercase tracking-widest max-w-2xl text-center leading-relaxed">
            {t('home.subtitle')}
            <br className="hidden md:block"/>{t('home.slogan')}
          </p>
        </div>

        {/* MODULES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* MODULE 1 */}
          <Link href="/learning-japanese/goals" className="group flex flex-col border border-neutral-800 bg-black p-6 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold uppercase tracking-widest">
                [MODULE_01]
              </span>
              <Terminal size={20} className="text-neutral-600 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase group-hover:text-emerald-400 transition-colors">
              {t('home.module1')}
            </h2>
            <p className="text-sm text-neutral-500 flex-1 mb-6 leading-relaxed">
              {t('home.module1_desc')}
            </p>
            <div className="flex items-center text-xs text-neutral-600 group-hover:text-emerald-500 uppercase tracking-widest transition-colors mt-auto">
              {t('home.boot')} <ChevronRight size={14} className="ml-1" />
            </div>
          </Link>

          {/* MODULE 2 */}
          <Link href="/timmer" className="group flex flex-col border border-neutral-800 bg-black p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/30 font-bold uppercase tracking-widest">
                [MODULE_02]
              </span>
              <Clock size={20} className="text-neutral-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase group-hover:text-blue-400 transition-colors">
              {t('home.module2')}
            </h2>
            <p className="text-sm text-neutral-500 flex-1 mb-6 leading-relaxed">
              {t('home.module2_desc')}
            </p>
            <div className="flex items-center text-xs text-neutral-600 group-hover:text-blue-500 uppercase tracking-widest transition-colors mt-auto">
              {t('home.boot')} <ChevronRight size={14} className="ml-1" />
            </div>
          </Link>

          {/* MODULE 3 */}
          <Link href="/todo-list" className="group flex flex-col border border-neutral-800 bg-black p-6 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold uppercase tracking-widest">
                [MODULE_03]
              </span>
              <CheckSquare size={20} className="text-neutral-600 group-hover:text-amber-500 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase group-hover:text-amber-400 transition-colors">
              {t('home.module3')}
            </h2>
            <p className="text-sm text-neutral-500 flex-1 mb-6 leading-relaxed">
              {t('home.module3_desc')}
            </p>
            <div className="flex items-center text-xs text-neutral-600 group-hover:text-amber-500 uppercase tracking-widest transition-colors mt-auto">
              {t('home.boot')} <ChevronRight size={14} className="ml-1" />
            </div>
          </Link>

        </div>
        
        {/* FOOTER */}
        <div className="mt-16 text-center text-[10px] text-neutral-600 border-t border-neutral-800 pt-6 w-full uppercase tracking-widest">
          SYSTEM_VERSION: 1.0.0 // STATUS: ONLINE // AUTHOR: HARRY MERVYN
        </div>
      </div>

      </div>
    </div>
  );
}
