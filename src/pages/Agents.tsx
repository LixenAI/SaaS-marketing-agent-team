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
  UserPlus,
  Share2,
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
  icon: React.ElementType;
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
    icon: Target,
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
    icon: Megaphone,
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
    icon: UserPlus,
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
    icon: PenTool,
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
    icon: BarChart3,
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
    icon: Share2,
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
    icon: Phone,
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
          {filteredAgents.map((agent) => {
            const AgentIcon = agent.icon;
            return (
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
                      <AgentIcon className="w-8 h-8 text-white" />
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
            );
          })}
        </AnimatePresence>
      </motion.section>

      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-24 h-24 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
            <Search size={40} className="text-[#475569]" />
          </div>
          <p className="text-[#94A3B8] text-[16px] mb-1">No agents match your filters</p>
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
