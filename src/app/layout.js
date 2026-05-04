import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  title: "MiniThink - sys.mervyn_os",
  description: "Advanced Learning Protocol",
};

import { ThemeProvider } from '@/components/ThemeContext';
import { TimerProvider } from '@/components/TimerContext';
import { LanguageProvider } from '@/i18n/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <LanguageProvider>
            <TimerProvider>
              {children}
            </TimerProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
