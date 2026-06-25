import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Unlink,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  Users,
  MessageSquare,
  TrendingUp,
  Mail,
  Calendar,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Linkedin,
  Play,
  Globe,
  DollarSign,
  BarChart3,
  Target,
  Clock,
  FileText,
  Plus,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* TYPES */
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  lastSync: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  dataPoints: DataPoint[];
  features: string[];
  authUrl: string;
  requiresOAuth: boolean;
}

interface DataPoint {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

interface SyncJob {
  id: string;
  platform: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  recordsCount: number;
}

/* DATA */
const INTEGRATIONS: Integration[] = [
  {
    id: 'ghl',
    name: 'GoHighLevel',
    description: 'Sync contacts, pipelines, appointments, and campaigns with your GHL account.',
    icon: <Zap size={24} />,
    color: '#8B5CF6',
    connected: false,
    lastSync: null,
    syncStatus: 'idle',
    authUrl: 'https://marketplace.gohighlevel.com/oauth/chooselocation',
    requiresOAuth: true,
    features: [
      'Contact sync (two-way)',
      'Pipeline opportunity import',
      'Appointment booking sync',
      'Workflow trigger integration',
      'Custom field mapping',
      'Conversation history sync',
    ],
    dataPoints: [
      { label: 'Contacts', value: '0', change: '+0', positive: true },
      { label: 'Opportunities', value: '0', change: '+0', positive: true },
      { label: 'Appointments', value: '0', change: '+0', positive: true },
      { label: 'Conversations', value: '0', change: '+0', positive: true },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Schedule posts, manage outreach, and track engagement on LinkedIn.',
    icon: <Linkedin size={24} />,
    color: '#0077B5',
    connected: false,
    lastSync: null,
    syncStatus: 'idle',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    requiresOAuth: true,
    features: [
      'Post scheduling & publishing',
      'DM outreach automation',
      'Profile analytics sync',
      'Company page management',
      'Lead gen form integration',
      'Comment & reply management',
    ],
    dataPoints: [
      { label: 'Scheduled Posts', value: '0', change: '+0', positive: true },
      { label: 'Followers', value: '0', change: '+0', positive: true },
      { label: 'Engagement Rate', value: '0%', change: '+0%', positive: true },
      { label: 'DM Conversations', value: '0', change: '+0', positive: true },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Schedule reels, stories, and posts. Sync analytics and manage comments.',
    icon: <Instagram size={24} />,
    color: '#E4405F',
    connected: false,
    lastSync: null,
    syncStatus: 'idle',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    requiresOAuth: true,
    features: [
      'Post & reel scheduling',
      'Story publishing',
      'Hashtag performance tracking',
      'Comment auto-response',
      'Analytics dashboard sync',
      'Inbox message management',
    ],
    dataPoints: [
      { label: 'Scheduled Posts', value: '0', change: '+0', positive: true },
      { label: 'Followers', value: '0', change: '+0', positive: true },
      { label: 'Engagement Rate', value: '0%', change: '+0%', positive: true },
      { label: 'Reel Views', value: '0', change: '+0', positive: true },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Schedule TikTok videos, sync analytics, and manage your content calendar.',
    icon: <Play size={24} />,
    color: '#000000',
    connected: false,
    lastSync: null,
    syncStatus: 'idle',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    requiresOAuth: true,
    features: [
      'Video scheduling & publishing',
      'Trending sound discovery',
      'Analytics sync (views, likes, shares)',
      'Comment management',
      'Hashtag performance',
      'Content calendar integration',
    ],
    dataPoints: [
      { label: 'Scheduled Videos', value: '0', change: '+0', positive: true },
      { label: 'Followers', value: '0', change: '+0', positive: true },
      { label: 'Avg Watch Time', value: '0s', change: '+0s', positive: true },
      { label: 'Total Views', value: '0', change: '+0', positive: true },
    ],
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads',
    description: 'Manage campaigns, audiences, and ad creatives. Import performance data.',
    icon: <Facebook size={24} />,
    color: '#1877F2',
    connected: false,
    lastSync: null,
    syncStatus: 'idle',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    requiresOAuth: true,
    features: [
      'Campaign creation & management',
      'Audience sync (custom & lookalike)',
      'Ad creative upload',
      'Performance analytics import',
      'Budget & bidding automation',
      'A/B test management',
    ],
    dataPoints: [
      { label: 'Active Campaigns', value: '0', change: '+0', positive: true },
      { label: 'Ad Spend (MTD)', value: '$0', change: '+$0', positive: true },
      { label: 'ROAS', value: '0x', change: '+0x', positive: true },
      { label: 'Conversions', value: '0', change: '+0', positive: true },
    ],
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Sync search, display, and video campaigns. Import conversion data.',
    icon: <Globe size={24} />,
    color: '#EA4335',
    connected: false,
    lastSync: null,
    syncStatus: 'idle',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    requiresOAuth: true,
    features: [
      'Campaign import & sync',
      'Keyword performance tracking',
      'Search query report sync',
      'Conversion action mapping',
      'Google Analytics 4 integration',
      'Smart bidding insights',
    ],
    dataPoints: [
      { label: 'Active Campaigns', value: '0', change: '+0', positive: true },
      { label: 'Ad Spend (MTD)', value: '$0', change: '+$0', positive: true },
      { label: 'CPC', value: '$0', change: '+$0', positive: true },
      { label: 'Conversions', value: '0', change: '+0', positive: true },
    ],
  },
];

const SYNC_JOBS: SyncJob[] = [
  { id: 'sync-1', platform: 'GoHighLevel', type: 'Contact Import', status: 'completed', startedAt: '2026-06-24 14:30', recordsCount: 1240 },
  { id: 'sync-2', platform: 'LinkedIn', type: 'Post Analytics', status: 'completed', startedAt: '2026-06-24 13:00', recordsCount: 86 },
  { id: 'sync-3', platform: 'Facebook Ads', type: 'Campaign Performance', status: 'completed', startedAt: '2026-06-24 12:00', recordsCount: 342 },
  { id: 'sync-4', platform: 'Google Ads', type: 'Conversion Sync', status: 'failed', startedAt: '2026-06-24 11:45', recordsCount: 0 },
  { id: 'sync-5', platform: 'Instagram', type: 'Follower Growth', status: 'completed', startedAt: '2026-06-24 10:00', recordsCount: 56 },
];

/* STATUS BADGE */
function StatusBadge({ status }: { status: Integration['syncStatus'] }) {
  const map = {
    idle: { text: 'Idle', cls: 'bg-[#2A2A38] text-[#64748B]' },
    syncing: { text: 'Syncing...', cls: 'bg-[#8B5CF6]/15 text-[#8B5CF6]' },
    error: { text: 'Error', cls: 'bg-[#F43F5E]/15 text-[#F43F5E]' },
    success: { text: 'Synced', cls: 'bg-[#10B981]/15 text-[#10B981]' },
  };
  const s = map[status];
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium', s.cls)}>{s.text}</span>;
}

function SyncJobStatus({ status }: { status: SyncJob['status'] }) {
  const map = {
    pending: { cls: 'bg-[#F59E0B]/15 text-[#F59E0B]', label: 'Pending' },
    running: { cls: 'bg-[#8B5CF6]/15 text-[#8B5CF6]', label: 'Running' },
    completed: { cls: 'bg-[#10B981]/15 text-[#10B981]', label: 'Completed' },
    failed: { cls: 'bg-[#F43F5E]/15 text-[#F43F5E]', label: 'Failed' },
  };
  const s = map[status];
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', s.cls)}>{s.label}</span>;
}

/* INTEGRATION CARD */
function IntegrationCard({
  integration: int,
  onToggle,
  onSync,
  expanded,
  onExpand,
}: {
  integration: Integration;
  onToggle: (id: string) => void;
  onSync: (id: string) => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className={cn('bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden transition-all duration-250', int.connected && 'border-[rgba(139,92,246,0.15)]')}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${int.color}, ${int.color}88)` }}>
              {int.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#F1F5F9]">{int.name}</h3>
                {int.connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[11px] font-medium"><Check size={10} /> Connected</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2A2A38] text-[#64748B] text-[11px] font-medium"><LinkOff size={10} /> Disconnected</span>
                )}
              </div>
              <p className="text-[13px] text-[#94A3B8] mt-0.5 max-w-[400px]">{int.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {int.connected && (
              <>
                <StatusBadge status={int.syncStatus} />
                {int.lastSync && <span className="text-[11px] text-[#64748B] flex items-center gap-1"><Clock size={10} />{int.lastSync}</span>}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          {int.connected ? (
            <>
              <button onClick={() => onSync(int.id)} disabled={int.syncStatus === 'syncing'} className={cn('flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all', int.syncStatus === 'syncing' ? 'bg-[#1A1A24] text-[#64748B] cursor-not-allowed' : 'bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20')}>
                <RefreshCw size={14} className={int.syncStatus === 'syncing' ? 'animate-spin' : ''} />
                {int.syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
              <button onClick={() => onToggle(int.id)} className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[rgba(244,63,94,0.1)] transition-all">
                <LinkOff size={14} /> Disconnect
              </button>
            </>
          ) : (
            <button onClick={() => onToggle(int.id)} className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-medium text-white hover:brightness-110 transition-all" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
              <Link2 size={14} /> Connect
            </button>
          )}
          <button onClick={onExpand} className="flex items-center gap-1 px-3 py-2 rounded-[10px] text-[13px] text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all ml-auto">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: easeOutExpo }} className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-[rgba(255,255,255,0.04)]">
              {int.connected && (
                <div className="grid grid-cols-4 gap-3 mt-4 mb-5">
                  {int.dataPoints.map((dp) => (
                    <div key={dp.label} className="bg-[#0A0A0F] rounded-xl p-3 border border-[rgba(255,255,255,0.04)]">
                      <p className="text-[11px] text-[#64748B] mb-1">{dp.label}</p>
                      <p className="text-lg font-semibold text-[#F1F5F9]">{dp.value}</p>
                      {dp.change && <p className={cn('text-[11px]', dp.positive ? 'text-[#10B981]' : 'text-[#F43F5E]')}>{dp.change}</p>}
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-[13px] font-medium text-[#F1F5F9] mb-2">Available Features</p>
                <div className="grid grid-cols-2 gap-2">
                  {int.features.map((feat) => (
                    <div key={feat} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]', int.connected ? 'text-[#94A3B8] bg-[#0A0A0F]' : 'text-[#475569] bg-[#0A0A0F]/50')}>
                      <Check size={12} className={int.connected ? 'text-[#10B981]' : 'text-[#475569]'} /> {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* SYNC HISTORY */
function SyncHistory() {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3, ease: easeOutExpo }} className="mt-8">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-4">
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Sync History
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: easeOutExpo }} className="overflow-hidden">
            <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Platform</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Records</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNC_JOBS.map((job, i) => (
                    <motion.tr key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-6 py-3 text-sm text-[#F1F5F9]">{job.platform}</td>
                      <td className="px-6 py-3 text-sm text-[#94A3B8]">{job.type}</td>
                      <td className="px-6 py-3"><SyncJobStatus status={job.status} /></td>
                      <td className="px-6 py-3 text-sm text-[#94A3B8]">{job.recordsCount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-[#64748B]">{job.startedAt}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* MAIN PAGE */
export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showOAuthModal, setShowOAuthModal] = useState<string | null>(null);

  const connectedCount = integrations.filter((i) => i.connected).length;

  const handleToggle = useCallback((id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (i.connected) {
          return { ...i, connected: false, lastSync: null, syncStatus: 'idle' as const };
        } else {
          setShowOAuthModal(id);
          return i;
        }
      })
    );
  }, []);

  const handleOAuthComplete = useCallback((id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: true, lastSync: 'Just now', syncStatus: 'success' as const } : i))
    );
    setShowOAuthModal(null);
  }, []);

  const handleSync = useCallback((id: string) => {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, syncStatus: 'syncing' as const } : i)));
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, syncStatus: 'success' as const, lastSync: 'Just now', dataPoints: i.dataPoints.map((dp) => ({ ...dp, value: Math.floor(Math.random() * 5000).toString(), change: `+${Math.floor(Math.random() * 500)}` })) }
            : i
        )
      );
    }, 2000);
  }, []);

  const oauthIntegration = showOAuthModal ? integrations.find((i) => i.id === showOAuthModal) : null;

  return (
    <div className="p-8 min-h-[calc(100dvh-64px)]">
      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOutExpo }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[13px] text-[#64748B] mb-1">App <span className="text-[#475569]">/</span> <span className="text-[#F1F5F9]">Integrations</span></p>
            <h1 className="text-[36px] font-headline font-bold text-[#F1F5F9] leading-[1.15] tracking-[-0.02em] mb-2">Integrations</h1>
            <p className="text-[16px] text-[#94A3B8] leading-[1.6] max-w-[640px] mb-4">Connect your GHL account, social media platforms, and ad accounts to sync data and automate marketing workflows.</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[13px] text-[#94A3B8]"><span className="w-2 h-2 rounded-full bg-[#10B981]" />{connectedCount} connected</span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[13px] text-[#94A3B8]"><span className="w-2 h-2 rounded-full bg-[#64748B]" />{integrations.length - connectedCount} available</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {integrations.map((int) => (
          <IntegrationCard key={int.id} integration={int} onToggle={handleToggle} onSync={handleSync} expanded={expandedId === int.id} onExpand={() => setExpandedId(expandedId === int.id ? null : int.id)} />
        ))}
      </div>

      <SyncHistory />

      <AnimatePresence>
        {showOAuthModal && oauthIntegration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowOAuthModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: easeOutExpo }} className="bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-2xl w-[480px] max-w-[90vw] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${oauthIntegration.color}, ${oauthIntegration.color}88)` }}>
                    {oauthIntegration.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#F1F5F9]">Connect {oauthIntegration.name}</h3>
                    <p className="text-[13px] text-[#94A3B8]">Authorize LixenAI to access your {oauthIntegration.name} account</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[13px] font-medium text-[#F1F5F9] mb-3">This integration will have access to:</p>
                <div className="space-y-2 mb-5">
                  {oauthIntegration.features.slice(0, 4).map((feat) => (
                    <div key={feat} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0A0A0F]"><Check size={14} className="text-[#10B981] shrink-0" /><span className="text-[13px] text-[#94A3B8]">{feat}</span></div>
                  ))}
                </div>
                <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] rounded-xl p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-[#F59E0B]">Demo Mode</p>
                      <p className="text-[12px] text-[#94A3B8] mt-0.5">This is a simulated OAuth flow. In production, you would be redirected to {oauthIntegration.name}'s authorization page. To set up real OAuth, add your API credentials in Settings → API Keys.</p>
                    </div>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] text-[#94A3B8] mb-1.5">API Key / Access Token (optional for demo)</label>
                  <input type="text" placeholder={`Paste your ${oauthIntegration.name} API key...`} className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] transition-all" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleOAuthComplete(oauthIntegration.id)} className="flex-1 h-10 rounded-[10px] text-sm font-medium text-white hover:brightness-110 transition-all" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
                    <span className="flex items-center justify-center gap-2"><Link2 size={14} /> Authorize & Connect</span>
                  </button>
                  <button onClick={() => setShowOAuthModal(null)} className="h-10 px-4 rounded-[10px] text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all border border-[rgba(255,255,255,0.06)]">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
