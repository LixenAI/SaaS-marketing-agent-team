import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Workflow,
  FileText,
  ClipboardCheck,
  Palette,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Target,
  Megaphone,
  UserPlus,
  PenTool,
  Share2,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── types ─── */
interface KPICard {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
}

interface AgentCard {
  name: string
  role: string
  icon: React.ElementType
  status: 'active' | 'idle' | 'offline'
  capabilities: string[]
  color: string
}

interface WorkflowCard {
  name: string
  description: string
  steps: number
  progress: number
  status: 'in-progress' | 'completed' | 'not-started'
  color: string
}

interface ActivityItem {
  type: 'agent' | 'workflow' | 'template' | 'qa'
  title: string
  time: string
  status: string
}

/* ─── data ─── */
const kpis: KPICard[] = [
  { label: 'Active Agents', value: '7', change: '+2', positive: true, icon: Bot },
  { label: 'Workflows Run', value: '24', change: '+8', positive: true, icon: Workflow },
  { label: 'Assets Generated', value: '156', change: '+23', positive: true, icon: FileText },
  { label: 'QA Score', value: '94%', change: '+3%', positive: true, icon: ClipboardCheck },
]

const agents: AgentCard[] = [
  {
    name: 'Marketing Director',
    role: 'Strategy Lead',
    icon: Target,
    status: 'active',
    capabilities: ['Weekly Planning', 'Priority Assignment', 'Final Review'],
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Campaign Agent',
    role: 'Campaign Builder',
    icon: Megaphone,
    status: 'active',
    capabilities: ['Brief Creation', 'Timeline Planning', 'Channel Strategy'],
    color: 'from-cyan-500 to-teal-600',
  },
  {
    name: 'Partner Acquisition',
    role: 'Recruitment',
    icon: UserPlus,
    status: 'active',
    capabilities: ['LinkedIn Outreach', 'Qualification', 'Recruitment Copy'],
    color: 'from-violet-500 to-indigo-600',
  },
  {
    name: 'Copywriting Agent',
    role: 'Copy Creator',
    icon: PenTool,
    status: 'idle',
    capabilities: ['Landing Pages', 'CTAs', 'Conversion Copy'],
    color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Ads Manager',
    role: 'Paid Media',
    icon: BarChart3,
    status: 'active',
    capabilities: ['Ad Angles', 'Creative Briefs', 'Paid Readiness'],
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Social Media',
    role: 'Content',
    icon: Share2,
    status: 'active',
    capabilities: ['LinkedIn', 'Instagram', 'TikTok', 'Content Calendars'],
    color: 'from-rose-500 to-pink-600',
  },
  {
    name: 'Sales Enablement',
    role: 'Sales Support',
    icon: Phone,
    status: 'idle',
    capabilities: ['Discovery', 'Demo Scripts', 'Objection Handling'],
    color: 'from-emerald-500 to-green-600',
  },
]

const workflows: WorkflowCard[] = [
  {
    name: 'Weekly Marketing Workflow',
    description: 'Plan, assign, and review weekly marketing priorities across all channels.',
    steps: 5,
    progress: 60,
    status: 'in-progress',
    color: 'bg-accent-violet',
  },
  {
    name: 'Campaign Production Workflow',
    description: 'End-to-end campaign creation from brief to asset production and review.',
    steps: 6,
    progress: 33,
    status: 'in-progress',
    color: 'bg-accent-cyan',
  },
]

const recentActivity: ActivityItem[] = [
  { type: 'agent', title: 'Marketing Director assigned 3 new priorities', time: '2 min ago', status: 'completed' },
  { type: 'workflow', title: 'Partner Recruitment Workflow completed', time: '15 min ago', status: 'completed' },
  { type: 'template', title: 'Campaign Brief template used for Med Spa Q3', time: '32 min ago', status: 'active' },
  { type: 'qa', title: 'Content QA passed for LinkedIn outreach batch', time: '1 hr ago', status: 'completed' },
  { type: 'agent', title: 'Copywriting Agent generated landing page copy', time: '2 hr ago', status: 'completed' },
  { type: 'workflow', title: 'Sales Enablement Workflow started', time: '3 hr ago', status: 'active' },
]

const quickActions = [
  { label: 'New Campaign', icon: Zap, color: 'from-accent-violet to-accent-violet-bright' },
  { label: 'LinkedIn Outreach', icon: Users, color: 'from-accent-cyan to-accent-cyan-bright' },
  { label: 'Content Calendar', icon: FileText, color: 'from-accent-emerald to-emerald-400' },
  { label: 'Run QA Check', icon: ClipboardCheck, color: 'from-accent-amber to-amber-400' },
  { label: 'Generate Asset', icon: Palette, color: 'from-accent-rose to-rose-400' },
  { label: 'View Analytics', icon: BarChart3, color: 'from-violet-500 to-accent-violet' },
]

