import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import BandwidthTracker from './pages/BandwidthTracker';
import ProgramDetail from './pages/ProgramDetail';
import WeeklyTracker from './pages/WeeklyTracker';
import MeetingsHub from './pages/MeetingsHub';
import WeeklyDigest from './pages/WeeklyDigest';
import MemoTimeline from './pages/MemoTimeline';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bandwidth" element={<BandwidthTracker />} />
            <Route path="/weekly" element={<WeeklyTracker />} />
            <Route path="/meetings" element={<MeetingsHub />} />
            <Route path="/digest" element={<WeeklyDigest />} />
            <Route path="/timeline" element={<MemoTimeline />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/program/:id" element={<ProgramDetail />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
