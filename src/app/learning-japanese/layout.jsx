"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TerminalModalProvider } from '@/components/TerminalModalContext';
import { useLanguage } from '@/i18n/LanguageContext';
import ModuleHeader from '@/components/ModuleHeader';

export default function JapaneseLayout({ children }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isStudyRoom = pathname.includes('/study/');

  return (
    <div className="h-screen flex flex-col bg-[#09090b] font-mono text-slate-300">
      {!isStudyRoom && (
        <ModuleHeader title="MODULE_JAPANESE">
          <Link href="/learning-japanese/goals" className={`transition-colors ${pathname.includes('/goals') ? 'text-emerald-400 border-b border-emerald-500 pb-1' : 'text-neutral-500 hover:text-emerald-500'}`}>
            [ {t('nav.terminal')} ]
          </Link>
          <Link href="/learning-japanese/vocabulary" className={`transition-colors ${pathname.includes('/vocabulary') ? 'text-emerald-400 border-b border-emerald-500 pb-1' : 'text-neutral-500 hover:text-emerald-500'}`}>
            [ {t('nav.vocab')} ]
          </Link>
          <Link href="/learning-japanese/creator" className={`transition-colors ${pathname.includes('/creator') ? 'text-emerald-400 border-b border-emerald-500 pb-1' : 'text-neutral-500 hover:text-emerald-500'}`}>
            [ {t('nav.parser')} ]
          </Link>
        </ModuleHeader>
      )}
      <main className="flex-1 flex flex-col min-h-0">
        <TerminalModalProvider>
          {children}
        </TerminalModalProvider>
      </main>
    </div>
  );
}
