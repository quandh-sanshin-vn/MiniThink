"use client";

import Link from 'next/link';
import { Terminal, Globe, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/components/ThemeContext';

export default function ModuleHeader({ children, title }) {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex-none flex items-center justify-between px-6 py-4 bg-black border-b border-neutral-800 font-mono">
      <Link href="/" className="text-emerald-500 text-sm font-bold uppercase flex items-center gap-2 hover:text-emerald-400 transition-colors tracking-widest">
        <Terminal size={18} />
        <span>sys.mervyn_os</span>
      </Link>
      
      <div className="flex items-center gap-8 text-xs uppercase font-bold tracking-wider">
        {/* Module Specific Nav / Content */}
        {children && (
          <div className="flex items-center gap-6">
            {children}
          </div>
        )}

        {/* Global Controls */}
        <div className="flex items-center gap-2 border-l border-neutral-800 pl-8">
          {/* Module Title if provided */}
          {title && (
            <div className="mr-6 text-emerald-500 flex items-center gap-2">
              <span className="text-neutral-500">[</span>
              {title}
              <span className="text-neutral-500">]</span>
            </div>
          )}

          <Globe size={14} className="text-neutral-500" />
          <button onClick={() => setLang('vi')} className={`transition-colors ${lang === 'vi' ? 'text-emerald-500' : 'text-neutral-600 hover:text-emerald-400'}`}>VI</button>
          <span className="text-neutral-800">|</span>
          <button onClick={() => setLang('en')} className={`transition-colors ${lang === 'en' ? 'text-emerald-500' : 'text-neutral-600 hover:text-emerald-400'}`}>EN</button>
          <span className="text-neutral-800">|</span>
          <button onClick={() => setLang('ja')} className={`transition-colors ${lang === 'ja' ? 'text-emerald-500' : 'text-neutral-600 hover:text-emerald-400'}`}>JA</button>
          
          <div className="border-l border-neutral-800 pl-4 ml-2 flex items-center">
            <button onClick={toggleTheme} className="text-neutral-500 hover:text-amber-400 transition-colors" title="Toggle Theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
