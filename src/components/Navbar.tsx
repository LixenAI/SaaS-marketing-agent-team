import { useLocation } from 'react-router-dom'
import { Search, Bell, Zap } from 'lucide-react'
import { useState } from 'react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/agents': 'Agents',
  '/workflows': 'Workflows',
  '/templates': 'Templates',
  '/brand': 'Brand Config',
  '/qa': 'QA Hub',
  '/assets': 'Asset Generator',
}

const pagePaths: Record<string, string> = {
  '/': 'Command Center',
  '/agents': 'Command Center',
  '/workflows': 'Operations',
  '/templates': 'Operations',
  '/brand': 'Quality',
  '/qa': 'Quality',
  '/assets': 'Assets',
}

export default function Navbar() {
  const location = useLocation()
  const [searchFocused, setSearchFocused] = useState(false)
  const title = pageTitles[location.pathname] || 'Dashboard'
  const path = pagePaths[location.pathname] || 'Command Center'

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.06] bg-bg-surface px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-tertiary">{path}</span>
        <span className="text-text-tertiary">/</span>
        <span className="font-medium text-text-primary">{title}</span>
      </div>

      <div className="relative">
        <div
          className={`flex items-center gap-2 rounded-lg border bg-bg-base px-3 py-2 transition-all duration-200 ${
            searchFocused
              ? 'w-[420px] border-accent-violet shadow-glow-violet'
              : 'w-[320px] border-white/[0.1]'
          }`}
        >
          <Search className="h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search agents, templates, workflows..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-tertiary font-mono">
            /
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-text-secondary hover:bg-white/[0.04] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-rose" />
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-violet to-accent-cyan px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all">
          <Zap className="h-4 w-4" />
          New Workflow
        </button>
      </div>
    </header>
  )
}
