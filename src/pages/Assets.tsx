import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Linkedin,
  Instagram,
  Facebook,
  Search,
  Mail,
  Layout,
  FileText,
  Handshake,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Copy,
  Trash2,
  Zap,
  RotateCcw,
  Grid3X3,
  List,
  ChevronRight,
  Image,
  Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

type AssetCategory = 'Social' | 'Ads' | 'Email' | 'Landing Pages' | 'Sales';
type AssetFormat = 'PNG' | 'JPG' | 'PDF';
type GenStatus = 'generating' | 'complete' | 'error' | null;

interface AssetType {
  id: number;
  name: string;
  category: AssetCategory;
  dimensions: string;
  formats: AssetFormat[];
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ReactNode;
  description: string;
  tags: string[];
}

interface GeneratedAsset {
  id: string;
  name: string;
  type: string;
  dimensions: string;
  format: AssetFormat;
  date: string;
  color: string;
  status: 'ready' | 'processing' | 'error';
}

interface WizardFormData {
  headline: string;
  subheadline: string;
  ctaText: string;
  bodyCopy: string;
  offer: string;
  tone: string;
  specialInstructions: string;
  colorScheme: string;
  layout: string;
  includeLogo: boolean;
  logoPosition: string;
}

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */

const assetTypes: AssetType[] = [
  {
    id: 1,
    name: 'LinkedIn Post',
    category: 'Social',
    dimensions: '1200×627',
    formats: ['PNG', 'JPG'],
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#22D3EE',
    icon: <Linkedin size={20} />,
    description: 'Single-image LinkedIn post with headline overlay for maximum engagement.',
    tags: ['Social', 'LinkedIn', 'B2B'],
  },
  {
    id: 2,
    name: 'Instagram Post',
    category: 'Social',
    dimensions: '1080×1080',
    formats: ['PNG', 'JPG'],
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#22D3EE',
    icon: <Instagram size={20} />,
    description: 'Square Instagram post optimized for feed visibility and brand consistency.',
    tags: ['Social', 'Instagram', 'Visual'],
  },
  {
    id: 3,
    name: 'Facebook Ad',
    category: 'Ads',
    dimensions: '1200×628',
    formats: ['PNG', 'JPG'],
    color: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#FBBF24',
    icon: <Facebook size={20} />,
    description: 'Facebook feed ad with headline, body text, and compelling CTA button.',
    tags: ['Ads', 'Facebook', 'Paid'],
  },
  {
    id: 4,
    name: 'Google Ad',
    category: 'Ads',
    dimensions: '1200×628',
    formats: ['PNG', 'JPG'],
    color: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#FBBF24',
    icon: <Search size={20} />,
    description: 'Google Display Network compliant ad image for remarketing campaigns.',
    tags: ['Ads', 'Google', 'GDN'],
  },
  {
    id: 5,
    name: 'Email Sequence',
    category: 'Email',
    dimensions: '600×200',
    formats: ['PNG', 'JPG'],
    color: '#8B5CF6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#A78BFA',
    icon: <Mail size={20} />,
    description: 'Branded email header banner for marketing sequences and newsletters.',
    tags: ['Email', 'Header', 'Branding'],
  },
  {
    id: 6,
    name: 'Landing Page',
    category: 'Landing Pages',
    dimensions: '1920×1080',
    formats: ['PNG', 'JPG'],
    color: '#8B5CF6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#A78BFA',
    icon: <Layout size={20} />,
    description: 'Full-width hero section background with text overlay for landing pages.',
    tags: ['Web', 'Hero', 'Conversion'],
  },
  {
    id: 7,
    name: 'Sales Deck',
    category: 'Sales',
    dimensions: '1920×1080',
    formats: ['PNG', 'JPG', 'PDF'],
    color: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#34D399',
    icon: <FileText size={20} />,
    description: 'Professional presentation cover slide for sales meetings and pitches.',
    tags: ['Sales', 'Deck', 'Presentation'],
  },
  {
    id: 8,
    name: 'Partner One-Pager',
    category: 'Sales',
    dimensions: '2550×3300',
    formats: ['PDF', 'PNG'],
    color: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#34D399',
    icon: <Handshake size={20} />,
    description: 'Single-page partner information sheet with key stats and contact info.',
    tags: ['Sales', 'Partner', 'Print'],
  },
];

