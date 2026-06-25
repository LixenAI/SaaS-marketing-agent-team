import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Workflows from './pages/Workflows';
import Templates from './pages/Templates';
import Brand from './pages/Brand';
import QA from './pages/QA';
import Assets from './pages/Assets';
import SettingsPage from './pages/Settings';
import Integrations from './pages/Integrations';
import Campaigns from './pages/Campaigns';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="templates" element={<Templates />} />
        <Route path="brand" element={<Brand />} />
        <Route path="qa" element={<QA />} />
        <Route path="assets" element={<Assets />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="integrations" element={<Integrations />} />
      </Route>
    </Routes>
  );
}
