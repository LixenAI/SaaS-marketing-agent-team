import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Shield,
  Users,
  Tag,
  Pencil,
  Check,
  X,
  ChevronDown,
  Save,
  RotateCcw,
  GripVertical,
  Plus,
  CircleDot,
  AlertTriangle,
  Info,
  AlertCircle,
  Linkedin,
  Mail,
  Calendar,
  Instagram,
  Copy,
  Pause,
  Clock,
} from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const approvedTerms = [
  { term: 'Agency Partner', context: 'Become a LixenAI Agency Partner' },
  { term: 'AI Growth System', context: 'Our AI Growth System handles everything' },
  { term: 'Done-for-you deployment', context: 'Full done-for-you deployment in 48 hours' },
  { term: 'Live demo', context: 'Schedule your live demo today' },
  { term: 'Niche snapshot', context: 'Get your free niche snapshot' },
  { term: 'Fulfillment backend', context: 'Our fulfillment backend handles delivery' },
  { term: 'Working price', context: 'See the working price for your niche' },
  { term: 'Illustrative revenue example', context: 'This is an illustrative revenue example, not a guarantee' },
  { term: 'You close. LixenAI delivers.', context: 'Use in partner-facing materials' },
  { term: 'You close. We build, deploy, and deliver.', context: 'Alternative tagline for partner materials' },
];

const avoidedTerms = [
  { term: 'GHL reseller', reason: 'Positions us as a reseller, not a platform', alternative: 'Agency Partner' },
  { term: 'Passive income', reason: 'Unsupported income claim', alternative: 'Performance-based revenue' },
  { term: 'Guaranteed appointments', reason: 'Guarantee not supported', alternative: 'Appointment generation system' },
  { term: 'Guaranteed earnings', reason: 'Income claim violation', alternative: 'Revenue opportunity' },
  { term: 'Set-it-and-forget-it', reason: 'Implies no work required', alternative: 'Streamlined operations' },
  { term: 'Fully HIPAA compliant', reason: 'Must verify actual compliance status', alternative: 'Security-focused' },
  { term: 'Every niche is ready', reason: 'Overclaim — some niches need more setup', alternative: 'Expanding niche library' },
  { term: '24/7 human support', reason: 'Only if contracted — not default', alternative: 'Priority support available' },
  { term: 'No work required', reason: 'Misleading claim', alternative: 'We handle the heavy lifting' },
  { term: 'Done-for-you clients', reason: 'Implies we provide clients directly', alternative: 'Client acquisition support' },
  { term: 'Guaranteed first client', reason: 'Unsupported outcome claim', alternative: 'Client acquisition system' },
  { term: 'Guaranteed revenue', reason: 'Income claim violation', alternative: 'Revenue opportunity' },
  { term: 'Own an AI company', reason: 'Only if legal documents support ownership', alternative: 'Partner with LixenAI' },
];

const voiceAttributes = [
  { name: 'Professional', score: 8, color: '#8B5CF6' },
  { name: 'Conversational', score: 6, color: '#06B6D4' },
  { name: 'Bold', score: 7, color: '#F59E0B' },
  { name: 'Educational', score: 7, color: '#10B981' },
  { name: 'Empathetic', score: 5, color: '#F43F5E' },
];

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