const categoryTabs = ['All', 'Social', 'Ads', 'Email', 'Landing Pages', 'Sales'];

const offers = ['Q1 Partner Bonus', 'Med Spa Launch Pack', 'Spring Campaign', 'Enterprise Deal', 'Free Trial Month'];
const tones = ['Professional', 'Bold', 'Conversational', 'Educational'];

const colorSchemes = [
  { id: 'violet', name: 'Violet Wave', from: '#8B5CF6', to: '#A78BFA' },
  { id: 'cyan', name: 'Cyan Burst', from: '#06B6D4', to: '#22D3EE' },
  { id: 'amber', name: 'Amber Glow', from: '#F59E0B', to: '#FBBF24' },
  { id: 'emerald', name: 'Emerald Flow', from: '#10B981', to: '#34D399' },
];

const layoutOptions: Record<string, string[]> = {
  'LinkedIn Post': ['Text Left / Image Right', 'Centered Text', 'Text Only', 'Full Bleed Image'],
  'Instagram Post': ['Square Centered', 'Split Layout', 'Frame Design', 'Gradient Background'],
  'Facebook Ad': ['Single Image', 'Carousel Style', 'Text Overlay', 'Split Screen'],
  'Google Ad': ['Standard GDN', 'Text Focus', 'Image Focus'],
  'Email Sequence': ['Centered Header', 'Full Width', 'Logo Left / Text Right'],
  'Landing Page': ['Hero Full Bleed', 'Contained', 'Split Layout', 'Video Background'],
  'Sales Deck': ['Title Center', 'Title Left', 'Image Background'],
  'Partner One-Pager': ['Stats Grid', 'Contact Focus', 'Offer Highlight'],
};

/* ─────────────────────────────────────────────
   Animation config
   ───────────────────────────────────────────── */

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const staggerItem = {
  initial: { opacity: 0, y: 35 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutExpo } },
};

/* ─────────────────────────────────────────────
   Page Component
   ───────────────────────────────────────────── */

