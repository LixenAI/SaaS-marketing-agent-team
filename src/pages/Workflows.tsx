import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── types ─────────────────────── */

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  type: 'form' | 'selection' | 'review' | 'preview' | 'confirmation';
  fields: StepField[];
  checklist?: string[];
}

interface StepField {
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  required?: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedTime: string;
  lastRun: string;
  color: 'violet' | 'cyan' | 'emerald';
  accentColor: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completedSteps: number;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'completed' | 'in-progress' | 'failed' | 'cancelled';
  stepsCompleted: number;
  totalSteps: number;
  startedAt: string;
  completedAt: string | null;
}

/* ─────────────────────── data ─────────────────────── */

const WORKFLOW_DEFINITIONS: Workflow[] = [
  {
    id: 'weekly-marketing',
    name: 'Weekly Marketing Workflow',
    description:
      'Plan the week\'s marketing priorities, content assignments, social calendar, and review schedule.',
    steps: [
      {
        id: 1, title: 'Set Weekly Priorities',
        description: 'Define top 3 marketing priorities for the week.',
        type: 'form',
        fields: [
          { label: 'Priority 1', placeholder: 'e.g., Launch LinkedIn ad campaign', type: 'text', required: true },
          { label: 'Priority 2', placeholder: 'e.g., Publish blog post on med spa trends', type: 'text', required: false },
          { label: 'Priority 3', placeholder: 'e.g., Update landing page copy', type: 'text', required: false },
        ],
      },
      {
        id: 2, title: 'Agent Assignment',
        description: 'Assign tasks to specific marketing agents.',
        type: 'selection',
        fields: [
          { label: 'Content Agent Tasks', placeholder: 'Assign content tasks...', type: 'textarea', required: false },
          { label: 'Social Agent Tasks', placeholder: 'Assign social media tasks...', type: 'textarea', required: false },
          { label: 'Ads Agent Tasks', placeholder: 'Assign ad campaign tasks...', type: 'textarea', required: false },
        ],
      },
      {
        id: 3, title: 'Content Plan Review',
        description: 'Review and approve the content calendar for the week.',
        type: 'review',
        checklist: [
          'Blog posts scheduled and approved',
          'Social media content calendar finalized',
          'Email newsletter content ready',
          'Ad copy reviewed for compliance',
        ],
        fields: [{ label: 'Reviewer Notes', placeholder: 'Add any notes or concerns...', type: 'textarea', required: false }],
      },
      {
        id: 4, title: 'Social Calendar',
        description: 'Generate and schedule social media content.',
        type: 'form',
        fields: [
          { label: 'Platforms', placeholder: 'Select platforms...', type: 'select', options: ['LinkedIn', 'Instagram', 'TikTok', 'All Platforms'], required: true },
          { label: 'Post Count', placeholder: 'e.g., 5 posts per platform', type: 'text', required: false },
          { label: 'Content Themes', placeholder: 'e.g., Med Spa Tips, Partner Success Stories', type: 'textarea', required: false },
        ],
      },
      {
        id: 5, title: 'Final Review & Publish',
        description: 'QA check and publish all approved content.',
        type: 'confirmation',
        checklist: [
          'All content reviewed and approved',
          'Brand compliance verified',
          'Publishing schedule confirmed',
          'Analytics tracking enabled',
        ],
        fields: [{ label: 'Final Notes', placeholder: 'Any last-minute notes...', type: 'textarea', required: false }],
      },
    ],
    estimatedTime: '~30 min',
    lastRun: '2d ago',
    color: 'violet',
    accentColor: '#8B5CF6',
    status: 'not-started',
    completedSteps: 0,
  },
  {
    id: 'campaign-production',
    name: 'Campaign Production Workflow',
    description:
      'Build a complete campaign from brief to publish-ready assets across all channels.',
    steps: [
      {
        id: 1, title: 'Campaign Brief',
        description: 'Fill out the campaign brief template.',
        type: 'form',
        fields: [
          { label: 'Campaign Name', placeholder: 'e.g., Summer Med Spa Glow-Up', type: 'text', required: true },
          { label: 'Campaign Objective', placeholder: 'Select objective...', type: 'select', options: ['Brand Awareness', 'Lead Generation', 'Partner Recruitment', 'Product Launch', 'Retention'], required: true },
          { label: 'Target Audience', placeholder: 'e.g., Women 25-45 interested in skincare', type: 'text', required: true },
        ],
      },
      {
        id: 2, title: 'Channel Strategy',
        description: 'Define channel mix and timeline.',
        type: 'selection',
        fields: [
          { label: 'Primary Channels', placeholder: 'Select primary channels...', type: 'select', options: ['LinkedIn', 'Instagram', 'TikTok', 'Email', 'Paid Ads', 'Landing Page'], required: true },
          { label: 'Budget Allocation', placeholder: 'e.g., $5K ads, $2K content', type: 'text', required: false },
          { label: 'Timeline', placeholder: 'e.g., 4 weeks', type: 'text', required: false },
        ],
      },
      {
        id: 3, title: 'Copy & Creative',
        description: 'Generate all copy and creative briefs.',
        type: 'form',
        fields: [
          { label: 'Headline Options', placeholder: 'List 3 headline variations...', type: 'textarea', required: true },
          { label: 'Body Copy', placeholder: 'Main campaign body copy...', type: 'textarea', required: true },
          { label: 'CTA', placeholder: 'e.g., Book Your Free Consultation', type: 'text', required: true },
        ],
      },
      {
        id: 4, title: 'Asset Production',
        description: 'Create ads, social posts, and landing pages.',
        type: 'review',
        checklist: [
          'Ad creatives designed and approved',
          'Social media assets created',
          'Landing page built and tested',
          'Email template prepared',
        ],
        fields: [{ label: 'Asset Notes', placeholder: 'Notes on asset production...', type: 'textarea', required: false }],
      },
      {
        id: 5, title: 'QA & Review',
        description: 'Run QA checklist on all assets.',
        type: 'review',
        checklist: [
          'All links working correctly',
          'Brand guidelines followed',
          'Compliance rules verified',
          'Mobile responsiveness checked',
          'Tracking pixels installed',
        ],
        fields: [{ label: 'QA Notes', placeholder: 'Document any issues found...', type: 'textarea', required: false }],
      },
      {
        id: 6, title: 'Launch & Monitor',
        description: 'Publish and set up monitoring.',
        type: 'confirmation',
        checklist: [
          'All assets published',
          'Analytics dashboard configured',
          'Team notified of launch',
          'Monitoring alerts set up',
        ],
        fields: [{ label: 'Launch Notes', placeholder: 'Post-launch observations...', type: 'textarea', required: false }],
      },
    ],
    estimatedTime: '~60 min',
    lastRun: '5d ago',
    color: 'cyan',
    accentColor: '#06B6D4',
    status: 'in-progress',
    completedSteps: 2,
  },
  {
    id: 'partner-recruitment',
    name: 'Partner Recruitment Workflow',
    description:
      'Identify, reach out to, qualify, and onboard new Agency Partners.',
    steps: [
      {
        id: 1, title: 'Prospect Identification',
        description: 'Define ideal partner profile and build prospect list.',
        type: 'form',
        fields: [
          { label: 'Ideal Partner Profile', placeholder: 'e.g., Med Spa owners with 3+ locations', type: 'textarea', required: true },
          { label: 'Target Geography', placeholder: 'e.g., California, Texas, Florida', type: 'text', required: true },
          { label: 'Prospect Count Goal', placeholder: 'e.g., 50 prospects', type: 'text', required: false },
        ],
      },
      {
        id: 2, title: 'Outreach Sequence',
        description: 'Generate and send LinkedIn outreach messages.',
        type: 'form',
        fields: [
          { label: 'Connection Message', placeholder: 'Hi [Name], I noticed your work at [Company]...', type: 'textarea', required: true },
          { label: 'Follow-up Message', placeholder: 'Following up on my previous message...', type: 'textarea', required: true },
          { label: 'Sender Profile', placeholder: 'Which team member\'s LinkedIn to use?', type: 'text', required: false },
        ],
      },
      {
        id: 3, title: 'Qualification',
        description: 'Review responses and qualify interested prospects.',
        type: 'review',
        checklist: [
          'Response rate tracked',
          'Interested prospects identified',
          'Qualification criteria applied',
          'Discovery calls scheduled',
        ],
        fields: [{ label: 'Qualification Notes', placeholder: 'Notes on qualified prospects...', type: 'textarea', required: false }],
      },
      {
        id: 4, title: 'Onboarding',
        description: 'Send onboarding materials and schedule kickoff.',
        type: 'confirmation',
        checklist: [
          'Partnership agreement sent',
          'Onboarding deck prepared',
          'Kickoff meeting scheduled',
          'Welcome email sent',
        ],
        fields: [{ label: 'Onboarding Notes', placeholder: 'Final onboarding details...', type: 'textarea', required: false }],
      },
    ],
    estimatedTime: '~45 min',
    lastRun: '1w ago',
    color: 'violet',
    accentColor: '#8B5CF6',
    status: 'not-started',
    completedSteps: 0,
  },
  {
    id: 'sales-enablement',
    name: 'Sales Enablement Workflow',
    description:
      'Prepare discovery calls, demos, objection handling, and partner training materials.',
    steps: [
      {
        id: 1, title: 'Discovery Prep',
        description: 'Prepare discovery call scripts and qualification questions.',
        type: 'form',
        fields: [
          { label: 'Discovery Questions', placeholder: 'List 5-7 key questions...', type: 'textarea', required: true },
          { label: 'Qualification Criteria', placeholder: 'BANT or MEDDIC criteria...', type: 'textarea', required: true },
          { label: 'Call Duration', placeholder: 'e.g., 30 minutes', type: 'text', required: false },
        ],
      },
      {
        id: 2, title: 'Demo Materials',
        description: 'Build demo presentation and talking points.',
        type: 'form',
        fields: [
          { label: 'Demo Flow', placeholder: 'Outline the demo sequence...', type: 'textarea', required: true },
          { label: 'Key Features to Highlight', placeholder: 'List top 5 features...', type: 'textarea', required: true },
          { label: 'Custom Talking Points', placeholder: 'Personalization notes...', type: 'textarea', required: false },
        ],
      },
      {
        id: 3, title: 'Objection Handling',
        description: 'Generate responses to common objections.',
        type: 'form',
        fields: [
          { label: 'Common Objections', placeholder: 'List objections you expect...', type: 'textarea', required: true },
          { label: 'Response Scripts', placeholder: 'Draft responses for each objection...', type: 'textarea', required: true },
        ],
      },
      {
        id: 4, title: 'Proposal Draft',
        description: 'Create proposal template with current offers.',
        type: 'form',
        fields: [
          { label: 'Offer Package', placeholder: 'e.g., Premium Partnership - $2,500/mo', type: 'text', required: true },
          { label: 'Proposal Outline', placeholder: 'Key sections of the proposal...', type: 'textarea', required: true },
          { label: 'Pricing Notes', placeholder: 'Any flexible pricing options...', type: 'textarea', required: false },
        ],
      },
      {
        id: 5, title: 'Training Deck',
        description: 'Assemble partner training materials.',
        type: 'confirmation',
        checklist: [
          'Training deck completed',
          'Product walkthrough recorded',
          'FAQ document updated',
          'Support contacts listed',
        ],
        fields: [{ label: 'Training Notes', placeholder: 'Additional training resources...', type: 'textarea', required: false }],
      },
    ],
    estimatedTime: '~40 min',
    lastRun: '3d ago',
    color: 'emerald',
    accentColor: '#10B981',
    status: 'not-started',
    completedSteps: 0,
  },
];

