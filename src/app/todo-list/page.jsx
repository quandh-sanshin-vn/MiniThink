"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Plus, ArrowRight, Check, Trash2, Edit3, MoveRight, MoveLeft } from 'lucide-react';
import Link from 'next/link';
import ModuleHeader from '@/components/ModuleHeader';
import { useLanguage } from '@/i18n/LanguageContext';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = [
  { id: 'P0', label: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'P1', label: 'HIGH', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'P2', label: 'NORMAL', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'P3', label: 'LOW', color: 'text-neutral-500', bg: 'bg-neutral-800', border: 'border-neutral-700' },
];

const MODULES = ['CORE', 'UI', 'SRS', 'TIMER', 'TODO', 'OTHER'];

export default function TodoListPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'P2', module: 'CORE' });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('minithink_dev_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('minithink_dev_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task = {
      id: crypto.randomUUID(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      module: newTask.module,
      status: 'TODO',
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, task]);
    setNewTask({ ...newTask, title: '' }); // keep last selected priority/module
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const moveTask = (id, direction) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const currentIndex = STATUSES.indexOf(t.status);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < STATUSES.length) {
          return { ...t, status: STATUSES[newIndex] };
        }
      }
      return t;
    }));
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-emerald-500 animate-pulse">BOOTING TERMINAL...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col">
      <ModuleHeader title={t('todo.title')} />
      
      <div className="flex-1 p-4 lg:p-8 flex flex-col">
        <div className="mb-8">
          <p className="text-xs text-neutral-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">{t('todo.subtitle')}</p>
        </div>

      {/* ADD TASK FORM */}
      <div className="mb-8 bg-black border border-neutral-800 p-4">
        <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full flex flex-col gap-2">
            <label className="text-[10px] text-neutral-500 uppercase">{t('todo.task_title')}</label>
            <input 
              type="text" 
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              placeholder={t('todo.placeholder')}
              className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500/50 font-mono placeholder:text-neutral-700"
              autoFocus
            />
          </div>
          <div className="w-full md:w-auto flex gap-4">
            <div className="flex flex-col gap-2 w-1/2 md:w-auto">
              <label className="text-[10px] text-neutral-500 uppercase">{t('todo.module')}</label>
              <select 
                value={newTask.module}
                onChange={e => setNewTask({...newTask, module: e.target.value})}
                className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono uppercase"
              >
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 w-1/2 md:w-auto">
              <label className="text-[10px] text-neutral-500 uppercase">{t('todo.priority')}</label>
              <select 
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono uppercase"
              >
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.id}_{p.label}</option>)}
              </select>
            </div>
          </div>
          <button 
            type="submit"
            disabled={!newTask.title.trim()}
            className="w-full md:w-auto bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-2 px-6 hover:bg-emerald-500 hover:text-black transition-colors flex items-center justify-center gap-2 uppercase text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
          >
            <Plus size={16} /> {t('todo.add_btn')}
          </button>
        </form>
      </div>

      {/* BOARD */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {STATUSES.map(status => (
          <div key={status} className="flex flex-col h-full bg-black border border-neutral-800">
            <div className={`p-3 border-b border-neutral-800 font-bold text-sm tracking-widest flex justify-between items-center ${status === 'DONE' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <span>// {status}</span>
              <span className="text-xs bg-neutral-900 px-2 py-0.5">{tasks.filter(t => t.status === status).length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
              {tasks.filter(t => t.status === status).sort((a, b) => a.priority.localeCompare(b.priority)).map(task => {
                const priority = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[3];
                
                return (
                  <div key={task.id} className="border border-neutral-800 bg-[#0c0c0e] p-3 group hover:border-neutral-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 uppercase border ${priority.border} ${priority.color} ${priority.bg}`}>
                        {priority.id}
                      </span>
                      <span className="text-[10px] text-neutral-500 border border-neutral-800 px-1 uppercase">
                        {task.module}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-4 ${status === 'DONE' ? 'text-neutral-500 line-through' : 'text-slate-300'}`}>
                      {task.title}
                    </p>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-800/50 opacity-20 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-neutral-500 hover:text-rose-500 transition-colors p-1"
                        title="Destroy Task"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="flex gap-2">
                        {status !== 'TODO' && (
                          <button 
                            onClick={() => moveTask(task.id, -1)}
                            className="text-neutral-500 hover:text-emerald-400 transition-colors p-1"
                          >
                            <MoveLeft size={14} />
                          </button>
                        )}
                        {status !== 'DONE' && (
                          <button 
                            onClick={() => moveTask(task.id, 1)}
                            className="text-neutral-500 hover:text-emerald-400 transition-colors p-1"
                          >
                            <MoveRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="text-center text-neutral-700 text-xs py-8 uppercase tracking-widest border border-dashed border-neutral-800">
                  {t('todo.empty_status')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      </div>
    </div>
  );
}
