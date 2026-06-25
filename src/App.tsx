import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Agents from './pages/Agents'
import Workflows from './pages/Workflows'
import Templates from './pages/Templates'
import Brand from './pages/Brand'
import QA from './pages/QA'
import Assets from './pages/Assets'

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
      </Route>
    </Routes>
  )
}