const complianceRules: { title: string; severity: Severity; description: string; approved: string; violation: string; appliesTo: string[] }[] = [
  {
    title: 'No Unsupported Income Claims',
    severity: 'Critical',
    description: 'Never state or imply guaranteed income, revenue, or earnings. All income references must include the standard disclaimer.',
    approved: '"Past performance does not guarantee future results. Individual outcomes may vary."',
    violation: '"Earn $10k/month guaranteed" or "Passive income stream"',
    appliesTo: ['Partner Recruitment Email', 'Landing Page', 'Sales Script'],
  },
  {
    title: 'No Guaranteed Results',
    severity: 'Critical',
    description: 'Never guarantee clients, appointments, revenue, or any specific business outcome. Use "designed to" or "helps" instead.',
    approved: '"Our system is designed to help you generate qualified appointments"',
    violation: '"Guaranteed 50 appointments per month"',
    appliesTo: ['Landing Page', 'Ad Copy', 'Sales Script'],
  },
  {
    title: 'Partner Opportunity Language',
    severity: 'High',
    description: 'Always describe the partner program as "independent, performance-based partner opportunity" — never as employment or franchise.',
    approved: '"Join as an independent, performance-based partner"',
    violation: '"Become a LixenAI employee" or "Franchise opportunity"',
    appliesTo: ['Partner Recruitment Email', 'Partner Outreach DM', 'Landing Page'],
  },
  {
    title: 'Income Disclaimer Required',
    severity: 'High',
    description: 'Any time income examples or case studies are used, the standard disclaimer must be prominently displayed.',
    approved: '"Results not typical. See full income disclaimer at lixenai.com/disclaimer"',
    violation: 'Showing revenue screenshots without any disclaimer',
    appliesTo: ['Landing Page', 'Sales Script', 'Partner Recruitment Email'],
  },
  {
    title: 'Human Review Required',
    severity: 'Medium',
    description: 'All marketing content must pass human review before publishing. AI-generated content is a draft, not final.',
    approved: '"AI-generated draft — reviewed and approved by [Name], [Date]"',
    violation: 'Publishing AI content without human review or approval',
    appliesTo: ['Social Post', 'Blog Post', 'Email Campaign'],
  },
  {
    title: 'Med Spa Specific Claims',
    severity: 'Medium',
    description: 'All medical/aesthetic claims must be verified against current regulations. No before/without disclaimers.',
    approved: '"Our AI system helps streamline patient intake and follow-up"',
    violation: '"Guaranteed patient results" or unverified medical claims',
    appliesTo: ['Med Spa Landing Page', 'Med Spa Ad Copy', 'Sales Script'],
  },
];

const audienceSegments = [
  {
    name: 'High-Ticket Closers',
    description: 'Experienced sales professionals who close high-value deals for businesses and agencies.',
    icon: 'violet',
    industry: 'Sales, B2B Services',
    companySize: 'Solo — 5 employees',
    role: 'Closer, Sales Consultant',
    location: 'US, Canada, UK',
    painPoints: ['Inconsistent deal flow', 'No fulfillment backend', 'Difficult to scale', 'Client acquisition costs'],
    motivations: ['Recurring revenue share', 'Done-for-you delivery', 'Premium positioning', 'Proven system'],
  },
  {
    name: 'Digital Marketing Agency Owners',
    description: 'Agency owners looking to add AI-powered services without building from scratch.',
    icon: 'cyan',
    industry: 'Marketing Services, Digital Agencies',
    companySize: '2–20 employees',
    role: 'Owner, Founder, Managing Director',
    location: 'US, Canada, UK, Australia',
    painPoints: ['Client churn', 'Fulfillment bottlenecks', 'Scaling delivery', 'Tech complexity'],
    motivations: ['Revenue growth', 'Competitive edge', 'Operational efficiency', 'New service lines'],
  },
  {
    name: 'Med Spa Owners',
    description: 'Aesthetic clinic and med spa business owners seeking AI automation for patient management.',
    icon: 'emerald',
    industry: 'Medical Aesthetics, Wellness',
    companySize: '5–50 employees',
    role: 'Owner, Medical Director',
    location: 'US, Canada',
    painPoints: ['Patient no-shows', 'Follow-up gaps', 'Staff overhead', 'Marketing compliance'],
    motivations: ['Patient retention', 'Operational efficiency', 'Compliance confidence', 'Revenue growth'],
  },
  {
    name: 'Sales Professionals',
    description: 'B2B sales professionals looking to leverage AI for prospecting and closing.',
    icon: 'amber',
    industry: 'SaaS, Technology, Professional Services',
    companySize: '10–200 employees',
    role: 'AE, SDR, Sales Manager',
    location: 'US, Canada, UK',
    painPoints: ['Manual prospecting', 'Low response rates', 'Inefficient follow-up', 'Quota pressure'],
    motivations: ['Pipeline growth', 'Higher close rates', 'Time savings', 'Career advancement'],
  },
];

