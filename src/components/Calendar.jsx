import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useWeather } from '../hooks/useWeather';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AddEventModal from '../pages/AddEventModal';

export default function Calendar() {
  const {
    currentMonth, setCurrentMonth,
    selectedDate, setSelectedDate,
    tasks, getDayData, getEventsForDate,
    getProductivityForDate, getDateKey
  } = useApp();

  const { getWeatherForDate, loading: weatherLoading } = useWeather();
  const [hoverDate, setHoverDate] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTargetDate, setEventTargetDate] = useState(null);
  const hoverTimerRef = useRef(null);
  const calRef = useRef(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  const todayKey = getDateKey(today);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleString('en', { month: 'long', year: 'numeric' });
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseEnter = useCallback((date, e) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = calRef.current?.getBoundingClientRect() || {};
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hoverTimerRef.current = setTimeout(() => {
      setHoverDate(date);
      setHoverPos({ x, y });
    }, 400);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoverDate(null);
  }, []);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    const dateObj = new Date(date);
    if (dateObj > today) {
      setEventTargetDate(date);
      setShowEventModal(true);
    }
  };

  const getHoverData = (dateKey) => {
    const productivity = getProductivityForDate(dateKey);
    const dayData = getDayData(dateKey);
    const completedIds = dayData.completedTasks || [];
    const completedTasks = tasks.filter(t => completedIds.includes(t.id));
    const pendingTasks = tasks.filter(t => !completedIds.includes(t.id));

    const radarData = [
      { subject: 'Tasks', value: productivity },
      { subject: 'Water', value: Math.min(100, ((dayData.water || 0) / 3000) * 100) },
      { subject: 'Sleep', value: Math.min(100, ((dayData.sleep || 0) / 8) * 100) },
      { subject: 'Steps', value: Math.min(100, ((dayData.steps || 0) / 10000) * 100) },
      { subject: 'Mood', value: Math.min(100, ((dayData.mood || 0) / 10) * 100) },
      { subject: 'Exercise', value: Math.min(100, ((dayData.exercise || 0) / 45) * 100) },
    ];

    const pieData = tasks.length > 0
      ? [
          ...completedTasks.map(t => ({ name: t.label, value: 1, color: t.color })),
          ...(pendingTasks.length > 0 ? [{ name: 'Pending', value: pendingTasks.length, color: '#333' }] : [])
        ]
      : [{ name: 'No tasks', value: 1, color: '#333' }];

    return { productivity, radarData, pieData, completedTasks, pendingTasks };
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(dateKey);
  }

  // Popup positioning
  const popupLeft = hoverPos.x > 500 ? hoverPos.x - 300 : hoverPos.x + 10;
  const popupTop = hoverPos.y > 300 ? hoverPos.y - 320 : hoverPos.y + 10;

  return (
    <div className="calendar-section" ref={calRef}>
      <div className="cal-header">
        <button className="nav-btn" onClick={prevMonth}>‹</button>
        <span className="month-label">{monthName}</span>
        <button className="nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="weekday-row">
        {WEEKDAYS.map(d => <div key={d} className="weekday-cell">{d}</div>)}
      </div>

      <div className="days-grid">
        {days.map((dateKey, i) => {
          if (!dateKey) return <div key={`empty-${i}`} className="day-empty" />;

          const isToday = dateKey === todayKey;
          const isSelected = dateKey === getDateKey(selectedDate);
          const dateObj = new Date(dateKey);
          const isFuture = dateObj > today;
          const isPast = dateObj < today && dateKey !== todayKey;
          const dayNum = parseInt(dateKey.split('-')[2]);

          const weather = getWeatherForDate(dateKey);
          const events = getEventsForDate(dateKey);
          const productivity = isPast || isToday ? getProductivityForDate(dateKey) : null;
          const dayData = getDayData(dateKey);
          const completedCount = (dayData.completedTasks || []).length;

          return (
            <div
              key={dateKey}
              className={`day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isFuture ? 'future' : ''} ${isPast ? 'past' : ''}`}
              onClick={() => handleDayClick(dateKey)}
              onMouseEnter={(e) => handleMouseEnter(dateKey, e)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="day-top">
                <span className="day-num">{dayNum}</span>
                {weather && !weatherLoading && (
                  <span className="weather-badge" title={weather.label}>
                    {weather.icon} {weather.maxTemp}°
                  </span>
                )}
              </div>

              {weather && !weatherLoading && (
                <div className="day-weather-detail">
                  <span className="rain-prob">🌧 {weather.rainProb || 0}%</span>
                  <span className="uv-info">UV {weather.uvMax || 0}</span>
                </div>
              )}

              {(isToday || isPast) && tasks.length > 0 && (
                <div className="day-progress">
                  <div className="progress-bar-mini">
                    <div
                      className="progress-fill-mini"
                      style={{ width: `${productivity}%` }}
                    />
                  </div>
                  <span className="task-count-mini">{completedCount}/{tasks.length}</span>
                </div>
              )}

              {events.length > 0 && (
                <div className="event-dots">
                  {events.slice(0, 3).map(ev => (
                    <span key={ev.id} className="event-dot" title={ev.title} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover Popup */}
      {hoverDate && (
        <div
          className="hover-popup"
          style={{ left: popupLeft, top: popupTop }}
          onMouseEnter={() => clearTimeout(hoverTimerRef.current)}
          onMouseLeave={handleMouseLeave}
        >
          {(() => {
            const { productivity, radarData, pieData, completedTasks } = getHoverData(hoverDate);
            const dateObj = new Date(hoverDate);
            const isFut = dateObj > today;
            const events = getEventsForDate(hoverDate);
            const weather = getWeatherForDate(hoverDate);

            return (
              <>
                <div className="popup-header">
                  <span className="popup-date">
                    {dateObj.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {weather && <span className="popup-weather">{weather.icon} {weather.maxTemp}°/{weather.minTemp}°</span>}
                </div>

                {isFut ? (
                  <div className="popup-future">
                    {events.length > 0 ? (
                      <div className="popup-events">
                        {events.map(ev => (
                          <div key={ev.id} className="popup-event">
                            <span className="popup-event-time">{ev.time}</span>
                            <span className="popup-event-title">{ev.title}</span>
                            {ev.destination && <span className="popup-event-loc">📍 {ev.destination}</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="popup-empty">Click to add an event</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="popup-productivity">
                      <span>Productivity: <strong>{productivity}%</strong></span>
                    </div>
                    <div className="popup-charts">
                      <div className="mini-radar">
                        <ResponsiveContainer width={150} height={120}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 9 }} />
                            <Radar dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      {tasks.length > 0 && (
                        <div className="mini-pie">
                          <ResponsiveContainer width={100} height={100}>
                            <PieChart>
                              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={40}>
                                {pieData.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(val, name) => [val, name]}
                                contentStyle={{ background: '#111', border: '1px solid #333', fontSize: 10 }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="pie-legend">
                            {pieData.slice(0, 4).map((d, i) => (
                              <div key={i} className="legend-item">
                                <span className="legend-dot" style={{ background: d.color }} />
                                <span className="legend-name">{d.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}

      {showEventModal && (
        <AddEventModal
          date={eventTargetDate}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
}
