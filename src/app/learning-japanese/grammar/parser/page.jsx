"use client";

import React, { useState } from 'react';
import { Terminal, Database, ArrowRight, CornerDownRight } from 'lucide-react';
import Link from 'next/link';

export default function GrammarParserPage() {
  const [formData, setFormData] = useState({
    patternSyntax: '',
    meaning: '',
    nuance: '',
    initialJa: '',
    initialVi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Hàm render cú pháp thành giao diện trực quan
  // Mọi thứ trong dấu ngoặc nhọn {} sẽ được highlight
  const renderLiveSyntax = (text) => {
    if (!text) return <span className="text-neutral-700 italic">No structure defined yet...</span>;
    
    // Tách chuỗi theo regex tìm kiếm nội dung trong dấu {}
    const parts = text.split(/(\{.*?\})/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const content = part.slice(1, -1);
        return (
          <span key={idx} className="inline-block bg-emerald-500 text-black font-bold px-2 py-0.5 mx-1 uppercase text-sm border border-emerald-500">
            {content}
          </span>
        );
      }
      return <span key={idx} className="text-white text-lg">{part}</span>;
    });
  };

  const insertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      patternSyntax: prev.patternSyntax + `{${tag}}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!result.success) throw new Error(result.error);
      
      setSuccessMsg(`Successfully parsed and stored structure: ${formData.patternSyntax}`);
      // Reset form
      setFormData({
        patternSyntax: '',
        meaning: '',
        nuance: '',
        initialJa: '',
        initialVi: ''
      });
    } catch (error) {
      console.error(error);
      alert('Error parsing grammar structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col p-4 md:p-8 selection:bg-emerald-500/30">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 mb-8 gap-4">
        <div>
          <Link href="/learning-japanese" className="text-emerald-500 hover:text-emerald-400 text-xs uppercase mb-2 inline-flex items-center gap-2">
            <CornerDownRight size={14} className="rotate-180" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-emerald-500 tracking-wider flex items-center gap-2 uppercase">
            <Terminal size={24} /> SYS.GRAMMAR_PARSER_V1
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        
        {/* Left Column: Form */}
        <div className="border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col">
          <h2 className="text-emerald-400 font-bold uppercase flex items-center gap-2 border-b border-neutral-800 pb-3 mb-6">
            <Database size={16} /> Input_Stream
          </h2>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
            
            {/* Pattern Syntax */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs text-neutral-400 uppercase font-bold text-emerald-500/80">1. Structure_Pattern</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => insertTag('V-ru')} className="text-[10px] bg-neutral-800 hover:bg-emerald-900/50 text-neutral-400 px-2 py-0.5 uppercase border border-neutral-700">V-ru</button>
                  <button type="button" onClick={() => insertTag('V-ta')} className="text-[10px] bg-neutral-800 hover:bg-emerald-900/50 text-neutral-400 px-2 py-0.5 uppercase border border-neutral-700">V-ta</button>
                  <button type="button" onClick={() => insertTag('N')} className="text-[10px] bg-neutral-800 hover:bg-emerald-900/50 text-neutral-400 px-2 py-0.5 uppercase border border-neutral-700">Noun</button>
                </div>
              </div>
              <input
                type="text"
                required
                value={formData.patternSyntax}
                onChange={e => setFormData({ ...formData, patternSyntax: e.target.value })}
                placeholder="e.g. {V-ru / V-ta} + わけがない"
                className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-3 focus:border-emerald-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-[10px] text-neutral-500 mt-2">Use curly braces <span className="text-emerald-500 font-bold">{"{ }"}</span> to define slots/conditions.</p>
            </div>

            {/* Meaning & Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2 uppercase font-bold text-emerald-500/80">2. Meaning (VI)</label>
                <input
                  type="text"
                  required
                  value={formData.meaning}
                  onChange={e => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="e.g. Không thể nào mà..."
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-3 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-2 uppercase font-bold text-emerald-500/80">3. Nuance/Context</label>
                <input
                  type="text"
                  value={formData.nuance}
                  onChange={e => setFormData({ ...formData, nuance: e.target.value })}
                  placeholder="e.g. Cảm xúc phủ định mạnh mẽ"
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-3 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>

            {/* Initial Example */}
            <div className="border border-amber-500/30 p-4 bg-amber-500/5 mt-4">
              <label className="block text-xs text-amber-500 mb-4 uppercase font-bold flex items-center gap-2">
                4. Mandatory_First_Example
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  value={formData.initialJa}
                  onChange={e => setFormData({ ...formData, initialJa: e.target.value })}
                  placeholder="Japanese sentence using the structure..."
                  className="w-full bg-[#09090b] border border-amber-500/50 text-slate-200 p-3 focus:border-amber-500 focus:outline-none font-mono text-sm"
                />
                <input
                  type="text"
                  required
                  value={formData.initialVi}
                  onChange={e => setFormData({ ...formData, initialVi: e.target.value })}
                  placeholder="Vietnamese meaning..."
                  className="w-full bg-[#09090b] border border-amber-500/50 text-slate-200 p-3 focus:border-amber-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-auto bg-emerald-500/10 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black py-4 uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'ENCODING...' : 'ENCODE_STRUCTURE_TO_DB'} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Column: Live Render Preview */}
        <div className="border border-neutral-800 bg-[#09090b] p-6 flex flex-col relative overflow-hidden">
          {/* Grid Background Effect */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <h2 className="text-neutral-500 font-bold uppercase flex items-center gap-2 border-b border-neutral-800 pb-3 mb-8 relative z-10">
            Live_Preview_Engine
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
            
            <div className="mb-8">
              <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-4">Structure Render</span>
              <div className="py-4 px-8 border-2 border-dashed border-emerald-500/30 bg-black min-w-[300px] flex items-center justify-center min-h-[80px]">
                {renderLiveSyntax(formData.patternSyntax)}
              </div>
            </div>

            <div className="w-full max-w-sm mb-8 space-y-4">
              <div className="border-l-2 border-neutral-700 pl-4 text-left">
                <span className="text-[10px] text-neutral-500 uppercase block mb-1">Meaning</span>
                <p className="text-white font-bold">{formData.meaning || '...'}</p>
              </div>
              
              <div className="border-l-2 border-neutral-700 pl-4 text-left">
                <span className="text-[10px] text-neutral-500 uppercase block mb-1">Context</span>
                <p className="text-neutral-400 text-sm italic">{formData.nuance || '...'}</p>
              </div>
            </div>

            {/* Example Preview */}
            {(formData.initialJa || formData.initialVi) && (
              <div className="w-full bg-neutral-900/50 border border-neutral-800 p-4 text-left animate-in fade-in slide-in-from-bottom-4">
                <span className="text-[10px] text-amber-500 uppercase block mb-2 font-bold tracking-widest border-b border-neutral-800 pb-2">Example_#1</span>
                <p className="text-emerald-300 font-bold mb-1">{formData.initialJa}</p>
                <p className="text-neutral-500 text-sm">{formData.initialVi}</p>
              </div>
            )}
            
          </div>

          {/* Success Message Alert */}
          {successMsg && (
            <div className="absolute bottom-6 left-6 right-6 bg-emerald-500/10 border border-emerald-500 p-3 text-emerald-400 text-xs font-bold uppercase animate-in slide-in-from-bottom-2">
              {successMsg}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
