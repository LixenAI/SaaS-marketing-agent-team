import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Plus, Search, Filter, ChevronRight, ChevronLeft,
  Eye, Edit2, Copy, Trash2, CheckCircle2, AlertTriangle, X,
  Target, DollarSign, Calendar, Users, BarChart3, TrendingUp,
  TrendingDown, MoreHorizontal, Save, Rocket, Shield, Link2,
  FileText, Image, Upload, Check, ChevronDown, ExternalLink,
  RefreshCw, Settings, ArrowLeft, Play, Pause, CircleDot,
  Layers, MousePointer, Globe, Building2, Briefcase, Hash,
  Clock, Zap, Award, AlertCircle, Info, XCircle, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Types ─── */
interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  startDate: string;
  endDate: string;
  dailyBudget: number;
  lifetimeBudget: number;
  targeting: TargetingConfig;
  leadForm: LeadFormConfig;
  ads: AdCreative[];
  crmConnection: CrmConnection;
  checklist: ChecklistItem[];
  metrics: CampaignMetrics;
}

interface TargetingConfig {
  jobTitles: string[];
  companySizes: string[];
  industries: string[];
  locations: string[];
  excludeCompetitors: boolean;
  bidStrategy: string;
  scheduleDays: string[];
}

interface LeadFormConfig {
  formName: string;
  privacyPolicyUrl: string;
  thankYouMessage: string;
  enableC2C: boolean;
  c2cText: string;
  fields: LeadFormField[];
  qualifyingQuestions: QualifyingQuestion[];
}

interface LeadFormField {
  key: string;
  label: string;
  required: boolean;
  enabled: boolean;
  locked?: boolean;
}

interface QualifyingQuestion {
  id: string;
  question: string;
  options: string[];
}

interface AdCreative {
  id: string;
  name: string;
  headline: string;
  introText: string;
  cta: string;
  destinationUrl: string;
  imageUrl?: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

interface CrmConnection {
  method: 'zapier' | 'api' | 'manual' | null;
  connected: boolean;
  lastSync: string | null;
  recordsSynced: number;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
  autoCheck?: boolean;
}

interface CampaignMetrics {
  leads: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
}

/* ─── Default Data ─── */
const DEFAULT_TARGETING: TargetingConfig = {
  jobTitles: ['Founder', 'CEO', 'Owner', 'Director of Operations', 'VP of Marketing'],
  companySizes: ['11-50 employees', '51-200 employees'],
  industries: ['IT Services', 'Computer Software', 'Marketing & Advertising'],
  locations: ['United States', 'Canada'],
  excludeCompetitors: true,
  bidStrategy: 'Maximum Delivery',
  scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

const DEFAULT_LEAD_FORM: LeadFormConfig = {
  formName: 'SaaS Accelerator - Lead Capture',
  privacyPolicyUrl: 'https://lixen.ai/privacy',
  thankYouMessage: 'Thank you! Our team will review your application and contact you within 24 hours to discuss your white-label SaaS launch.',
  enableC2C: true,
  c2cText: 'I consent to being contacted via phone, email, and SMS about white-label SaaS opportunities. Message and data rates may apply.',
  fields: [
    { key: 'firstName', label: 'First Name', required: true, enabled: true, locked: true },
    { key: 'lastName', label: 'Last Name', required: true, enabled: true, locked: true },
    { key: 'email', label: 'Work Email', required: true, enabled: true, locked: true },
    { key: 'company', label: 'Company Name', required: false, enabled: true },
    { key: 'jobTitle', label: 'Job Title', required: false, enabled: true },
    { key: 'phone', label: 'Phone Number', required: false, enabled: true },
    { key: 'country', label: 'Country', required: false, enabled: true },
  ],
  qualifyingQuestions: [
    { id: 'q1', question: 'Which best describes your business model?', options: ['B2B SaaS', 'E-commerce', 'Agency', 'Other'] },
    { id: 'q2', question: 'What is your current monthly revenue?', options: ['$0-10K', '$10K-50K', '$50K-100K', '$100K+'] },
    { id: 'q3', question: 'How soon are you looking to launch a white-label SaaS?', options: ['Immediately', '1-3 months', '3-6 months', 'Just exploring'] },
  ],
};

const DEFAULT_ADS: AdCreative[] = [
  {
    id: 'ad-1', name: 'Ad 1: Cost Saver',
    headline: 'Stop Paying Thousands in Monthly SaaS Fees',
    introText: 'Agencies are replacing $2,000+/mo software stacks with their own white-label SaaS platforms — built and launched in under 48 hours. Pay once. Keep 100% of revenue. Scale without limits. See if your business model qualifies.',
    cta: 'Learn More', destinationUrl: 'https://lixen.ai/apply',
    utmSource: 'linkedin', utmMedium: 'paid', utmCampaign: 'saas-accelerator-leadgen',
  },
  {
    id: 'ad-2', name: 'Ad 2: Control & Ownership',
    headline: 'Own Your Platform. Own Your Revenue.',
    introText: 'Every client you onboard through someone else\'s platform is a client you don\'t truly own. White-label SaaS gives you full control, branding, and margin. Request access to our partner program and launch your platform this week.',
    cta: 'Sign Up', destinationUrl: 'https://lixen.ai/apply',
    utmSource: 'linkedin', utmMedium: 'paid', utmCampaign: 'saas-accelerator-leadgen',
  },
  {
    id: 'ad-3', name: 'Ad 3: Speed to Market',
    headline: 'Launch a White-Label SaaS in 48 Hours — Not 6 Months',
    introText: 'Most agencies think building a SaaS means hiring developers, writing code, and waiting months. It doesn\'t. Our done-for-you system handles the build, branding, and backend — you just bring the business. Apply now and launch this week.',
    cta: 'Register', destinationUrl: 'https://lixen.ai/apply',
    utmSource: 'linkedin', utmMedium: 'paid', utmCampaign: 'saas-accelerator-leadgen',
  },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', label: 'Ad copy reviewed and approved by brand compliance', checked: false, required: true },
  { id: 'c2', label: 'Audience targeting matches ideal customer profile', checked: false, required: true },
  { id: 'c3', label: 'Daily budget ($40) and lifetime budget ($560) confirmed', checked: false, required: true },
  { id: 'c4', label: 'Lead gen form has all required fields', checked: false, required: true },
  { id: 'c5', label: 'Privacy policy URL is valid and accessible', checked: false, required: true },
  { id: 'c6', label: 'C2C consent checkbox and text included', checked: false, required: true },
  { id: 'c7', label: 'CRM connection configured (Zapier, API, or Manual)', checked: false, required: true },
  { id: 'c8', label: 'Thank you message configured for lead form', checked: false, required: true },
  { id: 'c9', label: 'UTM parameters set on all ad destination URLs', checked: false, required: true },
  { id: 'c10', label: 'Conversion tracking pixel installed', checked: false, required: false },
  { id: 'c11', label: 'Landing page reviewed and mobile-optimized', checked: false, required: false },
  { id: 'c12', label: 'All ad images meet LinkedIn specs (1200×627px)', checked: false, required: true },
  { id: 'c13', label: 'Team review completed and sign-off obtained', checked: false, required: false },
];

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'demo-1', name: 'White-label SaaS Accelerator – Lead Gen', objective: 'Lead Generation',
    status: 'active', createdAt: '2026-06-20', startDate: '2026-06-21', endDate: '2026-07-05',
    dailyBudget: 40, lifetimeBudget: 560,
    targeting: DEFAULT_TARGETING, leadForm: DEFAULT_LEAD_FORM, ads: DEFAULT_ADS,
    crmConnection: { method: 'zapier', connected: true, lastSync: '2026-06-24T10:30:00Z', recordsSynced: 24 },
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    metrics: { leads: 24, impressions: 12400, clicks: 186, ctr: 1.5, cpc: 5.38, spend: 215.2 },
  },
  {
    id: 'demo-2', name: 'Q3 Partner Recruitment Drive', objective: 'Lead Generation',
    status: 'paused', createdAt: '2026-06-15', startDate: '2026-06-16', endDate: '2026-06-30',
    dailyBudget: 60, lifetimeBudget: 840,
    targeting: { ...DEFAULT_TARGETING, jobTitles: ['VP of Sales', 'Head of Partnerships', 'Business Development'] },
    leadForm: DEFAULT_LEAD_FORM, ads: DEFAULT_ADS.slice(0, 2),
    crmConnection: { method: 'manual', connected: false, lastSync: null, recordsSynced: 0 },
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: c.id !== 'c7' && c.id !== 'c12' })),
    metrics: { leads: 18, impressions: 8900, clicks: 134, ctr: 1.5, cpc: 6.27, spend: 251.2 },
  },
  {
    id: 'demo-3', name: 'Agency SaaS Onboarding Pilot', objective: 'Lead Generation',
    status: 'completed', createdAt: '2026-05-01', startDate: '2026-05-05', endDate: '2026-05-19',
    dailyBudget: 35, lifetimeBudget: 490,
    targeting: DEFAULT_TARGETING, leadForm: DEFAULT_LEAD_FORM, ads: DEFAULT_ADS,
    crmConnection: { method: 'api', connected: true, lastSync: '2026-05-20T08:00:00Z', recordsSynced: 47 },
    checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, checked: true })),
    metrics: { leads: 47, impressions: 28300, clicks: 452, ctr: 1.6, cpc: 4.42, spend: 490 },
  },
];

