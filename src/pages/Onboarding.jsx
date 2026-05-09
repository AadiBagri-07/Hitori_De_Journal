import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const TRACKER_OPTIONS = [
  { key: 'water', label: 'Water Intake', unit: 'ml', icon: '💧', defaultGoal: 3000, increment: 250, increments: [250, 500] },
  { key: 'screenTime', label: 'Screen Time', unit: 'min', icon: '📱', defaultGoal: 240, increment: 15, increments: [15, 30] },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️', defaultGoal: null, increment: 0.1, increments: [0.1, 0.5] },
  { key: 'steps', label: 'Step Counter', unit: 'steps', icon: '👟', defaultGoal: 10000, increment: 500, increments: [500, 1000] },
  { key: 'sleep', label: 'Sleep Duration', unit: 'hrs', icon: '🌙', defaultGoal: 8, increment: 0.5, increments: [0.5, 1] },
  { key: 'mood', label: 'Mood Rating', unit: '/10', icon: '😊', defaultGoal: 10, increment: 1, increments: [1] },
  { key: 'calories', label: 'Calorie Intake', unit: 'kcal', icon: '🥗', defaultGoal: 2000, increment: 100, increments: [100, 250] },
  { key: 'meditation', label: 'Meditation', unit: 'min', icon: '🧘', defaultGoal: 20, increment: 5, increments: [5, 10] },
  { key: 'reading', label: 'Reading Time', unit: 'min', icon: '📖', defaultGoal: 30, increment: 15, increments: [15, 30] },
  { key: 'exercise', label: 'Exercise Duration', unit: 'min', icon: '🏋️', defaultGoal: 45, increment: 15, increments: [15, 30] },
];