const INITIAL_HISTORY: WorkflowRun[] = [
  { id: 'run-1', workflowId: 'weekly-marketing', workflowName: 'Weekly Marketing Workflow', status: 'completed', stepsCompleted: 5, totalSteps: 5, startedAt: '2026-01-12 09:00', completedAt: '2026-01-12 09:35' },
  { id: 'run-2', workflowId: 'campaign-production', workflowName: 'Campaign Production Workflow', status: 'in-progress', stepsCompleted: 2, totalSteps: 6, startedAt: '2026-01-14 14:00', completedAt: null },
  { id: 'run-3', workflowId: 'sales-enablement', workflowName: 'Sales Enablement Workflow', status: 'completed', stepsCompleted: 5, totalSteps: 5, startedAt: '2026-01-13 11:00', completedAt: '2026-01-13 11:42' },
  { id: 'run-4', workflowId: 'partner-recruitment', workflowName: 'Partner Recruitment Workflow', status: 'cancelled', stepsCompleted: 1, totalSteps: 4, startedAt: '2026-01-10 10:00', completedAt: null },
  { id: 'run-5', workflowId: 'weekly-marketing', workflowName: 'Weekly Marketing Workflow', status: 'completed', stepsCompleted: 5, totalSteps: 5, startedAt: '2026-01-05 09:00', completedAt: '2026-01-05 09:28' },
  { id: 'run-6', workflowId: 'sales-enablement', workflowName: 'Sales Enablement Workflow', status: 'failed', stepsCompleted: 2, totalSteps: 5, startedAt: '2026-01-08 15:00', completedAt: null },
  { id: 'run-7', workflowId: 'campaign-production', workflowName: 'Campaign Production Workflow', status: 'completed', stepsCompleted: 6, totalSteps: 6, startedAt: '2026-01-02 13:00', completedAt: '2026-01-02 14:15' },
  { id: 'run-8', workflowId: 'weekly-marketing', workflowName: 'Weekly Marketing Workflow', status: 'completed', stepsCompleted: 5, totalSteps: 5, startedAt: '2025-12-29 09:00', completedAt: '2025-12-29 09:40' },
];

