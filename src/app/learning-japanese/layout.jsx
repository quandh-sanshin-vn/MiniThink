"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Terminal, Globe, Sun, Moon } from 'lucide-react';
import { TerminalModalProvider } from '@/components/TerminalModalContext';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/components/ThemeContext';

function NavContent({ pathname }) {
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const isStudyRoom = pathname.includes('/study/');
  
  if (isStudyRoom) return null;

  return (
    <nav className="flex-none flex items-center justify-between px-6 py-4 bg-black border-b border-neutral-800">
      <Link href="/learning-japanese/goals" className="text-emerald-500 text-sm font-bold uppercase flex items-center gap-2 hover:text-emerald-400 transition-colors tracking-widest">
        <Terminal size={18} />
        <span>sys.mervyn_os</span>
      </Link>
      
      <div className="flex items-center gap-8 text-xs uppercase font-bold tracking-wider">
        <div className="flex gap-6">
          <Link href="/learning-japanese/goals" className={`transition-colors ${pathname.includes('/goals') ? 'text-emerald-400 border-b border-emerald-500 pb-1' : 'text-neutral-500 hover:text-emerald-500'}`}>
            [ {t('nav.terminal')} ]
          </Link>
          <Link href="/learning-japanese/vocabulary" className={`transition-colors ${pathname.includes('/vocabulary') ? 'text-emerald-400 border-b border-emerald-500 pb-1' : 'text-neutral-500 hover:text-emerald-500'}`}>
            [ {t('nav.vocab')} ]
          </Link>
          <Link href="/learning-japanese/creator" className={`transition-colors ${pathname.includes('/creator') ? 'text-emerald-400 border-b border-emerald-500 pb-1' : 'text-neutral-500 hover:text-emerald-500'}`}>
            [ {t('nav.parser')} ]
          </Link>
        </div>

        <div className="flex items-center gap-2 border-l border-neutral-800 pl-8">
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

export default function JapaneseLayout({ children }) {
  const pathname = usePathname();

  const isStudyRoom = pathname.includes('/study/');

  return (
    <LanguageProvider>
      <div className="h-screen flex flex-col bg-[#09090b] font-mono text-slate-300">
        <NavContent pathname={pathname} />
        <main className="flex-1 flex flex-col min-h-0">
          <TerminalModalProvider>
            {children}
          </TerminalModalProvider>
        </main>
      </div>
    </LanguageProvider>
  );
}