const offers = [
  {
    name: 'Partner Fast-Start',
    type: 'Onboarding',
    value: 'Free first month',
    validUntil: 'Ongoing',
    status: 'Active' as const,
    description: 'New Agency Partners get their first month free, including full platform access and onboarding support.',
    targetSegment: 'Digital Marketing Agency Owners',
    benefits: ['No upfront cost', 'Full platform access', 'Dedicated onboarding specialist', '48-hour deployment'],
  },
  {
    name: 'Med Spa Launch Pack',
    type: 'Bundle',
    value: '20% off first campaign',
    validUntil: 'Mar 31, 2025',
    status: 'Active' as const,
    description: 'Complete AI automation setup for med spas including patient intake, follow-up, and marketing compliance.',
    targetSegment: 'Med Spa Owners',
    benefits: ['Compliance-ready templates', 'Patient journey automation', 'HIPAA-conscious setup', 'Ongoing support'],
  },
  {
    name: 'Agency Partner Revenue Share',
    type: 'Commission',
    value: '30% recurring',
    validUntil: 'Ongoing',
    status: 'Active' as const,
    description: 'Earn 30% recurring revenue on all clients you bring to the LixenAI platform.',
    targetSegment: 'High-Ticket Closers, Agency Owners',
    benefits: ['Monthly recurring revenue', 'No cap on earnings', 'Automatic payouts', 'Performance dashboard'],
  },
  {
    name: 'Q1 Partner Bonus',
    type: 'Bonus',
    value: '$500 for first 3 partners',
    validUntil: 'Jan 31, 2025',
    status: 'Expiring' as const,
    description: 'Limited-time bonus for partners who onboard 3 new clients in Q1.',
    targetSegment: 'All Partners',
    benefits: ['One-time cash bonus', 'Stackable with revenue share', 'Easy qualification', 'Fast payout'],
  },
];

const incomeDisclaimer = 'IMPORTANT: Any income examples shown are illustrative only and do not represent a guarantee of earnings. Individual results will vary based on effort, market conditions, and other factors. Always include the full FTC-compliant disclaimer when referencing income or revenue data.';

