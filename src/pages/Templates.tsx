import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Mail,
  Megaphone,
  MessageSquare,
  Monitor,
  Phone,
  Save,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────── types ─────────────────────── */

type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'toggle' | 'slider';

interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  maxLength?: number;
  dependsOn?: { fieldId: string; value: string | boolean };
  section: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  gradient: string;
  iconColor: string;
  fieldCount: number;
  usageCount: number;
  tags: string[];
  fields: TemplateField[];
  sections: string[];
}

/* ─────────────────────── data ─────────────────────── */

const TEMPLATES: Template[] = [
  {
    id: 'campaign-brief',
    name: 'Campaign Brief',
    description: 'Full campaign planning document with objectives, audience, messaging, channels, timeline, and budget.',
    category: 'Campaign',
    color: 'violet',
    gradient: 'from-[#8B5CF6] to-[#A78BFA]',
    iconColor: '#8B5CF6',
    fieldCount: 14,
    usageCount: 12,
    tags: ['Med Spa', 'Partner Recruitment'],
    sections: ['Overview', 'Audience', 'Messaging', 'Channels & Execution'],
    fields: [
      { id: 'campaign-name', label: 'Campaign Name', type: 'text', required: true, placeholder: 'e.g., Summer Med Spa Glow-Up', section: 'Overview' },
      { id: 'campaign-objective', label: 'Campaign Objective', type: 'select', required: true, options: ['Brand Awareness', 'Lead Generation', 'Partner Recruitment', 'Product Launch', 'Retention'], placeholder: 'Select objective...', section: 'Overview' },
      { id: 'primary-offer', label: 'Primary Offer', type: 'select', required: true, options: ['Free Consultation', '50% Off First Treatment', 'Membership Sign-up', 'Referral Program', 'Seasonal Package'], placeholder: 'Select offer...', section: 'Overview' },
      { id: 'campaign-duration', label: 'Campaign Duration', type: 'text', required: false, placeholder: 'e.g., Jan 15 - Feb 15, 2026', section: 'Overview' },
      { id: 'budget-range', label: 'Budget Range', type: 'select', required: false, options: ['Under $1K', '$1K - $5K', '$5K - $10K', '$10K - $25K', '$25K - $50K', '$50K+'], placeholder: 'Select budget...', section: 'Overview' },
      { id: 'primary-audience', label: 'Primary Audience Segment', type: 'select', required: true, options: ['Women 25-40 (Skincare)', 'Women 40-60 (Anti-aging)', 'Men 30-50 (Grooming)', 'Beauty Professionals', 'Medical Practitioners'], placeholder: 'Select audience...', section: 'Audience' },
      { id: 'secondary-audience', label: 'Secondary Audience', type: 'select', required: false, options: ['Gen Z (18-25)', 'High-income Professionals', 'Local Community', 'Existing Clients'], placeholder: 'Select secondary audience...', section: 'Audience' },
      { id: 'target-geography', label: 'Target Geography', type: 'multiselect', required: false, options: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Arizona', 'Nevada'], placeholder: 'Select regions...', section: 'Audience' },
      { id: 'pain-points', label: 'Pain Points to Address', type: 'textarea', required: false, placeholder: 'List 3-5 customer pain points this campaign addresses...', maxLength: 500, section: 'Audience' },
      { id: 'key-message', label: 'Key Message', type: 'textarea', required: true, placeholder: 'The single most important message (max 200 chars)...', maxLength: 200, section: 'Messaging' },
      { id: 'supporting-points', label: 'Supporting Points', type: 'textarea', required: false, placeholder: '3 bullet points supporting the key message...', section: 'Messaging' },
      { id: 'tone-of-voice', label: 'Tone of Voice', type: 'select', required: true, options: ['Professional', 'Conversational', 'Bold', 'Educational', 'Empathetic'], placeholder: 'Select tone...', section: 'Messaging' },
      { id: 'cta-text', label: 'CTA Text', type: 'text', required: true, placeholder: 'e.g., Book Your Free Consultation Today', section: 'Messaging' },
      { id: 'primary-channels', label: 'Primary Channels', type: 'multiselect', required: true, options: ['LinkedIn', 'Instagram', 'TikTok', 'Email', 'Paid Ads', 'Landing Page'], placeholder: 'Select channels...', section: 'Channels & Execution' },
      { id: 'content-types', label: 'Content Types Needed', type: 'multiselect', required: false, options: ['Posts', 'Stories', 'Ads', 'Landing Page', 'Email', 'Scripts'], placeholder: 'Select content types...', section: 'Channels & Execution' },
      { id: 'success-metrics', label: 'Success Metrics', type: 'multiselect', required: false, options: ['Impressions', 'Clicks', 'Leads', 'Partners', 'Revenue', 'Engagement Rate'], placeholder: 'Select metrics...', section: 'Channels & Execution' },
      { id: 'special-requirements', label: 'Special Requirements', type: 'textarea', required: false, placeholder: 'Any special requirements or notes...', section: 'Channels & Execution' },
    ],
  },
  {
    id: 'ad-brief',
    name: 'Ad Brief',
    description: 'Paid advertising brief with targeting, angles, copy, creative specs, and budget parameters.',
    category: 'Ads',
    color: 'amber',
    gradient: 'from-[#F59E0B] to-[#FBBF24]',
    iconColor: '#F59E0B',
    fieldCount: 10,
    usageCount: 8,
    tags: ['Paid Media', 'Creative'],
    sections: ['Overview', 'Targeting', 'Creative', 'Budget & Schedule'],
    fields: [
      { id: 'ad-campaign-name', label: 'Campaign Name', type: 'text', required: true, placeholder: 'e.g., Med Spa Lead Gen Q1', section: 'Overview' },
      { id: 'ad-objective', label: 'Ad Objective', type: 'select', required: true, options: ['Awareness', 'Traffic', 'Leads', 'Conversions', 'App Installs'], placeholder: 'Select objective...', section: 'Overview' },
      { id: 'ad-platform', label: 'Ad Platform', type: 'select', required: true, options: ['Facebook/Instagram', 'Google Ads', 'LinkedIn Ads', 'TikTok Ads', 'Programmatic'], placeholder: 'Select platform...', section: 'Overview' },
      { id: 'target-audience', label: 'Target Audience', type: 'textarea', required: true, placeholder: 'Demographics, interests, behaviors...', section: 'Targeting' },
      { id: 'audience-size', label: 'Estimated Audience Size', type: 'text', required: false, placeholder: 'e.g., 250K - 500K', section: 'Targeting' },
      { id: 'ad-angles', label: 'Ad Angles', type: 'textarea', required: true, placeholder: 'List 2-3 messaging angles to test...', section: 'Creative' },
      { id: 'headlines', label: 'Headline Options', type: 'textarea', required: true, placeholder: '3 headline variations...', section: 'Creative' },
      { id: 'body-copy', label: 'Body Copy', type: 'textarea', required: true, placeholder: 'Primary ad body copy...', section: 'Creative' },
      { id: 'creative-specs', label: 'Creative Specs', type: 'multiselect', required: false, options: ['1080x1080 Image', '1080x1920 Story', '1200x628 Feed', 'Video 15s', 'Video 30s', 'Carousel'], placeholder: 'Select formats...', section: 'Creative' },
      { id: 'daily-budget', label: 'Daily Budget', type: 'select', required: true, options: ['$10-$25', '$25-$50', '$50-$100', '$100-$250', '$250-$500', '$500+'], placeholder: 'Select budget...', section: 'Budget & Schedule' },
      { id: 'campaign-duration-ad', label: 'Campaign Duration', type: 'text', required: false, placeholder: 'e.g., 2 weeks', section: 'Budget & Schedule' },
      { id: 'landing-page-url', label: 'Landing Page URL', type: 'text', required: false, placeholder: 'https://...', section: 'Budget & Schedule' },
    ],
  },
  {
    id: 'linkedin-outreach',
    name: 'LinkedIn Outreach',
    description: 'LinkedIn connection request and follow-up message sequences for partner recruitment.',
    category: 'Sales',
    color: 'violet',
    gradient: 'from-[#8B5CF6] to-[#10B981]',
    iconColor: '#8B5CF6',
    fieldCount: 8,
    usageCount: 15,
    tags: ['LinkedIn', 'Partners'],
    sections: ['Prospect Info', 'Messages', 'Follow-up'],
    fields: [
      { id: 'li-target-role', label: 'Target Role', type: 'select', required: true, options: ['Med Spa Owner', 'Clinic Director', 'Aesthetician', 'Business Development', 'Marketing Manager'], placeholder: 'Select role...', section: 'Prospect Info' },
      { id: 'li-industry', label: 'Target Industry', type: 'multiselect', required: true, options: ['Medical Spas', 'Dermatology Clinics', 'Wellness Centers', 'Beauty Salons', 'Cosmetic Surgery'], placeholder: 'Select industries...', section: 'Prospect Info' },
      { id: 'li-prospect-count', label: 'Prospect Count', type: 'select', required: false, options: ['10-25', '25-50', '50-100', '100-200', '200+'], placeholder: 'Select range...', section: 'Prospect Info' },
      { id: 'li-connection-msg', label: 'Connection Request Message', type: 'textarea', required: true, placeholder: 'Hi [Name], I noticed your work at [Company]...', maxLength: 300, section: 'Messages' },
      { id: 'li-value-prop', label: 'Value Proposition', type: 'textarea', required: true, placeholder: 'What value do you bring to the partnership?', section: 'Messages' },
      { id: 'li-cta', label: 'Call to Action', type: 'text', required: true, placeholder: 'e.g., Would you be open to a 15-min call?', section: 'Messages' },
      { id: 'li-followup-1', label: 'Follow-up #1 (Day 3)', type: 'textarea', required: false, placeholder: 'Follow-up message if no response...', maxLength: 300, section: 'Follow-up' },
      { id: 'li-followup-2', label: 'Follow-up #2 (Day 7)', type: 'textarea', required: false, placeholder: 'Second follow-up message...', maxLength: 300, section: 'Follow-up' },
      { id: 'li-sender-name', label: 'Sender Name', type: 'text', required: true, placeholder: 'Your name for the signature', section: 'Follow-up' },
    ],
  },
  {
    id: 'social-content',
    name: 'Social Content',
    description: 'Social media post templates for LinkedIn, Instagram, and TikTok with caption and hashtag structures.',
    category: 'Social',
    color: 'cyan',
    gradient: 'from-[#06B6D4] to-[#22D3EE]',
    iconColor: '#06B6D4',
    fieldCount: 12,
    usageCount: 24,
    tags: ['Social Media', 'Content'],
    sections: ['Platform & Format', 'Content', 'Hashtags & CTA'],
    fields: [
      { id: 'social-platform', label: 'Primary Platform', type: 'select', required: true, options: ['LinkedIn', 'Instagram', 'TikTok', 'Facebook', 'Twitter/X'], placeholder: 'Select platform...', section: 'Platform & Format' },
      { id: 'social-format', label: 'Content Format', type: 'select', required: true, options: ['Single Image', 'Carousel', 'Reel/Video', 'Story', 'Text-only'], placeholder: 'Select format...', section: 'Platform & Format' },
      { id: 'social-content-pillars', label: 'Content Pillars', type: 'multiselect', required: false, options: ['Educational', 'Behind the Scenes', 'Client Testimonials', 'Product Showcase', 'Trends', 'Tips & Hacks'], placeholder: 'Select pillars...', section: 'Platform & Format' },
      { id: 'social-topic', label: 'Post Topic', type: 'text', required: true, placeholder: 'e.g., 5 Skincare Tips for Winter', section: 'Content' },
      { id: 'social-caption', label: 'Caption', type: 'textarea', required: true, placeholder: 'Write your caption here...', maxLength: 2200, section: 'Content' },
      { id: 'social-hook', label: 'Hook / Opening Line', type: 'text', required: true, placeholder: 'The first line that grabs attention...', section: 'Content' },
      { id: 'social-tone', label: 'Tone', type: 'select', required: false, options: ['Professional', 'Casual', 'Playful', 'Inspiring', 'Educational'], placeholder: 'Select tone...', section: 'Content' },
      { id: 'social-hashtags', label: 'Hashtags', type: 'text', required: false, placeholder: '#medspa #skincare #beauty', section: 'Hashtags & CTA' },
      { id: 'social-cta', label: 'Call to Action', type: 'select', required: false, options: ['Book Now', 'Learn More', 'Comment Below', 'Share', 'Save This', 'Link in Bio'], placeholder: 'Select CTA...', section: 'Hashtags & CTA' },
      { id: 'social-mention', label: 'Accounts to Mention', type: 'text', required: false, placeholder: '@partner @influencer', section: 'Hashtags & CTA' },
    ],
  },
  {
    id: 'landing-page-copy',
    name: 'Landing Page Copy',
    description: 'Complete landing page copy including hero, features, social proof, FAQ, and CTA sections.',
    category: 'Landing Pages',
    color: 'cyan',
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
    iconColor: '#06B6D4',
    fieldCount: 16,
    usageCount: 6,
    tags: ['Landing Page', 'Conversion'],
    sections: ['Hero', 'Features', 'Social Proof', 'FAQ & CTA'],
    fields: [
      { id: 'lp-headline', label: 'Hero Headline', type: 'text', required: true, placeholder: 'Main attention-grabbing headline...', section: 'Hero' },
      { id: 'lp-subheadline', label: 'Subheadline', type: 'textarea', required: true, placeholder: 'Supporting message under the headline...', section: 'Hero' },
      { id: 'lp-hero-cta', label: 'Hero CTA Button', type: 'text', required: true, placeholder: 'e.g., Get Started Free', section: 'Hero' },
      { id: 'lp-hero-image', label: 'Hero Image Description', type: 'textarea', required: false, placeholder: 'Describe the hero image/illustration...', section: 'Hero' },
      { id: 'lp-feature-1', label: 'Feature 1 - Title', type: 'text', required: true, placeholder: 'e.g., Advanced Treatments', section: 'Features' },
      { id: 'lp-feature-1-desc', label: 'Feature 1 - Description', type: 'textarea', required: true, placeholder: 'Describe this feature...', section: 'Features' },
      { id: 'lp-feature-2', label: 'Feature 2 - Title', type: 'text', required: false, placeholder: 'e.g., Expert Staff', section: 'Features' },
      { id: 'lp-feature-2-desc', label: 'Feature 2 - Description', type: 'textarea', required: false, placeholder: 'Describe this feature...', section: 'Features' },
      { id: 'lp-feature-3', label: 'Feature 3 - Title', type: 'text', required: false, placeholder: 'e.g., Proven Results', section: 'Features' },
      { id: 'lp-feature-3-desc', label: 'Feature 3 - Description', type: 'textarea', required: false, placeholder: 'Describe this feature...', section: 'Features' },
      { id: 'lp-testimonial', label: 'Testimonial Quote', type: 'textarea', required: false, placeholder: 'Customer testimonial...', section: 'Social Proof' },
      { id: 'lp-testimonial-author', label: 'Testimonial Author', type: 'text', required: false, placeholder: 'Name, Title, Company', section: 'Social Proof' },
      { id: 'lp-stats', label: 'Key Stats', type: 'text', required: false, placeholder: 'e.g., 500+ Happy Clients, 98% Satisfaction', section: 'Social Proof' },
      { id: 'lp-faq-1-q', label: 'FAQ 1 - Question', type: 'text', required: false, placeholder: 'Common question...', section: 'FAQ & CTA' },
      { id: 'lp-faq-1-a', label: 'FAQ 1 - Answer', type: 'textarea', required: false, placeholder: 'Answer to the question...', section: 'FAQ & CTA' },
      { id: 'lp-faq-2-q', label: 'FAQ 2 - Question', type: 'text', required: false, placeholder: 'Another common question...', section: 'FAQ & CTA' },
      { id: 'lp-faq-2-a', label: 'FAQ 2 - Answer', type: 'textarea', required: false, placeholder: 'Answer...', section: 'FAQ & CTA' },
      { id: 'lp-final-cta', label: 'Final CTA', type: 'text', required: true, placeholder: 'e.g., Book Your Consultation Now', section: 'FAQ & CTA' },
    ],
  },
  {
    id: 'sales-script',
    name: 'Sales Script',
    description: 'Discovery call, demo, objection handling, and closing scripts for partner conversations.',
    category: 'Sales',
    color: 'emerald',
    gradient: 'from-[#10B981] to-[#34D399]',
    iconColor: '#10B981',
    fieldCount: 10,
    usageCount: 18,
    tags: ['Sales', 'Partners'],
    sections: ['Discovery', 'Demo', 'Objections', 'Close'],
    fields: [
      { id: 'ss-product', label: 'Product/Service Name', type: 'text', required: true, placeholder: 'e.g., LixenAI Partnership Program', section: 'Discovery' },
      { id: 'ss-prospect-type', label: 'Prospect Type', type: 'select', required: true, options: ['Med Spa Owner', 'Clinic Chain', 'Independent Aesthetician', 'Wellness Chain', 'New Business'], placeholder: 'Select type...', section: 'Discovery' },
      { id: 'ss-discovery-q1', label: 'Discovery Question 1', type: 'text', required: true, placeholder: 'e.g., What are your biggest marketing challenges?', section: 'Discovery' },
      { id: 'ss-discovery-q2', label: 'Discovery Question 2', type: 'text', required: false, placeholder: 'e.g., How do you currently acquire new clients?', section: 'Discovery' },
      { id: 'ss-discovery-q3', label: 'Discovery Question 3', type: 'text', required: false, placeholder: 'e.g., What does success look like for you?', section: 'Discovery' },
      { id: 'ss-demo-opening', label: 'Demo Opening', type: 'textarea', required: true, placeholder: 'How you start the demo...', section: 'Demo' },
      { id: 'ss-key-features', label: 'Key Features to Highlight', type: 'textarea', required: true, placeholder: 'List the top 5 features to demo...', section: 'Demo' },
      { id: 'ss-objection-1', label: 'Objection 1', type: 'text', required: false, placeholder: 'e.g., It\'s too expensive', section: 'Objections' },
      { id: 'ss-response-1', label: 'Response 1', type: 'textarea', required: false, placeholder: 'Your response to this objection...', section: 'Objections' },
      { id: 'ss-objection-2', label: 'Objection 2', type: 'text', required: false, placeholder: 'e.g., We don\'t have time', section: 'Objections' },
      { id: 'ss-response-2', label: 'Response 2', type: 'textarea', required: false, placeholder: 'Your response...', section: 'Objections' },
      { id: 'ss-closing-question', label: 'Closing Question', type: 'text', required: true, placeholder: 'e.g., Shall we get you started this week?', section: 'Close' },
      { id: 'ss-next-steps', label: 'Next Steps', type: 'textarea', required: false, placeholder: 'Outline the agreed next steps...', section: 'Close' },
    ],
  },
];

const CATEGORIES = ['All', 'Campaign', 'Ads', 'Social', 'Sales', 'Landing Pages'];

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ─────────────────────── icon helper ─────────────────────── */

function TemplateIcon({ template, size = 20 }: { template: Template; size?: number }) {
  const props = { size, style: { color: template.iconColor } };
  switch (template.id) {
    case 'campaign-brief': return <FileText {...props} />;
    case 'ad-brief': return <Megaphone {...props} />;
    case 'linkedin-outreach': return <Mail {...props} />;
    case 'social-content': return <MessageSquare {...props} />;
    case 'landing-page-copy': return <Monitor {...props} />;
    case 'sales-script': return <Phone {...props} />;
    default: return <FileText {...props} />;
  }
}

/* ═══════════════════════ TEMPLATE CARD ═══════════════════════ */

function TemplateCard({
  template,
  onPreview,
  onUse,
}: {
  template: Template;
  onPreview: (t: Template) => void;
  onUse: (t: Template) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 35 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        'bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 transition-all duration-250',
        'hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]',
        hovered && template.color === 'violet' && 'border-[#8B5CF6]/30',
        hovered && template.color === 'cyan' && 'border-[#06B6D4]/30',
        hovered && template.color === 'amber' && 'border-[#F59E0B]/30',
        hovered && template.color === 'emerald' && 'border-[#10B981]/30',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200',
            hovered && 'scale-110',
          )}
          style={{ background: `${template.iconColor}15` }}
        >
          <TemplateIcon template={template} size={22} />
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: `${template.iconColor}15`, color: template.iconColor }}
        >
          {template.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#F1F5F9] font-headline mb-1.5">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#94A3B8] line-clamp-2 mb-4">
        {template.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-4 text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1">
          <FileText size={12} />
          {template.fieldCount} fields
        </span>
        <span>Used {template.usageCount} times</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {template.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] bg-[#1A1A24] text-[#94A3B8] border border-[rgba(255,255,255,0.04)]">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 h-9 rounded-[10px] text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150"
        >
          Preview
        </button>
        <button
          onClick={() => onUse(template)}
          className="flex-1 h-9 rounded-[10px] text-sm font-medium text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${template.iconColor}, ${template.iconColor}CC)` }}
        >
          Use Template
        </button>
      </div>
    </motion.div>
  );
}

/* ═════════════════════── FORM FIELD RENDERER ═══════════════════════ */

function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: TemplateField;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}) {
  const baseInput = cn(
    'w-full bg-[#0A0A0F] border rounded-[10px] text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none transition-all duration-150',
    'focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    error ? 'border-[#F43F5E]' : 'border-[rgba(255,255,255,0.1)]',
  );

  if (field.type === 'textarea') {
    return (
      <div>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          maxLength={field.maxLength}
          className={cn(baseInput, 'px-4 py-3 resize-none')}
        />
        {field.maxLength && (
          <p className="text-xs text-[#475569] mt-1 text-right">
            {(value || '').length}/{field.maxLength}
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(baseInput, 'h-[42px] px-4 appearance-none cursor-pointer')}
      >
        <option value="" className="bg-[#1A1A24]">{field.placeholder || 'Select...'}</option>
        {field.options?.map(opt => (
          <option key={opt} value={opt} className="bg-[#1A1A24]">{opt}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'multiselect') {
    const selected = (value || '').split(',').filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2">
        {field.options?.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => {
                const next = isSelected
                  ? selected.filter(s => s !== opt)
                  : [...selected, opt];
                onChange(next.join(','));
              }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
                isSelected
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#A78BFA]'
                  : 'bg-[#1A1A24] border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.15)]',
              )}
            >
              {isSelected && <Check size={10} className="inline mr-1" />}
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  // text
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={cn(baseInput, 'h-[42px] px-4')}
    />
  );
}

/* ═════════════════════── LIVE PREVIEW ═══════════════════════ */

function LivePreview({
  template,
  formData,
}: {
  template: Template;
  formData: Record<string, string>;
}) {
  const generatePreview = useMemo(() => {
    const d = formData;
    switch (template.id) {
      case 'campaign-brief':
        return {
          title: d['campaign-name'] || 'Campaign Brief',
          sections: [
            { heading: 'Overview', content: [
              d['campaign-objective'] && `Objective: ${d['campaign-objective']}`,
              d['primary-offer'] && `Primary Offer: ${d['primary-offer']}`,
              d['campaign-duration'] && `Duration: ${d['campaign-duration']}`,
              d['budget-range'] && `Budget: ${d['budget-range']}`,
            ].filter(Boolean) },
            { heading: 'Audience', content: [
              d['primary-audience'] && `Primary: ${d['primary-audience']}`,
              d['secondary-audience'] && `Secondary: ${d['secondary-audience']}`,
              d['target-geography'] && `Geography: ${d['target-geography']}`,
              d['pain-points'] && `Pain Points: ${d['pain-points']}`,
            ].filter(Boolean) },
            { heading: 'Messaging', content: [
              d['key-message'] && `Key Message: ${d['key-message']}`,
              d['supporting-points'] && `Supporting Points: ${d['supporting-points']}`,
              d['tone-of-voice'] && `Tone: ${d['tone-of-voice']}`,
              d['cta-text'] && `CTA: ${d['cta-text']}`,
            ].filter(Boolean) },
            { heading: 'Channels', content: [
              d['primary-channels'] && `Channels: ${d['primary-channels']}`,
              d['content-types'] && `Content Types: ${d['content-types']}`,
              d['success-metrics'] && `Success Metrics: ${d['success-metrics']}`,
              d['special-requirements'] && `Notes: ${d['special-requirements']}`,
            ].filter(Boolean) },
          ],
        };
      case 'ad-brief':
        return {
          title: d['ad-campaign-name'] || 'Ad Brief',
          sections: [
            { heading: 'Campaign Overview', content: [
              d['ad-objective'] && `Objective: ${d['ad-objective']}`,
              d['ad-platform'] && `Platform: ${d['ad-platform']}`,
            ].filter(Boolean) },
            { heading: 'Targeting', content: [
              d['target-audience'] && `Audience: ${d['target-audience']}`,
              d['audience-size'] && `Audience Size: ${d['audience-size']}`,
            ].filter(Boolean) },
            { heading: 'Creative', content: [
              d['ad-angles'] && `Angles: ${d['ad-angles']}`,
              d['headlines'] && `Headlines: ${d['headlines']}`,
              d['body-copy'] && `Body Copy: ${d['body-copy']}`,
              d['creative-specs'] && `Formats: ${d['creative-specs']}`,
            ].filter(Boolean) },
            { heading: 'Budget & Schedule', content: [
              d['daily-budget'] && `Daily Budget: ${d['daily-budget']}`,
              d['campaign-duration-ad'] && `Duration: ${d['campaign-duration-ad']}`,
              d['landing-page-url'] && `Landing Page: ${d['landing-page-url']}`,
            ].filter(Boolean) },
          ],
        };
      case 'linkedin-outreach':
        return {
          title: `LinkedIn Outreach: ${d['li-sender-name'] || 'New Sequence'}`,
          sections: [
            { heading: 'Target Profile', content: [
              d['li-target-role'] && `Target Role: ${d['li-target-role']}`,
              d['li-industry'] && `Industries: ${d['li-industry']}`,
              d['li-prospect-count'] && `Prospect Count: ${d['li-prospect-count']}`,
            ].filter(Boolean) },
            { heading: 'Connection Message', content: d['li-connection-msg'] ? [d['li-connection-msg']] : [] },
            { heading: 'Value Proposition', content: d['li-value-prop'] ? [d['li-value-prop']] : [] },
            { heading: 'Follow-up Sequence', content: [
              d['li-followup-1'] && `Day 3: ${d['li-followup-1']}`,
              d['li-followup-2'] && `Day 7: ${d['li-followup-2']}`,
            ].filter(Boolean) },
          ],
        };
      case 'social-content':
        return {
          title: d['social-topic'] || 'Social Media Post',
          sections: [
            { heading: 'Post Details', content: [
              d['social-platform'] && `Platform: ${d['social-platform']}`,
              d['social-format'] && `Format: ${d['social-format']}`,
              d['social-content-pillars'] && `Pillars: ${d['social-content-pillars']}`,
              d['social-tone'] && `Tone: ${d['social-tone']}`,
            ].filter(Boolean) },
            { heading: 'Caption', content: d['social-caption'] ? [d['social-caption']] : [] },
            { heading: 'Hook', content: d['social-hook'] ? [d['social-hook']] : [] },
            { heading: 'CTA & Hashtags', content: [
              d['social-cta'] && `CTA: ${d['social-cta']}`,
              d['social-hashtags'] && `Hashtags: ${d['social-hashtags']}`,
              d['social-mention'] && `Mentions: ${d['social-mention']}`,
            ].filter(Boolean) },
          ],
        };
      case 'landing-page-copy':
        return {
          title: d['lp-headline'] || 'Landing Page Copy',
          sections: [
            { heading: 'Hero Section', content: [
              d['lp-headline'] && d['lp-headline'],
              d['lp-subheadline'] && d['lp-subheadline'],
              d['lp-hero-cta'] && `CTA: ${d['lp-hero-cta']}`,
            ].filter(Boolean) },
            { heading: 'Features', content: [
              d['lp-feature-1'] && `${d['lp-feature-1']}: ${d['lp-feature-1-desc'] || ''}`,
              d['lp-feature-2'] && `${d['lp-feature-2']}: ${d['lp-feature-2-desc'] || ''}`,
              d['lp-feature-3'] && `${d['lp-feature-3']}: ${d['lp-feature-3-desc'] || ''}`,
            ].filter(Boolean) },
            { heading: 'Social Proof', content: [
              d['lp-testimonial'] && `"${d['lp-testimonial']}" — ${d['lp-testimonial-author'] || ''}`,
              d['lp-stats'] && d['lp-stats'],
            ].filter(Boolean) },
            { heading: 'FAQ & Final CTA', content: [
              d['lp-faq-1-q'] && `Q: ${d['lp-faq-1-q']}\nA: ${d['lp-faq-1-a'] || ''}`,
              d['lp-faq-2-q'] && `Q: ${d['lp-faq-2-q']}\nA: ${d['lp-faq-2-a'] || ''}`,
              d['lp-final-cta'] && `Final CTA: ${d['lp-final-cta']}`,
            ].filter(Boolean) },
          ],
        };
      case 'sales-script':
        return {
          title: `Sales Script: ${d['ss-product'] || 'New Script'}`,
          sections: [
            { heading: 'Discovery', content: [
              d['ss-prospect-type'] && `Prospect: ${d['ss-prospect-type']}`,
              d['ss-discovery-q1'] && `Q1: ${d['ss-discovery-q1']}`,
              d['ss-discovery-q2'] && `Q2: ${d['ss-discovery-q2']}`,
              d['ss-discovery-q3'] && `Q3: ${d['ss-discovery-q3']}`,
            ].filter(Boolean) },
            { heading: 'Demo', content: [
              d['ss-demo-opening'] && `Opening: ${d['ss-demo-opening']}`,
              d['ss-key-features'] && `Features: ${d['ss-key-features']}`,
            ].filter(Boolean) },
            { heading: 'Objection Handling', content: [
              d['ss-objection-1'] && `O: ${d['ss-objection-1']}\nR: ${d['ss-response-1'] || ''}`,
              d['ss-objection-2'] && `O: ${d['ss-objection-2']}\nR: ${d['ss-response-2'] || ''}`,
            ].filter(Boolean) },
            { heading: 'Close', content: [
              d['ss-closing-question'] && `Closing: ${d['ss-closing-question']}`,
              d['ss-next-steps'] && `Next Steps: ${d['ss-next-steps']}`,
            ].filter(Boolean) },
          ],
        };
      default:
        return { title: 'Preview', sections: [] };
    }
  }, [template.id, formData]);

  return (
    <div className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#06B6D4]">Live Preview</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(generatePreview.sections.map(s => `${s.heading}\n${s.content.join('\n')}`).join('\n\n'))}
            className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-150"
          >
            <Copy size={12} />
            Copy
          </button>
          <button className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-150">
            <Download size={12} />
            Export
          </button>
        </div>
      </div>
      <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto">
        <motion.h3
          key={generatePreview.title}
          initial={{ opacity: 0.7, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg font-semibold text-[#F1F5F9] font-headline"
        >
          {generatePreview.title}
        </motion.h3>
        {generatePreview.sections.map((section, sIdx) => (
          section.content.length > 0 && (
            <motion.div
              key={`${section.heading}-${sIdx}`}
              initial={{ opacity: 0.7, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: sIdx * 0.05 }}
            >
              <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                {section.heading}
              </h4>
              <div className="space-y-1.5">
                {section.content.map((line, lIdx) => (
                  <p key={lIdx} className="text-sm text-[#94A3B8] whitespace-pre-line leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          )
        ))}
        {generatePreview.sections.every(s => s.content.length === 0) && (
          <p className="text-sm text-[#475569] italic">Start filling the form to see a live preview...</p>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════── TEMPLATE FORM WIZARD ═══════════════════════ */

function TemplateFormWizard({
  template,
  onBack,
}: {
  template: Template;
  onBack: () => void;
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Auto-save simulation
  useEffect(() => {
    if (!unsavedChanges) return;
    const timer = setTimeout(() => {
      setSaveIndicator(true);
      setUnsavedChanges(false);
      setTimeout(() => setSaveIndicator(false), 2000);
    }, 20000);
    return () => clearTimeout(timer);
  }, [formData, unsavedChanges]);

  // Mark unsaved on form change
  useEffect(() => {
    setUnsavedChanges(true);
  }, [formData]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem(`template-draft-${template.id}`, JSON.stringify(formData));
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const section = template.sections[currentSection];
  const sectionFields = template.fields.filter(f => f.section === section);

  // Check overall completion
  const requiredFields = template.fields.filter(f => f.required);
  const completedRequired = requiredFields.filter(f => (formData[f.id] || '').trim().length > 0);
  const allRequiredComplete = completedRequired.length === requiredFields.length;

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
            Draft saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
      >
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Templates
        </button>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${template.iconColor}20` }}
          >
            <TemplateIcon template={template} size={16} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F1F5F9] font-headline">
            {template.name}
          </h2>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${template.iconColor}15`, color: template.iconColor }}
          >
            {template.category}
          </span>
          <span className="text-sm font-mono text-[#64748B]">
            Section {currentSection + 1} of {template.sections.length}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unsavedChanges && (
              <span className="text-xs text-[#F59E0B]">Unsaved changes</span>
            )}
          </div>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[10px] text-sm font-medium text-[#F1F5F9] bg-[#22222E] border border-[rgba(255,255,255,0.1)] hover:bg-[#2A2A38] transition-all duration-150"
          >
            <Save size={14} />
            Save Draft
          </button>
        </div>
      </motion.div>

      {/* Section tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: easeOutExpo }}
        className="flex items-center gap-1 overflow-x-auto pb-2"
      >
        {template.sections.map((sec, idx) => {
          const secFields = template.fields.filter(f => f.section === sec);
          const requiredFields_sec = secFields.filter(f => f.required);
          const isComplete = requiredFields_sec.every(f => (formData[f.id] || '').trim().length > 0);
          const isActive = idx === currentSection;

          return (
            <button
              key={sec}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]',
              )}
            >
              {isComplete && !isActive && (
                <Check size={14} className="text-[#10B981]" />
              )}
              {sec}
            </button>
          );
        })}
      </motion.div>

      {/* Two-column layout: form + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeOutExpo }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6"
            >
              <h3 className="text-lg font-semibold text-[#F1F5F9] font-headline mb-5">
                {section}
              </h3>

              <div className="space-y-5">
                {sectionFields.map((field) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                      {field.label}
                      {field.required && <span className="text-[#F43F5E] ml-1">*</span>}
                    </label>
                    {field.helpText && (
                      <p className="text-xs text-[#64748B] mb-1.5">{field.helpText}</p>
                    )}
                    <FormFieldRenderer
                      field={field}
                      value={formData[field.id] || ''}
                      onChange={(val) => handleFieldChange(field.id, val)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  onClick={() => setCurrentSection(s => Math.max(0, s - 1))}
                  disabled={currentSection === 0}
                  className={cn(
                    'inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-sm font-medium transition-all duration-150',
                    currentSection === 0
                      ? 'text-[#475569] cursor-not-allowed'
                      : 'text-[#F1F5F9] bg-[#22222E] border border-[rgba(255,255,255,0.1)] hover:bg-[#2A2A38]',
                  )}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                {currentSection < template.sections.length - 1 ? (
                  <button
                    onClick={() => setCurrentSection(s => s + 1)}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-sm font-medium text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${template.iconColor}, ${template.iconColor}CC)` }}
                  >
                    Next
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    disabled={!allRequiredComplete}
                    className={cn(
                      'inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-sm font-medium text-white transition-all duration-150',
                      allRequiredComplete
                        ? 'hover:brightness-110 hover:scale-[1.02] animate-pulse'
                        : 'opacity-50 cursor-not-allowed',
                    )}
                    style={
                      allRequiredComplete
                        ? { background: `linear-gradient(135deg, ${template.iconColor}, ${template.iconColor}CC)` }
                        : { background: '#475569' }
                    }
                  >
                    <Sparkles size={14} />
                    Generate Document
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Preview panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: easeOutExpo }}
          className="hidden lg:block"
        >
          <div className="sticky top-20">
            <LivePreview template={template} formData={formData} />
          </div>
        </motion.div>
      </div>

      {/* Mobile preview toggle */}
      <div className="lg:hidden">
        <details className="group">
          <summary className="flex items-center justify-between p-4 bg-[#111118] rounded-xl border border-[rgba(255,255,255,0.06)] cursor-pointer">
            <span className="text-sm font-medium text-[#F1F5F9]">Live Preview</span>
            <ChevronDown size={16} className="text-[#64748B] group-open:rotate-180 transition-transform" />
          </summary>
          <div className="mt-3">
            <LivePreview template={template} formData={formData} />
          </div>
        </details>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return TEMPLATES;
    return TEMPLATES.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleUseTemplate = useCallback((t: Template) => {
    setActiveTemplate(t);
    setPreviewTemplate(null);
  }, []);

  const handlePreview = useCallback((t: Template) => {
    setPreviewTemplate(t);
  }, []);

  const handleBack = useCallback(() => {
    setActiveTemplate(null);
    setPreviewTemplate(null);
  }, []);

  if (activeTemplate) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <TemplateFormWizard template={activeTemplate} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="text-xs text-[#64748B] mb-2"
        >
          Operations / Templates
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="text-3xl md:text-4xl font-bold text-[#F1F5F9] font-headline mb-3"
        >
          Marketing Templates
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: easeOutExpo }}
          className="text-base text-[#94A3B8] max-w-[600px] mb-3"
        >
          Standardized templates for consistent, on-brand marketing output. Fill the forms and let the agents do the rest.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-xs text-[#64748B] font-mono"
        >
          47 documents generated this month
        </motion.p>
      </div>

      {/* Category Filters */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="flex items-center gap-2 mb-8 overflow-x-auto pb-2"
      >
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.25, ease: easeOutBack }}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150',
              activeCategory === cat
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-[#111118] text-[#94A3B8] border border-[rgba(255,255,255,0.08)] hover:text-[#F1F5F9] hover:bg-[#22222E]',
            )}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              className="bg-[#1A1A24] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-modal max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${previewTemplate.iconColor}20` }}
                  >
                    <TemplateIcon template={previewTemplate} size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#F1F5F9] font-headline">
                      {previewTemplate.name}
                    </h3>
                    <span
                      className="text-xs"
                      style={{ color: previewTemplate.iconColor }}
                    >
                      {previewTemplate.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-[#94A3B8]">{previewTemplate.description}</p>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Sections</h4>
                  {previewTemplate.sections.map((sec, idx) => {
                    const secFields = previewTemplate.fields.filter(f => f.section === sec);
                    return (
                      <div key={sec} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                        <span className="text-sm text-[#F1F5F9]">{idx + 1}. {sec}</span>
                        <span className="text-xs text-[#64748B]">{secFields.length} fields</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {previewTemplate.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] bg-[#111118] text-[#94A3B8] border border-[rgba(255,255,255,0.04)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => { setPreviewTemplate(null); handleUseTemplate(previewTemplate); }}
                  className="w-full h-10 rounded-[10px] text-sm font-medium text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${previewTemplate.iconColor}, ${previewTemplate.iconColor}CC)` }}
                >
                  Use This Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <TemplateCard
                template={t}
                onPreview={handlePreview}
                onUse={handleUseTemplate}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Search size={48} className="text-[#475569] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F1F5F9] font-headline mb-2">
            No templates found
          </h3>
          <p className="text-sm text-[#64748B]">
            Try selecting a different category.
          </p>
        </motion.div>
      )}
    </div>
  );
}
