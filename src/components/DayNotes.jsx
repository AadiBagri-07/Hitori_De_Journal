import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function DayNotes() {
  const {
    selectedDate, getDateKey, getNotesForDate,
    saveJournalEntry, saveTaskNote,
    tasks, getDayData, getTodayKey,
    setShowJournalPrompt
  } = useApp();

  const dateKey = getDateKey(selectedDate);
  const todayKey = getTodayKey();
  const isToday = dateKey === todayKey;
  const isFuture = new Date(selectedDate) > new Date();

  const dayNotes = getNotesForDate(dateKey);
  const [journalText, setJournalText] = useState(dayNotes.journal || '');
  const [journalSaved, setJournalSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [collapsed, setCollapsed] = useState(false);

  const dayData = getDayData(selectedDate);
  const completedTaskIds = dayData.completedTasks || [];

  // Sync when date changes
  useEffect(() => {
    const n = getNotesForDate(dateKey);
    setJournalText(n.journal || '');
    setJournalSaved(false);
  }, [dateKey]);

  const handleSaveJournal = () => {
    saveJournalEntry(dateKey, journalText.trim());
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const displayDate = new Date(selectedDate).toLocaleDateString('en', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  const hasContent = dayNotes.journal || Object.keys(dayNotes.taskNotes || {}).length > 0;
  const taskNotesCount = Object.keys(dayNotes.taskNotes || {}).length;

  return (
    <div className="day-notes-section">
      <div className="notes-header" onClick={() => setCollapsed(c => !c)}>
        <div className="notes-title-row">
          <h3 className="notes-title">
            Notes
            {hasContent && <span className="notes-has-dot" />}
          </h3>
          <span className="notes-date-sub">{displayDate}</span>
        </div>
        <span className="notes-collapse-icon">{collapsed ? '›' : '‹'}</span>
      </div>

      {!collapsed && (
        <>
          <div className="notes-tabs">
            <button
              className={`notes-tab ${activeTab === 'journal' ? 'active' : ''}`}
              onClick={() => setActiveTab('journal')}
            >
              Journal
            </button>
            <button
              className={`notes-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              Task Notes
              {taskNotesCount > 0 && <span className="notes-badge">{taskNotesCount}</span>}
            </button>
          </div>

          {activeTab === 'journal' && (
            <div className="journal-tab">
              {isFuture ? (
                <p className="notes-future-msg">Journal entries are for today and past dates.</p>
              ) : (
                <>
                  {isToday && !dayNotes.journal && (
                    <p className="journal-nudge">
                      How's your day going? Jot down anything on your mind.
                      {' '}
                      <button
                        className="open-journal-prompt-btn"
                        onClick={e => { e.stopPropagation(); setShowJournalPrompt(true); }}
                      >
                        Open full prompt
                      </button>
                    </p>
                  )}
                  <textarea
                    className="journal-inline-textarea"
                    placeholder={isToday ? "Write something about today..." : "Notes from this day..."}
                    value={journalText}
                    onChange={e => { setJournalText(e.target.value); setJournalSaved(false); }}
                    rows={4}
                  />
                  <div className="journal-inline-actions">
                    <span className="journal-char-count">{journalText.length} chars</span>
                    <button
                      className={`journal-inline-save ${journalSaved ? 'saved' : ''}`}
                      onClick={handleSaveJournal}
                      disabled={!journalText.trim() && !dayNotes.journal}
                    >
                      {journalSaved ? '✓ Saved' : 'Save'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="task-notes-tab">
              {tasks.length === 0 && (
                <p className="no-task-notes">No tasks added yet.</p>
              )}
              {tasks.map(task => {
                const note = dayNotes.taskNotes?.[task.id];
                const done = completedTaskIds.includes(task.id);
                if (!note && isFuture) return null;
                return (
                  <div key={task.id} className="task-note-entry">
                    <div className="task-note-header">
                      <span className="task-note-dot" style={{ background: task.color }} />
                      <span className={`task-note-label ${done ? 'done' : ''}`}>{task.label}</span>
                      {done && <span className="task-done-badge">✓</span>}
                    </div>
                    {note ? (
                      <p className="task-note-body" style={{ borderLeftColor: task.color }}>{note}</p>
                    ) : !isFuture ? (
                      <p className="task-note-empty">No note — complete the task to add one.</p>
                    ) : null}
                  </div>
                );
              })}
              {isFuture && tasks.every(t => !dayNotes.taskNotes?.[t.id]) && (
                <p className="no-task-notes">Task notes appear here after completion.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
