import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BandwidthTracker from './pages/BandwidthTracker';
import ProgramDetail from './pages/ProgramDetail';
import WeeklyTracker from './pages/WeeklyTracker';
import MeetingsHub from './pages/MeetingsHub';
import WeeklyDigest from './pages/WeeklyDigest';
import Settings from './pages/Settings';
import './index.css';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar />
      <main className="ml-64">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bandwidth" element={<BandwidthTracker />} />
            <Route path="/weekly" element={<WeeklyTracker />} />
            <Route path="/meetings" element={<MeetingsHub />} />
            <Route path="/digest" element={<WeeklyDigest />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/program/:id" element={<ProgramDetail />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
