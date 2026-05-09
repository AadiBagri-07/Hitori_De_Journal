import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const PROMPTS = [
  "How would you describe today in a few lines?",
  "What made today meaningful?",
  "What's one thing you're grateful for from today?",
  "How are you feeling as the day wraps up?",
  "What did today teach you?",
];

export default function JournalPrompt() {
  const { showJournalPrompt, setShowJournalPrompt, saveJournalEntry, getNotesForDate, getTodayKey } = useApp();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const textareaRef = useRef(null);
  const todayKey = getTodayKey();

  useEffect(() => {
    if (showJournalPrompt) {
      const existing = getNotesForDate(todayKey);
      setText(existing.journal || '');
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [showJournalPrompt]);

  if (!showJournalPrompt) return null;

  const handleSave = () => {
    if (text.trim()) {
      saveJournalEntry(todayKey, text.trim());
      setSaved(true);
      setTimeout(() => {
        setShowJournalPrompt(false);
        setSaved(false);
      }, 1200);
    } else {
      setShowJournalPrompt(false);
    }
  };

  const handleLater = () => {
    setShowJournalPrompt(false);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="journal-overlay">
      <div className="journal-prompt-card">
        <div className="journal-prompt-header">
          <div className="journal-moon">🌙</div>
          <div>
            <p className="journal-time">{timeStr}</p>
            <h3 className="journal-heading">Evening Journal</h3>
          </div>
          <button className="journal-close" onClick={handleLater}>×</button>
        </div>

        <p className="journal-question">{prompt}</p>

        {saved ? (
          <div className="journal-saved">
            <span className="saved-check">✓</span>
            <span>Saved to your journal</span>
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              className="journal-textarea"
              placeholder="Write freely — this is just for you..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey) handleSave();
                if (e.key === 'Escape') handleLater();
              }}
            />
            <div className="journal-actions">
              <button className="journal-later" onClick={handleLater}>
                Maybe later
              </button>
              <button className="journal-save-btn" onClick={handleSave}>
                {text.trim() ? 'Save entry' : 'Skip for tonight'}
              </button>
            </div>
            <p className="journal-hint">⌘↵ to save · Esc to dismiss</p>
          </>
        )}
      </div>
    </div>
  );
}
