"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Plus, Trash2, Settings, RefreshCw, ExternalLink } from 'lucide-react';
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
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'P2', module: 'CORE' });
  const [showConfig, setShowConfig] = useState(false);
  const [configData, setConfigData] = useState({ domain: '', apiKey: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Load from local storage and DB config
  useEffect(() => {
    const saved = localStorage.getItem('minithink_dev_tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) {}
    }
    
    // Fetch config and tasks
    fetchConfigAndTasks();
    setIsLoaded(true);
  }, []);

  const fetchConfigAndTasks = async () => {
    setIsSyncing(true);
    setSyncError('');
    try {
      // Get Config
      const confRes = await fetch('/api/config');
      if (confRes.ok) {
        const conf = await confRes.json();
        if (conf.domain) {
           setConfigData({ domain: conf.domain, apiKey: conf.apiKey });
        }
      }
      
      // Get Tasks
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (data.tasks) {
          setBacklogTasks(data.tasks);
        }
      } else {
        const err = await res.json();
        if (res.status !== 400) setSyncError(err.error || 'Sync failed'); // Ignore 400 not configured
      }
    } catch (e) {
      setSyncError('Network Error');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      if (res.ok) {
        setShowConfig(false);
        fetchConfigAndTasks();
      } else {
        setSyncError('Failed to save config');
      }
    } catch (e) {
      setSyncError('Network Error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save local tasks
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
      createdAt: new Date().toISOString(),
      source: 'LOCAL'
    };

    setTasks([...tasks, task]);
    setNewTask({ ...newTask, title: '' });
  };

  const deleteLocalTask = (id) => {
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
      <div className="flex-1 overflow-y-auto bg-black border border-neutral-800 p-4">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-widest text-slate-300 flex items-center gap-2">
              <Terminal size={20} className="text-emerald-500"/> TASK_QUEUE
            </h2>
            <div className="flex gap-4 items-center">
              {isSyncing && <span className="text-xs text-blue-400 animate-pulse uppercase tracking-widest">[SYNCING...]</span>}
              {syncError && <span className="text-xs text-rose-500 uppercase tracking-widest">[{syncError}]</span>}
              <button 
                onClick={fetchConfigAndTasks}
                disabled={isSyncing}
                className="text-neutral-500 hover:text-emerald-500 transition-colors p-1"
                title="Sync Backlog"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              </button>
              <button 
                onClick={() => setShowConfig(true)}
                className="text-neutral-500 hover:text-emerald-500 transition-colors p-1 flex items-center gap-2"
                title="System Config"
              >
                <Settings size={16} /> <span className="text-xs uppercase hidden sm:inline">SYS_CONFIG</span>
              </button>
            </div>
         </div>

         <div className="flex flex-col gap-3">
            {[...backlogTasks, ...tasks]
               .sort((a, b) => a.priority.localeCompare(b.priority))
               .map(task => {
              const priority = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[3];
              const isBacklog = task.source === 'BACKLOG';
              
              return (
                <div key={task.id} className={`border ${isBacklog ? 'border-blue-500/30 bg-[#061224]' : 'border-neutral-800 bg-[#0c0c0e]'} p-4 group hover:border-neutral-600 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                  
                  <div className="flex-1 flex flex-col gap-2 w-full">
                     <div className="flex gap-2 items-center flex-wrap">
                        {isBacklog && (
                           <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 border border-blue-500/30 px-1.5 py-0.5 uppercase hover:bg-blue-500/20 transition-colors flex items-center gap-1 font-bold">
                              {task.id} <ExternalLink size={10} />
                           </a>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 uppercase border ${priority.border} ${priority.color} ${priority.bg} font-bold`}>
                           {priority.id}
                        </span>
                        <span className="text-[10px] text-neutral-500 border border-neutral-800 px-1.5 py-0.5 uppercase">
                           {task.module}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 uppercase border border-neutral-700 ${task.status === 'DONE' ? 'text-emerald-500 border-emerald-500/30' : 'text-neutral-400'}`}>
                           {task.status}
                        </span>
                     </div>
                     <p className={`text-sm ${task.status === 'DONE' ? 'text-neutral-500 line-through' : (isBacklog ? 'text-blue-100' : 'text-slate-300')}`}>
                        {task.title}
                     </p>
                  </div>
                  
                  {!isBacklog && (
                     <button 
                       onClick={() => deleteLocalTask(task.id)}
                       className="text-neutral-500 hover:text-rose-500 transition-colors p-2 md:opacity-0 md:group-hover:opacity-100 shrink-0 border border-transparent hover:border-rose-500/30"
                       title="Destroy Task"
                     >
                       <Trash2 size={16} />
                     </button>
                  )}
                </div>
              );
            })}
            
            {tasks.length === 0 && backlogTasks.length === 0 && (
              <div className="text-center text-neutral-700 text-xs py-12 uppercase tracking-widest border border-dashed border-neutral-800">
                {t('todo.empty_status') || 'NO TASKS IN QUEUE'}
              </div>
            )}
         </div>
      </div>

      {/* SYS CONFIG MODAL */}
      {showConfig && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#09090b] border border-blue-500 w-full max-w-lg p-6 shadow-2xl flex flex-col gap-6">
               <h2 className="text-xl font-bold text-blue-500 uppercase tracking-widest border-b border-blue-500/30 pb-4">
                  SYSTEM INTEGRATION CONFIG
               </h2>
               
               <form onSubmit={saveConfig} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-neutral-500 uppercase">Platform</label>
                     <input 
                       type="text" 
                       value="BACKLOG"
                       disabled
                       className="w-full bg-neutral-900 border border-neutral-800 p-3 text-sm text-neutral-500 font-mono"
                     />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-blue-400 uppercase">Domain (ex: sanshinbts.backlog.com)</label>
                     <input 
                       type="text" 
                       value={configData.domain}
                       onChange={e => setConfigData({...configData, domain: e.target.value})}
                       placeholder="your-space.backlog.com"
                       className="w-full bg-black border border-blue-500/50 p-3 text-sm text-blue-100 focus:outline-none focus:border-blue-500 font-mono"
                       required
                     />
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-blue-400 uppercase">API Key</label>
                     <input 
                       type="password" 
                       value={configData.apiKey}
                       onChange={e => setConfigData({...configData, apiKey: e.target.value})}
                       placeholder="********************"
                       className="w-full bg-black border border-blue-500/50 p-3 text-sm text-blue-100 focus:outline-none focus:border-blue-500 font-mono"
                       required
                     />
                     <p className="text-[10px] text-neutral-500">Go to Personal Settings {'>'} API to generate a new key.</p>
                  </div>

                  <div className="flex gap-4 mt-4 pt-4 border-t border-neutral-800">
                     <button 
                       type="button"
                       onClick={() => setShowConfig(false)}
                       className="flex-1 py-3 px-4 border border-neutral-700 text-neutral-400 hover:text-white transition-colors uppercase font-bold text-xs"
                     >
                       CANCEL
                     </button>
                     <button 
                       type="submit"
                       disabled={isSyncing}
                       className="flex-1 py-3 px-4 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-colors uppercase font-bold text-xs flex justify-center items-center gap-2"
                     >
                       {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : 'SAVE & SYNC'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      </div>
    </div>
  );
}