export default function Assets() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [wizardAsset, setWizardAsset] = useState<AssetType | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [libraryView, setLibraryView] = useState<'grid' | 'list'>('grid');

  const filteredAssets = useMemo(() => {
    return activeCategory === 'All'
      ? assetTypes
      : assetTypes.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const categoryCount = (cat: string) =>
    cat === 'All' ? assetTypes.length : assetTypes.filter((a) => a.category === cat).length;

  const handleAssetGenerated = useCallback((asset: GeneratedAsset) => {
    setGeneratedAssets((prev) => [asset, ...prev]);
    setWizardAsset(null);
  }, []);

  const removeAsset = useCallback((id: string) => {
    setGeneratedAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <div className="p-8 min-h-[calc(100dvh-64px)]">
      {/* ── Section 1: Page Header ── */}
      <section className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
        >
          <p className="text-[13px] text-[#64748B] mb-1">
            Assets <span className="text-[#475569]">/</span>{' '}
            <span className="text-[#F1F5F9]">Generator</span>
          </p>
          <h1 className="text-[36px] font-headline font-bold text-[#F1F5F9] leading-[1.15] tracking-[-0.02em] mb-2">
            Asset Generator
          </h1>
          <p className="text-[16px] text-[#94A3B8] leading-[1.6] max-w-[640px] mb-2">
            Create on-brand marketing assets through guided form wizards. All outputs follow brand rules and compliance guidelines.
          </p>
          <p className="text-[13px] text-[#64748B]">
            {generatedAssets.length} asset{generatedAssets.length !== 1 ? 's' : ''} generated this month
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          className="flex flex-wrap gap-2 mt-6"
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {categoryTabs.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                variants={{
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: easeOutBack } },
                }}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[#111118] text-[#94A3B8] border border-[rgba(255,255,255,0.06)] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]'
                )}
              >
                {cat}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[11px] font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-[#0A0A0F] text-[#64748B]'
                  )}
                >
                  {categoryCount(cat)}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ── Section 2: Asset Type Grid ── */}
      {!wizardAsset && (
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                variants={staggerItem}
                layout
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
                className={cn(
                  'group relative rounded-[16px] bg-[#111118] border border-[rgba(255,255,255,0.06)] overflow-hidden',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)]',
                  'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]',
                  'hover:border-[rgba(139,92,246,0.3)] transition-all duration-250'
                )}
              >
                {/* Preview area */}
                <div className="relative h-[160px] overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${asset.gradientFrom}22, ${asset.gradientTo}22)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${asset.gradientFrom}, ${asset.gradientTo})` }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-white">{asset.icon}</span>
                    </motion.div>
                  </div>
                  <div className="absolute bottom-3 right-3 font-mono text-[12px] text-[#64748B] bg-[#0A0A0F]/80 px-2 py-1 rounded-[6px]">
                    {asset.dimensions}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-[18px] font-semibold text-[#F1F5F9] leading-[1.3] mb-1">
                    {asset.name}
                  </h3>
                  <p className="text-[13px] text-[#94A3B8] leading-[1.45] mb-3 line-clamp-2">
                    {asset.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0A0A0F] text-[#64748B] border border-[rgba(255,255,255,0.04)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setWizardAsset(asset)}
                    className="w-full h-9 rounded-[10px] text-[13px] font-medium text-white hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                  >
                    Generate
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.section>
      )}

      {/* ── Section 3: Asset Wizard ── */}
      <AnimatePresence>
        {wizardAsset && (
          <AssetWizard
            asset={wizardAsset}
            onClose={() => setWizardAsset(null)}
            onGenerate={handleAssetGenerated}
          />
        )}
      </AnimatePresence>

      {/* ── Section 4: Generated Assets Library ── */}
      {generatedAssets.length > 0 && !wizardAsset && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOutExpo }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[22px] font-semibold text-[#F1F5F9] leading-[1.3] mb-1">
                Generated Assets
              </h2>
              <p className="text-[13px] text-[#94A3B8]">Your recently generated marketing assets</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#111118] rounded-[10px] p-1 border border-[rgba(255,255,255,0.06)]">
                <button
                  onClick={() => setLibraryView('grid')}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-[8px] transition-all',
                    libraryView === 'grid' ? 'bg-[#8B5CF6] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  )}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setLibraryView('list')}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-[8px] transition-all',
                    libraryView === 'list' ? 'bg-[#8B5CF6] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  )}
                >
                  <List size={14} />
                </button>
              </div>
              <button
                onClick={() => setGeneratedAssets([])}
                className="h-8 px-3 rounded-[10px] text-[12px] font-medium text-[#F43F5E] hover:bg-[rgba(244,63,94,0.1)] transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Assets grid */}
          <div
            className={cn(
              'gap-4',
              libraryView === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col'
            )}
          >
            <AnimatePresence>
              {generatedAssets.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  layout
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={cn(
                    'group relative rounded-[16px] bg-[#111118] border border-[rgba(255,255,255,0.06)] overflow-hidden',
                    'shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)]',
                    'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]',
                    libraryView === 'list' && 'flex items-center gap-4 p-4'
                  )}
                >
                  {/* Thumbnail */}
                  <div
                    className={cn(
                      'bg-[#0A0A0F] overflow-hidden relative',
                      libraryView === 'grid' ? 'aspect-[16/10] m-3 rounded-[10px]' : 'w-16 h-16 rounded-[10px] shrink-0'
                    )}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${asset.color}22, ${asset.color}11)`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText size={libraryView === 'grid' ? 32 : 20} style={{ color: asset.color }} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className={cn(libraryView === 'grid' && 'px-4 pb-4')}>
                    <p className={cn('text-[#F1F5F9] truncate mb-1', libraryView === 'grid' ? 'text-[13px]' : 'text-[14px]')}>
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] text-[#64748B]">
                        {asset.dimensions} · {asset.format}
                      </span>
                      <span className="text-[12px] text-[#64748B]">{asset.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={cn(
                      'flex items-center gap-1 transition-opacity duration-150',
                      libraryView === 'grid'
                        ? 'absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-[#1A1A24]/90 rounded-[8px] p-1'
                        : 'ml-auto'
                    )}
                  >
                    <button className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors" title="Download">
                      <Download size={14} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors" title="Copy">
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[rgba(244,63,94,0.1)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* Empty state */}
      {generatedAssets.length === 0 && !wizardAsset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-24 h-24 rounded-full bg-[#111118] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
            <Image size={40} className="text-[#475569]" />
          </div>
          <p className="text-[#94A3B8] text-[16px] mb-1">No assets generated yet</p>
          <p className="text-[#64748B] text-[13px]">Select an asset type above to create your first asset</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Asset Wizard Component
   ───────────────────────────────────────────── */

function AssetWizard({
  asset,
  onClose,
  onGenerate,
}: {
  asset: AssetType;
  onClose: () => void;
  onGenerate: (a: GeneratedAsset) => void;
}) {
  const [step, setStep] = useState(1);
  const [genStatus, setGenStatus] = useState<GenStatus>(null);
  const [genProgress, setGenProgress] = useState(0);
  const [complianceResults, setComplianceResults] = useState<ComplianceItem[]>([]);

  const [formData, setFormData] = useState<WizardFormData>({
    headline: '',
    subheadline: '',
    ctaText: '',
    bodyCopy: '',
    offer: offers[0],
    tone: tones[0],
    specialInstructions: '',
    colorScheme: 'violet',
    layout: (layoutOptions[asset.name] || ['Standard'])[0],
    includeLogo: true,
    logoPosition: 'bottom-right',
  });

  const updateField = useCallback((field: keyof WizardFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = useMemo(() => {
    if (step === 1) return formData.headline.trim().length > 0;
    if (step === 2) return true;
    return true;
  }, [step, formData]);

  const startGeneration = useCallback(() => {
    setGenStatus('generating');
    setGenProgress(0);
    const interval = setInterval(() => {
      setGenProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setGenStatus('complete');
          setComplianceResults(generateComplianceResults(formData));
          return 100;
        }
        return p + 2;
      });
    }, 80);
  }, [formData]);

  const finishGeneration = useCallback(() => {
    const newAsset: GeneratedAsset = {
      id: `asset-${Date.now()}`,
      name: `${asset.name} - ${formData.headline || 'Untitled'}`,
      type: asset.name,
      dimensions: asset.dimensions,
      format: asset.formats[0],
      date: new Date().toLocaleDateString(),
      color: asset.color,
      status: 'ready',
    };
    onGenerate(newAsset);
  }, [asset, formData, onGenerate]);

  const selectedColor = colorSchemes.find((c) => c.id === formData.colorScheme) || colorSchemes[0];
  const layouts = layoutOptions[asset.name] || ['Standard'];

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
    >
      {/* Wizard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all"
          >
            <ArrowLeft size={16} />
            Back to Assets
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${asset.gradientFrom}, ${asset.gradientTo})` }}
            >
              <span className="text-white">{asset.icon}</span>
            </div>
            <h2 className="text-[28px] font-headline font-bold text-[#F1F5F9] leading-[1.2]">
              {asset.name}
            </h2>
          </div>
          <span className="font-mono text-[13px] text-[#64748B] bg-[#2A2A38] px-3 py-1 rounded-full">
            {asset.dimensions}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#64748B]">Step {step} of 3</span>
          <div className="w-32 h-[3px] bg-[#2A2A38] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
        {/* Form Panel */}
        <div className="bg-[#111118] rounded-[16px] border border-[rgba(255,255,255,0.06)] p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Content & Messaging */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: easeOutExpo }}
                className="space-y-5"
              >
                <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-1">Content & Messaging</h3>
                <p className="text-[13px] text-[#64748B] mb-4">Define the message and content for your asset.</p>

                <FormField label="Headline *">
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => updateField('headline', e.target.value)}
                    placeholder="Enter main headline..."
                    maxLength={asset.name === 'Google Ad' ? 30 : asset.name === 'Facebook Ad' ? 40 : 100}
                    className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
                  />
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    {formData.headline.length}/{asset.name === 'Google Ad' ? 30 : asset.name === 'Facebook Ad' ? 40 : 100} characters
                  </span>
                </FormField>

                {asset.name !== 'Google Ad' && (
                  <FormField label="Subheadline">
                    <input
                      type="text"
                      value={formData.subheadline}
                      onChange={(e) => updateField('subheadline', e.target.value)}
                      placeholder="Enter secondary text..."
                      className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
                    />
                  </FormField>
                )}

                <FormField label="CTA Text">
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => updateField('ctaText', e.target.value)}
                    placeholder="e.g., Get Started, Learn More..."
                    className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
                  />
                </FormField>

                {(asset.name === 'Facebook Ad' || asset.name === 'Landing Page') && (
                  <FormField label="Body Copy">
                    <textarea
                      value={formData.bodyCopy}
                      onChange={(e) => updateField('bodyCopy', e.target.value)}
                      placeholder="Enter supporting text..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all resize-none"
                    />
                  </FormField>
                )}

                <FormField label="Offer">
                  <select
                    value={formData.offer}
                    onChange={(e) => updateField('offer', e.target.value)}
                    className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F1F5F9] outline-none focus:border-[#8B5CF6] cursor-pointer"
                  >
                    {offers.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Tone">
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => updateField('tone', t)}
                        className={cn(
                          'px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150',
                          formData.tone === t
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-[#0A0A0F] text-[#94A3B8] border border-[rgba(255,255,255,0.06)] hover:text-[#F1F5F9]'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Special Instructions">
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => updateField('specialInstructions', e.target.value)}
                    placeholder="Any custom requirements..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all resize-none"
                  />
                </FormField>
              </motion.div>
            )}

            {/* Step 2: Visual Design */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: easeOutExpo }}
                className="space-y-5"
              >
                <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-1">Visual Design</h3>
                <p className="text-[13px] text-[#64748B] mb-4">Choose colors, layout, and visual options.</p>

                <FormField label="Color Scheme">
                  <div className="grid grid-cols-2 gap-3">
                    {colorSchemes.map((cs) => (
                      <button
                        key={cs.id}
                        onClick={() => updateField('colorScheme', cs.id)}
                        className={cn(
                          'relative p-3 rounded-[10px] border-2 transition-all duration-200 text-left',
                          formData.colorScheme === cs.id
                            ? 'border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                            : 'border-transparent bg-[#0A0A0F] hover:border-[rgba(255,255,255,0.1)]'
                        )}
                      >
                        <div
                          className="w-full h-[60px] rounded-[8px] mb-2"
                          style={{ background: `linear-gradient(135deg, ${cs.from}, ${cs.to})` }}
                        />
                        <span className={cn(
                          'text-[12px] font-medium',
                          formData.colorScheme === cs.id ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
                        )}>
                          {cs.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Layout">
                  <div className="grid grid-cols-2 gap-2">
                    {layouts.map((l) => (
                      <button
                        key={l}
                        onClick={() => updateField('layout', l)}
                        className={cn(
                          'px-3 py-2.5 rounded-[10px] text-[12px] font-medium transition-all duration-150 text-left border',
                          formData.layout === l
                            ? 'border-[#8B5CF6] bg-[rgba(139,92,246,0.1)] text-[#F1F5F9]'
                            : 'border-[rgba(255,255,255,0.06)] bg-[#0A0A0F] text-[#94A3B8] hover:text-[#F1F5F9]'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Logo Placement">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#F1F5F9]">Include LixenAI Logo</span>
                    <button
                      onClick={() => updateField('includeLogo', !formData.includeLogo)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors duration-200',
                        formData.includeLogo ? 'bg-[#8B5CF6]' : 'bg-[#2A2A38]'
                      )}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                        animate={{ left: formData.includeLogo ? 22 : 4 }}
                        transition={{ duration: 0.2, ease: easeOutExpo }}
                      />
                    </button>
                  </div>
                  {formData.includeLogo && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => updateField('logoPosition', pos)}
                          className={cn(
                            'px-3 py-1.5 rounded-[8px] text-[11px] font-medium capitalize transition-all border',
                            formData.logoPosition === pos
                              ? 'border-[#8B5CF6] bg-[rgba(139,92,246,0.1)] text-[#F1F5F9]'
                              : 'border-[rgba(255,255,255,0.06)] bg-[#0A0A0F] text-[#94A3B8]'
                          )}
                        >
                          {pos.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </FormField>
              </motion.div>
            )}

            {/* Step 3: Review & Generate */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: easeOutExpo }}
                className="space-y-5"
              >
                <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-1">Review & Generate</h3>
                <p className="text-[13px] text-[#64748B] mb-4">Review your settings and generate the asset.</p>

                <div className="space-y-3">
                  <SummaryRow label="Headline" value={formData.headline || '(empty)'} />
                  {formData.subheadline && <SummaryRow label="Subheadline" value={formData.subheadline} />}
                  {formData.ctaText && <SummaryRow label="CTA Text" value={formData.ctaText} />}
                  {formData.bodyCopy && <SummaryRow label="Body Copy" value={formData.bodyCopy} />}
                  <SummaryRow label="Offer" value={formData.offer} />
                  <SummaryRow label="Tone" value={formData.tone} />
                  <SummaryRow label="Color Scheme" value={selectedColor.name} />
                  <SummaryRow label="Layout" value={formData.layout} />
                  <SummaryRow label="Logo" value={formData.includeLogo ? `Yes (${formData.logoPosition})` : 'No'} />
                </div>

                {complianceResults.length > 0 && (
                  <div className="mt-4 p-4 rounded-[10px] bg-[#0A0A0F] border border-[rgba(255,255,255,0.06)]">
                    <h4 className="text-[13px] font-semibold text-[#F1F5F9] mb-3">Brand Compliance Check</h4>
                    <div className="space-y-2">
                      {complianceResults.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-2"
                        >
                          {item.status === 'pass' && <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />}
                          {item.status === 'warn' && <AlertTriangle size={14} className="text-[#F59E0B] shrink-0" />}
                          {item.status === 'error' && <AlertCircle size={14} className="text-[#F43F5E] shrink-0" />}
                          <span className={cn(
                            'text-[12px]',
                            item.status === 'pass' ? 'text-[#10B981]' : item.status === 'warn' ? 'text-[#F59E0B]' : 'text-[#F43F5E]'
                          )}>
                            {item.message}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {!genStatus && (
                  <button
                    onClick={startGeneration}
                    disabled={!formData.headline.trim()}
                    className={cn(
                      'w-full h-12 rounded-[10px] text-[15px] font-semibold text-white transition-all duration-150',
                      formData.headline.trim()
                        ? 'hover:brightness-110 hover:scale-[1.02]'
                        : 'opacity-40 cursor-not-allowed'
                    )}
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Zap size={18} />
                      Generate Asset
                    </span>
                  </button>
                )}

                {genStatus === 'generating' && (
                  <div className="space-y-3">
                    <div className="h-2 bg-[#2A2A38] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
                        animate={{ width: `${genProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#94A3B8]">
                        {genProgress < 30 && 'Applying brand rules...'}
                        {genProgress >= 30 && genProgress < 60 && 'Checking compliance...'}
                        {genProgress >= 60 && genProgress < 90 && 'Rendering final output...'}
                        {genProgress >= 90 && 'Finalizing...'}
                      </span>
                      <span className="text-[13px] text-[#64748B] font-mono">{genProgress}%</span>
                    </div>
                  </div>
                )}

                {genStatus === 'complete' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#10B981]">
                      <CheckCircle2 size={20} />
                      <span className="text-[15px] font-semibold">Asset generated successfully!</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={finishGeneration}
                        className="flex-1 h-10 rounded-[10px] text-[14px] font-medium text-white hover:brightness-110 transition-all"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                      >
                        Save to Library
                      </button>
                      <button
                        onClick={() => {
                          setGenStatus(null);
                          setGenProgress(0);
                          setComplianceResults([]);
                        }}
                        className="flex-1 h-10 rounded-[10px] text-[14px] font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all border border-[rgba(255,255,255,0.06)]"
                      >
                        Edit & Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className={cn(
                'flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[13px] font-medium transition-all',
                step === 1
                  ? 'text-[#475569] cursor-not-allowed'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)]'
              )}
            >
              <ChevronRight size={14} className="rotate-180" />
              Previous
            </button>
            {step < 3 && (
              <button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={!canProceed}
                className={cn(
                  'flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[13px] font-medium transition-all',
                  canProceed
                    ? 'bg-[#8B5CF6] text-white hover:brightness-110'
                    : 'bg-[#2A2A38] text-[#475569] cursor-not-allowed'
                )}
              >
                Next
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-[#111118] rounded-[16px] border border-[rgba(255,255,255,0.06)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[14px] font-semibold text-[#F1F5F9]">Live Preview</h4>
            <button className="flex items-center gap-1.5 text-[12px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
              <RotateCcw size={12} />
              Refresh
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <motion.div
              className="relative overflow-hidden rounded-[12px] shadow-2xl"
              style={{
                width: '100%',
                maxWidth: asset.dimensions.includes('×') ? Math.min(600, parseInt(asset.dimensions.split('×')[0]) / 2) : 400,
                aspectRatio: asset.dimensions.includes('×')
                  ? `${asset.dimensions.split('×')[0]} / ${asset.dimensions.split('×')[1]}`
                  : '16/9',
                background: `linear-gradient(135deg, ${selectedColor.from}33, ${selectedColor.to}33)`,
              }}
              animate={genStatus === 'generating' ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={genStatus === 'generating' ? { duration: 1.5, repeat: Infinity } : {}}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {formData.includeLogo && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <Hexagon size={20} className="text-[#F1F5F9]/60" />
                    <span className="text-[10px] font-semibold text-[#F1F5F9]/60">LixenAI</span>
                  </div>
                )}
                {formData.headline ? (
                  <>
                    <h4
                      className="text-[#F1F5F9] font-semibold mb-2 leading-tight"
                      style={{ fontSize: formData.headline.length > 40 ? '14px' : formData.headline.length > 20 ? '18px' : '24px' }}
                    >
                      {formData.headline}
                    </h4>
                    {formData.subheadline && (
                      <p className="text-[#94A3B8] text-[12px] mb-3 leading-snug">{formData.subheadline}</p>
                    )}
                    {formData.ctaText && (
                      <span
                        className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold text-white mt-2"
                        style={{ background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})` }}
                      >
                        {formData.ctaText}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})` }}
                    >
                      <span className="text-white">{asset.icon}</span>
                    </div>
                    <p className="text-[13px] text-[#64748B]">{asset.name} Preview</p>
                    <p className="text-[11px] text-[#475569] mt-1">{asset.dimensions}</p>
                  </div>
                )}
              </div>

              <div className="absolute bottom-3 left-3 text-[10px] text-[#64748B] bg-[#0A0A0F]/80 px-2 py-0.5 rounded">
                {formData.layout}
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {genStatus === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0F]/80 rounded-[16px] backdrop-blur-sm"
              >
                <motion.div
                  className="w-12 h-12 rounded-full border-2 border-[#8B5CF6] border-t-transparent mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-[16px] text-[#F1F5F9] font-medium mb-1">Generating your asset...</p>
                <p className="text-[13px] text-[#94A3B8]">
                  {genProgress < 30 && 'Applying brand rules...'}
                  {genProgress >= 30 && genProgress < 60 && 'Checking compliance...'}
                  {genProgress >= 60 && 'Rendering final output...'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Helper Components
   ───────────────────────────────────────────── */

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] text-[#94A3B8] font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span className="text-[13px] text-[#F1F5F9] text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Brand Compliance
   ───────────────────────────────────────────── */

interface ComplianceItem {
  status: 'pass' | 'warn' | 'error';
  message: string;
}

function generateComplianceResults(formData: WizardFormData): ComplianceItem[] {
  const results: ComplianceItem[] = [];

  if (formData.headline.length > 0) {
    results.push({ status: 'pass', message: 'Headline is present and within length limits' });
    if (formData.headline.toLowerCase().includes('free')) {
      results.push({ status: 'warn', message: 'Word "free" detected — may trigger spam filters in some channels' });
    }
  }

  if (formData.ctaText.length > 0) {
    const goodCtAs = ['get started', 'learn more', 'sign up', 'download', 'book now', 'contact us'];
    if (goodCtAs.some((c) => formData.ctaText.toLowerCase().includes(c))) {
      results.push({ status: 'pass', message: 'CTA text follows brand action-word guidelines' });
    } else {
      results.push({ status: 'warn', message: 'Consider using brand-approved CTA verbs for better conversion' });
    }
  }

  results.push({ status: 'pass', message: `${formData.tone} tone is approved for this asset type` });
  results.push({ status: 'pass', message: `Offer "${formData.offer}" is validated against active offers` });

  if (formData.includeLogo) {
    results.push({ status: 'pass', message: 'LixenAI logo placement meets brand guidelines' });
  } else {
    results.push({ status: 'warn', message: 'Logo omitted — not recommended for external-facing assets' });
  }

  results.push({ status: 'pass', message: `${formData.colorScheme} palette is within brand color system` });

  return results;
}