/* ------------------------------------------------------------------ */
/*  HELPER COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOutExpo }}
      className={'bg-[#111118] rounded-2xl p-8 border border-[rgba(255,255,255,0.06)] mb-6 ' + className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="mt-0.5 text-[#8B5CF6]">{icon}</div>
      <div>
        <h2 className="text-[22px] font-semibold text-[#F1F5F9] font-headline">{title}</h2>
        <p className="text-[13px] text-[#94A3B8] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, { bg: string; text: string; border: string }> = {
    Critical: { bg: 'bg-[rgba(244,63,94,0.15)]', text: 'text-[#F43F5E]', border: 'border-[#F43F5E]' },
    High: { bg: 'bg-[rgba(245,158,11,0.15)]', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]' },
    Medium: { bg: 'bg-[rgba(6,182,212,0.15)]', text: 'text-[#06B6D4]', border: 'border-[#06B6D4]' },
    Low: { bg: 'bg-[rgba(100,116,139,0.15)]', text: 'text-[#94A3B8]', border: 'border-[#94A3B8]' },
  };
  const c = colors[severity];
  return (
    <span className={'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ' + c.bg + ' ' + c.text + ' ' + c.border}>
      {severity === 'Critical' && <AlertCircle size={12} />}
      {severity === 'High' && <AlertTriangle size={12} />}
      {severity === 'Medium' && <Info size={12} />}
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: 'Active' | 'Expiring' | 'Expired' | 'Draft' }) {
  const colors = {
    Active: 'bg-[rgba(16,185,129,0.15)] text-[#10B981]',
    Expiring: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]',
    Expired: 'bg-[rgba(100,116,139,0.15)] text-[#94A3B8]',
    Draft: 'bg-[rgba(6,182,212,0.15)] text-[#06B6D4]',
  };
  return (
    <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ' + colors[status]}>
      <CircleDot size={10} className="mr-1" />
      {status}
    </span>
  );
}

function SegmentIcon({ color }: { color: string }) {
  const gradients: Record<string, string> = {
    violet: 'from-[#8B5CF6] to-[#A78BFA]',
    cyan: 'from-[#06B6D4] to-[#22D3EE]',
    emerald: 'from-[#10B981] to-[#34D399]',
    amber: 'from-[#F59E0B] to-[#FBBF24]',
  };
  return (
    <div className={'w-12 h-12 rounded-full bg-gradient-to-br ' + (gradients[color] || gradients.violet) + ' flex items-center justify-center'}>
      <Users size={22} className="text-white" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function Brand() {
  const [editMode, setEditMode] = useState(false);
  const [changedSections, setChangedSections] = useState<Set<string>>(new Set());
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set([0]));

  /* edit mode keyboard shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setEditMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleRule = useCallback((idx: number) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const markChanged = useCallback((section: string) => {
    setChangedSections((prev) => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    setChangedSections(new Set());
    setEditMode(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (changedSections.size > 0) {
      if (window.confirm('You have unsaved changes. Discard them?')) {
        setChangedSections(new Set());
        setEditMode(false);
      }
    } else {
      setEditMode(false);
    }
  }, [changedSections.size]);

  return (
    <div className="p-8 pb-24">
      {/* ========== PAGE HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="mb-8"
      >
        <p className="text-[13px] text-[#64748B] mb-2">Quality / Brand Configuration</p>
        <h1 className="text-[36px] font-bold text-[#F1F5F9] font-headline leading-[1.15] tracking-[-0.02em]">
          Brand Configuration
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.15 }}
          className="text-[16px] text-[#94A3B8] mt-3 max-w-[700px] leading-[1.6]"
        >
          The source of truth for brand voice, compliance, audience definitions, and offers.
          All agents reference these rules when generating content.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center gap-4 mt-5"
        >
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className={
              'flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium transition-all duration-150 ' +
              (editMode
                ? 'bg-[rgba(139,92,246,0.15)] text-[#A78BFA] ring-1 ring-[#8B5CF6]'
                : 'bg-[#22222E] text-[#F1F5F9] border border-[rgba(255,255,255,0.1)] hover:bg-[#2A2A38]')
            }
          >
            <Pencil size={16} />
            {editMode ? 'Editing' : 'Edit Mode'}
          </button>
          <span className="text-[13px] text-[#64748B]">Last updated 3 days ago by Marketing Director</span>
          {changedSections.size > 0 && editMode && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[11px] font-semibold text-[#F59E0B] bg-[rgba(245,158,11,0.15)] px-2 py-0.5 rounded-full"
            >
              {changedSections.size} section{changedSections.size > 1 ? 's' : ''} modified
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* ========== BRAND VOICE RULES ========== */}
      <SectionCard className={editMode && changedSections.has('voice') ? 'ring-1 ring-dashed ring-[#8B5CF6]' : ''}>
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            icon={<Megaphone size={20} />}
            title="Brand Voice Rules"
            description="Approved terminology, messaging guidelines, and voice attributes"
          />
          {editMode && changedSections.has('voice') && <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />}
        </div>

        {/* Approved + Avoided Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Approved */}
          <div>
            <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-1 flex items-center gap-2">
              <Check size={18} className="text-[#10B981]" />
              Approved Terms
            </h3>
            <p className="text-[13px] text-[#64748B] mb-4">Always use these terms in marketing content</p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {approvedTerms.map((t, i) => (
                <motion.div
                  key={t.term}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: easeOutExpo }}
                  className={
                    'bg-[#0A0A0F] rounded-[10px] p-3 px-4 border border-[rgba(255,255,255,0.06)] transition-all duration-150 hover:translate-x-[3px] hover:border-[rgba(16,185,129,0.3)] ' +
                    (editMode ? 'border-dashed ring-1 ring-[rgba(16,185,129,0.1)]' : '')
                  }
                >
                  <div className="flex items-start gap-2">
                    {editMode && <GripVertical size={16} className="text-[#475569] mt-0.5 shrink-0 cursor-grab" />}
                    <div>
                      <p className="text-[14px] font-semibold text-[#F1F5F9]">{t.term}</p>
                      <p className="text-[13px] text-[#94A3B8] italic mt-0.5">&ldquo;{t.context}&rdquo;</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {editMode && (
                <button className="w-full py-2 rounded-[10px] border border-dashed border-[rgba(255,255,255,0.1)] text-[13px] text-[#64748B] hover:text-[#F1F5F9] hover:border-[rgba(255,255,255,0.2)] transition-colors flex items-center justify-center gap-1">
                  <Plus size={14} /> Add Term
                </button>
              )}
            </div>
          </div>

          {/* Avoided */}
          <div>
            <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-1 flex items-center gap-2">
              <X size={18} className="text-[#F43F5E]" />
              Avoided Terms
            </h3>
            <p className="text-[13px] text-[#64748B] mb-4">Never use these terms in any marketing content</p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {avoidedTerms.map((t, i) => (
                <motion.div
                  key={t.term}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: easeOutExpo }}
                  className={
                    'bg-[#0A0A0F] rounded-[10px] p-3 px-4 border-l-[3px] border-l-[#F43F5E] border border-[rgba(255,255,255,0.06)] transition-all duration-150 hover:translate-x-[3px] ' +
                    (editMode ? 'border-dashed' : '')
                  }
                >
                  <div className="flex items-start gap-2">
                    {editMode && <GripVertical size={16} className="text-[#475569] mt-0.5 shrink-0 cursor-grab" />}
                    <div>
                      <p className="text-[14px] font-semibold text-[#F1F5F9]">{t.term}</p>
                      <p className="text-[13px] text-[#94A3B8] mt-0.5">{t.reason}</p>
                      <p className="text-[12px] text-[#64748B] mt-1">
                        Use: <span className="text-[#A78BFA] font-medium">{t.alternative}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {editMode && (
                <button className="w-full py-2 rounded-[10px] border border-dashed border-[rgba(255,255,255,0.1)] text-[13px] text-[#64748B] hover:text-[#F1F5F9] hover:border-[rgba(255,255,255,0.2)] transition-colors flex items-center justify-center gap-1">
                  <Plus size={14} /> Add Term
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Voice Attributes */}
        <div>
          <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-4">Voice Attributes</h3>
          <div className="flex flex-wrap gap-3">
            {voiceAttributes.map((attr, i) => (
              <motion.div
                key={attr.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: easeOutExpo }}
                className="bg-[#0A0A0F] rounded-[10px] px-4 py-3 border border-[rgba(255,255,255,0.06)] min-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: attr.color }} />
                  <span className="text-[14px] font-medium text-[#F1F5F9]">{attr.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#22222E] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (attr.score / 10) * 100 + '%' }}
                      transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: attr.color }}
                    />
                  </div>
                  <span className="text-[13px] font-mono text-[#94A3B8] min-w-[28px] text-right">{attr.score}/10</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ========== COMPLIANCE RULES ========== */}
      <SectionCard className={editMode && changedSections.has('compliance') ? 'ring-1 ring-dashed ring-[#8B5CF6]' : ''}>
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            icon={<Shield size={20} className="text-[#10B981]" />}
            title="Compliance Rules"
            description="Legal and regulatory requirements for all marketing content"
          />
          {editMode && changedSections.has('compliance') && <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />}
        </div>

        {/* Income Disclaimer Callout */}
        <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.3)] rounded-[10px] p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#F1F5F9] leading-[1.6]">{incomeDisclaimer}</p>
        </div>

        {/* Rule Cards */}
        <div className="space-y-3">
          {complianceRules.map((rule, i) => {
            const expanded = expandedRules.has(i);
            const severityColors: Record<Severity, string> = {
              Critical: 'border-l-[#F43F5E]',
              High: 'border-l-[#F59E0B]',
              Medium: 'border-l-[#06B6D4]',
              Low: 'border-l-[#94A3B8]',
            };
            return (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: easeOutExpo }}
                className={
                  'bg-[#0A0A0F] rounded-[10px] border border-[rgba(255,255,255,0.06)] border-l-4 ' +
                  severityColors[rule.severity] +
                  (editMode ? ' border-dashed' : '')
                }
              >
                {/* Rule Header */}
                <button
                  onClick={() => toggleRule(i)}
                  className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-[10px]"
                >
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={rule.severity} />
                    <span className="text-[16px] font-medium text-[#F1F5F9]">{rule.title}</span>
                  </div>
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={18} className="text-[#64748B]" />
                  </motion.div>
                </button>

                {/* Rule Body */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 border-t border-[rgba(255,255,255,0.06)]">
                        <p className="text-[14px] text-[#F1F5F9] leading-[1.6] mb-4 mt-3">{rule.description}</p>

                        {/* Examples */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-[10px] p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Check size={14} className="text-[#10B981]" />
                              <span className="text-[12px] font-semibold text-[#10B981] uppercase tracking-wider">Approved</span>
                            </div>
                            <p className="text-[13px] text-[#F1F5F9] leading-[1.5]">{rule.approved}</p>
                          </div>
                          <div className="bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] rounded-[10px] p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <X size={14} className="text-[#F43F5E]" />
                              <span className="text-[12px] font-semibold text-[#F43F5E] uppercase tracking-wider">Violation</span>
                            </div>
                            <p className="text-[13px] text-[#F1F5F9] leading-[1.5] line-through opacity-70">{rule.violation}</p>
                          </div>
                        </div>

                        {/* Applies To */}
                        <div className="mb-2">
                          <p className="text-[12px] text-[#64748B] uppercase tracking-wider mb-2">Applies To</p>
                          <div className="flex flex-wrap gap-2">
                            {rule.appliesTo.map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-1 rounded-full text-[12px] bg-[rgba(139,92,246,0.1)] text-[#A78BFA] border border-[rgba(139,92,246,0.2)] cursor-pointer hover:bg-[rgba(139,92,246,0.2)] transition-colors"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {editMode && (
                          <button
                            onClick={() => markChanged('compliance')}
                            className="mt-3 text-[12px] text-[#8B5CF6] hover:text-[#A78BFA] transition-colors flex items-center gap-1"
                          >
                            <Pencil size={12} /> Edit Rule
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      {/* ========== AUDIENCE SEGMENTS ========== */}
      <SectionCard className={editMode && changedSections.has('audience') ? 'ring-1 ring-dashed ring-[#8B5CF6]' : ''}>
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            icon={<Users size={20} className="text-[#06B6D4]" />}
            title="Audience Segments"
            description="Defined target audiences for marketing personalization"
          />
          {editMode && changedSections.has('audience') && <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {audienceSegments.map((seg, i) => (
            <motion.div
              key={seg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: easeOutExpo }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={
                'bg-[#0A0A0F] rounded-2xl p-6 border border-[rgba(255,255,255,0.06)] min-h-[320px] flex flex-col transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] ' +
                (editMode ? 'border-dashed' : '')
              }
            >
              <SegmentIcon color={seg.icon} />
              <h3 className="text-[18px] font-semibold text-[#F1F5F9] mt-4 mb-1">{seg.name}</h3>
              <p className="text-[13px] text-[#94A3B8] leading-[1.5] mb-4">{seg.description}</p>

              {/* Demographics */}
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Industry</p>
                  <p className="text-[13px] text-[#F1F5F9] font-medium">{seg.industry}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Company Size</p>
                  <p className="text-[13px] text-[#F1F5F9] font-medium">{seg.companySize}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Role</p>
                  <p className="text-[13px] text-[#F1F5F9] font-medium">{seg.role}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-wider">Location</p>
                  <p className="text-[13px] text-[#F1F5F9] font-medium">{seg.location}</p>
                </div>
              </div>

              {/* Pain Points */}
              <div className="mb-3">
                <p className="text-[11px] text-[#64748B] uppercase tracking-wider mb-1.5">Pain Points</p>
                <div className="space-y-1">
                  {seg.painPoints.map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <X size={10} className="text-[#F43F5E] shrink-0" />
                      <span className="text-[12px] text-[#94A3B8]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivations */}
              <div className="mb-4">
                <p className="text-[11px] text-[#64748B] uppercase tracking-wider mb-1.5">Motivations</p>
                <div className="space-y-1">
                  {seg.motivations.map((m) => (
                    <div key={m} className="flex items-center gap-1.5">
                      <Check size={10} className="text-[#10B981] shrink-0" />
                      <span className="text-[12px] text-[#94A3B8]">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="mt-auto">
                <p className="text-[11px] text-[#64748B] uppercase tracking-wider mb-1.5">Channels</p>
                <div className="flex items-center gap-2">
                  <Linkedin size={14} className="text-[#64748B]" />
                  <Mail size={14} className="text-[#64748B]" />
                  <Calendar size={14} className="text-[#64748B]" />
                  <Instagram size={14} className="text-[#64748B]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* ========== OFFERS ========== */}
      <SectionCard className={editMode && changedSections.has('offers') ? 'ring-1 ring-dashed ring-[#8B5CF6]' : ''}>
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            icon={<Tag size={20} className="text-[#F59E0B]" />}
            title="Current Offers"
            description="Active offers and promotions available for marketing campaigns"
          />
          <div className="flex items-center gap-3">
            {editMode && changedSections.has('offers') && <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />}
            {editMode && (
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[13px] font-medium text-white hover:brightness-110 transition-all" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
                <Plus size={14} /> New Offer
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-4">Name</th>
                <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-4">Type</th>
                <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-4">Value</th>
                <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-4">Valid Until</th>
                <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer, i) => (
                <motion.tr
                  key={offer.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: easeOutExpo }}
                  className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[#22222E] transition-colors duration-100"
                >
                  <td className="py-3 px-4">
                    <p className="text-[14px] font-medium text-[#F1F5F9]">{offer.name}</p>
                    <p className="text-[12px] text-[#64748B]">{offer.targetSegment}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[13px] text-[#94A3B8]">{offer.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[14px] font-mono font-medium text-[#F1F5F9]">{offer.value}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[13px] text-[#94A3B8] flex items-center gap-1">
                      <Clock size={12} /> {offer.validUntil}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={offer.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors" title="Duplicate">
                        <Copy size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors" title="Deactivate">
                        <Pause size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: easeOutExpo }}
              className="bg-[#0A0A0F] rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-[16px] font-medium text-[#F1F5F9]">{offer.name}</h4>
                <StatusBadge status={offer.status} />
              </div>
              <p className="text-[13px] text-[#94A3B8] mb-3">{offer.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <span className="text-[#64748B]">Type: </span>
                  <span className="text-[#F1F5F9]">{offer.type}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Value: </span>
                  <span className="text-[#F1F5F9] font-mono">{offer.value}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Valid: </span>
                  <span className="text-[#F1F5F9]">{offer.validUntil}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <button className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]"><Pencil size={14} /></button>
                <button className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]"><Copy size={14} /></button>
                <button className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]"><Pause size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* ========== EDIT MODE STICKY BAR ========== */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A24] border-t border-[rgba(255,255,255,0.06)] px-6 py-4 flex items-center justify-between"
            style={{ marginLeft: 256 }}
          >
            <div className="flex items-center gap-3">
              {changedSections.size > 0 ? (
                <span className="text-[14px] text-[#F59E0B] font-medium">{changedSections.size} section{changedSections.size > 1 ? 's' : ''} modified</span>
              ) : (
                <span className="text-[14px] text-[#64748B]">No changes yet</span>
              )}
              <span className="text-[12px] text-[#475569]">Press Ctrl+E to toggle edit mode</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                <RotateCcw size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}