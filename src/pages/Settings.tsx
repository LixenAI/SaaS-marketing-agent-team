import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Bot,
  Database,
  Shield,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  ChevronRight,
  Globe,
  Mail,
  Smartphone,
  Slack,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn('relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0', enabled ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]' : 'bg-[#2A2A38]')}
    >
      <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" animate={{ left: enabled ? 22 : 4 }} transition={{ duration: 0.2, ease: easeOutExpo }} />
    </button>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeOutExpo }} className="bg-[#111118] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 flex items-center justify-center text-[#8B5CF6]">{icon}</div>
        <h2 className="text-lg font-semibold text-[#F1F5F9] font-headline">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, description, children, danger }: { label: string; description?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className={cn('text-sm font-medium', danger ? 'text-[#F43F5E]' : 'text-[#F1F5F9]')}>{label}</p>
        {description && <p className="text-[12px] text-[#64748B] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [account, setAccount] = useState({ name: 'Admin', email: 'admin@lixen.ai', company: 'LixenAI', role: 'Marketing Director' });
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [animations, setAnimations] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true, slack: false, agentComplete: true, workflowUpdates: true, qaAlerts: true, marketingTips: false, soundEnabled: true });
  const [agentDefaults, setAgentDefaults] = useState({ autoRunDirector: false, verboseOutput: false, brandVoiceV2: true, complianceStrict: true });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 800); setTimeout(() => setSaveStatus('idle'), 3000); };
  const handleReset = () => {
    setAccount({ name: 'Admin', email: 'admin@lixen.ai', company: 'LixenAI', role: 'Marketing Director' });
    setTheme('dark'); setAnimations(true); setCompactMode(false);
    setNotifications({ email: true, push: true, slack: false, agentComplete: true, workflowUpdates: true, qaAlerts: true, marketingTips: false, soundEnabled: true });
    setAgentDefaults({ autoRunDirector: false, verboseOutput: false, brandVoiceV2: true, complianceStrict: true });
    setShowResetConfirm(false); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="p-8 min-h-[calc(100dvh-64px)]">
      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOutExpo }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[13px] text-[#64748B] mb-1">App <span className="text-[#475569]">/</span> <span className="text-[#F1F5F9]">Settings</span></p>
            <h1 className="text-[36px] font-headline font-bold text-[#F1F5F9] leading-[1.15] tracking-[-0.02em] mb-2">Settings</h1>
            <p className="text-[16px] text-[#94A3B8] leading-[1.6] max-w-[640px]">Configure your account, preferences, agent defaults, and app behavior.</p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'saved' && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-[#10B981]"><Check size={16} />Saved</motion.span>}
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-all border border-[rgba(255,255,255,0.06)]"><RotateCcw size={14} />Reset</button>
            <button onClick={handleSave} disabled={saveStatus === 'saving'} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white transition-all', saveStatus === 'saving' ? 'opacity-60' : 'hover:brightness-110')} style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}><Save size={14} />{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Account" icon={<User size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] text-[#94A3B8] mb-1.5">Display Name</label>
              <input type="text" value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] transition-all" />
            </div>
            <div>
              <label className="block text-[13px] text-[#94A3B8] mb-1.5">Email</label>
              <input type="email" value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[#94A3B8] mb-1.5">Company</label>
                <input type="text" value={account.company} onChange={(e) => setAccount((a) => ({ ...a, company: e.target.value }))} className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] text-[#94A3B8] mb-1.5">Role</label>
                <select value={account.role} onChange={(e) => setAccount((a) => ({ ...a, role: e.target.value }))} className="w-full h-10 px-3 bg-[#0A0A0F] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-sm text-[#F1F5F9] outline-none focus:border-[#8B5CF6] cursor-pointer">
                  <option>Marketing Director</option><option>Campaign Manager</option><option>Content Lead</option><option>Partner Manager</option><option>Admin</option>
                </select>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Appearance" icon={<Palette size={18} />}>
          <SettingRow label="Theme" description="Choose your preferred color theme">
            <div className="flex items-center gap-1 bg-[#0A0A0F] rounded-lg p-1 border border-[rgba(255,255,255,0.06)]">
              {[{ id: 'dark' as const, icon: <Moon size={14} />, label: 'Dark' }, { id: 'light' as const, icon: <Sun size={14} />, label: 'Light' }, { id: 'system' as const, icon: <Monitor size={14} />, label: 'Auto' }].map((t) => (
                <button key={t.id} onClick={() => setTheme(t.id)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all', theme === t.id ? 'bg-[#8B5CF6] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]')}>{t.icon}{t.label}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Animations" description="Enable page transitions and micro-interactions"><Toggle enabled={animations} onChange={setAnimations} /></SettingRow>
          <SettingRow label="Compact Mode" description="Reduce padding and spacing for denser layout"><Toggle enabled={compactMode} onChange={setCompactMode} /></SettingRow>
        </SectionCard>

        <SectionCard title="Notifications" icon={<Bell size={18} />}>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[rgba(255,255,255,0.04)]">
            {[{ key: 'email' as const, icon: <Mail size={14} /> }, { key: 'push' as const, icon: <Smartphone size={14} /> }, { key: 'slack' as const, icon: <Slack size={14} /> }].map((c) => (
              <div key={c.key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0A0F] border border-[rgba(255,255,255,0.06)]">
                <span className={notifications[c.key] ? 'text-[#8B5CF6]' : 'text-[#475569]'}>{c.icon}</span>
                <span className="text-[12px] text-[#94A3B8] capitalize">{c.key}</span>
                <Toggle enabled={notifications[c.key]} onChange={(v) => setNotifications((n) => ({ ...n, [c.key]: v }))} />
              </div>
            ))}
          </div>
          <SettingRow label="Agent Completion" description="Get notified when an agent finishes a task"><Toggle enabled={notifications.agentComplete} onChange={(v) => setNotifications((n) => ({ ...n, agentComplete: v }))} /></SettingRow>
          <SettingRow label="Workflow Updates" description="Notifications for workflow progress"><Toggle enabled={notifications.workflowUpdates} onChange={(v) => setNotifications((n) => ({ ...n, workflowUpdates: v }))} /></SettingRow>
          <SettingRow label="QA Alerts" description="Get alerted when QA checks need attention"><Toggle enabled={notifications.qaAlerts} onChange={(v) => setNotifications((n) => ({ ...n, qaAlerts: v }))} /></SettingRow>
          <SettingRow label="Marketing Tips" description="Weekly tips and best practices"><Toggle enabled={notifications.marketingTips} onChange={(v) => setNotifications((n) => ({ ...n, marketingTips: v }))} /></SettingRow>
          <SettingRow label="Sound Effects" description="Play sounds for notifications">
            <button onClick={() => setNotifications((n) => ({ ...n, soundEnabled: !n.soundEnabled }))} className={cn('w-10 h-10 rounded-lg flex items-center justify-center transition-colors', notifications.soundEnabled ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#0A0A0F] text-[#475569]')}>{notifications.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
          </SettingRow>
        </SectionCard>

        <SectionCard title="Agent Defaults" icon={<Bot size={18} />}>
          <SettingRow label="Auto-run Marketing Director" description="Automatically run the Director agent on login"><Toggle enabled={agentDefaults.autoRunDirector} onChange={(v) => setAgentDefaults((a) => ({ ...a, autoRunDirector: v }))} /></SettingRow>
          <SettingRow label="Verbose Output" description="Show detailed reasoning in agent responses"><Toggle enabled={agentDefaults.verboseOutput} onChange={(v) => setAgentDefaults((a) => ({ ...a, verboseOutput: v }))} /></SettingRow>
          <SettingRow label="Brand Voice v2" description="Use the updated brand voice guidelines"><Toggle enabled={agentDefaults.brandVoiceV2} onChange={(v) => setAgentDefaults((a) => ({ ...a, brandVoiceV2: v }))} /></SettingRow>
          <SettingRow label="Strict Compliance Mode" description="Require compliance review before publishing"><Toggle enabled={agentDefaults.complianceStrict} onChange={(v) => setAgentDefaults((a) => ({ ...a, complianceStrict: v }))} /></SettingRow>
        </SectionCard>

        <SectionCard title="Data & Export" icon={<Database size={18} />}>
          <div className="space-y-3">
            {[{ icon: <Download size={18} />, color: 'text-[#8B5CF6]', title: 'Export All Data', desc: 'Download workflows, templates, and config as JSON' }, { icon: <Upload size={18} />, color: 'text-[#06B6D4]', title: 'Import Data', desc: 'Restore from a previous export file' }, { icon: <Globe size={18} />, color: 'text-[#10B981]', title: 'Language', desc: 'English (US) · More languages coming soon' }].map((item) => (
              <button key={item.title} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0A0A0F] border border-[rgba(255,255,255,0.06)] text-left hover:border-[rgba(139,92,246,0.3)] transition-colors group">
                <div className="flex items-center gap-3">
                  <span className={item.color}>{item.icon}</span>
                  <div><p className="text-sm text-[#F1F5F9]">{item.title}</p><p className="text-[12px] text-[#64748B]">{item.desc}</p></div>
                </div>
                <ChevronRight size={16} className="text-[#475569] group-hover:text-[#94A3B8] transition-colors" />
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Danger Zone" icon={<Shield size={18} />}>
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[rgba(244,63,94,0.05)] border border-[rgba(244,63,94,0.15)] text-left hover:border-[rgba(244,63,94,0.4)] transition-colors group">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-[#F43F5E]" />
                <div><p className="text-sm text-[#F43F5E]">Reset All Settings</p><p className="text-[12px] text-[#64748B]">Restore all settings to their default values</p></div>
              </div>
              <ChevronRight size={16} className="text-[#F43F5E]/50 group-hover:text-[#F43F5E] transition-colors" />
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={20} className="text-[#F43F5E] shrink-0 mt-0.5" />
                <div><p className="text-sm font-medium text-[#F43F5E]">Are you sure?</p><p className="text-[12px] text-[#94A3B8] mt-0.5">This will reset all settings. This action cannot be undone.</p></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#F43F5E] hover:brightness-110 transition-all">Yes, Reset Everything</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 rounded-lg text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">Cancel</button>
              </div>
            </motion.div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
