import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useOperator, operatorGet } from "@/lib/operator";
import { PageHeader } from "@/components/Shell";
import { SafetyBoundaries } from "@/components/SafetyBoundaries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Library,
  Bot,
  Rocket,
  Plug,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpRight,
} from "lucide-react";

interface CatalogResp { items: { category: string }[] }
interface AutopilotResp { tasks: { lane: string }[] }

export default function Dashboard() {
  const { token, status } = useOperator();
  const t = token!;

  const catalog = useQuery({
    queryKey: ["/api/catalog"],
    queryFn: () => operatorGet<CatalogResp>("/api/catalog", t),
  });
  const autopilot = useQuery({
    queryKey: ["/api/autopilot"],
    queryFn: () => operatorGet<AutopilotResp>("/api/autopilot", t),
  });

  const itemCount = catalog.data?.items.length ?? 0;
  const tasks = autopilot.data?.tasks ?? [];
  const auto = tasks.filter((x) => x.lane === "auto").length;
  const approval = tasks.filter((x) => x.lane === "approval").length;
  const blocked = tasks.filter((x) => x.lane === "blocked").length;

  const kpis = [
    { label: "Catalog assets", value: itemCount, icon: Library, href: "/agents", tone: "#0D3070" },
    { label: "Auto queue", value: auto, icon: CheckCircle2, href: "/autopilot", tone: "#437A22" },
    { label: "Approval queue", value: approval, icon: Clock, href: "/autopilot", tone: "#964219" },
    { label: "Blocked queue", value: blocked, icon: Ban, href: "/autopilot", tone: "#A12C7B" },
  ];

  const modules = [
    { href: "/agents", label: "Agent Library", desc: "Browse agents, workflows, templates, QA and config ingested from the repo.", icon: Library },
    { href: "/autopilot", label: "Autopilot Engine", desc: "Auto / approval / blocked queues with safe action classification.", icon: Bot },
    { href: "/workflows", label: "Workflow Launch", desc: "Stage repo workflows and review their gated steps before launch.", icon: Rocket },
    { href: "/integrations", label: "Integrations", desc: "Boolean env status and the Render setup block — no secret values.", icon: Plug },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Lixen.AI Marketing Agent OS — operator overview"
      />
      <div className="p-8 space-y-8 max-w-6xl">
        <div className="rounded-xl bg-[#0D3070] text-white p-6">
          <p className="text-[#60AAFF] text-[13px] font-medium">Welcome, operator</p>
          <h2 className="text-xl font-semibold mt-1">You close. We build, deploy, and deliver.</h2>
          <p className="text-white/75 text-sm mt-2 max-w-2xl">
            Internal command surface for LixenAI's marketing agent team. Strategy, creative
            production, partner acquisition, and sales enablement — with GoHighLevel owning nurture,
            pipeline, and CRM workflows. Human review is required before anything is published, sent, or launched.
          </p>
          {status && (
            <p className="text-white/40 text-[11px] mt-3">
              Session verified {new Date(status.time).toLocaleString()} · role: {status.role}
            </p>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <Link key={k.label} href={k.href} data-testid={`kpi-${k.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="bg-card border border-card-border rounded-lg p-4 hover-elevate cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">{k.label}</span>
                    <Icon className="h-4 w-4" style={{ color: k.tone }} />
                  </div>
                  {catalog.isLoading || autopilot.isLoading ? (
                    <Skeleton className="h-8 w-12 mt-2" />
                  ) : (
                    <div className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: k.tone }}>
                      {k.value}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <SafetyBoundaries />

        {/* Modules */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Modules</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link key={m.href} href={m.href} data-testid={`module-${m.href.slice(1)}`}>
                  <div className="bg-card border border-card-border rounded-lg p-5 hover-elevate cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="h-9 w-9 rounded-md bg-[#EBF2FA] flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[#1E5BA8]" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[#1E5BA8]" />
                    </div>
                    <h3 className="font-medium mt-3">{m.label}</h3>
                    <p className="text-[13px] text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
