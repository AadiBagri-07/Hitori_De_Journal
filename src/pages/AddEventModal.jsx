import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AddEventModal({ date, onClose }) {
  const { addEvent, getEventsForDate, deleteEvent } = useApp();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');

  const existingEvents = getEventsForDate(date);

  const dateObj = new Date(date);
  const displayDate = dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleSubmit = () => {
    if (!title.trim()) return;
    addEvent({ date, title: title.trim(), time, destination: destination.trim(), description: description.trim() });
    setTitle(''); setTime(''); setDestination(''); setDescription('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Events — {displayDate}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {existingEvents.length > 0 && (
          <div className="existing-events">
            {existingEvents.map(ev => (
              <div key={ev.id} className="event-item">
                <div className="event-info">
                  {ev.time && <span className="event-time">{ev.time}</span>}
                  <span className="event-title">{ev.title}</span>
                  {ev.destination && <span className="event-dest">📍 {ev.destination}</span>}
                  {ev.description && <span className="event-desc">{ev.description}</span>}
                </div>
                <button className="del-ev-btn" onClick={() => deleteEvent(ev.id)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-form">
          <h4>Add New Event</h4>
          <input
            className="modal-input"
            placeholder="Event title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className="modal-input"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <input
            className="modal-input"
            placeholder="Destination / Location"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
          <textarea
            className="modal-input modal-textarea"
            placeholder="Short description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
          <button className="modal-submit" onClick={handleSubmit} disabled={!title.trim()}>
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
}
