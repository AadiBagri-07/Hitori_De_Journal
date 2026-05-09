import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import './styles.css';

function AppRoutes() {
  const { user, theme } = useApp();

  return (
    <div className={`app-root theme-${theme}`}>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/onboarding" />} />
        <Route path="/onboarding" element={!user ? <Onboarding /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/onboarding" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
