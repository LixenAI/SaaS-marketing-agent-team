import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Link2Off,
  RefreshCw,
  Check,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Linkedin,
  Play,
  Globe,
  Clock,
  Plus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─── */
interface Integration {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  description: string;
  features: string[];
  apiKey?: string;
  lastSync: string | null;
  recordsSynced: number;
}

interface SyncRecord {
  id: string;
  platform: string;
  status: 'success' | 'error' | 'pending';
  records: number;
  timestamp: string;
}

/* ─── Data ─── */
const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'ghl',
    name: 'GoHighLevel',
    color: '#8B5CF6',
    connected: false,
    description: 'Sync contacts, pipelines, appointments, and conversations with your GHL sub-account.',
    features: ['Contact Sync', 'Pipeline Import', 'Appointment Sync', 'Conversation History'],
    lastSync: null,
    recordsSynced: 0,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0077B5',
    connected: false,
    description: 'Schedule posts, manage outreach campaigns, and track engagement from LinkedIn.',
    features: ['Post Scheduling', 'DM Outreach', 'Analytics Sync', 'Company Pages'],
    lastSync: null,
    recordsSynced: 0,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    connected: false,
    description: 'Schedule reels and stories, sync analytics, and manage comments.',
    features: ['Reel Scheduling', 'Story Publishing', 'Comment Management', 'Hashtag Analytics'],
    lastSync: null,
    recordsSynced: 0,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    connected: false,
    description: 'Schedule videos, find trending sounds, and sync analytics.',
    features: ['Video Scheduling', 'Trending Sounds', 'Analytics Sync', 'Comment Replies'],
    lastSync: null,
    recordsSynced: 0,
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads',
    color: '#1877F2',
    connected: false,
    description: 'Manage campaigns, sync audiences, and import performance data.',
    features: ['Campaign Management', 'Audience Sync', 'Performance Import', 'A/B Testing'],
    lastSync: null,
    recordsSynced: 0,
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    color: '#EA4335',
    connected: false,
    description: 'Sync campaigns, track keywords, and import conversion data.',
    features: ['Campaign Sync', 'Keyword Tracking', 'Conversion Import', 'Search Query Reports'],
    lastSync: null,
    recordsSynced: 0,
  },
];

