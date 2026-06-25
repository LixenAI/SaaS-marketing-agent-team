import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Workflow,
  FileText,
  Settings,
  ShieldCheck,
  Wand2,
  Link2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Command Center',
    items: [
      { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
      { label: 'Agents', icon: <Users size={20} />, path: '/agents' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Campaigns', icon: <Megaphone size={20} />, path: '/campaigns' },
      { label: 'Workflows', icon: <Workflow size={20} />, path: '/workflows' },
      { label: 'Templates', icon: <FileText size={20} />, path: '/templates' },
    ],
  },
  {
    title: 'Quality',
    items: [
      { label: 'Brand Config', icon: <ShieldCheck size={20} />, path: '/brand' },
      { label: 'QA Hub', icon: <ShieldCheck size={20} />, path: '/qa' },
    ],
  },
  {
    title: 'App',
    items: [
      { label: 'Integrations', icon: <Link2 size={20} />, path: '/integrations' },
      { label: 'Asset Generator', icon: <Wand2 size={20} />, path: '/assets' },
      { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ],
  },
];

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full bg-[#111118] border-r border-[rgba(255,255,255,0.06)] z-50 flex flex-col overflow-hidden"
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <img src="/lixenai-icon.png" alt="LixenAI" className="w-8 h-8 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.img
                src="/lixenai-logo.png"
                alt="LixenAI"
                className="h-7"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] px-3 mb-2"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item, idx) => {
                const active = isActive(item.path);
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4, ease: easeOutExpo }}
                  >
                    <Link
                      to={item.path}
                      className={
                        'flex items-center gap-3 h-10 rounded-[10px] transition-all duration-150 relative ' +
                        (collapsed ? 'justify-center px-0' : 'px-3') +
                        ' ' +
                        (active
                          ? 'bg-[rgba(139,92,246,0.1)] text-[#A78BFA]'
                          : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:translate-x-1')
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#8B5CF6] rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="shrink-0">{item.icon}</span>
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: collapse toggle */}
      <div className="shrink-0 p-3 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center w-full h-10 rounded-[10px] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
