import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function TaskList() {
  const {
    tasks, addTask, updateTask, deleteTask,
    toggleTaskForDate, selectedDate, getDayData, getDateKey,
    getNotesForDate
  } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#00d4ff');
  const [editId, setEditId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const COLORS = ['#00d4ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#9b59b6', '#ff8c42', '#e91e63', '#26c6da'];

  const dateKey = getDateKey(selectedDate);
  const dayData = getDayData(selectedDate);
  const completedTasks = dayData.completedTasks || [];
  const dayNotes = getNotesForDate(dateKey);

  const today = new Date();
  const isToday = dateKey === getDateKey(today);
  const isFuture = new Date(selectedDate) > today;

  const displayDate = new Date(selectedDate).toLocaleDateString('en', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addTask({ label: newLabel.trim(), color: newColor, type: 'daily' });
    setNewLabel('');
    setShowAdd(false);
  };

  const saveEdit = (id) => {
    if (editLabel.trim()) updateTask(id, { label: editLabel.trim() });
    setEditId(null);
  };

  const completedCount = tasks.filter(t => completedTasks.includes(t.id)).length;
  const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="task-section">
      <div className="task-section-header">
        <div>
          <h3 className="task-section-title">Tasks</h3>
          <span className="task-date-label">{displayDate}</span>
        </div>
        <button className="add-task-btn" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '−' : '+'}
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="task-progress-bar">
          <div className="task-progress-fill" style={{ width: `${pct}%` }} />
          <span className="task-progress-text">{completedCount}/{tasks.length} — {pct}%</span>
        </div>
      )}

      {showAdd && (
        <div className="add-task-form">
          <input
            className="task-input"
            placeholder="New habit or task..."
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="color-row">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-pick ${newColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="save-btn" onClick={handleAdd}>Add Task</button>
          </div>
        </div>
      )}

      <div className="task-list">
        {tasks.length === 0 && (
          <p className="no-tasks">No tasks yet. Add a daily habit above.</p>
        )}
        {tasks.map(task => {
          const done = completedTasks.includes(task.id);
          const isEditing = editId === task.id;
          const taskNote = dayNotes.taskNotes?.[task.id];

          return (
            <div key={task.id} className={`task-item ${done ? 'done' : ''}`}>
              <div className="task-main-row">
                {!isFuture ? (
                  <button
                    className="task-check"
                    style={{ borderColor: task.color, background: done ? task.color : 'transparent' }}
                    onClick={() => toggleTaskForDate(task.id, selectedDate, task.label)}
                  >
                    {done && <span className="check-icon">✓</span>}
                  </button>
                ) : (
                  <span className="task-color-dot" style={{ background: task.color }} />
                )}

                {isEditing ? (
                  <input
                    className="task-edit-input"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onBlur={() => saveEdit(task.id)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                    autoFocus
                  />
                ) : (
                  /* Wrapper enables the hover-note tooltip */
                  <span className="task-label-wrap">
                    <span
                      className={`task-label ${done ? 'strikethrough' : ''}`}
                      onDoubleClick={() => { setEditId(task.id); setEditLabel(task.label); }}
                    >
                      {task.label}
                    </span>
                    {/* Hover tooltip — only shown when task is done and has a note */}
                    {done && taskNote && (
                      <span className="task-note-tooltip" style={{ borderColor: task.color + '66' }}>
                        <span className="tnt-header" style={{ color: task.color }}>
                          Note for "{task.label}"
                        </span>
                        <span className="tnt-body">{taskNote}</span>
                      </span>
                    )}
                  </span>
                )}

                <div className="task-item-actions">
                  {taskNote && (
                    <span className="task-has-note-dot" style={{ background: task.color }} title="Has note" />
                  )}
                  <button
                    className="task-edit-btn"
                    onClick={() => { setEditId(task.id); setEditLabel(task.label); }}
                  >
                    ✎
                  </button>
                  <button className="task-del-btn" onClick={() => deleteTask(task.id)}>×</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
