"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Plus, Settings, RefreshCw, ExternalLink, X, FolderSync, ChevronDown } from 'lucide-react';
import ModuleHeader from '@/components/ModuleHeader';
import { useLanguage } from '@/i18n/LanguageContext';

const PRIORITIES = [
  { id: 'P0', label: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'P1', label: 'HIGH', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'P2', label: 'NORMAL', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'P3', label: 'LOW', color: 'text-neutral-500', bg: 'bg-neutral-800', border: 'border-neutral-700' },
];

const SelectDropdown = ({ value, options, onChange, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-neutral-900 border-neutral-800 p-2 px-3 text-xs text-slate-300 hover:border-blue-500 font-mono w-full flex justify-between items-center uppercase transition-colors"
      >
        <span className="truncate pr-2">{selected?.label || placeholder}</span>
        <ChevronDown size={14} className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[#09090b] border-blue-500/50 shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map(opt => (
              <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[11px] uppercase font-mono hover:bg-blue-500/20 transition-colors flex items-center ${value === opt.value ? 'text-blue-400 font-bold bg-blue-500/10 border-l-2 border-blue-500' : 'text-neutral-400 border-l-2 border-transparent'}`}
            >
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskItem = ({ task, depth = 0, onQaClick, currentUserName }) => {
  const priority = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[3];
  const isMyTask = currentUserName && task.assigneeName === currentUserName;
  
  return (
    <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 border-l-2 border-neutral-800 pl-4 mt-2' : ''}`}>
      <div className={`
        relative overflow-hidden cursor-pointer
        border ${depth > 0 ? 'border-neutral-800/50 bg-[#061224]/30' : (isMyTask ? 'border-emerald-500/50 bg-[#061224]' : 'border-blue-500/30 bg-[#061224]')}
        p-4 group hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] 
        transition-all duration-300 transform hover:-translate-y-0.5
        flex flex-col md:flex-row justify-between items-start md:items-center gap-4
        bg-[#061224] ${isMyTask ? 'hover:border-emerald-400' : 'hover:border-blue-400'}
      `}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-blue-500/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>

        <div className="relative z-10 flex-1 flex flex-col gap-2 w-full">
          <div className="flex gap-2 items-center flex-wrap">
            <a href={task.url} target="_blank" rel="noopener noreferrer" 
               className="text-[10px] text-blue-500 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 uppercase hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-1 font-bold">
              {task.id} <ExternalLink size={10} />
            </a>
            <span className={`text-[10px] px-1.5 py-0.5 uppercase border ${priority.border} ${priority.color} ${priority.bg} font-bold`}>
              {priority.id}
            </span>
            <span className="text-[10px] text-neutral-600 text-neutral-500 border border-neutral-300 border-neutral-800 bg-neutral-100 bg-black px-1.5 py-0.5 uppercase truncate max-w-[120px]" title={task.projectName}>
              {task.projectName || task.module}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 uppercase border border-neutral-300 border-neutral-700 ${task.status === 'DONE' ? 'text-emerald-600 text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-neutral-500 text-neutral-400'}`}>
              {task.statusText || task.status}
            </span>
            {task.issueType && (
              <span className="text-[10px] text-purple-600 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 uppercase">
                {task.issueType}
              </span>
            )}
          </div>
          <p className={`text-sm transition-colors ${task.status === 'DONE' ? 'text-neutral-400 text-neutral-500 line-through' : 'text-slate-800 text-blue-100 group-hover:text-blue-600 group-hover:text-blue-300'}`}>
            {task.title}
          </p>
        </div>
        
        {task.assigneeName && (
           <div className={`relative z-10 text-[10px] flex items-center gap-1 uppercase border px-2 py-1 ${isMyTask ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 font-bold' : 'text-neutral-500 border-neutral-200 border-neutral-800 bg-neutral-50 bg-neutral-900/50'}`}>
             <span className={`w-1.5 h-1.5 rounded-full ${isMyTask ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`}></span>
             {task.assigneeName}
           </div>
        )}
        <button 
           onClick={(e) => { e.stopPropagation(); onQaClick(task); }}
           className="relative z-10 text-[10px] uppercase font-bold border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors px-2 py-1 flex items-center gap-1"
        >
           + QA
        </button>
      </div>
      
      {/* Đệ quy render các task con */}
      {task.children && task.children.length > 0 && (
        <div className="flex flex-col gap-2">
           {task.children.map(child => (
             <TaskItem key={child.id} task={child} depth={depth + 1} onQaClick={onQaClick} currentUserName={currentUserName} />
           ))}
        </div>
      )}
    </div>
  );
};

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

  const [showQaModal, setShowQaModal] = useState(false);
  const [qaTaskInfo, setQaTaskInfo] = useState(null);
  const [qaForm, setQaForm] = useState({ featureName: '', shortDesc: '', assigneeId: '' });
  const [qaMembers, setQaMembers] = useState([]);
  const [isCreatingQa, setIsCreatingQa] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState('');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

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
        const w = data.workspaces || {};
        setWorkspaces(w);
        const domains = Object.keys(w);
        if (domains.length > 0) {
          setActiveWorkspace(domains[0]);
        }
      }
    } catch (e) { }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const conf = await res.json();
        if (conf.domain) {
          setConfigData({ domain: conf.domain, apiKey: conf.apiKey });
        }
        if (conf.currentUserName) {
          setCurrentUserName(conf.currentUserName);
        }
      }
    } catch (e) { }
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

  const handleOpenQaModal = async (task) => {
    let targetTask = task;
    if (task.parentIssueId) {
      const parentTask = tasks.find(t => t.externalId === task.parentIssueId);
      if (parentTask) {
        targetTask = parentTask;
      }
    }
    
    setQaTaskInfo(targetTask);
    setQaForm({ featureName: targetTask.title, shortDesc: '', assigneeId: '' });
    setShowQaModal(true);
    setQaMembers([]);
    
    try {
      const res = await fetch(`/api/projects/members?domain=${task.domain}&projectKey=${task.module}`);
      if (res.ok) {
        const data = await res.json();
        setQaMembers(data.members || []);
        if (data.currentUser && data.currentUser.id) {
           setQaForm(prev => ({ ...prev, assigneeId: data.currentUser.id.toString() }));
        }
      }
    } catch (error) {
      console.error('Failed to load members', error);
    }
  };

  const handleCreateQaSubmit = async (e) => {
    e.preventDefault();
    if (!qaForm.featureName || !qaForm.shortDesc) return;
    
    setIsCreatingQa(true);
    try {
      const res = await fetch('/api/tasks/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentIssueExternalId: qaTaskInfo.externalId,
          parentIssueKey: qaTaskInfo.id,
          projectKey: qaTaskInfo.module,
          domain: qaTaskInfo.domain,
          featureName: qaForm.featureName,
          shortDesc: qaForm.shortDesc,
          assigneeId: qaForm.assigneeId
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.open(data.url, '_blank');
        setShowQaModal(false);
      } else {
        alert("Lỗi: " + (data.error || "Không thể tạo QA task"));
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setIsCreatingQa(false);
    }
  };

  const allProjectsList = activeWorkspace ? (workspaces[activeWorkspace] || []) : [];

  // Lọc task
  const filteredTasks = tasks.filter(task => {
    const matchesWorkspace = !activeWorkspace || task.domain === activeWorkspace;
    const matchesSearch = searchQuery === '' || 
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = filterProject === 'ALL' || task.module === filterProject;
    const taskCurrentStatus = task.statusText || task.status;
    const matchesStatus = filterStatus === 'ALL' || taskCurrentStatus === filterStatus;

    return matchesWorkspace && matchesSearch && matchesProject && matchesStatus;
  });

  // Build tree from filtered tasks
  const buildTree = (taskList) => {
    const map = {};
    const roots = [];
    taskList.forEach(t => map[t.externalId] = { ...t, children: [] });
    
    taskList.forEach(t => {
      // Nếu task có parent và parent cũng nằm trong danh sách đang được render
      if (t.parentIssueId && map[t.parentIssueId]) {
        map[t.parentIssueId].children.push(map[t.externalId]);
      } else {
        roots.push(map[t.externalId]);
      }
    });
    return roots;
  };

  const taskTree = buildTree(filteredTasks);


  if (!isLoaded) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-emerald-500 animate-pulse">BOOTING TERMINAL...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 font-mono flex flex-col">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-black border-b border-neutral-800 pr-4">
         <ModuleHeader title={t('todo.title')} />
         
         {/* WORKSPACE INDICATOR IN HEADER */}
         {Object.keys(workspaces).length > 0 && (
           <div className="flex gap-4 text-xs pb-4 md:pb-0 px-4 md:px-0">
             <span className="text-neutral-500 uppercase tracking-widest flex items-center gap-1 hidden md:flex">
               <FolderSync size={14} /> {t('todo.connected')}
             </span>
             {Object.keys(workspaces).map(ws => (
               <button 
                  key={ws} 
                  onClick={() => { setActiveWorkspace(ws); setFilterProject('ALL'); }}
                  className={`transition-colors pb-0.5 border-b ${activeWorkspace === ws ? 'text-blue-400 border-blue-500' : 'text-neutral-500 border-transparent hover:text-blue-300'}`}
               >
                  {ws}
               </button>
             ))}
           </div>
         )}
      </div>

      <div className="flex-1 p-4 lg:p-8 flex flex-col">
        {/* ACTION BAR */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-black border border-neutral-800 p-4">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <input 
              type="text"
              placeholder={t('todo.search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 p-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono w-full sm:w-48 placeholder:text-neutral-600"
            />
            
            <SelectDropdown 
              className="w-full sm:w-48"
              value={filterProject}
              onChange={setFilterProject}
              options={[
                { value: 'ALL', label: t('todo.all_projects') },
                ...allProjectsList.map(p => ({ value: p.key, label: `[${p.key}] ${p.name}` }))
              ]}
            />

            <SelectDropdown 
              className="w-full sm:w-48"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'ALL', label: t('todo.all_statuses') },
                ...(() => {
                  let availableStatuses = [];
                  if (filterProject === 'ALL') {
                    const allProjStatuses = allProjectsList.flatMap(p => p.statuses || []);
                    availableStatuses = [...new Set(allProjStatuses.map(s => s.name))];
                  } else {
                    const selectedProj = allProjectsList.find(p => p.key === filterProject);
                    if (selectedProj) {
                      availableStatuses = (selectedProj.statuses || []).map(s => s.name);
                    }
                  }
                  if (availableStatuses.length === 0) {
                    availableStatuses = [...new Set(tasks.map(t => t.statusText || t.status))].filter(Boolean);
                  }
                  return availableStatuses.map(s => ({ value: s, label: s }));
                })()
              ]}
            />
          </div>

          <button
            onClick={openCreateModal}
            className="w-full lg:w-auto bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-2 px-6 hover:bg-emerald-500 hover:text-black transition-colors flex items-center justify-center gap-2 uppercase text-sm font-bold shrink-0"
          >
            <Plus size={16} /> {t('todo.new_task')}
          </button>
        </div>

        {/* BOARD (SINGLE LIST) */}
        <div className="flex-1 overflow-y-auto bg-black border border-neutral-800 p-4 relative">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-black py-2 z-20 border-b border-neutral-800">
            <h2 className="text-xl font-bold tracking-widest text-slate-300 flex items-center gap-2">
              <Terminal size={20} className="text-emerald-500" /> {t('todo.queue')}
              <span className="text-xs bg-neutral-900 text-neutral-500 px-2 py-0.5 font-normal ml-2">{filteredTasks.length}</span>
            </h2>
            <div className="flex gap-4 items-center">
              {isSyncing && <span className="text-xs text-blue-500 animate-pulse uppercase tracking-widest hidden md:inline">{t('todo.syncing')}</span>}
              {syncError && <span className="text-xs text-rose-500 uppercase tracking-widest">[{syncError}]</span>}
              <button
                onClick={syncBacklogTasks}
                disabled={isSyncing}
                className="text-neutral-400 hover:text-blue-500 transition-colors p-1"
                title="Force Cloud Sync"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin text-blue-500" : ""} />
              </button>
              <button
                onClick={() => setShowConfig(true)}
                className="text-neutral-400 hover:text-blue-500 transition-colors p-1 flex items-center gap-2"
                title="System Config"
              >
                <Settings size={16} /> <span className="text-xs uppercase hidden sm:inline">{t('todo.sys_config')}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {taskTree.map(task => (
              <TaskItem key={task.id} task={task} onQaClick={handleOpenQaModal} currentUserName={currentUserName} />
            ))}

            {taskTree.length === 0 && (
              <div className="text-center flex flex-col items-center justify-center text-neutral-400 text-xs py-16 uppercase tracking-widest border border-dashed border-neutral-800 gap-4">
                <Terminal size={32} className="opacity-20" />
                <p>{t('todo.empty_status') || 'NO TASKS IN QUEUE. SYNC BACKLOG OR CREATE NEW TASK.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* SYS CONFIG MODAL */}
        {showConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-[#09090b] border border-blue-500 w-full max-w-lg p-6 shadow-2xl flex flex-col gap-6">
              <h2 className="text-xl font-bold text-blue-500 uppercase tracking-widest border-b border-blue-500/30 pb-4 flex justify-between">
                <span>SYSTEM INTEGRATION CONFIG</span>
                <button onClick={() => setShowConfig(false)} className="text-neutral-500 hover:text-blue-500"><X size={20} /></button>
              </h2>

              <form onSubmit={saveConfig} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-neutral-500 uppercase">Platform</label>
                  <input type="text" value="BACKLOG" disabled className="w-full bg-neutral-900 border border-neutral-800 p-3 text-sm text-neutral-500 font-mono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-blue-500 uppercase">Domain (ex: sanshinbts.backlog.com)</label>
                  <input type="text" value={configData.domain} onChange={e => setConfigData({ ...configData, domain: e.target.value })} placeholder="your-space.backlog.com" className="w-full bg-black border border-blue-500/50 p-3 text-sm text-blue-100 text-slate-800 focus:outline-none focus:border-blue-500 font-mono" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-blue-500 uppercase">API Key</label>
                  <input type="password" value={configData.apiKey} onChange={e => setConfigData({ ...configData, apiKey: e.target.value })} placeholder="********************" className="w-full bg-black border border-blue-500/50 p-3 text-sm text-blue-100 text-slate-800 focus:outline-none focus:border-blue-500 font-mono" required />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-[#09090b] border border-emerald-500 w-full max-w-xl p-6 shadow-2xl flex flex-col gap-6">
              <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest border-b border-emerald-500/30 pb-4 flex justify-between">
                <span>{t('todo.deploy_task')}</span>
                <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-emerald-500"><X size={20} /></button>
              </h2>

              <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-emerald-500 uppercase">{t('todo.task_title')}</label>
                  <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder={t('todo.task_summary')} className="w-full bg-black border border-emerald-500/50 p-3 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500 font-mono" autoFocus required />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[10px] text-neutral-500 uppercase">{t('todo.target_ws')}</label>
                    <SelectDropdown 
                      value={newTask.domain}
                      onChange={(newDomain) => {
                        const newProject = workspaces[newDomain]?.[0]?.key || '';
                        setNewTask({ ...newTask, domain: newDomain, projectKey: newProject })
                      }}
                      options={Object.keys(workspaces).map(ws => ({ value: ws, label: ws }))}
                    />
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[10px] text-neutral-500 uppercase">{t('todo.target_prj')}</label>
                    <SelectDropdown 
                      value={newTask.projectKey}
                      onChange={(newProject) => setNewTask({ ...newTask, projectKey: newProject })}
                      options={workspaces[newTask.domain]?.map(p => ({ value: p.key, label: `[${p.key}] ${p.name}` })) || []}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-4 pt-4 border-t border-neutral-800">
                  <button type="submit" className="w-full py-3 px-4 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors uppercase font-bold text-xs flex justify-center items-center gap-2">
                    <Plus size={14} /> {t('todo.deploy_task')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK QA MODAL */}
        {showQaModal && qaTaskInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-[#09090b] border border-blue-500 shadow-2xl w-full max-w-md p-6 font-mono relative">
              <button onClick={() => setShowQaModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-blue-400 mb-6 uppercase flex items-center gap-2">
                [ QUICK QA SHELL ]
              </h2>
              <div className="text-xs text-neutral-500 mb-4 bg-blue-500/10 border-l-2 border-blue-500 p-2">
                Tạo nhanh sub-task QA cho: <span className="font-bold text-blue-400">{qaTaskInfo.id}</span>
              </div>
              
              <form onSubmit={handleCreateQaSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase text-neutral-500 mb-1">Tên Feature</label>
                  <input required type="text" value={qaForm.featureName} onChange={e => setQaForm({...qaForm, featureName: e.target.value})} className="w-full bg-black border border-neutral-800 p-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500" placeholder="VD: Login Form" />
                </div>
                
                <div>
                  <label className="block text-xs uppercase text-neutral-500 mb-1">Mô tả tóm tắt (Issue)</label>
                  <input required type="text" value={qaForm.shortDesc} onChange={e => setQaForm({...qaForm, shortDesc: e.target.value})} className="w-full bg-black border border-neutral-800 p-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500" placeholder="VD: Lỗi hiển thị nút bấm" />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-500 mb-1">Assignee</label>
                  <SelectDropdown 
                    value={qaForm.assigneeId}
                    onChange={val => setQaForm({...qaForm, assigneeId: val})}
                    options={[
                      { value: '', label: 'UNASSIGNED' },
                      ...qaMembers.map(m => ({ value: m.id.toString(), label: m.name }))
                    ]}
                    placeholder={qaMembers.length > 0 ? "Chọn người phụ trách" : "Đang tải..."}
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => setShowQaModal(false)} className="flex-1 border border-neutral-800 text-neutral-500 p-3 text-xs font-bold uppercase hover:bg-neutral-900 transition-colors">
                    [ CANCEL ]
                  </button>
                  <button disabled={isCreatingQa} type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-3 text-xs font-bold uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isCreatingQa ? <span className="animate-pulse">PROCESSING...</span> : '[ INITIATE QA ]'}
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
