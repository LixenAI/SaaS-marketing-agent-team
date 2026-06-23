import { useQuery } from "@tanstack/react-query";
import { useOperator, operatorGet } from "@/lib/operator";
import { PageHeader } from "@/components/Shell";
import { SafetyBoundaries } from "@/components/SafetyBoundaries";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Ban } from "lucide-react";
import type { AutopilotTask } from "@shared/schema";

interface Resp {
  tasks: AutopilotTask[];
  lanes: Record<string, { label: string; classes: string[] }>;
}

const LANE_META = {
  auto: {
    title: "Auto Queue",
    desc: "Runs unattended — read / check / draft / report only.",
    icon: CheckCircle2,
    color: "#437A22",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  approval: {
    title: "Approval Queue",
    desc: "Held for operator approval — send / publish / spend / enroll / CRM writes.",
    icon: Clock,
    color: "#964219",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  blocked: {
    title: "Blocked Queue",
    desc: "Never auto-run — credentials and safety blockers.",
    icon: Ban,
    color: "#A12C7B",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
} as const;

export default function Autopilot() {
  const { token } = useOperator();
  const t = token!;
  const { data, isLoading } = useQuery({
    queryKey: ["/api/autopilot"],
    queryFn: () => operatorGet<Resp>("/api/autopilot", t),
  });

  const lanes: Array<keyof typeof LANE_META> = ["auto", "approval", "blocked"];

  return (
    <>
      <PageHeader
        title="Autopilot Engine"
        subtitle="Action-class routing keeps risky operations off auto-run"
      />
      <div className="p-8 max-w-6xl space-y-8">
        <SafetyBoundaries />

        <div className="grid lg:grid-cols-3 gap-5">
          {lanes.map((lane) => {
            const meta = LANE_META[lane];
            const Icon = meta.icon;
            const tasks = (data?.tasks ?? []).filter((x) => x.lane === lane);
            return (
              <div key={lane} className="flex flex-col" data-testid={`queue-${lane}`}>
                <div className={`rounded-t-lg border ${meta.border} ${meta.bg} px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ color: meta.color }}>
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold text-sm">{meta.title}</span>
                    </div>
                    <Badge variant="outline" className="tabular-nums" style={{ color: meta.color }}>
                      {isLoading ? "—" : tasks.length}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">{meta.desc}</p>
                </div>
                <div className="border border-t-0 border-card-border rounded-b-lg p-3 space-y-3 flex-1 bg-card">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)
                  ) : tasks.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground py-6 text-center">Empty</p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-md border border-card-border bg-background p-3"
                        data-testid={`task-${task.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[13px] font-medium leading-snug">{task.title}</h4>
                          <Badge variant="secondary" className="text-[9px] shrink-0 uppercase">
                            {task.action.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{task.agent}</p>
                        <p className="text-[12px] text-foreground/80 mt-2 leading-relaxed">{task.reason}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