/* ─── animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

/* ─── component ─── */
export default function Dashboard() {
  const [counts, setCounts] = useState<number[]>(kpis.map(() => 0))

  useEffect(() => {
    const targets = kpis.map((k) => parseInt(k.value.replace(/[^0-9]/g, '')) || 0)
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCounts(targets.map((t) => Math.round(t * eased)))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.1) 50%, rgba(139,92,246,0.08) 100%)',
          }}
        >
          <div className="relative z-10">
            <h1 className="font-headline text-3xl font-bold text-white md:text-4xl">
              {getGreeting()}, Admin
            </h1>
            <p className="mt-2 text-text-secondary">
              Your marketing command center is ready. Here&apos;s what&apos;s happening today.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-tertiary">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/80 to-transparent" />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            variants={fadeUp}
            className="rounded-xl border border-white/[0.06] bg-bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-accent-violet/30 hover:shadow-elevated"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {kpi.label}
              </span>
              <kpi.icon className="h-5 w-5 text-text-tertiary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-medium gradient-text">
                {kpi.label === 'QA Score' ? `${counts[i]}%` : counts[i]}
              </span>
              <span
                className={cn(
                  'flex items-center text-sm font-medium',
                  kpi.positive ? 'text-accent-emerald' : 'text-accent-rose'
                )}
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                {kpi.change}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <h2 className="mb-4 text-lg font-semibold text-text-primary font-headline">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              variants={fadeUp}
              className="flex items-center gap-2 rounded-full bg-bg-surface border border-white/[0.06] px-4 py-2.5 text-sm text-text-secondary shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-accent-violet/30"
            >
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r', action.color)}>
                <action.icon className="h-3.5 w-3.5 text-white" />
              </div>
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Agents */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary font-headline">Active Agents</h2>
            <button className="flex items-center gap-1 text-sm text-accent-violet hover:text-accent-violet-bright transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {agents.slice(0, 5).map((agent) => {
              const AgentIcon = agent.icon
              return (
                <motion.div
                  key={agent.name}
                  variants={fadeUp}
                  className="rounded-xl border border-white/[0.06] bg-bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent-violet/30 hover:shadow-glow-violet cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r',
                        agent.color
                      )}
                    >
                      <AgentIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-text-primary">{agent.name}</h3>
                        <span
                          className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            agent.status === 'active'
                              ? 'bg-accent-emerald'
                              : agent.status === 'idle'
                                ? 'bg-accent-amber'
                                : 'bg-text-disabled'
                          )}
                        />
                      </div>
                      <p className="text-xs text-text-tertiary">{agent.role}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {agent.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="rounded-full bg-bg-elevated px-2 py-0.5 text-[10px] text-text-tertiary border border-white/[0.04]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                  <button className="mt-4 w-full rounded-lg bg-bg-elevated py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-accent-violet/10 hover:text-accent-violet border border-white/[0.04]">
                    Launch
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary font-headline">Recent Activity</h2>
          <div className="rounded-xl border border-white/[0.06] bg-bg-surface p-4 shadow-card">
            <div className="space-y-1">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      item.type === 'agent'
                        ? 'bg-accent-violet/10 text-accent-violet'
                        : item.type === 'workflow'
                          ? 'bg-accent-cyan/10 text-accent-cyan'
                          : item.type === 'template'
                            ? 'bg-accent-amber/10 text-accent-amber'
                            : 'bg-accent-emerald/10 text-accent-emerald'
                    )}
                  >
                    {item.type === 'agent' ? (
                      <Bot className="h-4 w-4" />
                    ) : item.type === 'workflow' ? (
                      <Workflow className="h-4 w-4" />
                    ) : item.type === 'template' ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-secondary">{item.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-text-tertiary">{item.time}</span>
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 text-accent-emerald" />
                      ) : (
                        <Activity className="h-3 w-3 text-accent-amber" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Running Workflows */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary font-headline">Running Workflows</h2>
          <button className="flex items-center gap-1 text-sm text-accent-violet hover:text-accent-violet-bright transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {workflows.map((wf) => (
            <motion.div
              key={wf.name}
              variants={fadeUp}
              className="rounded-xl border border-white/[0.06] bg-bg-surface shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent-violet/30 hover:shadow-elevated"
            >
              <div className="relative h-32 overflow-hidden">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: wf.color === 'bg-accent-violet'
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))'
                      : 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))',
                  }}
                >
                  <Workflow className="h-16 w-16 opacity-30"
                    style={{ color: wf.color === 'bg-accent-violet' ? '#8B5CF6' : '#06B6D4' }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-surface to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      wf.status === 'in-progress'
                        ? 'bg-accent-amber/20 text-accent-amber'
                        : 'bg-accent-emerald/20 text-accent-emerald'
                    )}
                  >
                    {wf.status === 'in-progress' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {wf.status === 'in-progress' ? 'In Progress' : 'Completed'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-text-primary">{wf.name}</h3>
                <p className="mt-1 text-xs text-text-tertiary line-clamp-2">{wf.description}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-text-tertiary mb-1.5">
                    <span>{wf.steps} steps</span>
                    <span>{wf.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${wf.progress}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      className={cn('h-full rounded-full', wf.color)}
                    />
                  </div>
                </div>
                <button className="mt-4 w-full rounded-lg bg-bg-elevated py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-accent-violet/10 hover:text-accent-violet border border-white/[0.04]">
                  Continue
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
