import React, { Component } from 'react';
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

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: 'white', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#f43f5e' }}>Error in Integrations page</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fbbf24' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: 12 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="templates" element={<Templates />} />
        <Route path="brand" element={<Brand />} />
        <Route path="qa" element={<QA />} />
        <Route path="assets" element={<Assets />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="integrations" element={<ErrorBoundary><Integrations /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
}
