import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const TRACKER_OPTIONS = [
  { key: 'water', label: 'Water Intake', unit: 'ml', icon: '💧', defaultGoal: 3000, increments: [250, 500] },
  { key: 'screenTime', label: 'Screen Time', unit: 'min', icon: '📱', defaultGoal: 240, increments: [15, 30] },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️', defaultGoal: null, increments: [0.1, 0.5] },
  { key: 'steps', label: 'Step Counter', unit: 'steps', icon: '👟', defaultGoal: 10000, increments: [500, 1000] },
  { key: 'sleep', label: 'Sleep Duration', unit: 'hrs', icon: '🌙', defaultGoal: 8, increments: [0.5, 1] },
  { key: 'mood', label: 'Mood Rating', unit: '/10', icon: '😊', defaultGoal: 10, increments: [1] },
  { key: 'calories', label: 'Calorie Intake', unit: 'kcal', icon: '🥗', defaultGoal: 2000, increments: [100, 250] },
  { key: 'meditation', label: 'Meditation', unit: 'min', icon: '🧘', defaultGoal: 20, increments: [5, 10] },
  { key: 'reading', label: 'Reading Time', unit: 'min', icon: '📖', defaultGoal: 30, increments: [15, 30] },
  { key: 'exercise', label: 'Exercise', unit: 'min', icon: '🏋️', defaultGoal: 45, increments: [15, 30] },
];

