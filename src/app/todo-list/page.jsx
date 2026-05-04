"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Plus, Settings, RefreshCw, ExternalLink, X, FolderSync } from 'lucide-react';
import ModuleHeader from '@/components/ModuleHeader';
import { useLanguage } from '@/i18n/LanguageContext';

const PRIORITIES = [
  { id: 'P0', label: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'P1', label: 'HIGH', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'P2', label: 'NORMAL', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'P3', label: 'LOW', color: 'text-neutral-500', bg: 'bg-neutral-800', border: 'border-neutral-700' },
];

export default function TodoListPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Modals
  const [showConfig, setShowConfig] = useState(false);
  const [configData, setConfigData] = useState({ domain: '', apiKey: '' });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'P2', projectKey: '', domain: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoaded(false);
    await Promise.all([
      fetchTasksFromDB(),
      fetchWorkspaces(),
      fetchConfig()
    ]);
    setIsLoaded(true);
  };

  const fetchTasksFromDB = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error("Failed to load tasks");
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || {});
      }
    } catch (e) {}
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const conf = await res.json();
        if (conf.domain) {
           setConfigData({ domain: conf.domain, apiKey: conf.apiKey });
        }
      }
    } catch (e) {}
  };

  const syncBacklogTasks = async () => {
    setIsSyncing(true);
    setSyncError('');
    try {
      const res = await fetch('/api/tasks/sync', { method: 'POST' });
      if (res.ok) {
        await fetchTasksFromDB(); // Reload latest
        await fetchWorkspaces();  // Projects might have updated
      } else {
        const err = await res.json();
        setSyncError(err.error || 'Sync failed');
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
        await syncBacklogTasks();
      } else {
        setSyncError('Failed to save config');
        setIsSyncing(false);
      }
    } catch (e) {
      setSyncError('Network Error');
      setIsSyncing(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    // Tạm thời chưa có API push lên Backlog, chỉ đóng modal
    alert("Tính năng tạo task trực tiếp lên Backlog đang được phát triển.");
    setShowCreateModal(false);
  };

  const openCreateModal = () => {
    const defaultDomain = Object.keys(workspaces)[0] || '';
    const defaultProject = workspaces[defaultDomain]?.[0]?.key || '';
    setNewTask({ ...newTask, domain: defaultDomain, projectKey: defaultProject });
    setShowCreateModal(true);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-emerald-500 animate-pulse">BOOTING TERMINAL...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col">
      <ModuleHeader title={t('todo.title')} />
      
      <div className="flex-1 p-4 lg:p-8 flex flex-col">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">
            {t('todo.subtitle')}
          </p>
          <button 
            onClick={openCreateModal}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-2 px-6 hover:bg-emerald-500 hover:text-black transition-colors flex items-center justify-center gap-2 uppercase text-sm font-bold"
          >
            <Plus size={16} /> NEW_TASK
          </button>
        </div>

        {/* WORKSPACE INDICATOR */}
        {Object.keys(workspaces).length > 0 && (
          <div className="mb-4 flex gap-4 text-xs">
             <span className="text-neutral-500 uppercase tracking-widest flex items-center gap-1">
               <FolderSync size={14}/> CONNECTED_WORKSPACES:
             </span>
             {Object.keys(workspaces).map(ws => (
                <span key={ws} className="text-blue-400 border-b border-blue-500/30 pb-0.5">{ws}</span>
             ))}
          </div>
        )}

      {/* BOARD (SINGLE LIST) */}
      <div className="flex-1 overflow-y-auto bg-black border border-neutral-800 p-4 relative">
         <div className="flex justify-between items-center mb-6 sticky top-0 bg-black py-2 z-10 border-b border-neutral-800">
            <h2 className="text-xl font-bold tracking-widest text-slate-300 flex items-center gap-2">
              <Terminal size={20} className="text-emerald-500"/> TASK_QUEUE
              <span className="text-xs bg-neutral-900 text-neutral-500 px-2 py-0.5 font-normal ml-2">{tasks.length}</span>
            </h2>
            <div className="flex gap-4 items-center">
              {isSyncing && <span className="text-xs text-blue-400 animate-pulse uppercase tracking-widest hidden md:inline">[SYNCING_CLOUD...]</span>}
              {syncError && <span className="text-xs text-rose-500 uppercase tracking-widest">[{syncError}]</span>}
              <button 
                onClick={syncBacklogTasks}
                disabled={isSyncing}
                className="text-neutral-500 hover:text-blue-400 transition-colors p-1"
                title="Force Cloud Sync"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin text-blue-400" : ""} />
              </button>
              <button 
                onClick={() => setShowConfig(true)}
                className="text-neutral-500 hover:text-blue-400 transition-colors p-1 flex items-center gap-2"
                title="System Config"
              >
                <Settings size={16} /> <span className="text-xs uppercase hidden sm:inline">SYS_CONFIG</span>
              </button>
            </div>
         </div>

         <div className="flex flex-col gap-3">
            {tasks.map(task => {
              const priority = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[3];
              
              return (
                <div key={task.id} className="border border-blue-500/30 bg-[#061224] p-4 group hover:border-blue-400/60 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  <div className="flex-1 flex flex-col gap-2 w-full">
                     <div className="flex gap-2 items-center flex-wrap">
                        <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 border border-blue-500/30 px-1.5 py-0.5 uppercase hover:bg-blue-500/20 transition-colors flex items-center gap-1 font-bold">
                           {task.id} <ExternalLink size={10} />
                        </a>
                        <span className={`text-[10px] px-1.5 py-0.5 uppercase border ${priority.border} ${priority.color} ${priority.bg} font-bold`}>
                           {priority.id}
                        </span>
                        <span className="text-[10px] text-neutral-500 border border-neutral-800 bg-black px-1.5 py-0.5 uppercase truncate max-w-[120px]" title={task.projectName}>
                           {task.projectName || task.module}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 uppercase border border-neutral-700 ${task.status === 'DONE' ? 'text-emerald-500 border-emerald-500/30' : 'text-neutral-400'}`}>
                           {task.status}
                        </span>
                     </div>
                     <p className={`text-sm ${task.status === 'DONE' ? 'text-neutral-500 line-through' : 'text-blue-100'}`}>
                        {task.title}
                     </p>
                  </div>
                </div>
              );
            })}
            
            {tasks.length === 0 && (
              <div className="text-center flex flex-col items-center justify-center text-neutral-700 text-xs py-16 uppercase tracking-widest border border-dashed border-neutral-800 gap-4">
                <Terminal size={32} className="opacity-20" />
                <p>{t('todo.empty_status') || 'NO TASKS IN QUEUE. SYNC BACKLOG OR CREATE NEW TASK.'}</p>
              </div>
            )}
         </div>
      </div>

      {/* SYS CONFIG MODAL */}
      {showConfig && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#09090b] border border-blue-500 w-full max-w-lg p-6 shadow-2xl flex flex-col gap-6">
               <h2 className="text-xl font-bold text-blue-500 uppercase tracking-widest border-b border-blue-500/30 pb-4 flex justify-between">
                  <span>SYSTEM INTEGRATION CONFIG</span>
                  <button onClick={() => setShowConfig(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
               </h2>
               
               <form onSubmit={saveConfig} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-neutral-500 uppercase">Platform</label>
                     <input type="text" value="BACKLOG" disabled className="w-full bg-neutral-900 border border-neutral-800 p-3 text-sm text-neutral-500 font-mono"/>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-blue-400 uppercase">Domain (ex: sanshinbts.backlog.com)</label>
                     <input type="text" value={configData.domain} onChange={e => setConfigData({...configData, domain: e.target.value})} placeholder="your-space.backlog.com" className="w-full bg-black border border-blue-500/50 p-3 text-sm text-blue-100 focus:outline-none focus:border-blue-500 font-mono" required/>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-blue-400 uppercase">API Key</label>
                     <input type="password" value={configData.apiKey} onChange={e => setConfigData({...configData, apiKey: e.target.value})} placeholder="********************" className="w-full bg-black border border-blue-500/50 p-3 text-sm text-blue-100 focus:outline-none focus:border-blue-500 font-mono" required/>
                  </div>

                  <div className="flex gap-4 mt-4 pt-4 border-t border-neutral-800">
                     <button type="submit" disabled={isSyncing} className="w-full py-3 px-4 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-colors uppercase font-bold text-xs flex justify-center items-center gap-2">
                       {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : 'SAVE & FULL SYNC'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#09090b] border border-emerald-500 w-full max-w-xl p-6 shadow-2xl flex flex-col gap-6">
               <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest border-b border-emerald-500/30 pb-4 flex justify-between">
                  <span>DEPLOY NEW TASK</span>
                  <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
               </h2>
               
               <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] text-emerald-500 uppercase">Task Summary</label>
                     <input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task summary..." className="w-full bg-black border border-emerald-500/50 p-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500 font-mono" autoFocus required/>
                  </div>

                  <div className="flex gap-4">
                     <div className="flex flex-col gap-2 flex-1">
                        <label className="text-[10px] text-neutral-500 uppercase">Target Workspace</label>
                        <select 
                           value={newTask.domain}
                           onChange={e => {
                              const newDomain = e.target.value;
                              const newProject = workspaces[newDomain]?.[0]?.key || '';
                              setNewTask({...newTask, domain: newDomain, projectKey: newProject})
                           }}
                           className="w-full bg-black border border-neutral-700 p-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                           {Object.keys(workspaces).length === 0 && <option value="">No workspace synced</option>}
                           {Object.keys(workspaces).map(ws => (
                              <option key={ws} value={ws}>{ws}</option>
                           ))}
                        </select>
                     </div>

                     <div className="flex flex-col gap-2 flex-1">
                        <label className="text-[10px] text-neutral-500 uppercase">Target Project</label>
                        <select 
                           value={newTask.projectKey}
                           onChange={e => setNewTask({...newTask, projectKey: e.target.value})}
                           className="w-full bg-black border border-neutral-700 p-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                           {(!workspaces[newTask.domain] || workspaces[newTask.domain].length === 0) && <option value="">No projects found</option>}
                           {workspaces[newTask.domain]?.map(p => (
                              <option key={p.key} value={p.key}>[{p.key}] {p.name}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <div className="flex gap-4 mt-4 pt-4 border-t border-neutral-800">
                     <button type="submit" className="w-full py-3 px-4 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors uppercase font-bold text-xs flex justify-center items-center gap-2">
                       <Plus size={14} /> DEPLOY TASK TO CLOUD
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
