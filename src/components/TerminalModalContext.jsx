"use client";
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Terminal, AlertTriangle, Info, XSquare } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const ModalContext = createContext(null);

export const useTerminalModal = () => useContext(ModalContext);

export const TerminalModalProvider = ({ children }) => {
  const { t } = useLanguage();
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'ALERT', // 'ALERT', 'CONFIRM', 'PROMPT'
    title: '',
    message: '',
    placeholder: '',
    resolve: null
  });
  
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (modalState.isOpen && modalState.type === 'PROMPT' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [modalState.isOpen, modalState.type]);

  const showAlert = (message, title = 'SYSTEM_ALERT') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'ALERT',
        title,
        message,
        resolve
      });
    });
  };

  const showConfirm = (message, title = 'USER_CONFIRMATION') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'CONFIRM',
        title,
        message,
        resolve
      });
    });
  };

  const showPrompt = (message, title = 'AWAITING_INPUT', placeholder = '') => {
    return new Promise((resolve) => {
      setInputValue('');
      setModalState({
        isOpen: true,
        type: 'PROMPT',
        title,
        message,
        placeholder,
        resolve
      });
    });
  };

  const handleClose = (value = null) => {
    if (modalState.resolve) {
      modalState.resolve(value);
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmitPrompt = () => {
    handleClose(inputValue);
  };

  // Keyboard support for ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalState.isOpen && e.key === 'Escape') {
        handleClose(modalState.type === 'CONFIRM' ? false : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen, modalState.type]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm font-mono selection:bg-emerald-500/30 p-4">
          <div className="bg-[#09090b] border border-emerald-500 w-full max-w-lg p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-5">
              <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-sm">
                {modalState.type === 'ALERT' ? <Info size={16} /> : modalState.type === 'CONFIRM' ? <AlertTriangle size={16} /> : <Terminal size={16} />}
                {modalState.title}
              </div>
              <button 
                onClick={() => handleClose(modalState.type === 'CONFIRM' ? false : null)} 
                className="text-neutral-500 hover:text-rose-500 transition-colors"
              >
                <XSquare size={18} />
              </button>
            </div>
            
            {/* Body */}
            <div className="text-slate-300 text-[15px] mb-8 leading-relaxed whitespace-pre-wrap">
              {modalState.message}
            </div>
            
            {/* Input for Prompt */}
            {modalState.type === 'PROMPT' && (
              <div className="mb-8">
                <div className="flex items-center text-emerald-500 bg-emerald-950/20 border border-emerald-900/50 p-3">
                  <span className="mr-3 font-bold">&gt;</span>
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitPrompt()}
                    placeholder={modalState.placeholder}
                    className="w-full bg-transparent outline-none text-emerald-400 placeholder:text-emerald-900 font-mono"
                  />
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-3 text-xs font-bold uppercase tracking-wider">
              {modalState.type === 'ALERT' && (
                <button 
                  onClick={() => handleClose(true)}
                  className="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                >
                  {t('modal.ack')}
                </button>
              )}
              
              {modalState.type === 'CONFIRM' && (
                <>
                  <button 
                    onClick={() => handleClose(false)}
                    className="px-6 py-2.5 text-neutral-500 border border-neutral-800 hover:border-neutral-500 hover:text-white transition-all"
                  >
                    {t('modal.abort')}
                  </button>
                  <button 
                    onClick={() => handleClose(true)}
                    className="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    {t('modal.execute')}
                  </button>
                </>
              )}
              
              {modalState.type === 'PROMPT' && (
                <>
                  <button 
                    onClick={() => handleClose(null)}
                    className="px-6 py-2.5 text-neutral-500 border border-neutral-800 hover:border-neutral-500 hover:text-white transition-all"
                  >
                    {t('modal.abort')}
                  </button>
                  <button 
                    onClick={handleSubmitPrompt}
                    className="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    {t('modal.submit')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
