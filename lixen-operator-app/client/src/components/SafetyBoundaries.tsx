import { ShieldCheck, ArrowRightLeft, Ban } from "lucide-react";

const LANES = [
  {
    icon: ArrowRightLeft,
    title: "Cold outreach lane",
    body: "Cold outreach runs through Apollo and Instantly only. Never run cold outreach through GoHighLevel.",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    title: "Warm CRM lane",
    body: "Warm CRM contact uses GoHighLevel LeadConnector Email only. Contacts must already be in the GHL pipeline.",
    tone: "green",
  },
  {
    icon: Ban,
    title: "Requires explicit approval",
    body: "No bulk enrollment, workflow publishing, live test messages, SMS, or ad-spend changes without explicit operator approval.",
    tone: "amber",
  },
];

const TONE: Record<string, string> = {
  blue: "border-[#60AAFF] bg-[#EBF2FA] text-[#0D3070]",
  green: "border-emerald-300 bg-emerald-50 text-emerald-900",
  amber: "border-amber-300 bg-amber-50 text-amber-900",
};

export function SafetyBoundaries({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-[#1E5BA8]" />
        <h2 className="text-sm font-semibold">Lixen safety boundaries</h2>
      </div>
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
        {LANES.map((l) => {
          const Icon = l.icon;
          return (
            <div
              key={l.title}
              className={`rounded-lg border p-4 ${TONE[l.tone]}`}
              data-testid={`safety-lane-${l.tone}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4" />
                <span className="text-[13px] font-semibold">{l.title}</span>
              </div>
              <p className="text-[12.5px] leading-relaxed opacity-90">{l.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
