import { useQuery } from "@tanstack/react-query";
import { useOperator, operatorGet } from "@/lib/operator";
import { PageHeader } from "@/components/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, AlertTriangle, Ban } from "lucide-react";
import type { AuditEntry } from "@shared/schema";

interface Resp { entries: AuditEntry[] }

const LEVEL = {
  info: { icon: Info, color: "#1E5BA8", label: "Info" },
  warn: { icon: AlertTriangle, color: "#964219", label: "Approval" },
  block: { icon: Ban, color: "#A12C7B", label: "Blocked" },
} as const;

export default function Audit() {
  const { token } = useOperator();
  const t = token!;
  const { data, isLoading } = useQuery({
    queryKey: ["/api/audit"],
    queryFn: () => operatorGet<Resp>("/api/audit", t),
  });

  const entries = [...(data?.entries ?? [])].reverse();

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Operator actions and safety decisions" />
      <div className="p-8 max-w-4xl">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {entries.map((e) => {
                const meta = LEVEL[e.level];
                const Icon = meta.icon;
                return (
                  <div key={e.id} className="relative" data-testid={`audit-${e.id}`}>
                    <div
                      className="absolute -left-[1.15rem] top-1.5 h-3 w-3 rounded-full border-2 border-background"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="bg-card border border-card-border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: meta.color }} />
                          <code className="text-[12.5px] font-medium">{e.event}</code>
                          <span className="text-[11px] text-muted-foreground">· {e.actor}</span>
                        </div>
                        <time className="text-[11px] text-muted-foreground tabular-nums">
                          {new Date(e.ts).toLocaleString()}
                        </time>
                      </div>
                      <p className="text-[13px] text-foreground/85 mt-1.5">{e.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