/* ─── Helpers ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

function generateId() {
  return 'camp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function addDaysStr(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

const statusConfig = {
  draft: { color: '#64748B', bg: 'rgba(100,116,139,0.15)', label: 'Draft', icon: CircleDot },
  active: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'Active', icon: Play },
  paused: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'Paused', icon: Pause },
  completed: { color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', label: 'Completed', icon: CheckCircle2 },
};

/* ─── Main Component ─── */
export default function Campaigns() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [view, setView] = useState<'list' | 'wizard' | 'detail'>('list');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Wizard state
  const [campaignName, setCampaignName] = useState('White-label SaaS Accelerator – Lead Gen');
  const [objective, setObjective] = useState('Lead Generation');
  const [targeting, setTargeting] = useState<TargetingConfig>(DEFAULT_TARGETING);
  const [dailyBudget, setDailyBudget] = useState(40);
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(addDaysStr(getTodayStr(), 14));
  const [leadForm, setLeadForm] = useState<LeadFormConfig>(DEFAULT_LEAD_FORM);
  const [ads, setAds] = useState<AdCreative[]>(DEFAULT_ADS);
  const [activeAdTab, setActiveAdTab] = useState(0);
  const [crmConnection, setCrmConnection] = useState<CrmConnection>({ method: null, connected: false, lastSync: null, recordsSynced: 0 });
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST.map(c => ({ ...c })));

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lixen_campaigns');
    if (saved) {
      try { setCampaigns(JSON.parse(saved)); } catch { setCampaigns(DEMO_CAMPAIGNS); }
    } else {
      setCampaigns(DEMO_CAMPAIGNS);
      localStorage.setItem('lixen_campaigns', JSON.stringify(DEMO_CAMPAIGNS));
    }
  }, []);

  // Persist
  const persist = useCallback((next: Campaign[]) => {
    setCampaigns(next);
    localStorage.setItem('lixen_campaigns', JSON.stringify(next));
  }, []);

  // Derived
  const lifetimeBudget = dailyBudget * Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));

  const filteredCampaigns = useMemo(() => {
    let list = [...campaigns];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.objective.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(c => c.status === statusFilter);
    }
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'budget') list.sort((a, b) => b.lifetimeBudget - a.lifetimeBudget);
    return list;
  }, [campaigns, searchQuery, statusFilter, sortBy]);

  const selectedCampaign = campaigns.find(c => c.id === detailId) || null;

  // Actions
  const openWizard = useCallback((editCampaign?: Campaign) => {
    if (editCampaign) {
      setEditingCampaign(editCampaign);
      setCampaignName(editCampaign.name);
      setObjective(editCampaign.objective);
      setTargeting(editCampaign.targeting);
      setDailyBudget(editCampaign.dailyBudget);
      setStartDate(editCampaign.startDate);
      setEndDate(editCampaign.endDate);
      setLeadForm(editCampaign.leadForm);
      setAds(editCampaign.ads);
      setCrmConnection(editCampaign.crmConnection);
      setChecklist(editCampaign.checklist.map(c => ({ ...c })));
    } else {
      setEditingCampaign(null);
      setCampaignName('White-label SaaS Accelerator – Lead Gen');
      setObjective('Lead Generation');
      setTargeting(DEFAULT_TARGETING);
      setDailyBudget(40);
      setStartDate(getTodayStr());
      setEndDate(addDaysStr(getTodayStr(), 14));
      setLeadForm(DEFAULT_LEAD_FORM);
      setAds(DEFAULT_ADS);
      setCrmConnection({ method: null, connected: false, lastSync: null, recordsSynced: 0 });
      setChecklist(DEFAULT_CHECKLIST.map(c => ({ ...c })));
    }
    setWizardStep(0);
    setView('wizard');
  }, []);

  const openDetail = useCallback((id: string) => {
    setDetailId(id);
    setView('detail');
  }, []);

  const backToList = useCallback(() => {
    setView('list');
    setDetailId(null);
    setEditingCampaign(null);
  }, []);

  const saveCampaign = useCallback((status: 'draft' | 'active') => {
    const campaign: Campaign = {
      id: editingCampaign?.id || generateId(),
      name: campaignName,
      objective,
      status,
      createdAt: editingCampaign?.createdAt || getTodayStr(),
      startDate,
      endDate,
      dailyBudget,
      lifetimeBudget: lifetimeBudget,
      targeting,
      leadForm,
      ads,
      crmConnection,
      checklist,
      metrics: editingCampaign?.metrics || { leads: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0 },
    };
    const next = editingCampaign
      ? campaigns.map(c => c.id === editingCampaign.id ? campaign : c)
      : [...campaigns, campaign];
    persist(next);
    setView('list');
    setEditingCampaign(null);
  }, [editingCampaign, campaignName, objective, startDate, endDate, dailyBudget, lifetimeBudget, targeting, leadForm, ads, crmConnection, checklist, campaigns, persist]);

  const deleteCampaign = useCallback((id: string) => {
    const next = campaigns.filter(c => c.id !== id);
    persist(next);
    if (detailId === id) backToList();
  }, [campaigns, detailId, persist, backToList]);

  const duplicateCampaign = useCallback((campaign: Campaign) => {
    const copy: Campaign = {
      ...campaign,
      id: generateId(),
      name: campaign.name + ' (Copy)',
      status: 'draft',
      createdAt: getTodayStr(),
      metrics: { leads: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0 },
      checklist: campaign.checklist.map(c => ({ ...c, checked: false })),
    };
    persist([...campaigns, copy]);
  }, [campaigns, persist]);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  }, []);

  const checklistProgress = useMemo(() => {
    const required = checklist.filter(c => c.required);
    return { checked: required.filter(c => c.checked).length, total: required.length };
  }, [checklist]);

  const canLaunch = checklistProgress.checked === checklistProgress.total;

  // ─── RENDER ───
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0A0A0F] text-[#F1F5F9]">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CampaignList
              campaigns={filteredCampaigns}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onCreate={() => openWizard()}
              onView={openDetail}
              onEdit={(c) => openWizard(c)}
              onDuplicate={duplicateCampaign}
              onDelete={deleteCampaign}
            />
          </motion.div>
        )}
        {view === 'wizard' && (
          <motion.div key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <CampaignWizard
              step={wizardStep}
              setStep={setWizardStep}
              campaignName={campaignName}
              setCampaignName={setCampaignName}
              objective={objective}
              setObjective={setObjective}
              targeting={targeting}
              setTargeting={setTargeting}
              dailyBudget={dailyBudget}
              setDailyBudget={setDailyBudget}
              lifetimeBudget={lifetimeBudget}
              totalDays={totalDays}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              leadForm={leadForm}
              setLeadForm={setLeadForm}
              ads={ads}
              setAds={setAds}
              activeAdTab={activeAdTab}
              setActiveAdTab={setActiveAdTab}
              crmConnection={crmConnection}
              setCrmConnection={setCrmConnection}
              checklist={checklist}
              toggleChecklistItem={toggleChecklistItem}
              checklistProgress={checklistProgress}
              canLaunch={canLaunch}
              onSaveDraft={() => saveCampaign('draft')}
              onLaunch={() => saveCampaign('active')}
              onCancel={backToList}
              isEditing={!!editingCampaign}
            />
          </motion.div>
        )}
        {view === 'detail' && selectedCampaign && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CampaignDetail
              campaign={selectedCampaign}
              onBack={backToList}
              onEdit={() => openWizard(selectedCampaign)}
              onDuplicate={() => duplicateCampaign(selectedCampaign)}
              onDelete={() => deleteCampaign(selectedCampaign.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAMPAIGN LIST
   ═══════════════════════════════════════════════════════════════════ */
function CampaignList({
  campaigns, searchQuery, setSearchQuery, statusFilter, setStatusFilter,
  sortBy, setSortBy, onCreate, onView, onEdit, onDuplicate, onDelete,
}: {
  campaigns: Campaign[]; searchQuery: string; setSearchQuery: (s: string) => void;
  statusFilter: string; setStatusFilter: (s: string) => void;
  sortBy: string; setSortBy: (s: string) => void;
  onCreate: () => void; onView: (id: string) => void; onEdit: (c: Campaign) => void;
  onDuplicate: (c: Campaign) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">Campaigns</h1>
          <p className="text-sm text-[#64748B] mt-1">Create and manage LinkedIn lead generation campaigns</p>
        </div>
        <button
          onClick={onCreate}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
            'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white',
            'hover:brightness-110 transition-all duration-200 shadow-lg shadow-[#8B5CF6]/20',
          )}
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#111118] border border-[rgba(255,255,255,0.06)] text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-[#111118] border border-[rgba(255,255,255,0.06)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-4 rounded-xl bg-[#111118] border border-[rgba(255,255,255,0.06)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
          <option value="budget">Budget</option>
        </select>
      </div>

      {/* Campaign Cards */}
      {campaigns.length === 0 ? (
        <EmptyState onCreate={onCreate} />
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: easeOutExpo }}
              className="group bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:border-[rgba(139,92,246,0.2)] transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left: Name + Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <StatusBadge status={campaign.status} />
                    <h3 className="text-base font-semibold text-[#F1F5F9] truncate">{campaign.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><Target size={12} />{campaign.objective}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDateRange(campaign.startDate, campaign.endDate)}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} />${campaign.dailyBudget}/day</span>
                    <span className="flex items-center gap-1"><Globe size={12} />{campaign.targeting.locations.join(', ')}</span>
                  </div>
                </div>

                {/* Center: Metrics */}
                <div className="flex items-center gap-6 text-center">
                  <MetricBox label="Leads" value={campaign.metrics.leads} trend={campaign.metrics.leads > 20 ? 'up' : 'neutral'} />
                  <MetricBox label="Impressions" value={formatNumber(campaign.metrics.impressions)} />
                  <MetricBox label="Clicks" value={campaign.metrics.clicks} />
                  <MetricBox label="CTR" value={`${campaign.metrics.ctr}%`} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                  <ActionBtn icon={<Eye size={15} />} label="View" onClick={() => onView(campaign.id)} />
                  <ActionBtn icon={<Edit2 size={15} />} label="Edit" onClick={() => onEdit(campaign)} />
                  <ActionBtn icon={<Copy size={15} />} label="Duplicate" onClick={() => onDuplicate(campaign)} />
                  <ActionBtn icon={<Trash2 size={15} />} label="Delete" onClick={() => onDelete(campaign.id)} danger />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function MetricBox({ label, value, trend }: { label: string; value: string | number; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div>
      <p className="text-lg font-bold text-[#F1F5F9]">{value}</p>
      <div className="flex items-center justify-center gap-1">
        {trend === 'up' && <TrendingUp size={10} className="text-[#10B981]" />}
        {trend === 'down' && <TrendingDown size={10} className="text-[#EF4444]" />}
        <p className="text-[11px] text-[#64748B]">{label}</p>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        danger
          ? 'text-[#94A3B8] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]'
          : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]',
      )}
    >
      {icon}
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 flex items-center justify-center mb-5">
        <Megaphone size={36} className="text-[#8B5CF6]" />
      </div>
      <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">No campaigns yet</h3>
      <p className="text-sm text-[#64748B] mb-6 max-w-sm">Create your first LinkedIn lead generation campaign and start capturing qualified leads for your white-label SaaS.</p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:brightness-110 transition-all"
      >
        <Plus size={18} />
        Create Campaign
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAMPAIGN WIZARD
   ═══════════════════════════════════════════════════════════════════ */
const WIZARD_STEPS = [
  { label: 'Campaign Setup', icon: Target },
  { label: 'Lead Gen Form', icon: FileText },
  { label: 'Ad Creatives', icon: Image },
  { label: 'CRM Connection', icon: Link2 },
  { label: 'Pre-Launch Check', icon: Shield },
];

function CampaignWizard(props: WizardProps) {
  const { step, setStep, onCancel, onSaveDraft, onLaunch, canLaunch, isEditing, checklistProgress } = props;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0A0A0F]">
      {/* Wizard Header */}
      <div className="sticky top-0 z-30 bg-[#0A0A0F]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={onCancel} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-[#F1F5F9]">{isEditing ? 'Edit Campaign' : 'Create Campaign'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSaveDraft}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#94A3B8] bg-[#111118] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                <Save size={15} />
                Save as Draft
              </button>
              {step === 4 && (
                <button
                  onClick={onLaunch}
                  disabled={!canLaunch}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                    canLaunch
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:brightness-110 shadow-lg shadow-[#8B5CF6]/20'
                      : 'bg-[#1A1A24] text-[#475569] cursor-not-allowed',
                  )}
                >
                  <Rocket size={16} />
                  Launch Campaign
                </button>
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={i}
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive ? 'bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]' :
                    isDone ? 'text-[#10B981]' : 'text-[#64748B]',
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold',
                    isActive ? 'bg-[#8B5CF6] text-white' :
                    isDone ? 'bg-[#10B981] text-white' : 'bg-[#1A1A24] text-[#64748B]',
                  )}>
                    {isDone ? <Check size={12} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                  {i < WIZARD_STEPS.length - 1 && <ChevronRight size={14} className="text-[#475569] ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Setup key="s1" {...props} />}
          {step === 1 && <Step2LeadForm key="s2" {...props} />}
          {step === 2 && <Step3Ads key="s3" {...props} />}
          {step === 3 && <Step4CRM key="s4" {...props} />}
          {step === 4 && <Step5Checklist key="s5" {...props} />}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-30 bg-[#0A0A0F]/95 backdrop-blur-sm border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors', step === 0 ? 'text-[#475569] cursor-not-allowed' : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]')}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="text-sm text-[#64748B]">
            Step {step + 1} of {WIZARD_STEPS.length}
          </div>
          <button
            onClick={() => setStep(Math.min(4, step + 1))}
            disabled={step === 4}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors', step === 4 ? 'text-[#475569] cursor-not-allowed' : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]')}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Campaign Setup ─── */
function Step1Setup({
  campaignName, setCampaignName, objective, setObjective, targeting, setTargeting,
  dailyBudget, setDailyBudget, lifetimeBudget, totalDays, startDate, setStartDate, endDate, setEndDate,
}: WizardProps) {
  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(a => a !== val) : [...arr, val];

  const jobTitleOptions = ['Founder', 'CEO', 'Owner', 'Director of Operations', 'VP of Marketing', 'Head of Growth', 'E-commerce Manager', 'Business Development Manager', 'VP of Sales', 'Head of Partnerships'];
  const companySizeOptions = ['11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1001-5000 employees'];
  const industryOptions = ['IT Services', 'Computer Software', 'Financial Services', 'Marketing & Advertising', 'Internet', 'Telecommunications'];
  const locationOptions = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];
  const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h3 className="text-xl font-bold text-[#F1F5F9]">Campaign Setup</h3>

      {/* Campaign Basics */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Campaign Basics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Campaign Name</label>
            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]" />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Objective</label>
            <select value={objective} onChange={e => setObjective(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]">
              <option>Lead Generation</option>
              <option>Website Conversions</option>
              <option>Brand Awareness</option>
              <option>Website Visits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audience Targeting */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Audience Targeting</h4>
          <span className="text-xs text-[#64748B]">{targeting.jobTitles.length + targeting.companySizes.length + targeting.industries.length + targeting.locations.length} criteria selected</span>
        </div>

        <ChipSelector label="Job Titles" options={jobTitleOptions} selected={targeting.jobTitles} onChange={v => setTargeting({ ...targeting, jobTitles: toggleArray(targeting.jobTitles, v) })} />
        <ChipSelector label="Company Size" options={companySizeOptions} selected={targeting.companySizes} onChange={v => setTargeting({ ...targeting, companySizes: toggleArray(targeting.companySizes, v) })} />
        <ChipSelector label="Industries" options={industryOptions} selected={targeting.industries} onChange={v => setTargeting({ ...targeting, industries: toggleArray(targeting.industries, v) })} />
        <ChipSelector label="Locations" options={locationOptions} selected={targeting.locations} onChange={v => setTargeting({ ...targeting, locations: toggleArray(targeting.locations, v) })} />

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setTargeting({ ...targeting, excludeCompetitors: !targeting.excludeCompetitors })}
            className={cn('relative w-11 h-6 rounded-full transition-colors', targeting.excludeCompetitors ? 'bg-[#8B5CF6]' : 'bg-[#2A2A38]')}
          >
            <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform', targeting.excludeCompetitors ? 'left-[22px]' : 'left-0.5')} />
          </button>
          <span className="text-sm text-[#94A3B8]">Exclude competitors from targeting</span>
        </div>
      </div>

      {/* Budget & Schedule */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Budget & Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Daily Budget ($)</label>
            <input type="number" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} min={10} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]" />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Lifetime Budget ($)</label>
            <div className="h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] flex items-center">${lifetimeBudget}</div>
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Bid Strategy</label>
            <select value={targeting.bidStrategy} onChange={e => setTargeting({ ...targeting, bidStrategy: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]">
              <option>Maximum Delivery</option>
              <option>Manual CPC</option>
              <option>Enhanced CPC</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]" />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]" />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Duration</label>
            <div className="h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] flex items-center gap-2">
              <Clock size={14} className="text-[#8B5CF6]" /> {totalDays} days
            </div>
          </div>
        </div>

        {/* Schedule Days */}
        <div className="pt-2">
          <label className="block text-sm text-[#94A3B8] mb-2">Run on Days</label>
          <div className="flex gap-2">
            {dayOptions.map(day => (
              <button
                key={day}
                onClick={() => setTargeting({ ...targeting, scheduleDays: toggleArray(targeting.scheduleDays, day) })}
                className={cn(
                  'w-10 h-10 rounded-xl text-xs font-semibold transition-all',
                  targeting.scheduleDays.includes(day)
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[#0A0A0F] text-[#64748B] border border-[rgba(255,255,255,0.06)] hover:text-[#94A3B8]',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ChipSelector({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-[#94A3B8] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              selected.includes(opt)
                ? 'bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border-[rgba(139,92,246,0.3)]'
                : 'bg-[#0A0A0F] text-[#64748B] border-[rgba(255,255,255,0.06)] hover:text-[#94A3B8]',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 2: Lead Gen Form ─── */
function Step2LeadForm({ leadForm, setLeadForm }: WizardProps) {
  const toggleField = (key: string) => {
    setLeadForm({
      ...leadForm,
      fields: leadForm.fields.map(f => f.key === key && !f.locked ? { ...f, enabled: !f.enabled } : f),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h3 className="text-xl font-bold text-[#F1F5F9]">Lead Gen Form</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Settings */}
        <div className="space-y-5">
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Form Settings</h4>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">Form Name</label>
              <input value={leadForm.formName} onChange={e => setLeadForm({ ...leadForm, formName: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]" />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">Privacy Policy URL</label>
              <input value={leadForm.privacyPolicyUrl} onChange={e => setLeadForm({ ...leadForm, privacyPolicyUrl: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]" />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">Thank You Message</label>
              <textarea value={leadForm.thankYouMessage} onChange={e => setLeadForm({ ...leadForm, thankYouMessage: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] resize-none" />
            </div>
          </div>

          {/* C2C Consent */}
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">C2C Consent</h4>
              <button
                onClick={() => setLeadForm({ ...leadForm, enableC2C: !leadForm.enableC2C })}
                className={cn('relative w-11 h-6 rounded-full transition-colors', leadForm.enableC2C ? 'bg-[#8B5CF6]' : 'bg-[#2A2A38]')}
              >
                <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform', leadForm.enableC2C ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
            {leadForm.enableC2C && (
              <textarea value={leadForm.c2cText} onChange={e => setLeadForm({ ...leadForm, c2cText: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] resize-none" />
            )}
          </div>

          {/* Default Fields */}
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Default Fields</h4>
            {leadForm.fields.map(field => (
              <div key={field.key} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleField(field.key)}
                    disabled={field.locked}
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                      field.enabled ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-[rgba(255,255,255,0.15)]',
                    )}
                  >
                    {field.enabled && <Check size={12} className="text-white" />}
                  </button>
                  <span className={cn('text-sm', field.enabled ? 'text-[#F1F5F9]' : 'text-[#64748B]')}>{field.label}</span>
                  {field.required && <span className="text-[10px] text-[#F59E0B] font-semibold">REQ</span>}
                </div>
                {field.locked && <LockIcon />}
              </div>
            ))}
          </div>
        </div>

        {/* Qualifying Questions + Preview */}
        <div className="space-y-5">
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Qualifying Questions</h4>
            {leadForm.qualifyingQuestions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <label className="block text-sm text-[#94A3B8]">Question {idx + 1}</label>
                <input
                  value={q.question}
                  onChange={e => {
                    const next = [...leadForm.qualifyingQuestions];
                    next[idx] = { ...q, question: e.target.value };
                    setLeadForm({ ...leadForm, qualifyingQuestions: next });
                  }}
                  className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
                />
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt, oi) => (
                    <input
                      key={oi}
                      value={opt}
                      onChange={e => {
                        const next = [...leadForm.qualifyingQuestions];
                        next[idx] = { ...q, options: q.options.map((o, i) => i === oi ? e.target.value : o) };
                        setLeadForm({ ...leadForm, qualifyingQuestions: next });
                      }}
                      className="px-3 py-1 rounded-lg bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-xs text-[#94A3B8] outline-none focus:border-[#8B5CF6] w-[140px]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form Preview */}
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Preview</h4>
            <div className="bg-[#0A0A0F] rounded-xl p-5 space-y-3 border border-[rgba(255,255,255,0.04)]">
              <p className="text-sm font-semibold text-[#F1F5F9] mb-3">{leadForm.formName}</p>
              {leadForm.fields.filter(f => f.enabled).map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs text-[#94A3B8]">{f.label}{f.required && <span className="text-[#EF4444]">*</span>}</label>
                  <div className="h-8 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.06)]" />
                </div>
              ))}
              {leadForm.qualifyingQuestions.map((q, i) => (
                <div key={q.id} className="space-y-1">
                  <label className="text-xs text-[#94A3B8]">{q.question}</label>
                  <div className="h-8 rounded-lg bg-[#111118] border border-[rgba(255,255,255,0.06)]" />
                </div>
              ))}
              {leadForm.enableC2C && (
                <div className="flex items-start gap-2 pt-2">
                  <div className="w-4 h-4 rounded border border-[rgba(255,255,255,0.15)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{leadForm.c2cText}</p>
                </div>
              )}
              <div className="pt-2">
                <div className="h-9 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">Submit</span>
                </div>
              </div>
              <p className="text-[10px] text-[#475569] text-center mt-2">{leadForm.privacyPolicyUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Step 3: Ad Creatives ─── */
function Step3Ads({ ads, setAds, activeAdTab, setActiveAdTab }: WizardProps) {
  const activeAd = ads[activeAdTab];
  const ctaOptions = ['Learn More', 'Sign Up', 'Download', 'Register', 'Request Demo'];

  const avoidedTerms = ['guarantee', 'guaranteed', 'make money fast', 'get rich', 'passive income', 'earn $', 'no effort'];
  const hasWarnings = avoidedTerms.some(term => activeAd.introText.toLowerCase().includes(term));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#F1F5F9]">Ad Creatives</h3>
        {hasWarnings && (
          <span className="flex items-center gap-1.5 text-xs text-[#F59E0B] bg-[rgba(245,158,11,0.1)] px-3 py-1 rounded-full">
            <AlertTriangle size={12} /> Check brand compliance
          </span>
        )}
      </div>

      {/* Ad Tabs */}
      <div className="flex gap-2">
        {ads.map((ad, i) => (
          <button
            key={ad.id}
            onClick={() => setActiveAdTab(i)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
              activeAdTab === i
                ? 'bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border-[rgba(139,92,246,0.3)]'
                : 'bg-[#111118] text-[#94A3B8] border-[rgba(255,255,255,0.06)] hover:text-[#F1F5F9]',
            )}
          >
            <Image size={14} />
            {ad.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ad Form */}
        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Headline <span className="text-[#64748B]">({activeAd.headline.length}/200)</span></label>
            <input
              value={activeAd.headline}
              onChange={e => {
                const next = [...ads];
                next[activeAdTab] = { ...activeAd, headline: e.target.value.slice(0, 200) };
                setAds(next);
              }}
              className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Intro Text <span className="text-[#64748B]">({activeAd.introText.length}/600)</span></label>
            <textarea
              value={activeAd.introText}
              onChange={e => {
                const next = [...ads];
                next[activeAdTab] = { ...activeAd, introText: e.target.value.slice(0, 600) };
                setAds(next);
              }}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] resize-none"
            />
            {avoidedTerms.map(term =>
              activeAd.introText.toLowerCase().includes(term) ? (
                <p key={term} className="text-xs text-[#F59E0B] mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Avoid term: "{term}"</p>
              ) : null
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">Call-to-Action</label>
              <select
                value={activeAd.cta}
                onChange={e => {
                  const next = [...ads];
                  next[activeAdTab] = { ...activeAd, cta: e.target.value };
                  setAds(next);
                }}
                className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
              >
                {ctaOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">Destination URL</label>
              <input
                value={activeAd.destinationUrl}
                onChange={e => {
                  const next = [...ads];
                  next[activeAdTab] = { ...activeAd, destinationUrl: e.target.value };
                  setAds(next);
                }}
                className="w-full h-10 px-4 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* UTM Section */}
          <div className="pt-2">
            <label className="block text-sm text-[#94A3B8] mb-2">UTM Parameters</label>
            <div className="grid grid-cols-3 gap-3">
              {(['utmSource', 'utmMedium', 'utmCampaign'] as const).map(key => (
                <div key={key}>
                  <label className="text-[11px] text-[#64748B] uppercase">{key.replace('utm', 'UTM ')}</label>
                  <input
                    value={activeAd[key]}
                    onChange={e => {
                      const next = [...ads];
                      next[activeAdTab] = { ...activeAd, [key]: e.target.value };
                      setAds(next);
                    }}
                    className="w-full h-9 px-3 rounded-lg bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] text-xs text-[#F1F5F9] outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="pt-2">
            <label className="block text-sm text-[#94A3B8] mb-2">Ad Image</label>
            <div className="border-2 border-dashed border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center hover:border-[rgba(139,92,246,0.3)] transition-colors cursor-pointer">
              <Upload size={24} className="mx-auto text-[#64748B] mb-2" />
              <p className="text-sm text-[#94A3B8]">Drag & drop image here or click to browse</p>
              <p className="text-xs text-[#64748B] mt-1">1200 × 627px · JPG/PNG · Max 8MB</p>
            </div>
          </div>
        </div>

        {/* Ad Preview */}
        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">LinkedIn Preview</h4>
          <div className="bg-[#0A0A0F] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4]" />
              <div>
                <p className="text-sm font-semibold text-[#F1F5F9]">LixenAI</p>
                <p className="text-xs text-[#64748B]">Promoted</p>
              </div>
            </div>
            {/* Image placeholder */}
            <div className="aspect-[1200/627] bg-gradient-to-br from-[#1A1A24] to-[#2A2A38] flex items-center justify-center">
              <Image size={48} className="text-[#475569]" />
            </div>
            {/* Text */}
            <div className="p-4 space-y-2">
              <h5 className="text-base font-semibold text-[#F1F5F9] leading-snug">{activeAd.headline}</h5>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{activeAd.introText}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-sm font-semibold text-white">{activeAd.cta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Step 4: CRM Connection ─── */
function Step4CRM({ crmConnection, setCrmConnection }: WizardProps) {
  const methods: { key: 'zapier' | 'api' | 'manual'; title: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'zapier', title: 'Zapier', desc: 'Connect LinkedIn Lead Gen Forms to your CRM via Zapier. No coding required. Set up triggers in minutes.', icon: <Zap size={24} className="text-[#FF4A00]" /> },
    { key: 'api', title: 'LinkedIn Lead Gen Forms API', desc: 'Direct API integration for real-time lead sync. Best for custom CRM setups with developer resources.', icon: <CodeIcon /> },
    { key: 'manual', title: 'Manual CSV Export', desc: 'Export leads manually as CSV files. Simple but requires regular manual downloads.', icon: <FileText size={24} className="text-[#94A3B8]" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h3 className="text-xl font-bold text-[#F1F5F9]">CRM Connection</h3>
      <p className="text-sm text-[#64748B]">Choose how you want to sync LinkedIn leads to your CRM system.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map(method => {
          const isSelected = crmConnection.method === method.key;
          const isConnected = isSelected && crmConnection.connected;
          return (
            <button
              key={method.key}
              onClick={() => setCrmConnection({ method: method.key, connected: method.key === 'manual', lastSync: method.key === 'manual' ? new Date().toISOString() : null, recordsSynced: 0 })}
              className={cn(
                'relative text-left p-6 rounded-2xl border transition-all',
                isSelected
                  ? 'bg-[rgba(139,92,246,0.08)] border-[rgba(139,92,246,0.3)]'
                  : 'bg-[#111118] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]',
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <div className="mb-4">{method.icon}</div>
              <h4 className="text-base font-semibold text-[#F1F5F9] mb-1">{method.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{method.desc}</p>
              {isConnected && (
                <div className="mt-4 flex items-center gap-2 text-xs text-[#10B981]">
                  <CheckCircle2 size={12} /> Connected · {crmConnection.recordsSynced} records synced
                </div>
              )}
              {isSelected && !isConnected && method.key !== 'manual' && (
                <button
                  onClick={e => { e.stopPropagation(); setCrmConnection({ ...crmConnection, connected: true, lastSync: new Date().toISOString(), recordsSynced: 0 }); }}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:brightness-110 transition-all"
                >
                  Connect
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* Field Mapping Preview */}
      {crmConnection.method && (
        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Field Mapping Preview</h4>
          <div className="space-y-2">
            {[
              { from: 'First Name', to: 'first_name' },
              { from: 'Last Name', to: 'last_name' },
              { from: 'Work Email', to: 'email' },
              { from: 'Company Name', to: 'company' },
              { from: 'Job Title', to: 'job_title' },
              { from: 'Phone Number', to: 'phone' },
              { from: 'Country', to: 'country' },
            ].map(map => (
              <div key={map.from} className="flex items-center gap-4 text-sm">
                <span className="text-[#94A3B8] w-32">{map.from}</span>
                <ArrowRight />
                <span className="text-[#F1F5F9] font-medium">{map.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CodeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ─── Step 5: Pre-Launch Checklist ─── */
function Step5Checklist({ checklist, toggleChecklistItem, checklistProgress, canLaunch }: WizardProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#F1F5F9]">Pre-Launch Checklist</h3>
        <span className="text-sm text-[#64748B]">{checklistProgress.checked}/{checklistProgress.total} required items</span>
      </div>

      {/* Progress */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#94A3B8]">Completion</span>
          <span className={cn('text-sm font-bold', canLaunch ? 'text-[#10B981]' : 'text-[#F59E0B]')}>{Math.round((checklistProgress.checked / checklistProgress.total) * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-[#0A0A0F] overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', canLaunch ? 'bg-gradient-to-r from-[#10B981] to-[#06B6D4]' : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]')}
            initial={{ width: 0 }}
            animate={{ width: `${(checklistProgress.checked / checklistProgress.total) * 100}%` }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl divide-y divide-[rgba(255,255,255,0.04)]">
        {checklist.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <button
              onClick={() => toggleChecklistItem(item.id)}
              className={cn(
                'w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all',
                item.checked ? 'bg-[#10B981] border-[#10B981]' : 'border-[rgba(255,255,255,0.15)] hover:border-[#8B5CF6]',
              )}
            >
              {item.checked && <Check size={14} className="text-white" />}
            </button>
            <div className="flex-1">
              <span className={cn('text-sm', item.checked ? 'text-[#64748B] line-through' : 'text-[#F1F5F9]')}>{item.label}</span>
            </div>
            {item.required && <span className="text-[10px] text-[#F59E0B] font-semibold shrink-0">REQUIRED</span>}
          </div>
        ))}
      </div>

      {/* Issues */}
      {!canLaunch && (
        <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <h4 className="text-sm font-semibold text-[#F59E0B]">Items Needing Attention</h4>
          </div>
          <div className="space-y-1.5">
            {checklist.filter(c => c.required && !c.checked).map(item => (
              <p key={item.id} className="text-xs text-[#94A3B8] flex items-center gap-2">
                <XCircle size={10} className="text-[#EF4444] shrink-0" />
                {item.label}
              </p>
            ))}
          </div>
        </div>
      )}

      {canLaunch && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-2xl p-5 text-center">
          <CheckCircle2 size={32} className="text-[#10B981] mx-auto mb-2" />
          <h4 className="text-base font-semibold text-[#10B981] mb-1">All Systems Go!</h4>
          <p className="text-sm text-[#64748B]">Your campaign is ready to launch. Click "Launch Campaign" in the header.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAMPAIGN DETAIL
   ═══════════════════════════════════════════════════════════════════ */
function CampaignDetail({ campaign, onBack, onEdit, onDuplicate, onDelete }: {
  campaign: Campaign; onBack: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const [detailTab, setDetailTab] = useState<'overview' | 'ads' | 'leadform' | 'crm'>('overview');

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <StatusBadge status={campaign.status} />
            <h1 className="text-xl font-bold text-[#F1F5F9]">{campaign.name}</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">{formatDateRange(campaign.startDate, campaign.endDate)} · {campaign.objective}</p>
        </div>
        <div className="flex items-center gap-2">
          <DetailActionBtn icon={<Edit2 size={14} />} label="Edit" onClick={onEdit} />
          <DetailActionBtn icon={<Copy size={14} />} label="Duplicate" onClick={onDuplicate} />
          <DetailActionBtn icon={<Trash2 size={14} />} label="Delete" onClick={onDelete} danger />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <MetricCard label="Leads" value={campaign.metrics.leads} icon={<Users size={16} />} accent="#8B5CF6" />
        <MetricCard label="Impressions" value={formatNumber(campaign.metrics.impressions)} icon={<BarChart3 size={16} />} accent="#06B6D4" />
        <MetricCard label="Clicks" value={campaign.metrics.clicks} icon={<MousePointer size={16} />} accent="#3B82F6" />
        <MetricCard label="CTR" value={`${campaign.metrics.ctr}%`} icon={<TrendingUp size={16} />} accent="#10B981" />
        <MetricCard label="CPC" value={`$${campaign.metrics.cpc}`} icon={<DollarSign size={16} />} accent="#F59E0B" />
        <MetricCard label="Spend" value={formatCurrency(campaign.metrics.spend)} icon={<DollarSign size={16} />} accent="#EF4444" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111118] rounded-xl p-1 w-fit">
        {[
          { key: 'overview' as const, label: 'Overview', icon: Layers },
          { key: 'ads' as const, label: 'Ad Creatives', icon: Image },
          { key: 'leadform' as const, label: 'Lead Form', icon: FileText },
          { key: 'crm' as const, label: 'CRM', icon: Link2 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setDetailTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              detailTab === tab.key ? 'bg-[rgba(139,92,246,0.15)] text-[#A78BFA]' : 'text-[#64748B] hover:text-[#94A3B8]',
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {detailTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Target Audience</h4>
              <InfoRow label="Job Titles" value={campaign.targeting.jobTitles.join(', ')} />
              <InfoRow label="Company Size" value={campaign.targeting.companySizes.join(', ')} />
              <InfoRow label="Industries" value={campaign.targeting.industries.join(', ')} />
              <InfoRow label="Locations" value={campaign.targeting.locations.join(', ')} />
              <InfoRow label="Exclude Competitors" value={campaign.targeting.excludeCompetitors ? 'Yes' : 'No'} />
            </div>
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Budget & Schedule</h4>
              <InfoRow label="Daily Budget" value={`$${campaign.dailyBudget}`} />
              <InfoRow label="Lifetime Budget" value={`$${campaign.lifetimeBudget}`} />
              <InfoRow label="Bid Strategy" value={campaign.targeting.bidStrategy} />
              <InfoRow label="Schedule Days" value={campaign.targeting.scheduleDays.join(', ')} />
              <InfoRow label="Duration" value={`${Math.round((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`} />
            </div>
          </motion.div>
        )}
        {detailTab === 'ads' && (
          <motion.div key="ads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaign.ads.map(ad => (
              <div key={ad.id} className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-3">
                <div className="aspect-[1200/627] rounded-xl bg-gradient-to-br from-[#1A1A24] to-[#2A2A38] flex items-center justify-center mb-3">
                  <Image size={36} className="text-[#475569]" />
                </div>
                <h5 className="text-sm font-semibold text-[#F1F5F9]">{ad.headline}</h5>
                <p className="text-xs text-[#94A3B8] line-clamp-3">{ad.introText}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-xs font-semibold text-white">{ad.cta}</span>
                  <span className="text-[10px] text-[#64748B] truncate max-w-[120px]">{ad.destinationUrl}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        {detailTab === 'leadform' && (
          <motion.div key="leadform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Form Fields</h4>
              {campaign.leadForm.fields.filter(f => f.enabled).map(f => (
                <InfoRow key={f.key} label={f.label} value={f.required ? 'Required' : 'Optional'} />
              ))}
            </div>
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Qualifying Questions</h4>
              {campaign.leadForm.qualifyingQuestions.map((q, i) => (
                <div key={q.id} className="space-y-1">
                  <p className="text-sm text-[#F1F5F9]">{i + 1}. {q.question}</p>
                  <p className="text-xs text-[#64748B]">{q.options.join(' · ')}</p>
                </div>
              ))}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <InfoRow label="C2C Consent" value={campaign.leadForm.enableC2C ? 'Enabled' : 'Disabled'} />
                <InfoRow label="Privacy Policy" value={campaign.leadForm.privacyPolicyUrl} />
              </div>
            </div>
          </motion.div>
        )}
        {detailTab === 'crm' && (
          <motion.div key="crm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 max-w-lg">
              <h4 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">CRM Connection</h4>
              <InfoRow label="Method" value={campaign.crmConnection.method?.toUpperCase() || 'Not configured'} />
              <InfoRow label="Status" value={campaign.crmConnection.connected ? 'Connected' : 'Disconnected'} />
              <InfoRow label="Last Sync" value={campaign.crmConnection.lastSync ? new Date(campaign.crmConnection.lastSync).toLocaleString() : 'Never'} />
              <InfoRow label="Records Synced" value={String(campaign.crmConnection.recordsSynced)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs text-[#64748B]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#F1F5F9]">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
      <span className="text-sm text-[#64748B]">{label}</span>
      <span className="text-sm text-[#F1F5F9] text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function DetailActionBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border',
        danger
          ? 'border-[rgba(239,68,68,0.2)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]'
          : 'border-[rgba(255,255,255,0.06)] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WIZARD PROPS TYPE
   ═══════════════════════════════════════════════════════════════════ */
interface WizardProps {
  step: number;
  setStep: (s: number) => void;
  campaignName: string;
  setCampaignName: (s: string) => void;
  objective: string;
  setObjective: (s: string) => void;
  targeting: TargetingConfig;
  setTargeting: (t: TargetingConfig) => void;
  dailyBudget: number;
  setDailyBudget: (n: number) => void;
  lifetimeBudget: number;
  totalDays: number;
  startDate: string;
  setStartDate: (s: string) => void;
  endDate: string;
  setEndDate: (s: string) => void;
  leadForm: LeadFormConfig;
  setLeadForm: (l: LeadFormConfig) => void;
  ads: AdCreative[];
  setAds: (a: AdCreative[]) => void;
  activeAdTab: number;
  setActiveAdTab: (n: number) => void;
  crmConnection: CrmConnection;
  setCrmConnection: (c: CrmConnection) => void;
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  checklistProgress: { checked: number; total: number };
  canLaunch: boolean;
  onSaveDraft: () => void;
  onLaunch: () => void;
  onCancel: () => void;
  isEditing: boolean;
}
