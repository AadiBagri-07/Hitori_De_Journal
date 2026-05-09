import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function ChallengePopup() {
  const { challengePopup, setChallengePopup, saveTaskNote, getNotesForDate } = useApp();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (challengePopup) {
      const existing = getNotesForDate(challengePopup.dateKey);
      setText(existing.taskNotes?.[challengePopup.taskId] || '');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [challengePopup]);

  if (!challengePopup) return null;

  const handleSave = () => {
    if (text.trim()) {
      saveTaskNote(challengePopup.dateKey, challengePopup.taskId, text.trim());
    }
    setChallengePopup(null);
  };

  const handleSkip = () => {
    setChallengePopup(null);
  };

  return (
    <div className="challenge-overlay" onClick={handleSkip}>
      <div className="challenge-card" onClick={e => e.stopPropagation()}>
        <div className="challenge-icon">✓</div>
        <h3 className="challenge-title">Task completed!</h3>
        <p className="challenge-task-name">"{challengePopup.taskLabel}"</p>
        <p className="challenge-prompt">
          Any challenges or notes about this one?
        </p>
        <textarea
          ref={textareaRef}
          className="challenge-textarea"
          placeholder="What went well? What was hard? (optional)"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.metaKey) handleSave();
            if (e.key === 'Escape') handleSkip();
          }}
        />
        <div className="challenge-actions">
          <button className="challenge-skip" onClick={handleSkip}>
            Skip
          </button>
          <button className="challenge-save" onClick={handleSave}>
            {text.trim() ? 'Save note' : 'Done'}
          </button>
        </div>
        <p className="challenge-hint">Esc to skip · ⌘↵ to save</p>
      </div>
    </div>
  );
}