const THEMES = [
  { key: 'dark', label: 'Dark Cyan', desc: 'Default dark theme with cyan accents' },
  { key: 'midnight', label: 'Midnight Purple', desc: 'Deep purple and violet tones' },
  { key: 'forest', label: 'Forest Green', desc: 'Dark theme with green accents' },
  { key: 'ember', label: 'Ember', desc: 'Warm dark theme with orange accents' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, theme, setTheme, tasks, deleteTask, deletePastData } = useApp();
  const [deleteMonths, setDeleteMonths] = useState(3);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [nameSaved, setNameSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Weight setup
  const [baseWeightInput, setBaseWeightInput] = useState(user?.baseWeight ? String(user.baseWeight) : '');
  const [goalWeightInput, setGoalWeightInput] = useState(user?.goalWeight ? String(user.goalWeight) : '');
  const [weightSaved, setWeightSaved] = useState(false);

  const userTrackers = user?.trackers || [];
  const isTrackerEnabled = (key) => userTrackers.some(t => t.key === key);

  const toggleTracker = (opt) => {
    const current = userTrackers;
    if (isTrackerEnabled(opt.key)) {
      setUser({ ...user, trackers: current.filter(t => t.key !== opt.key) });
    } else {
      setUser({ ...user, trackers: [...current, { ...opt, goal: opt.defaultGoal }] });
    }
  };

  const saveName = () => {
    if (editName.trim()) {
      setUser({ ...user, name: editName.trim(), avatar: editName.trim()[0].toUpperCase() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const saveWeightSetup = () => {
    const base = parseFloat(baseWeightInput);
    const goal = parseFloat(goalWeightInput);
    if (isNaN(base) || base <= 0) return;
    setUser({
      ...user,
      baseWeight: base,
      goalWeight: isNaN(goal) || goal <= 0 ? null : goal,
    });
    setWeightSaved(true);
    setTimeout(() => setWeightSaved(false), 2000);
  };

  const handleDeleteData = () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    deletePastData(deleteMonths);
    setDeleteConfirm(false);
  };

  const handleLogout = () => {
    if (window.confirm('Reset everything and start over?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'weight', label: 'Weight' },
    { key: 'trackers', label: 'Trackers' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'theme', label: 'Theme' },
    { key: 'data', label: 'Data' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-to-home" onClick={() => navigate('/')}>← Back to Journal</button>
        <div className="profile-avatar-section">
          <div className="profile-avatar">{user?.avatar || '?'}</div>
          <div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-since">
              Journaling since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : 'today'}
            </p>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`profile-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="profile-content">

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3>Your Information</h3>
            <div className="profile-field">
              <label>Display Name</label>
              <div className="field-row">
                <input className="profile-input" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveName()} />
                <button className="save-profile-btn" onClick={saveName}>{nameSaved ? '✓ Saved' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weight' && (
          <div className="profile-section">
            <h3>Weight Setup</h3>
            <p className="section-desc">
              Set your baseline weight — this is your starting reference point. Each day you log your weight,
              the tracker shows how much you've fluctuated from this base. Your goal weight is shown as a target line on the graph.
            </p>

            <div className="weight-setup-card">
              <div className="weight-setup-row">
                <div className="weight-setup-field">
                  <label>Current / Base Weight (kg)</label>
                  <input
                    className="profile-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 72.5"
                    value={baseWeightInput}
                    onChange={e => setBaseWeightInput(e.target.value)}
                  />
                  <p className="weight-field-hint">This is your reference point. The tracker shows how your daily weight differs from this.</p>
                </div>
                <div className="weight-setup-field">
                  <label>Goal Weight (kg) — optional</label>
                  <input
                    className="profile-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 68.0"
                    value={goalWeightInput}
                    onChange={e => setGoalWeightInput(e.target.value)}
                  />
                  <p className="weight-field-hint">Shown as a dashed line on the weight chart.</p>
                </div>
              </div>

              {user?.baseWeight && (
                <div className="weight-current-display">
                  <div className="wcd-item">
                    <span className="wcd-label">Base weight</span>
                    <span className="wcd-val">{user.baseWeight} kg</span>
                  </div>
                  {user?.goalWeight && (
                    <div className="wcd-item">
                      <span className="wcd-label">Goal weight</span>
                      <span className="wcd-val">{user.goalWeight} kg</span>
                    </div>
                  )}
                  {user?.goalWeight && user?.baseWeight && (
                    <div className="wcd-item">
                      <span className="wcd-label">To {user.goalWeight < user.baseWeight ? 'lose' : 'gain'}</span>
                      <span className="wcd-val" style={{ color: '#ffd93d' }}>
                        {Math.abs(Number((user.baseWeight - user.goalWeight).toFixed(1)))} kg
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                className="save-profile-btn weight-save-btn"
                onClick={saveWeightSetup}
                disabled={!baseWeightInput}
              >
                {weightSaved ? '✓ Saved' : 'Save Weight Setup'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'trackers' && (
          <div className="profile-section">
            <h3>Active Trackers</h3>
            <p className="section-desc">Toggle which trackers appear on your dashboard</p>
            <div className="tracker-toggle-grid">
              {TRACKER_OPTIONS.map(opt => (
                <div key={opt.key} className={`tracker-toggle ${isTrackerEnabled(opt.key) ? 'enabled' : ''}`} onClick={() => toggleTracker(opt)}>
                  <span className="t-icon">{opt.icon}</span>
                  <span className="t-label">{opt.label}</span>
                  <span className="t-toggle">{isTrackerEnabled(opt.key) ? 'ON' : 'OFF'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="profile-section">
            <h3>Daily Habits</h3>
            <p className="section-desc">These repeat every day on your calendar</p>
            <div className="profile-task-list">
              {tasks.map(task => (
                <div key={task.id} className="profile-task-item">
                  <span className="profile-task-dot" style={{ background: task.color }} />
                  <span className="profile-task-label">{task.label}</span>
                  <button className="del-task-btn" onClick={() => deleteTask(task.id)}>×</button>
                </div>
              ))}
              {tasks.length === 0 && <p className="no-tasks-msg">No tasks yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="profile-section">
            <h3>App Theme</h3>
            <div className="theme-grid">
              {THEMES.map(t => (
                <button key={t.key} className={`theme-option ${theme === t.key ? 'active' : ''} theme-${t.key}`} onClick={() => setTheme(t.key)}>
                  <div className="theme-preview" />
                  <div className="theme-info">
                    <span className="theme-name">{t.label}</span>
                    <span className="theme-desc">{t.desc}</span>
                  </div>
                  {theme === t.key && <span className="theme-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="profile-section">
            <h3>Data Management</h3>
            <div className="data-card">
              <h4>Delete Past Data</h4>
              <p>Remove historical data older than a specified period</p>
              <div className="delete-control">
                <label>Delete data older than</label>
                <select className="months-select" value={deleteMonths} onChange={e => { setDeleteMonths(Number(e.target.value)); setDeleteConfirm(false); }}>
                  {[1, 2, 3, 6, 12, 24].map(m => (
                    <option key={m} value={m}>{m} {m === 1 ? 'month' : 'months'}</option>
                  ))}
                </select>
                <button className={`delete-data-btn ${deleteConfirm ? 'confirm' : ''}`} onClick={handleDeleteData}>
                  {deleteConfirm ? 'Confirm Delete' : 'Delete'}
                </button>
                {deleteConfirm && <button className="cancel-del-btn" onClick={() => setDeleteConfirm(false)}>Cancel</button>}
              </div>
            </div>
            <div className="data-card danger">
              <h4>Reset Everything</h4>
              <p>Clear all data and start fresh. This cannot be undone.</p>
              <button className="reset-all-btn" onClick={handleLogout}>Reset & Start Over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
