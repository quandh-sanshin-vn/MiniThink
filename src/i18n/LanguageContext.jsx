"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries } from './dictionaries';

const LanguageContext = createContext(null);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('vi'); // Default language

  // Load saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mervyn_os_lang');
    if (saved && dictionaries[saved]) {
      setLang(saved);
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (dictionaries[newLang]) {
      setLang(newLang);
      localStorage.setItem('mervyn_os_lang', newLang);
    }
  };

  // Translation function
  const t = (key) => {
    return dictionaries[lang][key] || dictionaries['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
