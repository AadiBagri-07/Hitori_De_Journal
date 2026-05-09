import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TRACKER_CONFIG = {
  water:      { label: 'Water Intake', unit: 'ml', icon: '💧', defaultGoal: 3000, increments: [250, 500], color: '#00d4ff' },
  screenTime: { label: 'Screen Time', unit: 'min', icon: '📱', defaultGoal: 240, increments: [15, 30], color: '#ff6b6b' },
  weight:     { label: 'Weight', unit: 'kg', icon: '⚖️', defaultGoal: null, increments: [0.1, 0.5], color: '#ffd93d', isWeight: true },
  steps:      { label: 'Steps', unit: 'steps', icon: '👟', defaultGoal: 10000, increments: [500, 1000], color: '#6bcb77' },
  sleep:      { label: 'Sleep', unit: 'hrs', icon: '🌙', defaultGoal: 8, increments: [0.5, 1], color: '#9b59b6' },
  mood:       { label: 'Mood', unit: '/10', icon: '😊', defaultGoal: 10, increments: [1], color: '#ff8c42' },
  calories:   { label: 'Calories', unit: 'kcal', icon: '🥗', defaultGoal: 2000, increments: [100, 250], color: '#e91e63' },
  meditation: { label: 'Meditation', unit: 'min', icon: '🧘', defaultGoal: 20, increments: [5, 10], color: '#00bfa5' },
  reading:    { label: 'Reading', unit: 'min', icon: '📖', defaultGoal: 30, increments: [15, 30], color: '#7986cb' },
  exercise:   { label: 'Exercise', unit: 'min', icon: '🏋️', defaultGoal: 45, increments: [15, 30], color: '#26c6da' },
};

