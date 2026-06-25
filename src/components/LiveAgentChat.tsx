import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Settings,
  Wand2,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  actions?: QuickAction[];
  timestamp: Date;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  response: string;
}

const APP_KNOWLEDGE: Record<string, string> = {
  dashboard: `The **Dashboard** is your command center. It shows:\n- KPI cards (Active Agents, Workflows Run, Assets Generated, QA Score)\n- Quick Actions for common tasks\n- Active Agents grid with Launch buttons\n- Recent Activity feed\n- Running Workflows with progress bars`,

  agents: `The **Agents** page has 7 marketing agents:\n1. **Marketing Director** - Strategy, weekly planning, assignments\n2. **Campaign Agent** - Campaign briefs, timelines, channel strategy\n3. **Partner Acquisition** - LinkedIn outreach, recruitment, qualification\n4. **Copywriting Agent** - Landing pages, CTAs, conversion copy\n5. **Ads Manager** - Ad angles, creative briefs, paid readiness\n6. **Social Media Agent** - LinkedIn, Instagram, TikTok, content calendars\n7. **Sales Enablement** - Discovery, demos, objections, proposals\n\nEach agent can be launched for a live session. Click **Launch** on any agent card.`,

  workflows: `The **Workflows** page has 4 guided workflows:\n1. **Weekly Marketing** (5 steps) - Plan week's priorities\n2. **Campaign Production** (6 steps) - Full campaign creation\n3. **Partner Recruitment** (4 steps) - Find and onboard partners\n4. **Sales Enablement** (5 steps) - Prepare sales materials\n\nEach workflow has forms, checklists, and progress tracking.`,

  templates: `The **Templates** page has 6 marketing templates:\n- Campaign Brief, Ad Brief, LinkedIn Outreach\n- Social Content, Landing Page Copy, Sales Script\n\nEach has a form wizard with live preview.`,

  brand: `The **Brand Config** page is your source of truth:\n- Approved/Avoided terms\n- Voice Attributes (Professional, Conversational, Bold, Educational, Empathetic)\n- Compliance Rules (no income claims, human review required)\n- 4 Audience Segments\n- Active Offers`,

  qa: `The **QA Hub** has 3 checklists:\n1. Content QA (12 items)\n2. Agent Output Review (8 items)\n3. Paid Ads Readiness (10 items)\n\nEach has Pass/Fail/N/A tracking with issue generation.`,

  assets: `The **Asset Generator** creates 8 marketing asset types:\nLinkedIn Post, Instagram Post, Facebook Ad, Google Ad, Email Sequence, Landing Page, Sales Deck, Partner One-Pager.\n\n3-step wizard: Content → Design → Review`,

  settings: `The **Settings** page lets you configure:\n- Account info and preferences\n- Agent defaults\n- Notification settings\n- Theme options\n- Data export/import`,
};

const WELCOME = `Hey! I'm **Lixen**, your AI assistant for the Marketing Command Center. I can help you:\n\n- Navigate any feature\n- Answer questions about agents, workflows, or templates\n- Suggest best practices\n- Help you customize the app\n\nWhat would you like to explore?`;

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'About Agents', icon: <Zap size={14} />, response: 'agents' },
  { label: 'Run a Workflow', icon: <Wand2 size={14} />, response: 'workflows' },
  { label: 'App Settings', icon: <Settings size={14} />, response: 'settings' },
  { label: 'Generate Assets', icon: <Sparkles size={14} />, response: 'assets' },
];

