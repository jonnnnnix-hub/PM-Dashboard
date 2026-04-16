import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataStoreProvider } from '@/data/DataStoreProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { ProgramPage } from '@/pages/ProgramPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export default function App() {
  return (
    <DataStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="programs/:id" element={<ProgramPage />} />
            <Route path="bandwidth" element={<PlaceholderPage title="Bandwidth Tracker" phase={2} description="Track team capacity allocation across programs with sliders, capacity bars, and trend charts." />} />
            <Route path="meetings" element={<PlaceholderPage title="Meetings Hub" phase={5} description="Record, transcribe, and analyze meetings with AI-powered summarization and action item extraction." />} />
            <Route path="digest" element={<PlaceholderPage title="Weekly Digest" phase={7} description="AI-generated weekly digest summarizing all program activity, status changes, and key decisions." />} />
            <Route path="brain" element={<PlaceholderPage title="Program Brain" phase={6} description="RAG-powered AI assistant that answers questions about your programs using embedded knowledge." />} />
            <Route path="reports" element={<PlaceholderPage title="Reports" phase={8} description="Cross-program analytics, exportable reports, and trend visualization." />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" phase={3} description="Checklist templates, user preferences, and Supabase connection configuration." />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataStoreProvider>
  );
}
