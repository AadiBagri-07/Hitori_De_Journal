import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const DEFAULT_TRACKERS = ['water', 'screenTime', 'weight', 'steps', 'sleep', 'mood', 'calories'];

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage('hitori_user', null));
  const [tasks, setTasks] = useState(() => loadFromStorage('hitori_tasks', []));
  const [events, setEvents] = useState(() => loadFromStorage('hitori_events', []));
  const [dailyData, setDailyData] = useState(() => loadFromStorage('hitori_daily', {}));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [theme, setTheme] = useState(() => loadFromStorage('hitori_theme', 'dark'));
  const [notes, setNotes] = useState(() => loadFromStorage('hitori_notes', {}));
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);
  const [challengePopup, setChallengePopup] = useState(null);

  useEffect(() => { saveToStorage('hitori_user', user); }, [user]);
  useEffect(() => { saveToStorage('hitori_tasks', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('hitori_events', events); }, [events]);
  useEffect(() => { saveToStorage('hitori_daily', dailyData); }, [dailyData]);
  useEffect(() => { saveToStorage('hitori_theme', theme); }, [theme]);
  useEffect(() => { saveToStorage('hitori_notes', notes); }, [notes]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const todayKey = getTodayKey();
      const lastPrompt = loadFromStorage('hitori_last_journal_prompt', '');
      if (hour >= 20 && lastPrompt !== todayKey) {
        setShowJournalPrompt(true);
        saveToStorage('hitori_last_journal_prompt', todayKey);
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDayData = useCallback((date) => {
    const key = getDateKey(date);
    return dailyData[key] || {};
  }, [dailyData]);

  const updateDayData = useCallback((date, updates) => {
    const key = getDateKey(date);
    setDailyData(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...updates }
    }));
  }, []);

  const updateTracker = useCallback((trackerKey, value, date = new Date()) => {
    updateDayData(date, { [trackerKey]: value });
  }, [updateDayData]);

  const incrementTracker = useCallback((trackerKey, amount, date = new Date()) => {
    const key = getDateKey(date);
    setDailyData(prev => {
      const current = (prev[key] || {})[trackerKey] || 0;
      return {
        ...prev,
        [key]: { ...(prev[key] || {}), [trackerKey]: current + amount }
      };
    });
  }, []);

  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, { ...task, id: Date.now(), color: task.color || '#00d4ff', completed: false }]);
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskForDate = useCallback((taskId, date, taskLabel) => {
    const key = getDateKey(date);
    let justCompleted = false;
    setDailyData(prev => {
      const dayData = prev[key] || {};
      const completedTasks = dayData.completedTasks || [];
      const isCompleted = completedTasks.includes(taskId);
      justCompleted = !isCompleted;
      return {
        ...prev,
        [key]: {
          ...dayData,
          completedTasks: isCompleted
            ? completedTasks.filter(id => id !== taskId)
            : [...completedTasks, taskId]
        }
      };
    });
    setTimeout(() => {
      if (justCompleted) {
        setChallengePopup({ taskId, taskLabel, dateKey: key });
      }
    }, 150);
  }, []);

  const getNotesForDate = useCallback((dateKey) => {
    return notes[dateKey] || { journal: '', taskNotes: {} };
  }, [notes]);

  const saveJournalEntry = useCallback((dateKey, text) => {
    setNotes(prev => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || { taskNotes: {} }), journal: text }
    }));
  }, []);

  const saveTaskNote = useCallback((dateKey, taskId, text) => {
    setNotes(prev => {
      const dayNotes = prev[dateKey] || { journal: '', taskNotes: {} };
      return {
        ...prev,
        [dateKey]: {
          ...dayNotes,
          taskNotes: { ...dayNotes.taskNotes, [taskId]: text }
        }
      };
    });
  }, []);

  const updateTrackerGoal = useCallback((trackerKey, newGoal) => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        trackers: prev.trackers.map(t =>
          t.key === trackerKey ? { ...t, goal: newGoal } : t
        )
      };
    });
  }, []);

  const addEvent = useCallback((event) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() }]);
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEventsForDate = useCallback((date) => {
    const key = getDateKey(date);
    return events.filter(e => e.date === key);
  }, [events]);

  const deletePastData = useCallback((monthsBack) => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    setDailyData(prev => {
      const filtered = {};
      Object.entries(prev).forEach(([key, val]) => {
        if (new Date(key) >= cutoff) filtered[key] = val;
      });
      return filtered;
    });
    setNotes(prev => {
      const filtered = {};
      Object.entries(prev).forEach(([key, val]) => {
        if (new Date(key) >= cutoff) filtered[key] = val;
      });
      return filtered;
    });
    setEvents(prev => prev.filter(e => new Date(e.date) >= cutoff));
  }, []);

  const getWeeklyTrend = useCallback((trackerKey, days = 7) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      result.push({
        date: d.toLocaleDateString('en', { weekday: 'short' }),
        value: (dailyData[key] || {})[trackerKey] || 0,
        fullDate: key
      });
    }
    return result;
  }, [dailyData]);

  const getProductivityForDate = useCallback((date) => {
    const key = getDateKey(date);
    const dayData = dailyData[key] || {};
    const completedTasks = dayData.completedTasks || [];
    const total = tasks.length;
    if (total === 0) return 0;
    return Math.round((completedTasks.length / total) * 100);
  }, [dailyData, tasks]);

  const value = {
    user, setUser,
    tasks, addTask, updateTask, deleteTask, toggleTaskForDate,
    events, addEvent, deleteEvent, getEventsForDate,
    dailyData, getDayData, updateDayData, updateTracker, incrementTracker,
    selectedDate, setSelectedDate,
    currentMonth, setCurrentMonth,
    theme, setTheme,
    getTodayKey, getDateKey,
    getWeeklyTrend, getProductivityForDate,
    deletePastData,
    DEFAULT_TRACKERS,
    notes, getNotesForDate, saveJournalEntry, saveTaskNote,
    showJournalPrompt, setShowJournalPrompt,
    challengePopup, setChallengePopup,
    updateTrackerGoal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
