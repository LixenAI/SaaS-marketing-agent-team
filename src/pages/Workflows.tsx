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
