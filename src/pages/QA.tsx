import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Bot,
  Megaphone,
  ArrowLeft,
  Check,
  X,
  Minus,
  ChevronDown,
  Download,
  Share2,
  Play,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  CircleDot,
  ListChecks,

  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type Response = 'pass' | 'fail' | 'na' | null;
type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

interface ChecklistItem {
  id: number;
  category: string;
  title: string;
  description: string;
  severity?: Severity;
}

interface ChecklistItemState {
  response: Response;
  notes: string;
  failSeverity: Severity;
}

interface ChecklistDef {
  id: string;
  name: string;
  description: string;
  color: string;
  colorBg: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
  avgTime: string;
  lastRun: string;
  lastRunStatus: string;
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const contentQAItems: ChecklistItem[] = [
  { id: 1, category: 'Brand Voice', title: 'Headline clarity', description: 'Headlines are clear, specific, and free from ambiguity. They communicate the main value proposition within 3 seconds.' },
  { id: 2, category: 'CTA', title: 'CTA presence and clarity', description: 'Every piece of content has a clear, single call-to-action. The CTA uses action-oriented language and is visually prominent.' },
  { id: 3, category: 'Brand Voice', title: 'Brand voice compliance', description: 'Content follows the approved brand voice attributes: Professional (8/10), Conversational (6/10), Bold (7/10). No avoided terms used.' },
  { id: 4, category: 'Format', title: 'Grammar and spelling', description: 'No grammatical errors, spelling mistakes, or punctuation issues. Consistent capitalization and formatting throughout.' },
  { id: 5, category: 'Accuracy', title: 'Link functionality', description: 'All links are working and point to correct destinations. No broken URLs, redirect chains, or placeholder links remain.' },
  { id: 6, category: 'Format', title: 'Mobile responsiveness', description: 'Content renders correctly on mobile devices. Text is readable, images scale, CTAs are tappable, no horizontal scrolling.' },
  { id: 7, category: 'Format', title: 'Image alt text', description: 'All images have descriptive alt text for accessibility and SEO. Alt text accurately describes the image content and context.' },
  { id: 8, category: 'SEO', title: 'Meta description', description: 'Meta description is present, under 160 characters, includes primary keyword, and accurately summarizes the page content.' },
  { id: 9, category: 'SEO', title: 'Social sharing tags', description: 'Open Graph and Twitter Card tags are present with correct title, description, and image for proper social preview.' },
  { id: 10, category: 'Performance', title: 'Load speed check', description: 'Page loads in under 3 seconds on standard connections. Images are optimized, scripts are deferred, no render-blocking resources.' },
  { id: 11, category: 'Performance', title: 'Cross-browser check', description: 'Content displays correctly across Chrome, Safari, Firefox, and Edge. No layout shifts, broken styles, or missing features.' },
  { id: 12, category: 'Accessibility', title: 'Accessibility check', description: 'Content meets WCAG 2.1 AA standards. Color contrast ratios pass, keyboard navigation works, ARIA labels are present where needed.' },
];

const agentOutputItems: ChecklistItem[] = [
  { id: 1, category: 'Strategic', title: 'Strategic alignment', description: 'Output aligns with the strategic objective stated in the prompt. Content serves the intended business goal.' },
  { id: 2, category: 'Audience', title: 'Target audience match', description: 'Content is tailored to the specified audience segment. Language, examples, and tone match the audience profile.' },
  { id: 3, category: 'CTA', title: 'Call-to-action clarity', description: 'The CTA is clear, specific, and compelling. It tells the reader exactly what to do next and why.' },
  { id: 4, category: 'Brand Voice', title: 'Brand voice consistency', description: 'Tone and style are consistent throughout. No abrupt shifts in voice. Follows brand voice attributes.' },
  { id: 5, category: 'Compliance', title: 'Compliance check', description: 'No avoided terms, unsupported claims, or regulatory violations. Income disclaimer present where required.' },
  { id: 6, category: 'Accuracy', title: 'Factual accuracy', description: 'All facts, statistics, and claims are verified against source material. No hallucinated information.' },
  { id: 7, category: 'Tone', title: 'Tone appropriateness', description: 'Tone matches the context and audience. Professional yet approachable. Not too salesy or too casual.' },
  { id: 8, category: 'Format', title: 'Formatting correctness', description: 'Proper use of headings, lists, paragraphs, and emphasis. Consistent formatting throughout the output.' },
];

const paidAdsItems: ChecklistItem[] = [
  { id: 1, category: 'Data', title: 'Funnel performance data', description: 'Historical funnel data has been reviewed. Conversion rates, CPA, and ROAS benchmarks are established.' },
  { id: 2, category: 'Landing', title: 'Landing page live', description: 'The landing page is deployed, accessible, and matches the ad promise. All forms and tracking work correctly.' },
  { id: 3, category: 'Tracking', title: 'Tracking pixels installed', description: 'All required tracking pixels (Meta, Google, LinkedIn) are installed and firing correctly on the landing page.' },
  { id: 4, category: 'Budget', title: 'Budget allocated', description: 'Daily and lifetime budgets are set. Bid strategy is defined and aligned with campaign objectives.' },
  { id: 5, category: 'Creative', title: 'Creative assets ready', description: 'All images, videos, and copy variants are finalized, approved, and uploaded to the ad platform.' },
  { id: 6, category: 'Targeting', title: 'Audience targeting defined', description: 'Target audience is clearly defined with demographics, interests, behaviors, and exclusions specified.' },
  { id: 7, category: 'Testing', title: 'A/B test plan', description: 'Testing plan is documented with hypotheses, variants, success metrics, and minimum sample sizes.' },
  { id: 8, category: 'Compliance', title: 'Compliance review complete', description: 'Ad copy and creative have passed compliance review. No prohibited claims, terms, or imagery.' },
  { id: 9, category: 'Legal', title: 'Disclaimer included', description: 'Required legal disclaimers are present in ad copy or landing page as required by platform and regulations.' },
  { id: 10, category: 'Review', title: 'Human review completed', description: 'A human reviewer has signed off on the campaign. All checklist items have been addressed.' },
];

const checklists: ChecklistDef[] = [
  {
    id: 'content',
    name: 'Content QA Checklist',
    description: 'Comprehensive content review covering brand voice, compliance, accuracy, formatting, and link validation.',
    color: '#06B6D4',
    colorBg: 'rgba(6,182,212,0.15)',
    icon: <FileCheck size={24} />,
    items: contentQAItems,
    avgTime: '~10 min',
    lastRun: '2d ago',
    lastRunStatus: 'Passed',
  },
  {
    id: 'agent',
    name: 'Agent Output Review',
    description: 'Review AI-generated content for brand alignment, factual accuracy, tone consistency, and human-readiness.',
    color: '#8B5CF6',
    colorBg: 'rgba(139,92,246,0.15)',
    icon: <Bot size={24} />,
    items: agentOutputItems,
    avgTime: '~8 min',
    lastRun: '5d ago',
    lastRunStatus: 'Passed',
  },
  {
    id: 'ads',
    name: 'Paid Ads Readiness',
    description: 'Pre-flight checklist for paid advertising: targeting, copy compliance, creative specs, landing page readiness, tracking.',
    color: '#F59E0B',
    colorBg: 'rgba(245,158,11,0.15)',
    icon: <Megaphone size={24} />,
    items: paidAdsItems,
    avgTime: '~12 min',
    lastRun: '1w ago',
    lastRunStatus: 'Attention',
  },
];

const qaStats = [
  { label: 'Content Reviews', value: '23', suffix: ' this month', color: '#06B6D4', icon: <FileCheck size={14} /> },
  { label: 'Pass Rate', value: '96', suffix: '%', color: '#10B981', icon: <Check size={14} /> },
  { label: 'Issues Found', value: '7', suffix: '', color: '#F59E0B', icon: <AlertTriangle size={14} /> },
  { label: 'Pending Reviews', value: '2', suffix: '', color: '#8B5CF6', icon: <Clock size={14} /> },
];

const qaHistory = [
  { checklist: 'Content QA Checklist', content: 'Partner Landing Page v2', result: 'Passed' as const, score: '12/12', date: 'Jun 23, 2025', reviewer: 'Alex M.' },
  { checklist: 'Agent Output Review', content: 'Email Campaign — Q3 Launch', result: 'Passed' as const, score: '8/8', date: 'Jun 20, 2025', reviewer: 'Sam K.' },
  { checklist: 'Paid Ads Readiness', content: 'Med Spa Facebook Campaign', result: 'Attention' as const, score: '8/10', date: 'Jun 18, 2025', reviewer: 'Jordan T.' },
  { checklist: 'Content QA Checklist', content: 'Agency Partner Recruitment', result: 'Passed' as const, score: '11/12', date: 'Jun 15, 2025', reviewer: 'Alex M.' },
  { checklist: 'Agent Output Review', content: 'Sales Script — Discovery Call', result: 'Failed' as const, score: '6/8', date: 'Jun 12, 2025', reviewer: 'Casey R.' },
];

/* ------------------------------------------------------------------ */
/*  HELPER COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, { bg: string; text: string }> = {
    Critical: { bg: 'bg-[rgba(244,63,94,0.15)]', text: 'text-[#F43F5E]' },
    High: { bg: 'bg-[rgba(245,158,11,0.15)]', text: 'text-[#F59E0B]' },
    Medium: { bg: 'bg-[rgba(6,182,212,0.15)]', text: 'text-[#06B6D4]' },
    Low: { bg: 'bg-[rgba(100,116,139,0.15)]', text: 'text-[#94A3B8]' },
  };
  const c = colors[severity];
  return (
    <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ' + c.bg + ' ' + c.text}>
      {severity === 'Critical' && <AlertCircle size={10} />}
      {severity === 'High' && <AlertTriangle size={10} />}
      {severity === 'Medium' && <Info size={10} />}
      {severity === 'Low' && <CircleDot size={10} />}
      {severity}
    </span>
  );
}

function ResultBadge({ result }: { result: 'Passed' | 'Failed' | 'Attention' }) {
  const colors = {
    Passed: 'bg-[rgba(16,185,129,0.15)] text-[#10B981]',
    Failed: 'bg-[rgba(244,63,94,0.15)] text-[#F43F5E]',
    Attention: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]',
  };
  return (
    <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ' + colors[result]}>
      {result === 'Passed' && <CheckCircle2 size={12} />}
      {result === 'Failed' && <XCircle size={12} />}
      {result === 'Attention' && <AlertTriangle size={12} />}
      {result}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function QA() {
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, Record<number, ChecklistItemState>>>({});
  const [showResults, setShowResults] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  /* keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResults) setShowResults(false);
        else if (activeChecklist) setActiveChecklist(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeChecklist, showResults]);

  const currentChecklist = useMemo(() => checklists.find((c) => c.id === activeChecklist), [activeChecklist]);

  const currentResponses = useMemo(() => {
    if (!currentChecklist) return {};
    return responses[currentChecklist.id] || {};
  }, [currentChecklist, responses]);

  const progress = useMemo(() => {
    if (!currentChecklist) return { checked: 0, total: 0, pct: 0 };
    const total = currentChecklist.items.length;
    const checked = Object.values(currentResponses).filter((r) => r.response !== null).length;
    return { checked, total, pct: Math.round((checked / total) * 100) };
  }, [currentChecklist, currentResponses]);

  const summary = useMemo(() => {
    if (!currentChecklist) return { pass: 0, fail: 0, na: 0 };
    const vals = Object.values(currentResponses);
    return {
      pass: vals.filter((v) => v.response === 'pass').length,
      fail: vals.filter((v) => v.response === 'fail').length,
      na: vals.filter((v) => v.response === 'na').length,
    };
  }, [currentChecklist, currentResponses]);

  const allAnswered = useMemo(() => {
    if (!currentChecklist) return false;
    return currentChecklist.items.every((item) => currentResponses[item.id]?.response !== null);
  }, [currentChecklist, currentResponses]);

  const setResponse = useCallback((checklistId: string, itemId: number, response: Response) => {
    setResponses((prev) => {
      const next = { ...prev, [checklistId]: { ...prev[checklistId] } };
      if (!next[checklistId]) next[checklistId] = {};
      next[checklistId] = {
        ...next[checklistId],
        [itemId]: {
          ...next[checklistId][itemId],
          response,
          notes: next[checklistId][itemId]?.notes || (response === 'fail' ? 'Issue: Item failed review. ' : ''),
          failSeverity: next[checklistId][itemId]?.failSeverity || 'Medium',
        },
      };
      return next;
    });
  }, []);

  const setNotes = useCallback((checklistId: string, itemId: number, notes: string) => {
    setResponses((prev) => {
      const next = { ...prev, [checklistId]: { ...prev[checklistId] } };
      if (!next[checklistId]) next[checklistId] = {};
      next[checklistId] = {
        ...next[checklistId],
        [itemId]: {
          ...next[checklistId][itemId],
          notes,
        },
      };
      return next;
    });
  }, []);

  const setFailSeverity = useCallback((checklistId: string, itemId: number, failSeverity: Severity) => {
    setResponses((prev) => {
      const next = { ...prev, [checklistId]: { ...prev[checklistId] } };
      if (!next[checklistId]) next[checklistId] = {};
      next[checklistId] = {
        ...next[checklistId],
        [itemId]: {
          ...next[checklistId][itemId],
          failSeverity,
        },
      };
      return next;
    });
  }, []);

  const startChecklist = useCallback((id: string) => {
    setActiveChecklist(id);
    setShowResults(false);
  }, []);

  const submitReview = useCallback(() => {
    setShowResults(true);
  }, []);

  const backToSelector = useCallback(() => {
    setActiveChecklist(null);
    setShowResults(false);
  }, []);

  const runAnother = useCallback(() => {
    setActiveChecklist(null);
    setShowResults(false);
  }, []);

  /* overall score across all checklists for dashboard */
  const overallScore = useMemo(() => {
    let totalItems = 0;
    let totalPassed = 0;
    Object.values(responses).forEach((checklistResp) => {
      Object.values(checklistResp).forEach((item) => {
        totalItems++;
        if (item.response === 'pass') totalPassed++;
      });
    });
    return totalItems > 0 ? Math.round((totalPassed / totalItems) * 100) : 0;
  }, [responses]);

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-8 pb-24">
      {/* ========== PAGE HEADER + STATS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="mb-8"
      >
        <p className="text-[13px] text-[#64748B] mb-2">Quality / QA Hub</p>
        <h1 className="text-[36px] font-bold text-[#F1F5F9] font-headline leading-[1.15] tracking-[-0.02em]">
          Quality Assurance
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.15 }}
          className="text-[16px] text-[#94A3B8] mt-3 max-w-[600px] leading-[1.6]"
        >
          Review and validate all marketing content before publishing. Every checklist item is a checkpoint.
        </motion.p>

        {/* Stat Pills */}
        <div className="flex flex-wrap gap-3 mt-6">
          {qaStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.35, ease: easeOutBack }}
              className="flex items-center gap-3 bg-[#111118] rounded-full px-5 py-3 border border-[rgba(255,255,255,0.06)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="text-[13px] text-[#94A3B8]">{stat.label}</span>
              </div>
              <span className="text-[20px] font-mono font-medium" style={{ color: stat.color }}>
                {stat.value}{stat.suffix}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Overall Score Dashboard */}
        {overallScore > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-4 flex items-center gap-4"
          >
            <div className="flex items-center gap-2 bg-[#111118] rounded-[10px] px-4 py-2.5 border border-[rgba(255,255,255,0.06)]">
              <ListChecks size={16} className="text-[#8B5CF6]" />
              <span className="text-[13px] text-[#94A3B8]">Overall Score:</span>
              <span className={'text-[16px] font-mono font-medium ' + (overallScore >= 90 ? 'text-[#10B981]' : overallScore >= 70 ? 'text-[#F59E0B]' : 'text-[#F43F5E]')}>
                {overallScore}%
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ========== CHECKLIST SELECTOR ========== */}
      <AnimatePresence mode="wait">
        {!activeChecklist && (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-[22px] font-semibold text-[#F1F5F9] font-headline mb-1">Choose a Checklist</h2>
            <p className="text-[13px] text-[#94A3B8] mb-5">Select the type of review you need to run</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {checklists.map((cl, i) => (
                <motion.div
                  key={cl.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: easeOutExpo }}
                  whileHover={{ y: -5, transition: { duration: 0.25 } }}
                  className="bg-[#111118] rounded-2xl p-6 border border-[rgba(255,255,255,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-250 group"
                  style={{ borderTop: `4px solid ${cl.color}` }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ background: cl.colorBg }}
                  >
                    <span style={{ color: cl.color }}>{cl.icon}</span>
                  </div>
                  <h3 className="text-[22px] font-semibold text-[#F1F5F9] font-headline mb-2">{cl.name}</h3>
                  <p className="text-[14px] text-[#94A3B8] leading-[1.5] mb-4">{cl.description}</p>

                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
                      style={{ background: cl.colorBg, color: cl.color }}
                    >
                      {cl.items.length} items
                    </span>
                    <span className="text-[13px] text-[#64748B] flex items-center gap-1">
                      <Clock size={12} /> {cl.avgTime}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#64748B] mb-5">
                    Last run {cl.lastRun} — <span style={{ color: cl.color }}>{cl.lastRunStatus}</span>
                  </p>

                  {/* Item Preview */}
                  <div className="space-y-1.5 mb-5">
                    {cl.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-[12px] text-[#64748B]">
                        <Check size={12} className="text-[#475569] shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {cl.items.length > 4 && (
                      <p className="text-[12px] text-[#475569]">+ {cl.items.length - 4} more</p>
                    )}
                  </div>

                  <button
                    onClick={() => startChecklist(cl.id)}
                    className="w-full h-10 rounded-[10px] text-sm font-medium text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${cl.color}, ${cl.id === 'content' ? '#22D3EE' : cl.id === 'agent' ? '#A78BFA' : '#FBBF24'})` }}
                  >
                    <Play size={16} />
                    Start Review
                  </button>
                </motion.div>
              ))}
            </div>

            {/* QA History (collapsible) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden"
            >
              <button
                onClick={() => setHistoryOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-5 px-6 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-[22px] font-semibold text-[#F1F5F9] font-headline">Review History</h3>
                  <span className="text-[13px] text-[#64748B]">23 reviews completed</span>
                </div>
                <motion.div animate={{ rotate: historyOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown size={20} className="text-[#64748B]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {historyOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[rgba(255,255,255,0.06)]">
                            <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-3">Checklist</th>
                            <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-3">Content</th>
                            <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-3">Result</th>
                            <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-3">Score</th>
                            <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-3">Date</th>
                            <th className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider py-3 px-3">Reviewer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qaHistory.map((row, i) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.04 }}
                              className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[#22222E] transition-colors"
                            >
                              <td className="py-3 px-3 text-[13px] text-[#F1F5F9]">{row.checklist}</td>
                              <td className="py-3 px-3 text-[13px] text-[#94A3B8]">{row.content}</td>
                              <td className="py-3 px-3"><ResultBadge result={row.result} /></td>
                              <td className="py-3 px-3 text-[14px] font-mono text-[#F1F5F9]">{row.score}</td>
                              <td className="py-3 px-3 text-[13px] text-[#94A3B8]">{row.date}</td>
                              <td className="py-3 px-3 text-[13px] text-[#94A3B8]">{row.reviewer}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* ========== ACTIVE CHECKLIST RUNNER ========== */}
        {activeChecklist && currentChecklist && !showResults && (
          <motion.div
            key="runner"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
          >
            {/* Runner Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={backToSelector}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F1F5F9] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: currentChecklist.colorBg }}
                >
                  <span style={{ color: currentChecklist.color }}>{currentChecklist.icon}</span>
                </div>
                <div>
                  <h2 className="text-[28px] font-bold text-[#F1F5F9] font-headline leading-[1.2]">{currentChecklist.name}</h2>
                  <p className="text-[14px] font-mono text-[#64748B]">{progress.checked} of {progress.total} items checked</p>
                </div>
              </div>
              {allAnswered && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={submitReview}
                  className="h-10 px-5 rounded-[10px] text-sm font-medium text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02] flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                >
                  <Check size={16} />
                  Submit Review
                </motion.button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-1.5 bg-[#22222E] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${currentChecklist.color}, ${currentChecklist.id === 'content' ? '#22D3EE' : currentChecklist.id === 'agent' ? '#A78BFA' : '#FBBF24'})` }}
                  initial={{ width: 0 }}
                  animate={{ width: progress.pct + '%' }}
                  transition={{ duration: 0.4, ease: easeOutExpo }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
              {currentChecklist.items.map((item, i) => {
                const state = currentResponses[item.id];
                const resp = state?.response || null;
                const isFail = resp === 'fail';
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35, ease: easeOutExpo }}
                    className={
                      'bg-[#111118] rounded-2xl p-6 border transition-colors duration-200 ' +
                      (isFail ? 'border-[rgba(244,63,94,0.3)]' : 'border-[rgba(255,255,255,0.06)]')
                    }
                  >
                    {/* Item Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={
                          'w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 transition-colors duration-200 ' +
                          (resp === 'pass'
                            ? 'bg-[rgba(16,185,129,0.2)] text-[#10B981]'
                            : resp === 'fail'
                              ? 'bg-[rgba(244,63,94,0.2)] text-[#F43F5E]'
                              : resp === 'na'
                                ? 'bg-[rgba(100,116,139,0.2)] text-[#94A3B8]'
                                : 'bg-[#22222E] text-[#475569] border border-[rgba(255,255,255,0.1)]')
                        }
                      >
                        {resp === 'pass' ? <Check size={18} /> : resp === 'fail' ? <X size={18} /> : resp === 'na' ? <Minus size={18} /> : item.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: currentChecklist.colorBg, color: currentChecklist.color }}
                          >
                            {item.category}
                          </span>
                          {isFail && state?.failSeverity && <SeverityBadge severity={state.failSeverity} />}
                        </div>
                        <h4 className="text-[18px] font-semibold text-[#F1F5F9] leading-[1.35]">{item.title}</h4>
                        <p className="text-[13px] text-[#94A3B8] mt-1 leading-[1.5]">{item.description}</p>
                      </div>
                    </div>

                    {/* Response Buttons */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => setResponse(currentChecklist.id, item.id, 'pass')}
                        className={
                          'flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[13px] font-medium transition-all duration-200 ' +
                          (resp === 'pass'
                            ? 'bg-[#10B981] text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-[#0A0A0F] text-[#94A3B8] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#10B981]')
                        }
                      >
                        <Check size={14} />
                        Pass
                      </button>
                      <button
                        onClick={() => setResponse(currentChecklist.id, item.id, 'fail')}
                        className={
                          'flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[13px] font-medium transition-all duration-200 ' +
                          (resp === 'fail'
                            ? 'bg-[#F43F5E] text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                            : 'bg-[#0A0A0F] text-[#94A3B8] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(244,63,94,0.1)] hover:text-[#F43F5E]')
                        }
                      >
                        <X size={14} />
                        Fail
                      </button>
                      <button
                        onClick={() => setResponse(currentChecklist.id, item.id, 'na')}
                        className={
                          'flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[13px] font-medium transition-all duration-200 ' +
                          (resp === 'na'
                            ? 'bg-[#64748B] text-white'
                            : 'bg-[#0A0A0F] text-[#94A3B8] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(100,116,139,0.1)] hover:text-[#F1F5F9]')
                        }
                      >
                        <Minus size={14} />
                        N/A
                      </button>
                    </div>

                    {/* Notes + Fail Severity */}
                    <AnimatePresence>
                      {resp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2">
                            {isFail && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[12px] text-[#64748B]">Severity:</span>
                                {(['Critical', 'High', 'Medium', 'Low'] as Severity[]).map((sev) => (
                                  <button
                                    key={sev}
                                    onClick={() => setFailSeverity(currentChecklist.id, item.id, sev)}
                                    className={
                                      'px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ' +
                                      (state?.failSeverity === sev
                                        ? sev === 'Critical'
                                          ? 'bg-[rgba(244,63,94,0.2)] text-[#F43F5E]'
                                          : sev === 'High'
                                            ? 'bg-[rgba(245,158,11,0.2)] text-[#F59E0B]'
                                            : sev === 'Medium'
                                              ? 'bg-[rgba(6,182,212,0.2)] text-[#06B6D4]'
                                              : 'bg-[rgba(100,116,139,0.2)] text-[#94A3B8]'
                                        : 'bg-[#22222E] text-[#475569] hover:text-[#94A3B8]')
                                    }
                                  >
                                    {sev}
                                  </button>
                                ))}
                              </div>
                            )}
                            <textarea
                              value={state?.notes || ''}
                              onChange={(e) => setNotes(currentChecklist.id, item.id, e.target.value)}
                              placeholder={isFail ? 'Describe the issue found...' : 'Add optional notes...'}
                              className={
                                'w-full bg-[#0A0A0F] border rounded-[10px] px-4 py-3 text-[13px] text-[#F1F5F9] placeholder-[#475569] outline-none transition-all resize-none ' +
                                (isFail ? 'border-[rgba(244,63,94,0.3)] focus:border-[#F43F5E] focus:shadow-[0_0_12px_rgba(244,63,94,0.1)]' : 'border-[rgba(255,255,255,0.06)] focus:border-[#8B5CF6] focus:shadow-[0_0_12px_rgba(139,92,246,0.1)]')
                              }
                              rows={2}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Submit */}
            {allAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center justify-center"
              >
                <button
                  onClick={submitReview}
                  className="h-12 px-8 rounded-[10px] text-base font-medium text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02] flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                >
                  <Check size={18} />
                  Submit Review
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ========== QA RESULTS ========== */}
        {showResults && currentChecklist && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Results Header */}
            <div className="mb-8">
              <button
                onClick={backToSelector}
                className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F1F5F9] transition-colors mb-4"
              >
                <ArrowLeft size={16} />
                Back to Checklists
              </button>

              <h2 className="text-[28px] font-bold text-[#F1F5F9] font-headline mb-3">
                {currentChecklist.name} — Review Complete
              </h2>

              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, ease: easeOutBack }}
                  className={
                    'px-4 py-2 rounded-[10px] text-[18px] font-bold flex items-center gap-2 ' +
                    (summary.fail === 0
                      ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981]'
                      : 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]')
                  }
                >
                  {summary.fail === 0 ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  {summary.fail === 0 ? 'PASSED' : 'NEEDS ATTENTION'}
                </motion.div>
                <span className="text-[20px] font-mono text-[#F1F5F9]">
                  {summary.pass}/{currentChecklist.items.length} passed
                  {summary.fail > 0 && <span className="text-[#F43F5E]">, {summary.fail} failed</span>}
                  {summary.na > 0 && <span className="text-[#94A3B8]">, {summary.na} N/A</span>}
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Passed', value: summary.pass, color: '#10B981', bg: 'bg-[rgba(16,185,129,0.15)]' },
                { label: 'Failed', value: summary.fail, color: '#F43F5E', bg: 'bg-[rgba(244,63,94,0.15)]' },
                { label: 'N/A', value: summary.na, color: '#94A3B8', bg: 'bg-[rgba(100,116,139,0.15)]' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: easeOutExpo }}
                  className={'rounded-2xl p-5 border border-[rgba(255,255,255,0.06)] ' + card.bg}
                >
                  <p className="text-[13px] font-medium mb-1" style={{ color: card.color }}>{card.label}</p>
                  <p className="text-[32px] font-mono font-medium text-[#F1F5F9]">{card.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Failed Items Detail */}
            {summary.fail > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
                  <XCircle size={20} className="text-[#F43F5E]" />
                  Failed Items
                </h3>
                <div className="space-y-3">
                  {currentChecklist.items
                    .filter((item) => currentResponses[item.id]?.response === 'fail')
                    .map((item) => {
                      const state = currentResponses[item.id];
                      return (
                        <div
                          key={item.id}
                          className="bg-[#111118] rounded-2xl p-5 border border-[rgba(244,63,94,0.2)]"
                        >
                          <div className="flex items-start gap-3">
                            <X size={18} className="text-[#F43F5E] mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[14px] font-semibold text-[#F1F5F9]">{item.title}</span>
                                {state?.failSeverity && <SeverityBadge severity={state.failSeverity} />}
                              </div>
                              <p className="text-[13px] text-[#94A3B8] mb-2">{item.description}</p>
                              {state?.notes && (
                                <div className="bg-[#0A0A0F] rounded-[10px] p-3 border border-[rgba(255,255,255,0.06)]">
                                  <p className="text-[12px] text-[#64748B] mb-1">Notes:</p>
                                  <p className="text-[13px] text-[#F1F5F9]">{state.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Passed Items */}
            {summary.pass > 0 && (
              <div className="mb-8">
                <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-[#10B981]" />
                  Passed Items
                </h3>
                <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] divide-y divide-[rgba(255,255,255,0.06)]">
                  {currentChecklist.items
                    .filter((item) => currentResponses[item.id]?.response === 'pass')
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <Check size={14} className="text-[#10B981] shrink-0" />
                        <span className="text-[14px] text-[#94A3B8]">{item.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* N/A Items */}
            {summary.na > 0 && (
              <div className="mb-8">
                <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#94A3B8]" />
                  N/A Items
                </h3>
                <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] divide-y divide-[rgba(255,255,255,0.06)]">
                  {currentChecklist.items
                    .filter((item) => currentResponses[item.id]?.response === 'na')
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <Minus size={14} className="text-[#64748B] shrink-0" />
                        <span className="text-[14px] text-[#94A3B8]">{item.title}</span>
                        {currentResponses[item.id]?.notes && (
                          <span className="text-[12px] text-[#475569] ml-auto">{currentResponses[item.id].notes}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 sticky bottom-4 bg-[#1A1A24] border border-[rgba(255,255,255,0.06)] rounded-[10px] p-4 z-10">
              <button className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-[#F1F5F9] bg-[#22222E] border border-[rgba(255,255,255,0.1)] hover:bg-[#2A2A38] transition-colors">
                <Download size={16} />
                Download Report
              </button>
              <button className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-[#F1F5F9] bg-[#22222E] border border-[rgba(255,255,255,0.1)] hover:bg-[#2A2A38] transition-colors">
                <Share2 size={16} />
                Share Results
              </button>
              {summary.fail === 0 ? (
                <button className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-white transition-all hover:brightness-110 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}>
                  <Check size={16} />
                  Mark as Resolved
                </button>
              ) : (
                <button className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-white bg-[#F43F5E] hover:brightness-110 transition-all">
                  <AlertTriangle size={16} />
                  Address Issues
                </button>
              )}
              <button
                onClick={runAnother}
                className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors ml-auto"
              >
                Run Another Checklist
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
