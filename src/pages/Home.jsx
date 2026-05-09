import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Calendar from '../components/Calendar';
import TaskList from '../components/TaskList';
import TrackerPanel from '../components/TrackerPanel';
import WeatherWidget from '../components/WeatherWidget';
import WeatherAlert from '../components/WeatherAlert';
import ChallengePopup from '../components/ChallengePopup';
import JournalPrompt from '../components/JournalPrompt';
import DayNotes from '../components/DayNotes';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <div className="home-layout">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-jp-main">一人で</span>
          <span className="logo-en-main">Journal</span>
          <span className="logo-meaning-main">ひとりで</span>
        </div>
        <button className="profile-btn" onClick={() => navigate('/profile')} title="Profile & Settings">
          <span className="avatar-circle">{user?.avatar || '?'}</span>
          <span className="profile-btn-name">{user?.name}</span>
        </button>
      </header>

      {/* Weather alerts — full-width strip below header */}
      <WeatherAlert />

      {/* Desktop: side-by-side  |  Mobile: calendar on top, panels below */}
      <div className="main-content">
        <div className="calendar-col">
          <Calendar />
        </div>
        <div className="sidebar-col">
          <WeatherWidget />
          <TaskList />
          <DayNotes />
          <TrackerPanel userTrackers={user?.trackers || []} />
        </div>
      </div>

      <ChallengePopup />
      <JournalPrompt />
    </div>
  );
}