function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('dashboard')) return APP_KNOWLEDGE.dashboard;
  if (lower.includes('agent')) return APP_KNOWLEDGE.agents;
  if (lower.includes('workflow')) return APP_KNOWLEDGE.workflows;
  if (lower.includes('template')) return APP_KNOWLEDGE.templates;
  if (lower.includes('brand')) return APP_KNOWLEDGE.brand;
  if (lower.includes('qa') || lower.includes('quality') || lower.includes('checklist')) return APP_KNOWLEDGE.qa;
  if (lower.includes('asset')) return APP_KNOWLEDGE.assets;
  if (lower.includes('setting')) return APP_KNOWLEDGE.settings;
  if (lower.match(/^(hi|hello|hey)/)) return `Hey there! I'm Lixen, your AI assistant. Ask me anything about the Marketing Command Center!`;
  if (lower.includes('help') || lower.includes('how') || lower.includes('what')) return `I can help with:\n\n**Navigation** — Tell me where you want to go\n**Feature Help** — Ask "What are agents?" or "How do workflows work?"\n**Tips** — Ask for best practices\n**Customization** — Ask how to change colors, add features, or modify the app`;
  if (lower.includes('tip') || lower.includes('best practice') || lower.includes('advice')) return `Best practices:\n\n1. **Start with Weekly Marketing Workflow** every Monday\n2. **Run QA checklists** before publishing\n3. **Use Brand Config** for approved terminology\n4. **Launch Marketing Director first** for strategy\n5. **Always include income disclaimer** when referencing revenue\n6. **Review Partner Acquisition** pipeline weekly\n7. **Generate assets in batches** using the Asset Generator`;
  if (lower.includes('change') || lower.includes('customize') || lower.includes('modify') || lower.includes('edit') || lower.includes('color')) return `I can help you customize! Common changes:\n\n**Colors** — Edit \`tailwind.config.js\` to change accent colors\n**Content** — Edit page files in \`src/pages/\` to change text/data\n**Agents** — Modify \`src/pages/Agents.tsx\` to add/remove agents\n**Layout** — Edit \`src/components/Sidebar.tsx\` for nav changes\n\nWant me to walk you through a specific change?`;
  if (lower.includes('start') || lower.includes('begin') || lower.includes('use')) return `Getting started:\n\n1. **Dashboard** — Check KPIs and activity\n2. **Agents** — Launch an agent (try Marketing Director)\n3. **Workflows** — Run Weekly Marketing Workflow\n4. **Templates** — Create marketing materials\n5. **Brand Config** — Review compliance rules\n6. **QA Hub** — Run checklists before publishing`;
  return `Great question! The LixenAI Marketing Command Center has **7 agents**, **4 workflows**, **6 templates**, **brand config**, and **QA tools**.\n\nTry asking about:\n- "What are agents?"\n- "How do workflows work?"\n- "Show me templates"\n- "Brand compliance rules"`;
}

function parseBold(text: string): (string | { bold: string })[] {
  const parts: (string | { bold: string })[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push({ bold: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

export default function LiveAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'agent', content: WELCOME, actions: QUICK_ACTIONS, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), []);
  useEffect(() => scrollToBottom(), [messages, isTyping, scrollToBottom]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(content);
      const agentMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'agent', content: response, timestamp: new Date() };
      setMessages((p) => [...p, agentMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); sendMessage(input); }, [input, sendMessage]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }, [input, sendMessage]);
  const copyMessage = useCallback((id: string, content: string) => { navigator.clipboard?.writeText(content); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }, []);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 hover:shadow-xl hover:shadow-[#8B5CF6]/40 hover:scale-105 transition-all duration-200 group"
            title="Ask Lixen AI"
          >
            <MessageCircle size={24} className="text-white" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[100] w-[400px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100dvh-100px)] bg-[#111118] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(139,92,246,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F1F5F9]">Lixen AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[11px] text-[#64748B]">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', msg.role === 'agent' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]' : 'bg-[#2A2A38]')}>
                    {msg.role === 'agent' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-[#94A3B8]" />}
                  </div>
                  <div className={cn('max-w-[80%] group', msg.role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn('px-3.5 py-2.5 rounded-2xl text-[13px] leading-[1.6] whitespace-pre-wrap', msg.role === 'agent' ? 'bg-[#1A1A24] text-[#F1F5F9] rounded-tl-md border border-[rgba(255,255,255,0.04)]' : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-tr-md')}>
                      {parseBold(msg.content).map((part, i) => typeof part === 'string' ? <span key={i}>{part}</span> : <strong key={i} className="font-semibold">{part.bold}</strong>)}
                    </div>
                    <button onClick={() => copyMessage(msg.id, msg.content)} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#64748B] hover:text-[#94A3B8]">
                      {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    {msg.actions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.actions.map((action) => (
                          <button key={action.label} onClick={() => sendMessage(action.label)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A24] border border-[rgba(255,255,255,0.06)] text-[12px] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.05)] transition-all duration-150">
                            {action.icon}{action.label}<ChevronRight size={10} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center shrink-0"><Bot size={14} className="text-white" /></div>
                  <div className="bg-[#1A1A24] rounded-2xl rounded-tl-md px-4 py-3 border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="shrink-0 px-4 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-end gap-2">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask me anything about the app..." rows={1} className="flex-1 bg-[#0A0A0F] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#8B5CF6] transition-colors resize-none max-h-[100px]" style={{ minHeight: '40px' }} />
                <button type="submit" disabled={!input.trim() || isTyping} className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150', input.trim() && !isTyping ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:brightness-110 text-white' : 'bg-[#1A1A24] text-[#475569] cursor-not-allowed')}>
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[#475569] mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
