import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Bot,
  Workflow,
  FileText,
  Shield,
  ClipboardCheck,
  Palette,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  section: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'Command Center' },
  { to: '/agents', label: 'Agents', icon: Bot, section: 'Command Center' },
  { to: '/workflows', label: 'Workflows', icon: Workflow, section: 'Operations' },
  { to: '/templates', label: 'Templates', icon: FileText, section: 'Operations' },
  { to: '/brand', label: 'Brand Config', icon: Shield, section: 'Quality' },
  { to: '/qa', label: 'QA Hub', icon: ClipboardCheck, section: 'Quality' },
  { to: '/assets', label: 'Asset Generator', icon: Palette, section: 'Assets' },
]

const sections = ['Command Center', 'Operations', 'Quality', 'Assets']

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col border-r border-white/[0.06] bg-bg-surface overflow-hidden"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan">
          <span className="text-lg font-bold text-white font-headline">L</span>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold gradient-text font-headline whitespace-nowrap"
          >
            LixenAI
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section) => (
          <div key={section}>
            {!collapsed && (
              <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                {section}
              </div>
            )}
            <div className="space-y-1">
              {navItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 group relative',
                        isActive
                          ? 'bg-accent-violet/10 text-accent-violet-bright'
                          : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary hover:translate-x-1'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-violet"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">Admin</div>
              <div className="text-xs text-text-tertiary">LixenAI Team</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-text-tertiary hover:bg-white/[0.04] hover:text-text-secondary transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