/* ─────────────────────── easing ─────────────────────── */

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ─────────────────────── helpers ─────────────────────── */

function statusBadgeClasses(status: WorkflowRun['status']) {
  switch (status) {
    case 'completed': return 'bg-[#10B981]/15 text-[#10B981]';
    case 'in-progress': return 'bg-[#8B5CF6]/15 text-[#8B5CF6]';
    case 'failed': return 'bg-[#F43F5E]/15 text-[#F43F5E]';
    case 'cancelled': return 'bg-[#64748B]/15 text-[#64748B]';
  }
}

function statusLabel(status: WorkflowRun['status']) {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': return 'In Progress';
    case 'failed': return 'Failed';
    case 'cancelled': return 'Cancelled';
  }
}

/* ═══════════════════════ WORKFLOW CARD ═══════════════════════ */

function WorkflowCard({
  workflow,
  onStart,
}: {
  workflow: Workflow;
  onStart: (w: Workflow) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const progressPct = workflow.steps.length > 0
    ? Math.round((workflow.completedSteps / workflow.steps.length) * 100)
    : 0;

  const colorMap = {
    violet: { bar: 'bg-[#8B5CF6]', dot: 'bg-[#8B5CF6]', border: 'border-[#8B5CF6]/30', glow: 'hover:border-[#8B5CF6]/30' },
    cyan: { bar: 'bg-[#06B6D4]', dot: 'bg-[#06B6D4]', border: 'border-[#06B6D4]/30', glow: 'hover:border-[#06B6D4]/30' },
    emerald: { bar: 'bg-[#10B981]', dot: 'bg-[#10B981]', border: 'border-[#10B981]/30', glow: 'hover:border-[#10B981]/30' },
  };
  const c = colorMap[workflow.color];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        'group bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden transition-all duration-250',
        'hover:-translate-y-[5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]',
        c.glow,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail area */}
      <div className="relative h-40 overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-400',
            hovered && 'scale-105',
          )}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${workflow.accentColor}20, ${workflow.accentColor}08)` }}
          >
            <Zap size={48} style={{ color: workflow.accentColor }} className="opacity-40" />
          </div>
        </div>
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111118] to-transparent" />
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            workflow.status === 'in-progress' ? 'bg-[#8B5CF6]/20 text-[#A78BFA]' :
            workflow.status === 'completed' ? 'bg-[#10B981]/20 text-[#10B981]' :
            'bg-[#1A1A24] text-[#64748B]',
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
            {workflow.status === 'in-progress' ? 'In Progress' : workflow.status === 'completed' ? 'Completed' : 'Not Started'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#F1F5F9] font-headline mb-1.5">
          {workflow.name}
        </h3>
        <p className="text-sm text-[#94A3B8] line-clamp-2 mb-4">
          {workflow.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-[#2A2A38] text-[#94A3B8]">
            {workflow.steps.length} steps
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
            <Clock size={12} />
            {workflow.estimatedTime}
          </span>
          <span className="text-xs text-[#64748B]">
            Last run {workflow.lastRun}
          </span>
        </div>

        {/* Mini progress bar */}
        {workflow.status === 'in-progress' && (
          <div className="mb-4">
            <div className="h-[3px] bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', c.bar)}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
              />
            </div>
            <p className="text-xs text-[#64748B] mt-1">{progressPct}% complete</p>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => onStart(workflow)}
          className={cn(
            'w-full h-10 rounded-[10px] text-sm font-medium text-white transition-all duration-200',
            'hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]',
          )}
          style={{ background: `linear-gradient(135deg, ${workflow.accentColor}, ${workflow.accentColor}CC)` }}
        >
          <span className="flex items-center justify-center gap-2">
            <Play size={14} />
            {workflow.status === 'in-progress' ? 'Continue Workflow' : 'Start Workflow'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ WORKFLOW RUNNER ═══════════════════════ */

function WorkflowRunner({
  workflow,
  onComplete,
  onCancel,
}: {
  workflow: Workflow;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const step = workflow.steps[currentStep];
  const isLastStep = currentStep === workflow.steps.length - 1;
  const progress = ((currentStep + 1) / workflow.steps.length) * 100;

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const toggleChecklistItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Workflows
          </button>
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-[#10B981]">
              <Save size={12} />
              Saved
            </span>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-[#F1F5F9] font-headline mb-2">
          {workflow.name}
        </h2>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span>Step {currentStep + 1} of {workflow.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-[3px] bg-[#1A1A24] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
            />
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 mt-4">
          {workflow.steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={cn(
                'w-8 h-8 rounded-full text-xs font-medium transition-all duration-200',
                i === currentStep
                  ? 'bg-[#8B5CF6] text-white'
                  : i < currentStep
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-[#1A1A24] text-[#64748B]',
              )}
            >
              {i < currentStep ? <Check size={14} className="mx-auto" /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: easeOutExpo }}
        >
          <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">{step.title}</h3>
          <p className="text-sm text-[#94A3B8] mb-6">{step.description}</p>

          {/* Checklist */}
          {step.checklist && (
            <div className="space-y-3 mb-6">
              {step.checklist.map((item) => (
                <label
                  key={item}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.06)] cursor-pointer hover:border-[rgba(139,92,246,0.3)] transition-colors"
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      checkedItems.has(item)
                        ? 'bg-[#8B5CF6] border-[#8B5CF6]'
                        : 'border-[#475569]',
                    )}
                    onClick={() => toggleChecklistItem(item)}
                  >
                    {checkedItems.has(item) && <Check size={12} className="text-white" />}
                  </div>
                  <span className={cn('text-sm', checkedItems.has(item) ? 'text-[#F1F5F9] line-through' : 'text-[#94A3B8]')}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            {step.fields.map((field) => (
              <div key={field.label}>
                <label className="block text-sm text-[#94A3B8] mb-1.5">
                  {field.label}
                  {field.required && <span className="text-[#F43F5E] ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] transition-all resize-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                    className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] cursor-pointer"
                  >
                    <option value="">{field.placeholder || 'Select...'}</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer actions */}
      <div className="p-6 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all"
        >
          <Save size={14} />
          Save Draft
        </button>
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all"
            >
              <ArrowLeft size={14} />
              Previous
            </button>
          )}
          <button
            onClick={() => {
              if (isLastStep) {
                onComplete();
              } else {
                setCurrentStep((s) => s + 1);
                handleSave();
              }
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
          >
            {isLastStep ? (
              <>
                <CheckCircle2 size={14} />
                Complete Workflow
              </>
            ) : (
              <>
                Next
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ WORKFLOW HISTORY ═══════════════════════ */

function WorkflowHistory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: easeOutExpo }}
      className="mt-8"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-4"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Workflow History
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Workflow</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Steps</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Started</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-6 py-3">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {INITIAL_HISTORY.map((run, i) => (
                    <motion.tr
                      key={run.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-[#F1F5F9]">{run.workflowName}</td>
                      <td className="px-6 py-3">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusBadgeClasses(run.status))}>
                          {statusLabel(run.status)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#94A3B8]">{run.stepsCompleted}/{run.totalSteps}</td>
                      <td className="px-6 py-3 text-sm text-[#64748B]">{run.startedAt}</td>
                      <td className="px-6 py-3 text-sm text-[#64748B]">{run.completedAt || '-'}</td>
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

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function Workflows() {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [completedWorkflow, setCompletedWorkflow] = useState<Workflow | null>(null);

  return (
    <div className="p-8 min-h-[calc(100dvh-64px)]">
      {/* Header */}
      {!activeWorkflow && !completedWorkflow && (
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="mb-8"
        >
          <p className="text-[13px] text-[#64748B] mb-1">
            Operations <span className="text-[#475569]">/</span>{' '}
            <span className="text-[#F1F5F9]">Workflows</span>
          </p>
          <h1 className="text-[36px] font-headline font-bold text-[#F1F5F9] leading-[1.15] tracking-[-0.02em] mb-2">
            Workflows
          </h1>
          <p className="text-[16px] text-[#94A3B8] leading-[1.6] max-w-[640px] mb-5">
            Step-by-step guided workflows to execute marketing processes with consistency and quality.
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[13px] text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              2 active
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)] text-[13px] text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              12 completed this month
            </span>
          </div>
        </motion.section>
      )}

      {/* Workflow Catalog */}
      <AnimatePresence mode="wait">
        {!activeWorkflow && !completedWorkflow && (
          <motion.section
            key="catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WORKFLOW_DEFINITIONS.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  workflow={wf}
                  onStart={setActiveWorkflow}
                />
              ))}
            </div>
            <WorkflowHistory />
          </motion.section>
        )}

        {/* Active Runner */}
        {activeWorkflow && (
          <motion.section
            key="runner"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
          >
            <WorkflowRunner
              workflow={activeWorkflow}
              onComplete={() => {
                setCompletedWorkflow(activeWorkflow);
                setActiveWorkflow(null);
              }}
              onCancel={() => setActiveWorkflow(null)}
            />
          </motion.section>
        )}

        {/* Completion */}
        {completedWorkflow && (
          <motion.section
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeOutBack }}
              className="w-20 h-20 rounded-full bg-[#10B981]/20 flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={40} className="text-[#10B981]" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-[#F1F5F9] font-headline mb-2">
              Workflow Complete!
            </h2>
            <p className="text-[#94A3B8] mb-8">
              {completedWorkflow.name} has been completed successfully.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompletedWorkflow(null)}
                className="px-6 py-2.5 rounded-[10px] text-sm font-medium text-white hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
              >
                Back to Workflows
              </button>
              <button
                onClick={() => {
                  setCompletedWorkflow(null);
                  setActiveWorkflow(completedWorkflow);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all border border-[rgba(255,255,255,0.06)]"
              >
                <RotateCcw size={14} />
                Run Again
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
