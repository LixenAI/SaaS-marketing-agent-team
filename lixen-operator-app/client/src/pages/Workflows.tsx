import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOperator, operatorGet } from "@/lib/operator";
import { PageHeader } from "@/components/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Rocket, ShieldAlert, FileText } from "lucide-react";
import type { CatalogItem } from "@shared/schema";

interface CatalogResp { items: CatalogItem[] }

export default function Workflows() {
  const { token } = useOperator();
  const t = token!;
  const { toast } = useToast();
  const [staged, setStaged] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["/api/catalog"],
    queryFn: () => operatorGet<CatalogResp>("/api/catalog", t),
  });

  const workflows = (data?.items ?? []).filter((i) => i.folder === "workflows");

  function stage(it: CatalogItem) {
    setStaged((s) => ({ ...s, [it.id]: true }));
    toast({
      title: "Staged for review",
      description: `${it.title} is staged. Launch is gated — a human must approve before any send, publish, or enroll step runs.`,
    });
  }

  return (
    <>
      <PageHeader
        title="Workflow Launch"
        subtitle="Stage repo workflows; launch steps stay human-gated"
      />
      <div className="p-8 max-w-5xl space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[13px] text-amber-900">
            <p className="font-semibold">Launch is review-gated.</p>
            <p className="mt-0.5">
              Staging a workflow assembles its brief and routes risky steps (send, publish, spend,
              enroll, CRM writes) to the Autopilot approval queue. Nothing is sent, published, or
              enrolled without explicit operator approval and human review.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="bg-card border border-card-border rounded-lg p-5"
                data-testid={`workflow-${wf.id.replace(/\W+/g, "-")}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#1E5BA8]" />
                      <h3 className="font-medium">{wf.title}</h3>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-1.5">{wf.summary}</p>
                    {wf.sections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {wf.sections.slice(0, 6).map((s) => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {staged[wf.id] ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Staged</Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#0D3070] hover:bg-[#1E5BA8]"
                        onClick={() => stage(wf)}
                        data-testid={`button-stage-${wf.id.replace(/\W+/g, "-")}`}
                      >
                        <Rocket className="h-3.5 w-3.5 mr-1.5" /> Stage
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
