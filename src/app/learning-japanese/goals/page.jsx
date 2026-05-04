"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Calendar, GitCommit, CheckSquare, XSquare, Edit3, ArrowLeft, RefreshCw, AlertTriangle, BarChart2, PlusSquare, Copy } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTerminalModal } from '@/components/TerminalModalContext';
import { useLanguage } from '@/i18n/LanguageContext';

export default function GoalsTerminalPage() {
  const { t } = useLanguage();
  const { showAlert, showConfirm, showPrompt } = useTerminalModal();

  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const activeGoal = goals.find(g => g.id === activeGoalId);

  const [dailyPlan, setDailyPlan] = useState([]);
  const [logs, setLogs] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [editMode, setEditMode] = useState('GOAL'); // 'GOAL' or 'SCHEDULE'
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  // Forms
  const [editForm, setEditForm] = useState({
    reason: '',
    vocabTarget: '',
    endDate: '',
    scheduleNote: ''
  });

  const [isSyncingSRS, setIsSyncingSRS] = useState(false);

  const fetchData = () => {
    fetch('/api/goals')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map(g => ({
            ...g,
            desc: g.description,
            startDate: g.startDate.split('T')[0],
            endDate: g.endDate.split('T')[0],
            workload: {
              vocab: { target: g.vocabTarget, current: g.vocabCurrent },
              grammar: { target: g.grammarTarget, current: g.grammarCurrent },
              sentences: { target: g.sentencesTarget, current: g.sentencesCurrent },
              conversations: { target: g.conversationsTarget, current: g.conversationsCurrent },
            },
            quality: {
              perfect: g.qualityPerfect,
              memorized: g.qualityMemorized,
              bad: g.qualityBad,
              alarming: g.qualityAlarming
            },
            dailyTasks: g.dailyTasks ? g.dailyTasks.map(t => ({
              id: t.id,
              type: t.taskType,
              title: t.title,
              status: t.status.toUpperCase(),
              scheduledDate: t.scheduledDate.split('T')[0]
            })) : []
          }));
          setGoals(formatted);
          const firstActive = formatted.find(g => g.status !== 'DELETED');
          setActiveGoalId(firstActive ? firstActive.id : null);

          let allLogs = [];
          data.forEach(g => {
            if (g.planModificationLogs) {
              const fLogs = g.planModificationLogs.map(l => {
                // Hỗ trợ ngược cho log cũ (trước khi có eventType riêng)
                let finalEvent = l.eventType;
                if (finalEvent === 'PLAN_MODIFIED' && l.reason) {
                  if (l.reason.startsWith('INIT_GOAL')) finalEvent = 'INIT_GOAL';
                  if (l.reason.startsWith('[SCHEDULE')) finalEvent = 'SCHEDULE_OVERRIDDEN';
                }

                let detailsText = l.reason || JSON.stringify(l.changes);
                if (finalEvent === 'TASK_REVERTED' && l.changes && l.changes.taskTitle) {
                  detailsText = `[Task: ${l.changes.taskTitle} | ID: ${l.changes.taskId}] ${l.reason}`;
                }

                return {
                  id: l.id,
                  goalId: g.id,
                  time: l.createdAt.replace('T', ' ').split('.')[0],
                  event: finalEvent,
                  details: detailsText
                };
              });
              allLogs = [...allLogs, ...fLogs];
            }
          });
          setLogs(allLogs.sort((a, b) => new Date(b.time) - new Date(a.time)));
        }
      })
      .catch(err => console.error("Failed to load goals", err));
  };

  useEffect(() => {
    fetchData();
    
    // Lazy Cron: Tự động chạy Sync SRS 1 lần mỗi ngày khi mở trang
    const lastSync = localStorage.getItem('minithink_last_srs_sync');
    const today = new Date().toISOString().split('T')[0];
    if (lastSync !== today) {
       // Delay một chút để UI load xong rồi mới chạy ngầm
       setTimeout(() => {
         handleSyncSRS(true).then(() => {
            localStorage.setItem('minithink_last_srs_sync', today);
         });
       }, 1000);
    }
  }, []);

  const handleSyncSRS = async (isAuto = false) => {
    setIsSyncingSRS(true);
    try {
      const res = await fetch('/api/sync/dynamic-plan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
         if (data.newTasks && data.newTasks.length > 0) {
             showAlert(`[AUTO-SYNC] Generated ${data.newTasks.length} review tasks for today.`, "SUCCESS");
             fetchData();
         } else {
             if (!isAuto) showAlert("No items due for review today.", "SUCCESS");
         }
      } else {
         if (!isAuto) showAlert(`Sync Error: ${data.error}`, "CRITICAL_ERROR");
      }
    } catch(err) {
      if (!isAuto) showAlert("Network Error.", "CRITICAL_ERROR");
    } finally {
      setIsSyncingSRS(false);
    }
  };

  useEffect(() => {
    if (goals.length > 0 && activeGoalId) {
      const activeGoal = goals.find(g => g.id === activeGoalId);
      if (activeGoal && activeGoal.dailyTasks) {
        setDailyPlan(activeGoal.dailyTasks.filter(t => t.scheduledDate === selectedScheduleDate));
      } else {
        setDailyPlan([]);
      }
    }
  }, [selectedScheduleDate, activeGoalId, goals]);

  const [createForm, setCreateForm] = useState({
    name: '',
    desc: 'Goal generated via Terminal V2',
    vocab: '',
    grammar: '',
    sentences: '',
    conversations: '',
    endDate: '',
    skipWeekends: false
  });

  const qualityData = [
    { name: t('study.stats.perfect').toUpperCase(), value: activeGoal?.quality?.perfect || 0, fill: '#10b981' }, // emerald-500
    { name: t('study.stats.memorized').toUpperCase(), value: activeGoal?.quality?.memorized || 0, fill: '#3b82f6' }, // blue-500
    { name: t('study.stats.bad').toUpperCase(), value: activeGoal?.quality?.bad || 0, fill: '#f59e0b' }, // amber-500
    { name: t('study.stats.alarming').toUpperCase(), value: activeGoal?.quality?.alarming || 0, fill: '#f43f5e' }, // rose-500
  ];

  const renderProgressBar = (current, target, label) => {
    const safeTarget = target > 0 ? target : 1;
    const pct = Math.min(100, Math.round((current / safeTarget) * 100)) || 0;
    const filled = Math.round(pct / 5);
    const empty = 20 - filled;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono uppercase">
          <span>{label}</span>
          <span>{current} / {target} ({pct}%)</span>
        </div>
        <div className="text-sm font-mono tracking-widest text-emerald-400">
          [{'#'.repeat(filled)}{'-'.repeat(empty)}]
        </div>
      </div>
    );
  };

  const handleResetTask = async (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = await showConfirm('Are you sure you want to REVERT this task? Learning progress for these items will be reset!', 'DANGEROUS_OPERATION');
    if (!isConfirmed) return;

    const reason = await showPrompt("Reverting tasks alters memory algorithms. Please provide a reason for the Audit Log (min 10 chars):", "AWAITING_REASON", "e.g., Testing algorithms...");
    if (!reason || reason.trim().length < 10) {
      showAlert("Action aborted: A valid reason of at least 10 characters is required.", "VALIDATION_ERROR");
      return;
    }

    try {
      const res = await fetch('/api/study/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, reason: reason.trim() })
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        showAlert('Failed to reset task: ' + data.error, "SYSTEM_ERROR");
      }
    } catch (error) {
      console.error(error);
      showAlert('An error occurred while resetting the task.', "CRITICAL_ERROR");
    }
  };

  const handleOpenEdit = () => {
    if (!activeGoal) return;
    setEditMode('GOAL');
    setEditForm({
      reason: '',
      vocabTarget: activeGoal.workload.vocab.target.toString(),
      endDate: activeGoal.endDate,
      scheduleNote: ''
    });
    setShowEditModal(true);
  };

  const handleOpenScheduleEdit = () => {
    setEditMode('SCHEDULE');
    setEditForm({
      reason: '',
      vocabTarget: '',
      endDate: '',
      scheduleNote: 'e.g. Skipped 10 vocab, shifted to tomorrow.'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.reason || editForm.reason.length < 10) {
      showAlert("Modification reason required (min 10 chars).", "VALIDATION_ERROR");
      return;
    }

    let logDetails = '';

    if (editMode === 'GOAL') {
      logDetails = `Reason: ${editForm.reason} | New Target: ${editForm.vocabTarget}`;
      const updatedGoals = goals.map(g => {
        if (g.id === activeGoalId) {
          return {
            ...g,
            endDate: editForm.endDate,
            workload: {
              ...g.workload,
              vocab: { ...g.workload.vocab, target: parseInt(editForm.vocabTarget) }
            }
          };
        }
        return g;
      });
      setGoals(updatedGoals);
    } else {
      logDetails = `Reason: ${editForm.reason} | Date: ${selectedScheduleDate} | Note: ${editForm.scheduleNote}`;
      setShowCalendarModal(false); // Đóng calendar modal sau khi sửa xong
    }

    const eventType = editMode === 'GOAL' ? 'GOAL_MODIFIED' : 'SCHEDULE_OVERRIDDEN';

    try {
      await fetch('/api/goals/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: activeGoalId,
          reason: editForm.reason,
          type: eventType,
          changes: editMode === 'GOAL'
            ? { vocabTarget: editForm.vocabTarget, endDate: editForm.endDate }
            : { date: selectedScheduleDate, note: editForm.scheduleNote }
        })
      });
    } catch (e) {
      console.error(e);
    }

    const newLog = {
      id: `l-${Date.now()}`,
      goalId: activeGoalId,
      time: new Date().toISOString().replace('T', ' ').split('.')[0],
      event: eventType,
      details: logDetails
    };

    setLogs(prev => [newLog, ...prev]);
    setShowEditModal(false);
  };

  const handleCreateGoal = async () => {
    if (!createForm.name || !createForm.endDate) {
      showAlert("ERROR: Name and End Date are required.", "VALIDATION_ERROR");
      return;
    }

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.toUpperCase(),
          desc: createForm.desc,
          startDate: new Date().toISOString().split('T')[0],
          endDate: createForm.endDate,
          skipWeekends: createForm.skipWeekends,
          vocabTarget: Number(createForm.vocab),
          grammarTarget: Number(createForm.grammar),
          sentencesTarget: Number(createForm.sentences),
          conversationsTarget: Number(createForm.conversations),
        })
      });
      const data = await res.json();

      if (!data.success) {
        showAlert("Failed to save to database: " + data.error, "SYSTEM_ERROR");
        return;
      }

      const dbGoal = data.goal;

      const newId = dbGoal.id;
      const newGoal = {
        id: newId,
        name: dbGoal.name,
        desc: dbGoal.description || dbGoal.desc,
        startDate: dbGoal.startDate.split('T')[0],
        endDate: dbGoal.endDate.split('T')[0],
        skipWeekends: dbGoal.skipWeekends,
        status: dbGoal.status,
        workload: {
          vocab: { target: dbGoal.vocabTarget, current: 0 },
          grammar: { target: dbGoal.grammarTarget, current: 0 },
          sentences: { target: dbGoal.sentencesTarget, current: 0 },
          conversations: { target: dbGoal.conversationsTarget, current: 0 }
        },
        quality: { perfect: 0, good: 0, memorized: 0, bad: 0, alarming: 0 },
        dailyTasks: dbGoal.dailyTasks ? dbGoal.dailyTasks.map(t => ({
          id: t.id,
          type: t.taskType,
          title: t.title,
          status: t.status.toUpperCase(),
          scheduledDate: t.scheduledDate.split('T')[0]
        })) : []
      };

      setGoals([...goals, newGoal]);
      setActiveGoalId(newId);

      setLogs([
        {
          id: `l-${Date.now()}`,
          goalId: newId,
          time: new Date().toISOString().replace('T', ' ').split('.')[0],
          event: 'INIT_GOAL',
          details: `INIT_GOAL: Goal generated via Terminal V2`
        },
        ...logs
      ]);

      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      showAlert("Network error. Could not connect to API.", "CRITICAL_ERROR");
    }
  };

  const requestDeleteGoal = (id) => {
    setDeleteTargetId(id);
  };

  const executeDeleteGoal = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;

    try {
      const res = await fetch('/api/goals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: id })
      });

      if (res.ok) {
        setGoals(goals.filter(g => g.id !== deleteTargetId));
        setDeleteTargetId(null);
        if (activeGoalId === deleteTargetId) setActiveGoalId(null);

        setLogs([
          {
            id: `l-del-${Date.now()}`,
            goalId: id,
            time: new Date().toISOString().replace('T', ' ').split('.')[0],
            event: 'GOAL_DELETED',
            details: 'Target and daily tasks destroyed by user command. Logs preserved.'
          },
          ...logs
        ]);
      } else {
        showAlert("Failed to destroy target: " + await res.text(), "SYSTEM_ERROR");
        setDeleteTargetId(null);
      }
    } catch (err) {
      console.error(err);
      showAlert("Network error.", "CRITICAL_ERROR");
      setDeleteTargetId(null);
    }
  };
  const getCalendarDays = () => {
    if (!activeGoal) return [];
    const start = new Date(activeGoal.startDate);
    const end = new Date(activeGoal.endDate);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0]);
    }
    return days;
  };

  const getCumulativeProgress = () => {
    if (!activeGoal || !activeGoal.dailyTasks) return { vocab: 0, grammar: 0, sentences: 0, conversations: 0 };
    let vocab = 0, grammar = 0, sentences = 0, conversations = 0;

    activeGoal.dailyTasks.forEach(t => {
      if (t.scheduledDate > selectedScheduleDate) return;
      if (t.isReview) return; // Skip review tasks

      let num = 0;
      const type = t.type || t.taskType;

      if (type === 'vocab') {
        const m = t.title.match(/Fetch (\d+)/);
        if (m) num = parseInt(m[1]);
        vocab += num;
      } else if (type === 'grammar') {
        const m = t.title.match(/Parse (\d+)/);
        if (m) num = parseInt(m[1]);
        grammar += num;
      } else if (type === 'map') {
        const m = t.title.match(/Test: (\d+)/);
        if (m) num = parseInt(m[1]);
        sentences += num;
      } else if (type === 'conversation') {
        const m = t.title.match(/\[SIM\] (\d+)/);
        if (m) num = parseInt(m[1]);
        conversations += num;
      }
    });
    return { vocab, grammar, sentences, conversations };
  };

  const renderCalendarProgressBar = (current, target, label) => {
    if (!target) return null;
    const percentage = Math.min(100, Math.round((current / target) * 100));
    const filledBlocks = Math.floor(percentage / 5);
    const emptyBlocks = 20 - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

    return (
      <div className="font-mono text-xs mb-1.5 flex items-center">
        <span className="text-emerald-500 mr-3">[{bar}]</span>
        <span className="text-neutral-400 w-20 inline-block">{label}</span>
        <span className="text-emerald-400 font-bold w-12 inline-block text-right mr-2">{percentage}%</span>
        <span className="text-neutral-500 w-20 text-right">({current}/{target})</span>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#09090b] text-slate-300 font-mono flex flex-col p-6 selection:bg-emerald-500/30">

      {/* TOP NAVBAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/learning-japanese" className="hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> [ RETURN ]
          </Link>
          <div className="hidden md:block h-4 w-px bg-neutral-800"></div>
          <h1 className="text-xl font-bold text-emerald-500 tracking-wider flex items-center gap-2">
            <Terminal size={20} /> {t('goals.tracker')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 border border-emerald-500/50 text-emerald-400 px-3 py-1 text-sm hover:bg-emerald-500 hover:text-black transition-colors uppercase font-bold"
          >
            <PlusSquare size={16} /> {t('goals.init_new')}
          </button>
          {goals.filter(g => g.status !== 'DELETED').length > 0 && (
            <>
              <span className="text-xs text-neutral-500 hidden md:inline uppercase">{t('goals.active_target')}</span>
              <div className="relative z-50">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between bg-[#09090b] border border-emerald-500/50 text-sm text-emerald-400 p-1 px-3 min-w-[150px] max-w-[200px] hover:bg-emerald-900/20 transition-colors uppercase font-bold"
                >
                  <span className="truncate">
                    {activeGoal ? (activeGoal.status === 'DELETED' ? `[DEL] ${activeGoal.name}` : activeGoal.name) : t('goals.select_target')}
                  </span>
                  <span className="ml-2 text-[10px] text-emerald-500/70">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-full min-w-[200px] bg-black border border-emerald-500/50 shadow-xl shadow-black max-h-[300px] overflow-y-auto custom-scrollbar">
                    {goals.filter(g => g.status !== 'DELETED').length === 0 && (
                      <div className="px-3 py-2 text-sm text-neutral-600 italic">{t('goals.no_targets_avail')}</div>
                    )}
                    {goals.filter(g => g.status !== 'DELETED').map(g => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setActiveGoalId(g.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm uppercase transition-colors ${g.id === activeGoalId
                            ? 'bg-emerald-900/40 text-emerald-300 font-bold'
                            : 'text-emerald-500 hover:bg-emerald-900/20'
                          }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {goals.filter(g => g.status !== 'DELETED').length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neutral-800 p-10 text-center">
          <Activity size={48} className="text-neutral-700 mb-4" />
          <h2 className="text-emerald-500 font-bold text-xl mb-2 uppercase">{t('goals.no_active_targets')}</h2>
          <p className="text-neutral-500 max-w-md text-sm mb-6">
            {t('goals.no_active_desc')}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-500/10 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors uppercase font-bold tracking-widest flex items-center gap-2"
          >
            <PlusSquare size={18} /> {t('goals.init_protocol')}
          </button>
        </div>
      ) : (
        /* MAIN GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

          {/* LEFT COLUMN: SPECS */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">

            {/* GOAL SPECS BLOCK */}
            <div className="border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col h-full min-h-0">
              <div className="flex justify-between items-start mb-4 border-b border-neutral-800 pb-2 shrink-0">
                <h2 className="text-emerald-400 font-bold uppercase flex items-center gap-2 truncate pr-2">
                  <Activity size={16} className="shrink-0" /> {activeGoal.name}
                </h2>
                <div className="flex gap-2">
                  <span className={`shrink-0 text-[10px] md:text-xs px-2 py-0.5 uppercase ${activeGoal.status === 'DELETED' ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' :
                      activeGoal.status === 'ON_TRACK' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {activeGoal.status}
                  </span>
                  {activeGoal.status !== 'DELETED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSyncSRS}
                        disabled={isSyncingSRS}
                        className="shrink-0 text-[10px] md:text-xs px-2 py-0.5 uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-colors font-bold flex items-center gap-1"
                        title="Auto-generate Dynamic Plan for SRS due items"
                      >
                        <RefreshCw size={12} className={isSyncingSRS ? "animate-spin" : ""} />
                        SYNC SRS
                      </button>
                      <button
                        onClick={() => requestDeleteGoal(activeGoal.id)}
                        className="shrink-0 text-[10px] md:text-xs px-2 py-0.5 uppercase bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-black transition-colors font-bold"
                      >
                        {t('goals.destroy')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-sm text-neutral-400 mb-6 line-clamp-3">
                  {'>'} {activeGoal.desc}
                </p>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('goals.start_date')}</span>
                    <span className="text-slate-300">{activeGoal.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('goals.end_date')}</span>
                    <span className="text-slate-300">{activeGoal.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('goals.skip_weekend')}</span>
                    <span className={activeGoal.skipWeekends ? "text-emerald-400" : "text-slate-300"}>{activeGoal.skipWeekends ? 'TRUE' : 'FALSE'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs text-neutral-500 mb-3 uppercase">{t('goals.progress_matrix')}</h3>
                  {renderProgressBar(activeGoal.workload.vocab.current, activeGoal.workload.vocab.target, 'VOCABULARY')}
                  {renderProgressBar(activeGoal.workload.grammar.current, activeGoal.workload.grammar.target, 'GRAMMAR')}
                  {renderProgressBar(activeGoal.workload.sentences.current, activeGoal.workload.sentences.target, 'WORD_MAP_REFLEX')}
                  {renderProgressBar(activeGoal.workload.conversations.current, activeGoal.workload.conversations.target, 'CONVERSATIONS')}
                </div>
              </div>

              <button
                onClick={handleOpenEdit}
                className="w-full py-2 mt-4 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all flex items-center justify-center gap-2 text-sm uppercase shrink-0"
              >
                <Edit3 size={16} /> {t('goals.modify_params')}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-1/2 min-h-0">
              {/* TODAY'S TASKS */}
              <div className="border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col min-h-0">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-4 shrink-0">
                  <h2 className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                    <CheckSquare size={16} /> {t('goals.daily_execution_plan')}
                  </h2>
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center gap-1 text-[10px] border border-emerald-500/50 text-emerald-400 px-2 py-1 hover:bg-emerald-500 hover:text-black uppercase transition-colors"
                  >
                    <Calendar size={12} /> {t('goals.view_schedule')}
                  </button>
                </div>
                <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
                  {dailyPlan.length === 0 ? (
                    <div className="text-neutral-500 text-sm mt-4 text-center">{t('goals.no_tasks_today')}</div>
                  ) : (
                    dailyPlan.map(task => {
                      const isPast = new Date(task.scheduledDate) < new Date(new Date().toDateString());
                      const isCompleted = task.status === 'COMPLETED';
                      const isMissed = !isCompleted && isPast;

                      return (
                        <Link
                          key={task.id}
                          href={task.type === 'grammar'
                            ? `/learning-japanese/grammar/study/${task.id}${isCompleted ? '?mode=practice' : ''}`
                            : task.type === 'consolidate'
                              ? `/learning-japanese/consolidate/study/${task.id}${isCompleted ? '?mode=practice' : ''}`
                              : `/learning-japanese/study/${task.id}${isCompleted ? '?mode=practice' : ''}`
                          }
                          className={`flex items-center justify-between p-3 border cursor-pointer transition-colors group ${isCompleted ? 'border-neutral-800 bg-[#09090b] hover:border-emerald-500' : isMissed ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500' : 'border-neutral-800 bg-[#09090b] hover:border-emerald-500'}`}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                            ) : isMissed ? (
                              <XSquare size={16} className="text-rose-500 shrink-0 group-hover:text-rose-400 transition-colors" />
                            ) : (
                              <div className="w-4 h-4 shrink-0 border border-neutral-600 group-hover:border-emerald-500 transition-colors"></div>
                            )}
                            <div className="flex flex-col items-start">
                              <span className={`text-sm font-bold transition-colors ${isCompleted ? 'text-neutral-500 group-hover:text-emerald-400' : isMissed ? 'text-rose-500 group-hover:text-rose-400' : 'text-slate-200 group-hover:text-emerald-400'}`}>
                                {task.title}
                              </span>
                              <div
                                className={`flex items-center gap-1 mt-1 text-[9px] transition-colors ${isMissed ? 'text-rose-500/50 hover:text-rose-400' : 'text-neutral-600 hover:text-emerald-400'}`}
                                onClick={(e) => handleCopyId(e, task.id)}
                              >
                                <Copy size={10} />
                                <span className="uppercase">
                                  {copiedId === task.id ? 'COPIED!' : `ID: ${task.id}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase text-neutral-500 px-1 border border-neutral-800 shrink-0">
                            {task.type}
                          </span>
                          {task.status === 'COMPLETED' && (
                            <button
                              onClick={(e) => handleResetTask(e, task.id)}
                              className="text-neutral-600 hover:text-amber-500 transition-colors p-1"
                              title="Revert Task & Reset Progress"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                        </div>
                      </Link>
                    );
                  })
                  )}
                </div>
              </div>

              {/* QUALITY METRICS CHART */}
              <div className="border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col min-h-0">
                <h2 className="text-emerald-400 font-bold uppercase flex items-center gap-2 border-b border-neutral-800 pb-2 mb-4 shrink-0">
                  <BarChart2 size={16} /> {t('goals.quality_diagnostics')}
                </h2>
                <div className="flex-1 w-full h-full min-h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                      <XAxis type="number" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" interval={0} stroke="#525252" tick={{ fill: '#a3a3a3', fontSize: 10 }} width={80} />
                      <Tooltip cursor={{ fill: '#171717' }} contentStyle={{ backgroundColor: '#09090b', borderColor: '#262626', fontSize: '12px', fontFamily: 'monospace' }} itemStyle={{ color: '#emerald-400' }} labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }} />
                      <Bar dataKey="value" name="Items" barSize={12} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SYSTEM LOGS / MODIFICATION LOGS */}
            <div className="border border-neutral-800 bg-neutral-900/50 p-5 flex-1 flex flex-col min-h-0">
              <h2 className="text-emerald-400 font-bold uppercase flex items-center gap-2 border-b border-neutral-800 pb-2 mb-4 shrink-0">
                <Terminal size={16} /> {t('goals.system_logs')}
              </h2>
              <div className="flex-1 overflow-auto bg-[#09090b] border border-neutral-800 p-4 font-mono text-xs text-neutral-400 space-y-2 custom-scrollbar">
                {logs.filter(l => l.goalId === activeGoalId).length === 0 && (
                  <div className="text-neutral-600">{t('goals.log_empty')}</div>
                )}
                {logs.filter(l => l.goalId === activeGoalId).map((log) => {
                  const event = String(log.event || '').toUpperCase();
                  const details = String(log.details || '').toLowerCase();

                  // Mặc định là Good Logs (Xanh lá)
                  let eventClass = 'text-emerald-500';
                  let textClass = 'text-slate-300';

                  // Bad logs (Đỏ)
                  if (event.includes('DYNAMIC') || event.includes('DELETED') || details.includes('nợ') || details.includes('chậm') || details.includes('kém') || details.includes('trễ')) {
                    eventClass = 'text-rose-500';
                    textClass = 'text-rose-400';
                  }
                  // Warning logs (Vàng)
                  else if (event.includes('SCHEDULE') || event.includes('MODIFIED') || event.includes('EDIT') || event.includes('REVERT')) {
                    eventClass = 'text-amber-500';
                    textClass = 'text-amber-400';
                  }

                  return (
                    <div key={log.id} className="flex gap-4">
                      <span className="text-neutral-500 whitespace-nowrap shrink-0">[{log.time}]</span>
                      <span className={`${eventClass} whitespace-nowrap font-bold shrink-0`}>[{event}]</span>
                      <span className={`${textClass} break-words`}>{log.details}</span>
                    </div>
                  );
                })}
                <div className="animate-pulse flex gap-4 opacity-50 mt-2">
                  <span className="text-neutral-500">[{new Date().toISOString().replace('T', ' ').split('.')[0]}]</span>
                  <span className="text-emerald-500/70">{t('goals.sys_idle')}</span>
                  <span className="text-slate-300">{t('goals.awaiting_input')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-emerald-500/50 w-full max-w-2xl p-6 shadow-2xl shadow-emerald-900/20">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-6">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2 uppercase">
                <PlusSquare size={18} />
                {t('goals.create.title')}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                <XSquare size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.create.name')}</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. N3_COMMUNICATION_PROTOCOL"
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.create.vocab')}</label>
                <input
                  type="number"
                  value={createForm.vocab}
                  onChange={e => setCreateForm({ ...createForm, vocab: e.target.value })}
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.create.grammar')}</label>
                <input
                  type="number"
                  value={createForm.grammar}
                  onChange={e => setCreateForm({ ...createForm, grammar: e.target.value })}
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.create.sentences')}</label>
                <input
                  type="number"
                  value={createForm.sentences}
                  onChange={e => setCreateForm({ ...createForm, sentences: e.target.value })}
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.create.conversations')}</label>
                <input
                  type="number"
                  value={createForm.conversations}
                  onChange={e => setCreateForm({ ...createForm, conversations: e.target.value })}
                  className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-amber-500 mb-1 uppercase">{t('goals.create.deadline')}</label>
                <input
                  type="date"
                  value={createForm.endDate}
                  onChange={e => setCreateForm({ ...createForm, endDate: e.target.value })}
                  className="w-full bg-[#09090b] border border-amber-500/50 text-slate-200 p-2 focus:border-amber-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer p-2 border border-neutral-700 hover:border-neutral-500 transition-colors h-[38px] bg-[#09090b]">
                  <div className={`w-4 h-4 border flex items-center justify-center ${createForm.skipWeekends ? 'border-emerald-500 bg-emerald-500/20' : 'border-neutral-600'}`}>
                    {createForm.skipWeekends && <div className="w-2 h-2 bg-emerald-500"></div>}
                  </div>
                  <span className="text-xs text-neutral-400 uppercase">{t('goals.create.skip_weekends')}</span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={createForm.skipWeekends}
                    onChange={e => setCreateForm({ ...createForm, skipWeekends: e.target.checked })}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-neutral-800 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 text-sm uppercase"
              >
                {t('goals.create.abort')}
              </button>
              <button
                onClick={handleCreateGoal}
                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors text-sm uppercase font-bold"
              >
                {t('goals.create.run_auto')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && activeGoal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-emerald-500/50 w-full max-w-lg p-6 shadow-2xl shadow-emerald-900/20">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-6">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2 uppercase">
                <AlertTriangle size={18} className="text-amber-500" />
                {editMode === 'GOAL' ? t('goals.edit.title_plan') : t('goals.edit.title_schedule')}
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                <XSquare size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {editMode === 'GOAL' ? (
                <>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.edit.new_vocab')}</label>
                    <input
                      type="number"
                      value={editForm.vocabTarget}
                      onChange={e => setEditForm({ ...editForm, vocabTarget: e.target.value })}
                      className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.edit.new_end')}</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.edit.target_date')}</label>
                    <input
                      type="text"
                      value={selectedScheduleDate}
                      disabled
                      className="w-full bg-[#09090b] border border-neutral-800 text-neutral-500 p-2 font-mono text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 uppercase">{t('goals.edit.note')}</label>
                    <input
                      type="text"
                      value={editForm.scheduleNote}
                      onChange={e => setEditForm({ ...editForm, scheduleNote: e.target.value })}
                      className="w-full bg-[#09090b] border border-neutral-700 text-slate-200 p-2 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-amber-500 mb-1 uppercase">{t('goals.edit.auth_reason')}</label>
                <textarea
                  value={editForm.reason}
                  onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                  placeholder={t('goals.edit.auth_placeholder')}
                  className="w-full bg-[#09090b] border border-amber-500/50 text-slate-200 p-2 focus:border-amber-500 focus:outline-none font-mono text-sm h-24 resize-none"
                ></textarea>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase">This log will be permanently stored in the database.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 text-sm uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors text-sm uppercase font-bold"
              >
                Execute_Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR MODAL */}
      {showCalendarModal && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-emerald-500/50 w-full max-w-7xl h-[80vh] flex flex-col shadow-2xl shadow-emerald-900/20">
            <div className="flex justify-between items-center border-b border-neutral-800 p-4 bg-neutral-900/50 shrink-0">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2 uppercase">
                <Calendar size={18} />
                Master_Schedule_View
              </h2>
              <button onClick={() => setShowCalendarModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                <XSquare size={20} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left sidebar: Days */}
              <div className="w-1/3 border-r border-neutral-800 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {getCalendarDays().map((dateStr, i) => {
                  const d = new Date(dateStr);
                  const isSelected = selectedScheduleDate === dateStr;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  const tasksForDate = activeGoal.dailyTasks?.filter(t => t.scheduledDate === dateStr) || [];
                  const totalTasks = tasksForDate.length;
                  
                  let completionStatus = null;
                  let progressPercent = 0;
                  const isPast = new Date(dateStr) < new Date(new Date().toDateString());

                  if (totalTasks > 0 && isPast) {
                    const completedTasks = tasksForDate.filter(t => t.status === 'COMPLETED').length;
                    progressPercent = Math.round((completedTasks / totalTasks) * 100);
                    
                    if (progressPercent === 100) {
                      completionStatus = 'PERFECT';
                    } else if (progressPercent >= 90) {
                      completionStatus = 'MINOR_MISS';
                    } else if (progressPercent >= 50) {
                      completionStatus = 'MAJOR_MISS';
                    } else {
                      completionStatus = 'CRITICAL_MISS';
                    }
                  }

                  let statusIndicator = null;
                  let textColor = 'text-slate-400';

                  if (completionStatus === 'PERFECT') {
                    statusIndicator = <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1 ml-2 border border-emerald-500/30">{progressPercent}%</span>;
                    if (!isSelected) textColor = 'text-emerald-500/80';
                  } else if (completionStatus === 'MINOR_MISS') {
                    statusIndicator = <span className="text-[9px] text-blue-500 bg-blue-500/10 px-1 ml-2 border border-blue-500/30">{progressPercent}%</span>;
                    if (!isSelected) textColor = 'text-blue-500/80';
                  } else if (completionStatus === 'MAJOR_MISS') {
                    statusIndicator = <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1 ml-2 border border-amber-500/30">{progressPercent}%</span>;
                    if (!isSelected) textColor = 'text-amber-500/80';
                  } else if (completionStatus === 'CRITICAL_MISS') {
                    statusIndicator = <span className="text-[9px] text-rose-500 bg-rose-500/10 px-1 ml-2 border border-rose-500/30">{progressPercent}%</span>;
                    if (!isSelected) textColor = 'text-rose-500/80';
                  }

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedScheduleDate(dateStr)}
                      className={`w-full text-left p-3 text-sm font-mono border transition-colors ${isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : `bg-neutral-900/30 border-transparent hover:border-neutral-700 ${textColor}`
                        } ${(isWeekend && !completionStatus) ? 'opacity-50' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span>{dateStr}</span>
                          {statusIndicator}
                        </div>
                        {isToday && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1 border border-emerald-500/30 uppercase">Today</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right content: Tasks for the day */}
              <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start border-b border-neutral-800 pb-4 mb-6">
                  <div>
                    <h3 className="text-emerald-400 font-bold uppercase text-lg mb-1">{selectedScheduleDate}</h3>
                    <p className="text-xs text-neutral-500 mb-4">Auto-generated breakdown tasks for this cycle.</p>

                    {/* ASCII Cumulative Progress Bar */}
                    <div className="bg-neutral-900/50 border border-neutral-800 p-3 mb-2">
                      <div className="text-[10px] text-amber-500 uppercase mb-2">
                        {'>'} Projected_Milestone_By: {selectedScheduleDate}
                      </div>
                      {renderCalendarProgressBar(getCumulativeProgress().vocab, activeGoal?.workload?.vocab?.target, 'VOCAB')}
                      {renderCalendarProgressBar(getCumulativeProgress().grammar, activeGoal?.workload?.grammar?.target, 'GRAMMAR')}
                      {renderCalendarProgressBar(getCumulativeProgress().sentences, activeGoal?.workload?.sentences?.target, 'REFLEX')}
                      {renderCalendarProgressBar(getCumulativeProgress().conversations, activeGoal?.workload?.conversations?.target, 'CONV')}
                    </div>
                  </div>
                  <button
                    onClick={handleOpenScheduleEdit}
                    className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black transition-colors text-xs uppercase font-bold"
                  >
                    <Edit3 size={14} /> Override_Plan
                  </button>
                </div>

                <div className="space-y-3">
                  {dailyPlan.map(task => {
                    const isPast = new Date(task.scheduledDate) < new Date(new Date().toDateString());
                    const isCompleted = task.status === 'COMPLETED';
                    const isMissed = !isCompleted && isPast;

                    return (
                      <div key={task.id} className={`flex items-center justify-between p-4 border ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : isMissed ? 'border-rose-500/30 bg-rose-500/5' : 'border-neutral-800 bg-neutral-900/30'}`}>
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                          ) : isMissed ? (
                            <XSquare size={16} className="text-rose-500 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 shrink-0 border border-neutral-600"></div>
                          )}
                          <span className={`${isCompleted ? 'text-emerald-500 opacity-70' : isMissed ? 'text-rose-400 opacity-70' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className={`text-[10px] uppercase px-1 border ${isCompleted ? 'text-emerald-500 border-emerald-500/30' : isMissed ? 'text-rose-500 border-rose-500/30' : 'text-neutral-500 border-neutral-800'}`}>
                          {task.type}
                        </span>
                      </div>
                    );
                  })}

                  {dailyPlan.length === 0 && (
                    <div className="text-neutral-500 text-sm text-center py-10 border border-dashed border-neutral-800">
                      [ NO_TASKS_SCHEDULED ]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for custom scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
      `}} />
      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-black border border-rose-500/50 w-full max-w-md p-6 shadow-2xl shadow-rose-900/20 font-mono">
            <div className="flex items-center gap-3 border-b border-rose-900/50 pb-4 mb-6">
              <AlertTriangle size={24} className="text-rose-500 animate-pulse" />
              <h2 className="text-lg font-bold text-rose-500 uppercase tracking-wider">
                System_Warning
              </h2>
            </div>

            <div className="text-rose-400/90 text-sm space-y-4 mb-8">
              <p className="uppercase font-bold text-rose-500">
                &gt; Irreversible_Action_Detected
              </p>
              <p>
                You are about to DESTROY the active target and ALL associated scheduled daily tasks.
              </p>
              <p className="text-neutral-500">
                * Note: System logs will be preserved for audit purposes.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-rose-900/30 pt-4">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 transition-colors uppercase text-xs font-bold"
              >
                Abort
              </button>
              <button
                onClick={executeDeleteGoal}
                className="px-4 py-2 border border-rose-500 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-black transition-colors uppercase text-xs font-bold flex items-center gap-2"
              >
                <XSquare size={14} /> Confirm_Destroy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