// Special Weight Card
function WeightCard({ userConfig }) {
  const { user, getDayData, updateTracker, getDateKey } = useApp();
  const color = '#ffd93d';
  const baseWeight = user?.baseWeight ?? null;

  // Build 14-day weight trend from dailyData
  const { dailyData } = useApp();
  const trend = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    const val = (dailyData[key] || {}).weight ?? null;
    // fall back to base weight if no entry
    const display = val ?? baseWeight ?? null;
    trend.push({
      date: d.toLocaleDateString('en', { weekday: 'short' }),
      weight: display,
      hasEntry: val !== null,
    });
  }

  const todayData = getDayData(new Date());
  const todayWeight = todayData.weight ?? baseWeight ?? null;
  const [inputVal, setInputVal] = useState('');
  const [editing, setEditing] = useState(false);

  const delta = baseWeight && todayWeight ? Number((todayWeight - baseWeight).toFixed(1)) : null;
  const goalWeight = userConfig?.goalWeight ?? null;

  const handleSet = () => {
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed) && parsed > 0) {
      updateTracker('weight', parsed);
    }
    setEditing(false);
    setInputVal('');
  };

  return (
    <div className="tracker-card">
      {/* Header — same pattern as every other card */}
      <div className="tracker-card-header">
        <div className="tracker-title-row">
          <span className="tracker-card-icon">⚖️</span>
          <h3 className="tracker-card-label">Weight</h3>
        </div>
        {baseWeight && (
          <span className="tracker-pct" style={{ color: '#aaa', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
            base {baseWeight} kg
          </span>
        )}
      </div>

      {/* No base set — nudge identical in style to "set-goal-btn" */}
      {!baseWeight && (
        <p className="weight-setup-nudge">
          Go to <strong>Profile → Weight</strong> to set your base weight and start tracking daily fluctuations.
        </p>
      )}

      {/* Trend graph — same structure as generic card */}
      {trend.some(t => t.weight !== null) && (
        <div className="tracker-trend">
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={trend} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-weight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              {baseWeight && <ReferenceLine y={baseWeight} stroke="#ffffff22" strokeDasharray="4 2" />}
              {goalWeight && <ReferenceLine y={goalWeight} stroke="var(--accent)" strokeOpacity={0.3} strokeDasharray="4 2" />}
              <Tooltip
                contentStyle={{ background: '#0d1117', border: `1px solid ${color}44`, fontSize: 11, borderRadius: 6 }}
                formatter={(val) => val ? [`${Number(val).toFixed(1)} kg`, 'Weight'] : ['—', 'No entry']}
              />
              <Area type="monotone" dataKey="weight" stroke={color} strokeWidth={2}
                fill="url(#grad-weight)"
                dot={(props) => {
                  const entry = trend[props.index];
                  if (!entry?.hasEntry) return <g key={props.index} />;
                  return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill={color} />;
                }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Current value — same layout as tracker-current */}
      <div className="tracker-current">
        {todayWeight ? (
          <span className="tracker-big-val" style={{ color }}>{Number(todayWeight).toFixed(1)} kg</span>
        ) : (
          <span className="tracker-big-val" style={{ color, opacity: 0.35 }}>— kg</span>
        )}
        {delta !== null && (
          <span className="weight-delta-badge" style={{
            color: delta > 0 ? '#ff6b6b' : delta < 0 ? '#6bcb77' : 'var(--text-muted)'
          }}>
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {Math.abs(delta)} kg from base
          </span>
        )}
        {goalWeight && todayWeight && (
          <span className="weight-delta-badge" style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
            · {Math.abs(Number((todayWeight - goalWeight).toFixed(1)))} kg to goal
          </span>
        )}
      </div>

      {/* Log input — styled as tracker-actions row */}
      <div className="tracker-actions">
        {!editing ? (
          <button
            className="tracker-btn inc"
            style={{ borderColor: color, color, flex: 1 }}
            onClick={() => { setEditing(true); setInputVal(todayWeight ? String(todayWeight) : ''); }}
          >
            {todayWeight ? 'Update today' : 'Log today'}
          </button>
        ) : (
          <div className="weight-edit-row">
            <input
              className="weight-edit-input"
              type="number"
              step="0.1"
              min="20" max="300"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSet(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
              placeholder={baseWeight ? String(baseWeight) : '72.5'}
              style={{ borderColor: color }}
            />
            <span className="weight-edit-unit">kg</span>
            <button className="goal-save-btn" style={{ background: color, color: '#000' }} onClick={handleSet}>✓</button>
            <button className="goal-cancel-btn" onClick={() => setEditing(false)}>×</button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackerCard({ trackerKey, userConfig }) {
  const { incrementTracker, updateTracker, getWeeklyTrend, getDayData, updateTrackerGoal } = useApp();
  const base = TRACKER_CONFIG[trackerKey] || {};

  // Weight has its own special card
  if (base.isWeight) return <WeightCard userConfig={userConfig} />;

  const color = base.color || '#00d4ff';
  const label = base.label || trackerKey;
  const icon = base.icon || '📊';
  const unit = base.unit || '';
  const increments = base.increments || [1];
  const goal = userConfig?.goal ?? base.defaultGoal;

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const trend = getWeeklyTrend(trackerKey, 7);
  const todayData = getDayData(new Date());
  const currentVal = todayData[trackerKey] || 0;
  const percentage = goal ? Math.min(100, Math.round((currentVal / goal) * 100)) : null;

  const formatVal = (v) => {
    if (trackerKey === 'water') return v >= 1000 ? `${(v / 1000).toFixed(1)}L` : `${v}ml`;
    if (trackerKey === 'steps') return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;
    if (unit === 'hrs') return `${v}h`;
    if (unit === '/10') return `${v}/10`;
    return `${v}${unit && !['steps','ml','kg','/10'].includes(unit) ? ' ' + unit : ''}`;
  };

  const handleDecrement = (amount) => {
    const newVal = Math.max(0, Number((currentVal - amount).toFixed(2)));
    updateTracker(trackerKey, newVal);
  };

  const openGoalEdit = () => { setGoalInput(goal ?? ''); setEditingGoal(true); };

  const saveGoal = () => {
    const parsed = parseFloat(goalInput);
    if (!isNaN(parsed) && parsed > 0) updateTrackerGoal(trackerKey, parsed);
    setEditingGoal(false);
  };

  return (
    <div className="tracker-card">
      <div className="tracker-card-header">
        <div className="tracker-title-row">
          <span className="tracker-card-icon">{icon}</span>
          <h3 className="tracker-card-label">{label}</h3>
        </div>
        <div className="tracker-header-right">
          {percentage !== null && <span className="tracker-pct" style={{ color }}>{percentage}%</span>}
          <button className="goal-edit-btn" onClick={openGoalEdit} title="Edit goal">⚙</button>
        </div>
      </div>

      {editingGoal && (
        <div className="goal-editor">
          <span className="goal-editor-label">Goal ({unit}):</span>
          <input
            className="goal-input"
            type="number"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditingGoal(false); }}
            autoFocus
            style={{ borderColor: color }}
          />
          <button className="goal-save-btn" style={{ background: color }} onClick={saveGoal}>✓</button>
          <button className="goal-cancel-btn" onClick={() => setEditingGoal(false)}>×</button>
        </div>
      )}

      <div className="tracker-trend">
        <ResponsiveContainer width="100%" height={70}>
          <AreaChart data={trend} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${trackerKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#666' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#0d1117', border: `1px solid ${color}44`, fontSize: 11, borderRadius: 6 }}
              labelStyle={{ color: '#888' }}
              formatter={(val) => [`${val} ${unit}`, '']}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${trackerKey})`} dot={false} activeDot={{ r: 3, fill: color }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="tracker-current">
        <span className="tracker-big-val" style={{ color }}>{formatVal(currentVal)}</span>
        {goal ? (
          <span className="tracker-goal">
            / {formatVal(goal)}
            <button className="inline-goal-btn" onClick={openGoalEdit} title="Edit goal">✎</button>
          </span>
        ) : (
          <button className="set-goal-btn" onClick={openGoalEdit} style={{ color }}>+ Set goal</button>
        )}
      </div>

      {percentage !== null && (
        <div className="tracker-progress-bar">
          <div className="tracker-progress-fill" style={{ width: `${percentage}%`, background: color }} />
        </div>
      )}

      <div className="tracker-actions">
        {trackerKey !== 'mood' && increments.map(inc => (
          <div key={inc} className="inc-dec-group">
            <button className="tracker-btn dec" onClick={() => handleDecrement(inc)}>−{inc}</button>
            <button className="tracker-btn inc" style={{ borderColor: color, color }} onClick={() => incrementTracker(trackerKey, inc)}>+{inc}</button>
          </div>
        ))}
        {trackerKey === 'mood' && (
          <div className="mood-row">
            <input type="range" min={0} max={10} step={1} value={currentVal}
              onChange={e => updateTracker(trackerKey, Number(e.target.value))}
              style={{ accentColor: color }} className="mood-slider-input" />
            <span className="mood-val" style={{ color }}>{currentVal}/10</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackerPanel({ userTrackers }) {
  return (
    <div className="tracker-panel">
      {userTrackers?.map(t => (
        <TrackerCard key={t.key} trackerKey={t.key} userConfig={t} />
      ))}
    </div>
  );
}