const SYNC_HISTORY: SyncRecord[] = [
  { id: 's1', platform: 'ghl', status: 'success', records: 234, timestamp: '2026-06-24T10:30:00Z' },
  { id: 's2', platform: 'linkedin', status: 'success', records: 12, timestamp: '2026-06-23T14:15:00Z' },
  { id: 's3', platform: 'google-ads', status: 'error', records: 0, timestamp: '2026-06-22T09:00:00Z' },
  { id: 's4', platform: 'facebook-ads', status: 'success', records: 89, timestamp: '2026-06-21T16:45:00Z' },
];

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ─── Platform Icons ─── */
function PlatformIcon({ id, color }: { id: string; color: string }) {
  switch (id) {
    case 'ghl': return <Globe size={20} style={{ color }} />;
    case 'linkedin': return <Linkedin size={20} style={{ color }} />;
    case 'instagram': return <Instagram size={20} style={{ color }} />;
    case 'tiktok': return <Play size={20} style={{ color }} />;
    case 'facebook-ads': return <Facebook size={20} style={{ color }} />;
    case 'google-ads': return <Globe size={20} style={{ color }} />;
    default: return <Link2 size={20} style={{ color }} />;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('lixen_integrations');
    return saved ? JSON.parse(saved) : DEFAULT_INTEGRATIONS;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authIntegration, setAuthIntegration] = useState<Integration | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>(SYNC_HISTORY);
  const [showFieldMapping, setShowFieldMapping] = useState<string | null>(null);

  const persist = useCallback((next: Integration[]) => {
    setIntegrations(next);
    localStorage.setItem('lixen_integrations', JSON.stringify(next));
  }, []);

  const selected = integrations.find(i => i.id === selectedId);

  const openAuth = useCallback((integration: Integration) => {
    setAuthIntegration(integration);
    setApiKeyInput(integration.apiKey || '');
    setShowAuthModal(true);
  }, []);

  const connect = useCallback(() => {
    if (!authIntegration) return;
    const next = integrations.map(i =>
      i.id === authIntegration.id
        ? { ...i, connected: true, apiKey: apiKeyInput, lastSync: new Date().toISOString() }
        : i
    );
    persist(next);
    setShowAuthModal(false);
    setAuthIntegration(null);
    setApiKeyInput('');
  }, [authIntegration, apiKeyInput, integrations, persist]);

  const disconnect = useCallback((id: string) => {
    const next = integrations.map(i =>
      i.id === id ? { ...i, connected: false, apiKey: undefined, lastSync: null } : i
    );
    persist(next);
  }, [integrations, persist]);

  const syncNow = useCallback((id: string) => {
    setSyncing(id);
    setTimeout(() => {
      const next = integrations.map(i =>
        i.id === id ? { ...i, lastSync: new Date().toISOString(), recordsSynced: i.recordsSynced + Math.floor(Math.random() * 50) + 5 } : i
      );
      persist(next);
      const record: SyncRecord = {
        id: `s${Date.now()}`,
        platform: id,
        status: Math.random() > 0.1 ? 'success' : 'error',
        records: Math.floor(Math.random() * 100) + 1,
        timestamp: new Date().toISOString(),
      };
      setSyncHistory(prev => [record, ...prev]);
      setSyncing(null);
    }, 2000);
  }, [integrations, persist]);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0A0A0F] text-[#F1F5F9] p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">Integrations</h1>
            <p className="text-sm text-[#64748B] mt-1">Connect your external accounts and sync data</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              {integrations.filter(i => i.connected).length} connected
            </span>
            <span className="text-[#475569]">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#475569]" />
              {integrations.filter(i => !i.connected).length} available
            </span>
          </div>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: easeOutExpo }}
              className={cn(
                'relative bg-[#111118] border rounded-2xl p-5 transition-all duration-200',
                selectedId === integration.id
                  ? 'border-[rgba(139,92,246,0.3)] shadow-lg shadow-[#8B5CF6]/5'
                  : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]',
              )}
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                {integration.connected ? (
                  <span className="flex items-center gap-1 text-[11px] text-[#10B981] font-semibold">
                    <Check size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                    <Link2Off size={10} /> Disconnected
                  </span>
                )}
              </div>

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${integration.color}15` }}
                >
                  <PlatformIcon id={integration.id} color={integration.color} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F1F5F9]">{integration.name}</h3>
                  <p className="text-[11px] text-[#64748B]">{integration.features.length} features</p>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">{integration.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {integration.features.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] text-[10px] text-[#94A3B8] border border-[rgba(255,255,255,0.04)]">
                    {f}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <button
                      onClick={() => syncNow(integration.id)}
                      disabled={syncing === integration.id}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        syncing === integration.id
                          ? 'bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] cursor-wait'
                          : 'bg-[rgba(139,92,246,0.1)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.2)]',
                      )}
                    >
                      <RefreshCw size={12} className={syncing === integration.id ? 'animate-spin' : ''} />
                      {syncing === integration.id ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                      onClick={() => disconnect(integration.id)}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() => setShowFieldMapping(showFieldMapping === integration.id ? null : integration.id)}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                    >
                      {showFieldMapping === integration.id ? 'Hide' : 'Fields'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openAuth(integration)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:brightness-110 transition-all"
                  >
                    <Link2 size={12} />
                    Connect
                  </button>
                )}
              </div>

              {/* Field Mapping */}
              <AnimatePresence>
                {showFieldMapping === integration.id && integration.connected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]"
                  >
                    <FieldMappingPreview platform={integration.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Sync History */}
        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#F1F5F9] mb-4">Sync History</h2>
          {syncHistory.length === 0 ? (
            <p className="text-sm text-[#64748B]">No sync history yet.</p>
          ) : (
            <div className="space-y-2">
              {syncHistory.map(record => {
                const integration = integrations.find(i => i.id === record.platform);
                return (
                  <div key={record.id} className="flex items-center gap-4 py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      record.status === 'success' ? 'bg-[#10B981]' :
                      record.status === 'error' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]',
                    )} />
                    <span className="text-sm text-[#F1F5F9] w-28">{integration?.name || record.platform}</span>
                    <span className="text-xs text-[#64748B]">{record.records} records</span>
                    <span className="text-xs text-[#475569] ml-auto">{new Date(record.timestamp).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && authIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${authIntegration.color}15` }}>
                  <PlatformIcon id={authIntegration.id} color={authIntegration.color} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F1F5F9]">Connect {authIntegration.name}</h3>
                  <p className="text-xs text-[#64748B]">Enter your API credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1.5">API Key / Access Token</label>
                  <input
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] placeholder-[#475569] outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)] rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#94A3B8]">Your API key is stored locally in your browser. It is never sent to our servers.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 h-10 rounded-xl text-sm font-medium text-[#94A3B8] bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={connect}
                  disabled={!apiKeyInput.trim()}
                  className={cn(
                    'flex-1 h-10 rounded-xl text-sm font-semibold transition-all',
                    apiKeyInput.trim()
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:brightness-110'
                      : 'bg-[#1A1A24] text-[#475569] cursor-not-allowed',
                  )}
                >
                  Connect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Field Mapping Preview ─── */
function FieldMappingPreview({ platform }: { platform: string }) {
  const mappings: Record<string, { from: string; to: string }[]> = {
    ghl: [
      { from: 'First Name', to: 'first_name' },
      { from: 'Last Name', to: 'last_name' },
      { from: 'Email', to: 'email' },
      { from: 'Phone', to: 'phone' },
      { from: 'Company', to: 'company_name' },
    ],
    linkedin: [
      { from: 'LinkedIn ID', to: 'social_id' },
      { from: 'Headline', to: 'title' },
      { from: 'Industry', to: 'industry' },
      { from: 'Location', to: 'location' },
    ],
    default: [
      { from: 'ID', to: 'external_id' },
      { from: 'Name', to: 'full_name' },
      { from: 'Email', to: 'email' },
      { from: 'Created', to: 'created_at' },
    ],
  };

  const fieldMap = mappings[platform] || mappings.default;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Field Mapping</p>
      {fieldMap.map(m => (
        <div key={m.from} className="flex items-center gap-3 text-xs">
          <span className="text-[#94A3B8] w-24">{m.from}</span>
          <ChevronRight />
          <span className="text-[#F1F5F9] font-medium">{m.to}</span>
        </div>
      ))}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
