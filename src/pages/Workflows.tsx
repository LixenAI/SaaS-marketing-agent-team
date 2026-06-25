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
  thumbnail: string;
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
    thumbnail: '/workflow-weekly.png',
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
    thumbnail: '/workflow-campaign.png',
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
    thumbnail: '/workflow-partner.png',
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
    thumbnail: '/workflow-sales.png',
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

/* ═══════════════════════ STEP CONTENT ═══════════════════════ */

function StepContent({
  step,
  stepIndex,
  formData,
  onFieldChange,
  checklistState,
  onChecklistToggle,
}: {
  step: WorkflowStep;
  stepIndex: number;
  totalSteps: number;
  formData: Record<string, string>;
  onFieldChange: (fieldIdx: number, value: string) => void;
  checklistState: boolean[];
  onChecklistToggle: (idx: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center text-[#8B5CF6] font-semibold text-lg font-headline">
          {stepIndex + 1}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-[#F1F5F9] font-headline">
            {step.title}
          </h4>
          <p className="text-sm text-[#94A3B8] mt-0.5">{step.description}</p>
        </div>
      </div>

      {/* Checklist if present */}
      {step.checklist && step.checklist.length > 0 && (
        <div className="bg-[#111118] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h5 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Checklist</h5>
          <div className="space-y-2.5">
            {step.checklist.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onChecklistToggle(idx)}
                className="flex items-center gap-3 w-full text-left group"
              >
                <div className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150',
                  checklistState[idx]
                    ? 'bg-[#10B981] border-[#10B981]'
                    : 'border-[#475569] group-hover:border-[#8B5CF6]',
                )}>
                  {checklistState[idx] && <Check size={12} className="text-white" />}
                </div>
                <span className={cn(
                  'text-sm transition-colors duration-150',
                  checklistState[idx] ? 'text-[#64748B] line-through' : 'text-[#F1F5F9]',
                )}>
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form fields */}
      {step.fields && step.fields.length > 0 && (
        <div className="space-y-4">
          {step.fields.map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                {field.label}
                {field.required && <span className="text-[#F43F5E] ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[`${step.id}-${idx}`] || ''}
                  onChange={(e) => onFieldChange(idx, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className={cn(
                    'w-full px-4 py-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B]',
                    'outline-none transition-all duration-150',
                    'focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
                  )}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[`${step.id}-${idx}`] || ''}
                  onChange={(e) => onFieldChange(idx, e.target.value)}
                  className={cn(
                    'w-full h-[42px] px-4 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9]',
                    'outline-none transition-all duration-150',
                    'focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
                  )}
                >
                  <option value="" className="bg-[#1A1A24]">{field.placeholder || 'Select...'}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#1A1A24]">{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[`${step.id}-${idx}`] || ''}
                  onChange={(e) => onFieldChange(idx, e.target.value)}
                  placeholder={field.placeholder}
                  className={cn(
                    'w-full h-[42px] px-4 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B]',
                    'outline-none transition-all duration-150',
                    'focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ COMPLETION CELEBRATION ═══════════════════════ */

function CompletionCelebration({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
    >
      {/* Confetti particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'][i % 5],
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: `${50 + (Math.random() - 0.5) * 40}%`,
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.8],
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400 - 100,
          }}
          transition={{ duration: 1.5, delay: i * 0.05, ease: easeOutExpo }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOutBack }}
        className="bg-[#1A1A24] rounded-2xl border border-[rgba(255,255,255,0.08)] p-10 text-center shadow-modal max-w-sm mx-4 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, ease: easeOutBack, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 size={40} className="text-[#10B981]" />
        </motion.div>
        <h3 className="text-2xl font-bold text-[#F1F5F9] font-headline mb-2">
          Workflow Complete!
        </h3>
        <p className="text-sm text-[#94A3B8] mb-6">
          All steps have been completed successfully. Your marketing workflow is now live.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Sparkles size={20} className="text-[#8B5CF6] mx-auto" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════ WORKFLOW RUNNER ═══════════════════════ */

function WorkflowRunner({
  workflow,
  onBack,
  onComplete,
}: {
  workflow: Workflow;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(workflow.completedSteps);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [checklistState, setChecklistState] = useState<Record<number, boolean[]>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [direction, setDirection] = useState(1);

  const step = workflow.steps[currentStep];
  const progressPct = Math.round(((currentStep) / workflow.steps.length) * 100);
  const isLastStep = currentStep === workflow.steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFieldChange = useCallback((fieldIdx: number, value: string) => {
    setFormData(prev => ({ ...prev, [`${step.id}-${fieldIdx}`]: value }));
  }, [step.id]);

  const handleChecklistToggle = useCallback((idx: number) => {
    setChecklistState(prev => {
      const current = prev[currentStep] || [];
      const next = [...current];
      next[idx] = !next[idx];
      return { ...prev, [currentStep]: next };
    });
  }, [currentStep]);

  const goNext = () => {
    if (isLastStep) {
      setShowCelebration(true);
    } else {
      setDirection(1);
      setCurrentStep(s => s + 1);
    }
  };

  const goPrev = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  };

  const handleCelebrationDone = () => {
    setShowCelebration(false);
    onComplete();
  };

  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -30 : 30 }),
  };

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      <AnimatePresence>
        {saveIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-40 flex items-center gap-2 px-3 py-2 bg-[#1A1A24] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-[#94A3B8]"
          >
            <Save size={12} className="text-[#8B5CF6]" />
            Auto-saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && <CompletionCelebration onDone={handleCelebrationDone} />}
      </AnimatePresence>

      {/* Runner Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="space-y-4"
      >
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${workflow.accentColor}20` }}
          >
            <Zap size={16} style={{ color: workflow.accentColor }} />
          </div>
          <h2 className="text-2xl font-bold text-[#F1F5F9] font-headline">
            {workflow.name}
          </h2>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#94A3B8]">
              Step {currentStep + 1} of {workflow.steps.length}: {step.title}
            </span>
            <span className="text-sm font-mono text-[#64748B]">{progressPct}% Complete</span>
          </div>
          <div className="h-1.5 bg-[#1A1A24] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${workflow.accentColor}, ${workflow.accentColor}CC)` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            />
          </div>
        </div>
      </motion.div>

      {/* Step content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 md:p-8"
          >
            <StepContent
              step={step}
              stepIndex={currentStep}
              totalSteps={workflow.steps.length}
              formData={formData}
              onFieldChange={handleFieldChange}
              checklistState={checklistState[currentStep] || step.checklist?.map(() => false) || []}
              onChecklistToggle={handleChecklistToggle}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: easeOutExpo }}
        className="flex items-center justify-between bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] p-4"
      >
        <button
          onClick={goPrev}
          disabled={isFirstStep}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-sm font-medium transition-all duration-150',
            isFirstStep
              ? 'text-[#475569] cursor-not-allowed'
              : 'text-[#F1F5F9] bg-[#22222E] border border-[rgba(255,255,255,0.1)] hover:bg-[#2A2A38]',
          )}
        >
          <ArrowLeft size={14} />
          Previous Step
        </button>

        {/* Step dots */}
        <div className="hidden sm:flex items-center gap-2">
          {workflow.steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx <= currentStep) {
                  setDirection(idx > currentStep ? 1 : -1);
                  setCurrentStep(idx);
                }
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                idx < currentStep ? 'bg-[#10B981]' :
                idx === currentStep ? 'bg-[#8B5CF6] w-6' :
                'bg-[#1A1A24] border border-[rgba(255,255,255,0.1)]',
              )}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-sm font-medium text-white transition-all duration-150',
            'hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]',
          )}
          style={{ background: `linear-gradient(135deg, ${workflow.accentColor}, ${workflow.accentColor}CC)` }}
        >
          {isLastStep ? 'Complete Workflow' : 'Next Step'}
          {isLastStep ? <Check size={14} /> : <ArrowRight size={14} />}
        </button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════ HISTORY TABLE ═══════════════════════ */

function WorkflowHistory() {
  const [collapsed, setCollapsed] = useState(false);
  const [runs] = useState<WorkflowRun[]>(INITIAL_HISTORY);

  const completedCount = runs.filter(r => r.status === 'completed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: easeOutExpo }}
      className="mt-10"
    >
      {/* Section header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#F1F5F9] font-headline">
            Workflow History
          </h3>
          <span className="text-xs text-[#64748B]">
            {completedCount} completed this month
          </span>
        </div>
        <div className="text-[#64748B] group-hover:text-[#F1F5F9] transition-colors duration-150">
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 border-b border-[rgba(255,255,255,0.06)] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <span className="col-span-2">Workflow</span>
                <span>Status</span>
                <span>Steps</span>
                <span>Started</span>
                <span>Completed</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                {runs.map((run, idx) => (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04, ease: easeOutExpo }}
                    className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 px-6 py-4 hover:bg-[#22222E] transition-colors duration-100 items-center"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: run.status === 'completed' ? '#10B98115'
                            : run.status === 'in-progress' ? '#8B5CF615'
                            : run.status === 'failed' ? '#F43F5E15' : '#64748B15',
                        }}
                      >
                        <Zap size={14} className={
                          run.status === 'completed' ? 'text-[#10B981]'
                          : run.status === 'in-progress' ? 'text-[#8B5CF6]'
                          : run.status === 'failed' ? 'text-[#F43F5E]' : 'text-[#64748B]'
                        } />
                      </div>
                      <span className="text-sm text-[#F1F5F9] font-medium truncate">{run.workflowName}</span>
                    </div>
                    <div>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusBadgeClasses(run.status))}>
                        {statusLabel(run.status)}
                      </span>
                    </div>
                    <span className="text-sm text-[#94A3B8]">
                      {run.stepsCompleted}/{run.totalSteps}
                    </span>
                    <span className="text-sm text-[#64748B]">{run.startedAt}</span>
                    <span className="text-sm text-[#64748B]">{run.completedAt ?? '—'}</span>
                    <div className="flex items-center justify-end gap-2">
                      {run.status === 'completed' && (
                        <button className="inline-flex items-center gap-1 text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors duration-150">
                          <FileText size={12} />
                          View Results
                        </button>
                      )}
                      <button className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-150">
                        <RotateCcw size={12} />
                        Rerun
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
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
  const [workflows] = useState<Workflow[]>(WORKFLOW_DEFINITIONS);

  const activeCount = workflows.filter(w => w.status === 'in-progress').length;
  const completedCount = 12; // From design spec

  const handleStart = useCallback((w: Workflow) => {
    setActiveWorkflow(w);
  }, []);

  const handleBack = useCallback(() => {
    setActiveWorkflow(null);
  }, []);

  const handleComplete = useCallback(() => {
    setActiveWorkflow(null);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <AnimatePresence mode="wait">
        {activeWorkflow ? (
          /* ── Active Runner ── */
          <motion.div
            key="runner"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <WorkflowRunner
              workflow={activeWorkflow}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          </motion.div>
        ) : (
          /* ── Catalog View ── */
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          >
            {/* Page Header */}
            <div className="mb-8">
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="text-xs text-[#64748B] mb-2"
              >
                Operations / Workflows
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="text-3xl md:text-4xl font-bold text-[#F1F5F9] font-headline mb-3"
              >
                Workflows
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: easeOutExpo }}
                className="text-base text-[#94A3B8] max-w-[600px] mb-3"
              >
                Structured marketing processes executed step by step. Start a workflow and follow the guided journey.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-xs text-[#64748B] font-mono"
              >
                <span className="text-[#8B5CF6]">{activeCount}</span> active / <span className="text-[#10B981]">{completedCount}</span> completed this month
              </motion.p>
            </div>

            {/* Workflow Catalog */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {workflows.map((w) => (
                <WorkflowCard key={w.id} workflow={w} onStart={handleStart} />
              ))}
            </motion.div>

            {/* Workflow History */}
            <WorkflowHistory />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
