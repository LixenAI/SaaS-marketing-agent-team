import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Check,
  X,
  Send,
  Pause,
  Square,
  Minimize2,
  Clock,
  Zap,
  CheckCircle2,
  FileText,
  BarChart3,
  Mail,
  Globe,
  Phone,
  Layout,
  Calendar,
  Target,
  PenTool,
  TrendingUp,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

type AgentStatus = 'active' | 'idle' | 'offline';
type AgentCategory = 'Strategy' | 'Content' | 'Distribution' | 'Operations';

interface Agent {
  id: number;
  name: string;
  role: string;
  category: AgentCategory;
  status: AgentStatus;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  capabilities: string[];
  lastActive: string;
  description: string;
  responsibilities: string[];
  keyOutputs: { label: string; icon: React.ReactNode }[];
  recentOutputs: { type: string; title: string; timestamp: string; status: string }[];
}

interface SessionMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  type?: 'text' | 'structured' | 'copy' | 'error';
}

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */

const agents: Agent[] = [
  {
    id: 1,
    name: 'Marketing Director',
    role: 'Strategy Lead',
    category: 'Strategy',
    status: 'active',
    color: '#8B5CF6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#A78BFA',
    icon: '/agent-director.png',
    capabilities: ['Weekly priorities', 'Team assignments', 'Final review', 'Budget allocation'],
    lastActive: '2h ago',
    description: 'The Marketing Director oversees all marketing operations, sets strategic priorities, and ensures alignment with company goals.',
    responsibilities: [
      'Set weekly marketing priorities and KPIs',
      'Assign tasks to specialized agents',
      'Review and approve final outputs',
      'Manage marketing budget allocation',
      'Report on marketing performance',
    ],
    keyOutputs: [
      { label: 'Strategy Docs', icon: <FileText size={16} /> },
      { label: 'Reports', icon: <BarChart3 size={16} /> },
      { label: 'Briefs', icon: <Target size={16} /> },
    ],
    recentOutputs: [
      { type: 'Strategy', title: 'Q2 Marketing Strategy Overview', timestamp: '2h ago', status: 'completed' },
      { type: 'Report', title: 'Weekly KPI Summary', timestamp: '1d ago', status: 'completed' },
      { type: 'Brief', title: 'Med Spa Launch Campaign Brief', timestamp: '2d ago', status: 'completed' },
      { type: 'Budget', title: 'April Budget Allocation Plan', timestamp: '3d ago', status: 'completed' },
      { type: 'Review', title: 'Partner Onboarding Content Review', timestamp: '4d ago', status: 'completed' },
    ],
  },
  {
    id: 2,
    name: 'Campaign Agent',
    role: 'Campaign Planner',
    category: 'Strategy',
    status: 'active',
    color: '#8B5CF6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#A78BFA',
    icon: '/agent-campaign.png',
    capabilities: ['Campaign briefs', 'Timeline planning', 'Channel strategy', 'Metric tracking'],
    lastActive: '30m ago',
    description: 'The Campaign Agent designs and plans marketing campaigns from concept to execution timeline.',
    responsibilities: [
      'Create comprehensive campaign briefs',
      'Build detailed execution timelines',
      'Develop multi-channel strategies',
      'Track campaign metrics and ROI',
    ],
    keyOutputs: [
      { label: 'Campaign Briefs', icon: <FileText size={16} /> },
      { label: 'Timelines', icon: <Calendar size={16} /> },
      { label: 'Reports', icon: <BarChart3 size={16} /> },
    ],
    recentOutputs: [
      { type: 'Brief', title: 'Spring Promotion Campaign Brief', timestamp: '30m ago', status: 'completed' },
      { type: 'Timeline', title: 'Q2 Campaign Calendar', timestamp: '5h ago', status: 'completed' },
      { type: 'Strategy', title: 'Multi-Channel Launch Plan', timestamp: '1d ago', status: 'completed' },
      { type: 'Report', title: 'Campaign Performance Review', timestamp: '2d ago', status: 'completed' },
    ],
  },
  {
    id: 3,
    name: 'Partner Acquisition',
    role: 'Partner Recruiter',
    category: 'Operations',
    status: 'idle',
    color: '#F59E0B',
    gradientFrom: '#10B981',
    gradientTo: '#34D399',
    icon: '/agent-partner.png',
    capabilities: ['LinkedIn outreach', 'Recruitment copy', 'Qualification', 'Pipeline mgmt'],
    lastActive: '4h ago',
    description: 'The Partner Acquisition agent handles recruitment outreach and manages the partner pipeline.',
    responsibilities: [
      'Execute LinkedIn outreach campaigns',
      'Write partner recruitment copy',
      'Qualify potential partners',
      'Manage recruitment pipeline',
    ],
    keyOutputs: [
      { label: 'Outreach Messages', icon: <Mail size={16} /> },
      { label: 'Pipeline Reports', icon: <BarChart3 size={16} /> },
      { label: 'Copy', icon: <PenTool size={16} /> },
    ],
    recentOutputs: [
      { type: 'Outreach', title: 'LinkedIn Outreach Sequence v3', timestamp: '4h ago', status: 'completed' },
      { type: 'Copy', title: 'Partner Recruitment Landing Page', timestamp: '1d ago', status: 'completed' },
      { type: 'Pipeline', title: 'Partner Pipeline Update', timestamp: '2d ago', status: 'completed' },
    ],
  },
  {
    id: 4,
    name: 'Copywriting Agent',
    role: 'Conversion Writer',
    category: 'Content',
    status: 'active',
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#22D3EE',
    icon: '/agent-copy.png',
    capabilities: ['Landing pages', 'CTAs', 'Scripts', 'Rewrites', 'Email sequences'],
    lastActive: '15m ago',
    description: 'The Copywriting Agent produces conversion-focused copy for landing pages, emails, ads, and more.',
    responsibilities: [
      'Write high-converting landing page copy',
      'Create compelling CTAs and headlines',
      'Draft video and sales scripts',
      'Rewrite and optimize existing copy',
      'Build email sequences',
    ],
    keyOutputs: [
      { label: 'Landing Pages', icon: <Layout size={16} /> },
      { label: 'Emails', icon: <Mail size={16} /> },
      { label: 'Scripts', icon: <FileText size={16} /> },
    ],
    recentOutputs: [
      { type: 'Landing Page', title: 'Med Spa Landing Page Copy', timestamp: '15m ago', status: 'completed' },
      { type: 'Email', title: 'Partner Welcome Sequence', timestamp: '2h ago', status: 'completed' },
      { type: 'Cta', title: 'CTA Variations for A/B Test', timestamp: '5h ago', status: 'completed' },
      { type: 'Script', title: 'Discovery Call Script v2', timestamp: '1d ago', status: 'completed' },
    ],
  },
  {
    id: 5,
    name: 'Ads Manager',
    role: 'Paid Media',
    category: 'Distribution',
    status: 'active',
    color: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#FBBF24',
    icon: '/agent-ads.png',
    capabilities: ['Ad angles', 'Ad copy', 'Creative briefs', 'A/B testing', 'Budget ops'],
    lastActive: '1h ago',
    description: 'The Ads Manager creates and optimizes paid media campaigns across Google, Facebook, and LinkedIn.',
    responsibilities: [
      'Develop ad angles and messaging',
      'Write high-performing ad copy',
      'Create creative briefs for designers',
      'Plan and execute A/B tests',
      'Manage ad budgets and bidding',
    ],
    keyOutputs: [
      { label: 'Ad Copy', icon: <Megaphone size={16} /> },
      { label: 'Briefs', icon: <FileText size={16} /> },
      { label: 'Reports', icon: <BarChart3 size={16} /> },
    ],
    recentOutputs: [
      { type: 'Ad Copy', title: 'Google Search Ad Variations', timestamp: '1h ago', status: 'completed' },
      { type: 'Brief', title: 'Creative Brief for Spring Campaign', timestamp: '3h ago', status: 'completed' },
      { type: 'Report', title: 'Facebook Ad Performance Report', timestamp: '1d ago', status: 'completed' },
      { type: 'Test', title: 'A/B Test Results: Headlines', timestamp: '2d ago', status: 'completed' },
    ],
  },
  {
    id: 6,
    name: 'Social Media Agent',
    role: 'Content Distributor',
    category: 'Distribution',
    status: 'active',
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#22D3EE',
    icon: '/agent-social.png',
    capabilities: ['LinkedIn posts', 'Instagram', 'TikTok', 'Content calendars', 'Scheduling'],
    lastActive: '45m ago',
    description: 'The Social Media Agent creates and schedules content across all social platforms.',
    responsibilities: [
      'Create LinkedIn posts and carousels',
      'Design Instagram content strategy',
      'Plan TikTok content and hooks',
      'Build content calendars',
      'Schedule and publish posts',
    ],
    keyOutputs: [
      { label: 'Social Posts', icon: <Globe size={16} /> },
      { label: 'Calendars', icon: <Calendar size={16} /> },
      { label: 'Reports', icon: <TrendingUp size={16} /> },
    ],
    recentOutputs: [
      { type: 'LinkedIn', title: 'Weekly LinkedIn Content Batch', timestamp: '45m ago', status: 'completed' },
      { type: 'Instagram', title: 'Instagram Story Sequence', timestamp: '3h ago', status: 'completed' },
      { type: 'Calendar', title: 'May Content Calendar', timestamp: '1d ago', status: 'completed' },
      { type: 'TikTok', title: 'TikTok Hook Scripts x10', timestamp: '2d ago', status: 'completed' },
    ],
  },
  {
    id: 7,
    name: 'Sales Enablement',
    role: 'Partner Support',
    category: 'Operations',
    status: 'offline',
    color: '#64748B',
    gradientFrom: '#10B981',
    gradientTo: '#34D399',
    icon: '/agent-sales.png',
    capabilities: ['Discovery calls', 'Demos', 'Objection handling', 'Proposals', 'Training'],
    lastActive: '2d ago',
    description: 'The Sales Enablement agent supports the sales team with scripts, proposals, and training materials.',
    responsibilities: [
      'Prepare discovery call frameworks',
      'Build demo scripts and guides',
      'Create objection handling playbooks',
      'Draft sales proposals',
      'Develop training materials',
    ],
    keyOutputs: [
      { label: 'Scripts', icon: <Phone size={16} /> },
      { label: 'Proposals', icon: <FileText size={16} /> },
      { label: 'Playbooks', icon: <BookOpenIcon size={16} /> },
    ],
    recentOutputs: [
      { type: 'Script', title: 'Med Spa Discovery Call Script', timestamp: '2d ago', status: 'completed' },
      { type: 'Proposal', title: 'Partner Proposal Template', timestamp: '3d ago', status: 'completed' },
      { type: 'Training', title: 'Sales Training Module 4', timestamp: '4d ago', status: 'completed' },
    ],
  },
];

function BookOpenIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Animation config
   ───────────────────────────────────────────── */

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easeOutExpo },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

/* ─────────────────────────────────────────────
   Status helpers
   ───────────────────────────────────────────── */

function statusColor(status: AgentStatus) {
  switch (status) {
    case 'active': return { dot: 'bg-[#10B981]', text: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
    case 'idle': return { dot: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
    case 'offline': return { dot: 'bg-[#64748B]', text: 'text-[#64748B]', bg: 'bg-[#64748B]/10' };
  }
}

function categoryColor(category: AgentCategory) {
  switch (category) {
    case 'Strategy': return 'bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/20';
    case 'Content': return 'bg-[#06B6D4]/10 text-[#22D3EE] border-[#06B6D4]/20';
    case 'Distribution': return 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/20';
    case 'Operations': return 'bg-[#10B981]/10 text-[#34D399] border-[#10B981]/20';
  }
}

/* ─────────────────────────────────────────────
   Page Component
   ───────────────────────────────────────────── */

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [showSession, setShowSession] = useState(false);
  const [sessionAgent, setSessionAgent] = useState<Agent | null>(null);

  /* Filters */
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const activeCount = agents.filter((a) => a.status === 'active').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;
  const offlineCount = agents.filter((a) => a.status === 'offline').length;

  const launchAgent = useCallback((agent: Agent) => {
    setSelectedAgent(null);
    setSessionAgent(agent);
    setShowSession(true);
  }, []);

  return (
    <div className="p-8 min-h-[calc(100dvh-64px)]">
      {/* ── Section 1: Page Header + Filters ── */}
      <section className="mb-8">
        <motion.div {...fadeUp}>
          <p className="text-[13px] text-[#64748B] mb-1">
            Command Center <span className="text-[#475569]">/</span>{' '}
            <span className="text-[#F1F5F9]">Agents</span>
          </p>
          <h1 className="text-[36px] font-headline font-bold text-[#F1F5F9] leading-[1.15] tracking-[-0.02em] mb-2">
            Marketing Agent Team
          </h1>
          <p className="text-[16px] text-[#94A3B8] leading-[1.6] max-w-[640px] mb-5">
            7 specialized agents working together to execute your marketing strategy
          </p>
        </motion.div>

        {/* Stats pills */}
        <motion.div
          className="flex flex-wrap gap-3 mb-6"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {[
            { label: `${activeCount} Active`, dot: 'bg-[#10B981]' },
            { label: `${idleCount} Idle`, dot: 'bg-[#F59E0B]' },
            { label: `${offlineCount} Offline`, dot: 'bg-[#64748B]' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easeOutBack } },
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)]"
            >
              <span className={cn('w-2 h-2 rounded-full', stat.dot)} />
              <span className="text-[13px] text-[#94A3B8]">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter bar */}
        <motion.div
          className="flex flex-wrap items-center gap-3 p-3 px-4 rounded-[16px] bg-[#111118] border border-[rgba(255,255,255,0.06)]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: easeOutExpo }}
        >
          {/* Search */}
          <div className="relative w-[320px] max-w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or capability..."
              className="w-full h-10 pl-9 pr-4 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#0A0A0F] rounded-[10px] p-1 border border-[rgba(255,255,255,0.06)]">
            {['all', 'active', 'idle', 'offline'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 capitalize',
                  statusFilter === s
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[13px] text-[#F1F5F9] outline-none focus:border-[#8B5CF6] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Strategy">Strategy</option>
            <option value="Content">Content</option>
            <option value="Distribution">Distribution</option>
            <option value="Operations">Operations</option>
          </select>

          {/* Clear filters */}
          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-[13px] text-[#F43F5E] hover:text-[#F43F5E]/80 transition-colors"
            >
              Clear All
            </button>
          )}
        </motion.div>
      </section>

      {/* ── Section 2: Agent Grid ── */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.id}
              variants={staggerItem}
              layout
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              className={cn(
                'group relative rounded-[16px] bg-[#111118] border border-[rgba(255,255,255,0.06)] overflow-hidden',
                'shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)]',
                'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]',
                'hover:border-[rgba(139,92,246,0.3)] transition-shadow duration-250'
              )}
            >
              {/* Top gradient band */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${agent.gradientFrom}, ${agent.gradientTo})` }}
              />

              <div className="p-6">
                {/* Icon + Name + Status */}
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${agent.gradientFrom}, ${agent.gradientTo})` }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2, ease: easeOutBack }}
                  >
                    <img src={agent.icon} alt={agent.name} className="w-10 h-10 object-contain" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] font-semibold text-[#F1F5F9] leading-[1.3] mb-0.5">
                      {agent.name}
                    </h3>
                    <p className="text-[13px] text-[#94A3B8] mb-2">{agent.role}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status badge */}
                      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', statusColor(agent.status).bg, statusColor(agent.status).text)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', statusColor(agent.status).dot)} />
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                      {/* Category tag */}
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium border', categoryColor(agent.category))}>
                        {agent.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-1.5 mb-4">
                  {agent.capabilities.slice(0, 4).map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-[13px] text-[#94A3B8]">
                      <Check size={14} className="text-[#10B981] shrink-0" />
                      {cap}
                    </div>
                  ))}
                </div>

                {/* Last active */}
                <p className="text-[12px] text-[#64748B] mb-4">Last active {agent.lastActive}</p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setDetailTab('overview');
                    }}
                    className="flex-1 h-9 rounded-[10px] text-[13px] font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => launchAgent(agent)}
                    className="flex-1 h-9 rounded-[10px] text-[13px] font-medium text-white hover:brightness-110 hover:scale-[1.02] transition-all duration-150"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                  >
                    Launch
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>

      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <img src="/empty-state-agents.png" alt="No agents" className="w-64 h-48 object-contain mb-4 opacity-60" />
          <p className="text-[#94A3B8] text-[16px]">No agents match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-3 text-[#8B5CF6] text-[14px] hover:text-[#A78BFA] transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {/* ── Section 3: Agent Detail Modal ── */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentDetailModal
            agent={selectedAgent}
            tab={detailTab}
            onTabChange={setDetailTab}
            onClose={() => setSelectedAgent(null)}
            onLaunch={(agent) => launchAgent(agent)}
          />
        )}
      </AnimatePresence>

      {/* ── Section 4: Agent Session Interface ── */}
      <AnimatePresence>
        {showSession && sessionAgent && (
          <AgentSessionPanel agent={sessionAgent} onClose={() => setShowSession(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Agent Detail Modal
   ───────────────────────────────────────────── */

function AgentDetailModal({
  agent,
  tab,
  onTabChange,
  onClose,
  onLaunch,
}: {
  agent: Agent;
  tab: string;
  onTabChange: (t: string) => void;
  onClose: () => void;
  onLaunch: (agent: Agent) => void;
}) {
  const tabs = ['overview', 'capabilities', 'recent', 'settings'];
  const tabLabels = ['Overview', 'Capabilities', 'Recent Output', 'Settings'];

  const s = statusColor(agent.status);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[8px]"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-[720px] max-h-[85vh] mx-4 rounded-[20px] bg-[#1A1A24] shadow-[0_24px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-[8px] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${agent.gradientFrom}, ${agent.gradientTo})` }}
            >
              <img src={agent.icon} alt={agent.name} className="w-12 h-12 object-contain" />
            </div>
            <div className="flex-1">
              <h2 className="text-[28px] font-headline font-bold text-[#F1F5F9] leading-[1.2] tracking-[-0.01em] mb-1">
                {agent.name}
              </h2>
              <p className="text-[14px] text-[#94A3B8] mb-2">
                {agent.role} <span className="text-[#64748B]">in</span>{' '}
                <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium border', categoryColor(agent.category))}>
                  {agent.category}
                </span>
              </p>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium', s.bg, s.text)}>
                <span className={cn('w-2 h-2 rounded-full', s.dot)} />
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
            </div>
            <button
              onClick={() => onLaunch(agent)}
              className="mt-2 h-10 px-5 rounded-[10px] text-[14px] font-medium text-white hover:brightness-110 hover:scale-[1.02] transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
            >
              Launch
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-6 border-b border-[rgba(255,255,255,0.06)]">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={cn(
                'relative px-4 py-3 text-[13px] font-medium transition-colors duration-150',
                tab === t ? 'text-[#A78BFA]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
            >
              {tabLabels[i]}
              {tab === t && (
                <motion.div
                  layoutId="agent-modal-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B5CF6]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[16px] text-[#94A3B8] leading-[1.6] mb-6">{agent.description}</p>

                <h4 className="text-[14px] font-semibold text-[#F1F5F9] mb-3">Primary Responsibilities</h4>
                <div className="space-y-2 mb-6">
                  {agent.responsibilities.map((r) => (
                    <div key={r} className="flex items-start gap-2 text-[14px] text-[#94A3B8]">
                      <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>

                <h4 className="text-[14px] font-semibold text-[#F1F5F9] mb-3">Key Outputs</h4>
                <div className="flex flex-wrap gap-3">
                  {agent.keyOutputs.map((o) => (
                    <div
                      key={o.label}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[#94A3B8]"
                    >
                      <span className="text-[#8B5CF6]">{o.icon}</span>
                      <span className="text-[13px]">{o.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'capabilities' && (
              <motion.div
                key="capabilities"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {agent.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className="p-4 rounded-[10px] bg-[#111118] border border-[rgba(255,255,255,0.06)]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={14} className="text-[#8B5CF6]" />
                      <span className="text-[14px] font-semibold text-[#F1F5F9]">{cap}</span>
                    </div>
                    <p className="text-[13px] text-[#64748B] ml-6">
                      {getCapabilityDescription(agent.name, cap)}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === 'recent' && (
              <motion.div
                key="recent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {agent.recentOutputs.map((out) => (
                  <div
                    key={out.title}
                    className="flex items-center gap-4 p-4 rounded-[10px] bg-[#111118] border border-[rgba(255,255,255,0.06)] hover:bg-[#22222E] transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-[#8B5CF6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-[#F1F5F9] truncate">{out.title}</p>
                      <p className="text-[12px] text-[#64748B]">{out.type}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-[#64748B]">{out.timestamp}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-medium">
                        <CheckCircle2 size={10} />
                        {out.status}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <SettingToggle label="Auto-run on task assignment" defaultOn />
                <SettingToggle label="Send notifications on completion" defaultOn />
                <SettingToggle label="Copy Director on all outputs" defaultOn={false} />
                <SettingToggle label="Use brand voice v2 (beta)" defaultOn={false} />
                <SettingToggle label="Enable verbose logging" defaultOn={false} />

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3">
                  <button className="h-10 px-5 rounded-[10px] text-[14px] font-medium text-white hover:brightness-110 transition-all duration-150"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                  >
                    Save Changes
                  </button>
                  <button className="h-10 px-5 rounded-[10px] text-[14px] font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150">
                    Reset to Defaults
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-[#F1F5F9]">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          on ? 'bg-[#8B5CF6]' : 'bg-[#2A2A38]'
        )}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
          animate={{ left: on ? 22 : 4 }}
          transition={{ duration: 0.2, ease: easeOutExpo }}
        />
      </button>
    </div>
  );
}

function getCapabilityDescription(_agentName: string, cap: string): string {
  const map: Record<string, string> = {
    'Weekly priorities': 'Generates prioritized weekly task lists based on active campaigns and goals.',
    'Team assignments': 'Distributes tasks to the appropriate agents based on workload and expertise.',
    'Final review': 'Reviews all marketing outputs for quality and brand compliance before publishing.',
    'Budget allocation': 'Optimizes marketing spend across channels and campaigns.',
    'Campaign briefs': 'Creates detailed campaign briefs with objectives, messaging, and KPIs.',
    'Timeline planning': 'Builds realistic campaign timelines with milestones and dependencies.',
    'Channel strategy': 'Recommends optimal channel mix for each campaign and audience.',
    'Metric tracking': 'Monitors campaign performance metrics and generates progress reports.',
    'LinkedIn outreach': 'Crafts personalized LinkedIn connection requests and follow-up messages.',
    'Recruitment copy': 'Writes compelling partner recruitment content for various platforms.',
    'Qualification': 'Evaluates potential partners against qualification criteria.',
    'Pipeline mgmt': 'Tracks partner prospects through the recruitment funnel.',
    'Landing pages': 'Writes high-converting landing page copy with A/B test variants.',
    'CTAs': 'Creates compelling call-to-action copy that drives conversions.',
    'Scripts': 'Drafts sales scripts, video scripts, and presentation outlines.',
    'Rewrites': 'Optimizes existing copy for better performance and clarity.',
    'Email sequences': 'Builds multi-touch email nurture sequences.',
    'Ad angles': 'Develops unique advertising angles and messaging hooks.',
    'Ad copy': 'Writes concise, high-performing ad copy for all platforms.',
    'Creative briefs': 'Creates briefs for designers and creative teams.',
    'A/B testing': 'Plans and analyzes ad creative and copy A/B tests.',
    'Budget ops': 'Manages daily ad budgets, bids, and pacing.',
    'LinkedIn posts': 'Creates engaging LinkedIn posts, carousels, and articles.',
    'Instagram': 'Designs Instagram feed posts, stories, and reel concepts.',
    'TikTok': 'Plans TikTok content with hooks, captions, and trends.',
    'Content calendars': 'Builds monthly social media content calendars.',
    'Scheduling': 'Schedules posts for optimal engagement times.',
    'Discovery calls': 'Prepares discovery call frameworks and question sets.',
    'Demos': 'Creates demo scripts and talking points for sales presentations.',
    'Objection handling': 'Builds objection handling playbooks with rebuttals.',
    'Proposals': 'Drafts professional sales proposals and SOWs.',
    'Training': 'Develops sales training modules and role-play scenarios.',
  };
  return map[cap] || `Handles ${cap} tasks for the marketing team.`;
}

/* ─────────────────────────────────────────────
   Agent Session Panel
   ───────────────────────────────────────────── */

function AgentSessionPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStatus] = useState<'running' | 'completed' | 'error'>('running');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer
  useState(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  });

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const sendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    const userMsg: SessionMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      const responses = getSimulatedResponses(agent.name, userMsg.content);
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const agentMsg: SessionMessage = {
        id: `a-${Date.now()}`,
        role: 'agent',
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString(),
        type: 'text',
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1500 + Math.random() * 2000);
  }, [inputValue, agent.name]);

  const quickActions = [
    { label: 'Generate report', icon: <BarChart3 size={14} /> },
    { label: 'Create brief', icon: <FileText size={14} /> },
    { label: 'Review output', icon: <CheckCircle2 size={14} /> },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0A0A0F]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
    >
      {/* Session Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-[#111118] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${agent.gradientFrom}, ${agent.gradientTo})` }}
          >
            <img src={agent.icon} alt={agent.name} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="text-[18px] font-semibold text-[#F1F5F9]">{agent.name}</h3>
            <div className="flex items-center gap-2">
              {sessionStatus === 'running' && (
                <span className="flex items-center gap-1.5 text-[12px] text-[#10B981]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
                  </span>
                  Running
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[14px] text-[#64748B]">{formatTime(elapsedSeconds)} elapsed</span>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F1F5F9] transition-colors" title="Pause">
              <Pause size={16} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F1F5F9] transition-colors" title="Stop">
              <Square size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F1F5F9] transition-colors"
              title="Minimize"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Left: Live Output */}
        <div className="flex-1 lg:flex-[0.6] overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg, ${agent.gradientFrom}, ${agent.gradientTo})` }}
              >
                <img src={agent.icon} alt={agent.name} className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-1">{agent.name} Session</h3>
              <p className="text-[14px] text-[#64748B] max-w-md">
                Send a message to start interacting with this agent. You can also use the quick actions on the right.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'mb-4',
                  msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-[14px] px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'bg-[#1A1A24] border border-[rgba(255,255,255,0.06)] text-[#F1F5F9]'
                  )}
                >
                  <p className="text-[14px] leading-[1.5] whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn(
                    'text-[11px] mt-1.5',
                    msg.role === 'user' ? 'text-[rgba(255,255,255,0.6)]' : 'text-[#64748B]'
                  )}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="flex items-center gap-1 px-4 py-3 rounded-[14px] bg-[#1A1A24] border border-[rgba(255,255,255,0.06)]">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Control Panel */}
        <div className="lg:flex-[0.4] border-l border-[rgba(255,255,255,0.06)] bg-[#111118] p-6 overflow-y-auto">
          {/* Quick Actions */}
          <div className="mb-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => {
                    setInputValue(qa.label);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-[10px] text-[13px] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all text-left"
                >
                  <span className="text-[#8B5CF6]">{qa.icon}</span>
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] mb-3">Send Message</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a command..."
                className="flex-1 h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[13px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6]"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-[10px] text-white hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Parameters */}
          <div className="mb-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] mb-3">Parameters</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] text-[#94A3B8] block mb-1">Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="70"
                  className="w-full accent-[#8B5CF6]"
                />
                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <label className="text-[12px] text-[#94A3B8] block mb-1">Max Output Length</label>
                <select className="w-full h-9 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[13px] text-[#F1F5F9] outline-none focus:border-[#8B5CF6]">
                  <option>Short (500 tokens)</option>
                  <option>Medium (1000 tokens)</option>
                  <option selected>Long (2000 tokens)</option>
                  <option>Extended (4000 tokens)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Session Log */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] mb-3">Session Log</h4>
            <div className="space-y-2">
              {[
                { t: formatTime(Math.max(0, elapsedSeconds - 2)), e: 'Session started' },
                { t: formatTime(Math.max(0, elapsedSeconds - 1)), e: 'Agent initialized' },
                ...(messages.length > 0 ? [{ t: messages[messages.length - 1].timestamp, e: 'Message received' }] : []),
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <Clock size={12} className="text-[#64748B] shrink-0" />
                  <span className="text-[#64748B] font-mono">{log.t}</span>
                  <span className="text-[#94A3B8]">{log.e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getSimulatedResponses(agentName: string, _userMsg: string): string[] {
  const responses: Record<string, string[]> = {
    'Marketing Director': [
      "I've reviewed the current campaign metrics. Our CPL is down 12% this week. I'll prepare a strategic brief with recommendations for next week's priorities.",
      "Based on our Q2 goals, I recommend focusing on partner acquisition this week. I'll assign the Campaign Agent to build a targeted brief.",
      "The brand compliance review is complete. All outputs are aligned with our voice guidelines. I'll send the approval summary shortly.",
    ],
    'Campaign Agent': [
      "I've drafted a comprehensive campaign brief for the Med Spa launch. It includes audience segmentation, channel strategy, and a 6-week timeline.",
      "The multi-channel campaign plan is ready. I've allocated budget across Google Ads (40%), LinkedIn (35%), and Instagram (25%).",
      "I've created a detailed timeline with 15 milestones. The first creative deliverables are due next Tuesday.",
    ],
    'Partner Acquisition': [
      "I've identified 47 qualified prospects on LinkedIn. The outreach sequence is ready with 4 touchpoints over 2 weeks.",
      "The recruitment landing page copy is complete. I've A/B tested two headlines and the first variant is converting 23% better.",
      "Partner pipeline update: 12 new prospects, 3 in qualification stage, 1 ready for discovery call.",
    ],
    'Copywriting Agent': [
      "I've written the landing page copy with 3 headline variations. The primary CTA uses urgency framing and is expected to convert at 4.2%.",
      "The email nurture sequence is complete — 5 emails over 14 days. Each email has a 35%+ open rate based on historical data.",
      "Here's the rewritten ad copy with stronger hooks. I've used power words and emotional triggers aligned with our brand voice.",
    ],
    'Ads Manager': [
      "I've created 8 ad variations for the Google Search campaign. The estimated CTR ranges from 3.8% to 5.2%.",
      "The Facebook ad campaign is optimized for conversions. I've set up retargeting audiences and lookalike segments.",
      "A/B test results are in: Headline variant B is the winner with a 22% improvement in CTR. I'll scale this variant.",
    ],
    'Social Media Agent': [
      "I've created 12 LinkedIn posts for next week. The content mix is 40% educational, 35% promotional, 25% engagement.",
      "The Instagram story sequence is ready with interactive polls and swipe-up CTAs. Estimated reach: 8.5K.",
      "May content calendar is complete. I've aligned posting times with peak engagement hours for each platform.",
    ],
    'Sales Enablement': [
      "The discovery call framework is updated with new qualifying questions. Expected call duration: 25-30 minutes.",
      "I've created a new objection handling playbook covering the top 8 objections we heard last quarter.",
      "The sales proposal template is refreshed with updated pricing and case studies. Turnaround time is now under 2 hours.",
    ],
  };
  const agentResponses = responses[agentName] || ["I've processed your request. Here's the output you requested."];
  return agentResponses;
}