export default function Onboarding() {
  const { setUser, addTask } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedTrackers, setSelectedTrackers] = useState(['water', 'screenTime', 'weight', 'steps']);
  const [customGoals, setCustomGoals] = useState({});
  const [goalEditKey, setGoalEditKey] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [taskColor, setTaskColor] = useState('#00d4ff');
  const [dailyTasks, setDailyTasks] = useState([]);
  const [error, setError] = useState('');

  const COLORS = ['#00d4ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#9b59b6', '#ff8c42', '#e91e63'];

  const toggleTracker = (key) => {
    setSelectedTrackers(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const addDailyTask = () => {
    if (!taskInput.trim()) return;
    setDailyTasks(prev => [...prev, { label: taskInput.trim(), color: taskColor }]);
    setTaskInput('');
  };

  const removeTask = (i) => setDailyTasks(prev => prev.filter((_, idx) => idx !== i));

  const handleFinish = () => {
    const trackerConfig = selectedTrackers.map(key => {
      const opt = TRACKER_OPTIONS.find(o => o.key === key);
      const goal = customGoals[key] !== undefined ? Number(customGoals[key]) : opt.defaultGoal;
      return { ...opt, goal };
    });

    const newUser = {
      name: name.trim(),
      trackers: trackerConfig,
      createdAt: new Date().toISOString(),
      avatar: name.trim()[0].toUpperCase()
    };
    setUser(newUser);

    dailyTasks.forEach(t => {
      addTask({ label: t.label, color: t.color, type: 'daily' });
    });

    navigate('/');
  };

  const steps = [
    // Step 0 - Name
    <div key="name" className="step-content">
      <h2>What should we call you?</h2>
      <p className="step-sub">Your name will appear across the app</p>
      <input
        className="onboard-input"
        placeholder="Your name..."
        value={name}
        onChange={e => { setName(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(1)}
        autoFocus
      />
      {error && <p className="error-msg">{error}</p>}
    </div>,

    // Step 1 - Trackers + Goals
    <div key="trackers" className="step-content">
      <h2>Choose your daily trackers</h2>
      <p className="step-sub">Select what to monitor — tap a selected tracker to set your personal goal</p>
      <div className="tracker-grid">
        {TRACKER_OPTIONS.map(opt => {
          const selected = selectedTrackers.includes(opt.key);
          const goal = customGoals[opt.key] !== undefined ? customGoals[opt.key] : opt.defaultGoal;
          const isEditing = goalEditKey === opt.key;

          return (
            <div key={opt.key} className={`tracker-option-wrap ${selected ? 'selected' : ''}`}>
              <button
                className={`tracker-option ${selected ? 'selected' : ''}`}
                onClick={() => {
                  toggleTracker(opt.key);
                  setGoalEditKey(null);
                }}
              >
                <span className="tracker-icon">{opt.icon}</span>
                <div className="tracker-opt-info">
                  <span className="tracker-label">{opt.label}</span>
                  {selected && goal && (
                    <span className="tracker-goal-preview">Goal: {goal} {opt.unit}</span>
                  )}
                </div>
                {selected && <span className="check-mark">✓</span>}
              </button>
              {selected && opt.defaultGoal !== null && (
                <button
                  className="set-tracker-goal-btn"
                  onClick={e => {
                    e.stopPropagation();
                    setGoalEditKey(isEditing ? null : opt.key);
                  }}
                  title="Edit goal"
                >
                  {isEditing ? '×' : '⚙'}
                </button>
              )}
              {isEditing && (
                <div className="tracker-goal-inline-edit" onClick={e => e.stopPropagation()}>
                  <span className="tgi-label">Daily goal ({opt.unit}):</span>
                  <input
                    className="tgi-input"
                    type="number"
                    defaultValue={goal || ''}
                    placeholder={String(opt.defaultGoal || '')}
                    autoFocus
                    onChange={e => setCustomGoals(prev => ({ ...prev, [opt.key]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setGoalEditKey(null); }}
                  />
                  <button className="tgi-done" onClick={() => setGoalEditKey(null)}>Done</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,

    // Step 2 - Daily Tasks
    <div key="tasks" className="step-content">
      <h2>Set your daily habits</h2>
      <p className="step-sub">These appear on every day in your calendar</p>
      <div className="task-input-row">
        <input
          className="onboard-input task-in"
          placeholder="Add a daily habit (e.g. Morning run)..."
          value={taskInput}
          onChange={e => setTaskInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addDailyTask()}
        />
        <div className="color-picks">
          {COLORS.map(c => (
            <button
              key={c}
              className={`color-dot ${taskColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setTaskColor(c)}
            />
          ))}
        </div>
        <button className="add-btn" onClick={addDailyTask}>Add</button>
      </div>
      <div className="task-list-preview">
        {dailyTasks.map((t, i) => (
          <div key={i} className="task-preview-item">
            <span className="task-dot" style={{ background: t.color }} />
            <span>{t.label}</span>
            <button className="remove-task-btn" onClick={() => removeTask(i)}>×</button>
          </div>
        ))}
        {dailyTasks.length === 0 && <p className="empty-hint">No habits added yet — you can skip and add later</p>}
      </div>
    </div>
  ];

  return (
    <div className="onboard-overlay">
      <div className="onboard-card">
        <div className="onboard-logo">
          <span className="logo-jp">一人で</span>
          <span className="logo-en">Journal</span>
          <span className="logo-meaning">ひとりで — on one's own</span>
        </div>

        <div className="step-indicator">
          {steps.map((_, i) => (
            <div key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        <div className="step-wrapper">
          {steps[step]}
        </div>

        <div className="onboard-actions">
          {step > 0 && (
            <button className="back-btn" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < steps.length - 1 ? (
            <button
              className="next-btn"
              onClick={() => {
                if (step === 0 && !name.trim()) { setError('Please enter your name'); return; }
                setGoalEditKey(null);
                setStep(s => s + 1);
              }}
            >
              Continue
            </button>
          ) : (
            <button className="next-btn finish" onClick={handleFinish}>
              Start Journaling
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
