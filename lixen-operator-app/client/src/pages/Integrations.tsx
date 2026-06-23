import { useQuery } from "@tanstack/react-query";
import { useOperator, operatorGet } from "@/lib/operator";
import { PageHeader } from "@/components/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Server, Terminal } from "lucide-react";

interface EnvItem {
  key: string;
  group: string;
  required: boolean;
  note: string;
  configured: boolean;
  defaultValue: string | null;
}
interface Resp { items: EnvItem[]; usingPreviewFallbackToken: boolean }

const RENDER_ENV = [
  ["OPERATOR_TOKEN", "<set a private app password>"],
  ["GHL_LOCATION_ID", "C7e7ReTQ4FXMZp9TjxzU"],
  ["GHL_PRIVATE_INTEGRATION_TOKEN", "<HighLevel private integration token>"],
  ["GHL_API_BASE_URL", "https://services.leadconnectorhq.com"],
  ["GHL_API_VERSION", "2021-07-28"],
  ["GHL_OPPORTUNITIES_API_VERSION", "2023-02-21"],
  ["LIXEN_CUSTOM_DOMAIN", "marketing-agent.lixenai.com"],
  ["LIXEN_BOOKING_LINK", "https://link.lixen.ai/widget/booking/W0BVrWmszScBAjQhN631"],
  ["LIXEN_SUPPORT_EMAIL", "support@lixen.ai"],
];

export default function Integrations() {
  const { token } = useOperator();
  const t = token!;
  const { data, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
    queryFn: () => operatorGet<Resp>("/api/integrations", t),
  });

  const groups = ["Operator", "HighLevel", "Lixen"];

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Environment status (boolean only) and Render setup"
      />
      <div className="p-8 max-w-5xl space-y-8">
        <div className="rounded-lg border border-card-border bg-card p-4 text-[13px] text-muted-foreground">
          This page reports whether each environment variable is <strong>configured</strong> on the
          server — it never reads or displays secret values.
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          groups.map((g) => {
            const items = (data?.items ?? []).filter((i) => i.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g}>
                <h2 className="text-sm font-semibold mb-3">{g}</h2>
                <div className="space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.key}
                      className="flex items-center justify-between bg-card border border-card-border rounded-lg px-4 py-3"
                      data-testid={`env-${it.key}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-[13px] font-medium text-[#0D3070]">{it.key}</code>
                          {it.required && (
                            <Badge variant="outline" className="text-[9px] border-[#60AAFF] text-[#1E5BA8]">
                              required
                            </Badge>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{it.note}</p>
                      </div>
                      <div className="shrink-0 ml-4">
                        {it.configured ? (
                          <span className="flex items-center gap-1.5 text-[12.5px] text-emerald-700" data-testid={`env-status-${it.key}`}>
                            <CheckCircle2 className="h-4 w-4" /> Configured
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground" data-testid={`env-status-${it.key}`}>
                            <XCircle className="h-4 w-4" /> Not set
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Render setup block */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-[#1E5BA8]" />
            <h2 className="text-sm font-semibold">Render environment setup</h2>
          </div>
          <div className="rounded-lg bg-[#0D3070] text-[#EBF2FA] p-5 font-mono text-[12.5px] overflow-x-auto">
            <p className="text-[#60AAFF] mb-2"># Render → service → Environment → add variables</p>
            {RENDER_ENV.map(([k, v]) => (
              <div key={k} className="whitespace-pre">
                <span className="text-white">{k}</span>=<span className="text-[#60AAFF]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deploy handoff */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-[#1E5BA8]" />
            <h2 className="text-sm font-semibold">Deploy handoff</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-card-border rounded-lg p-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-1">Build command</p>
              <code className="text-[12.5px] text-[#0D3070]">npm install && npm run build</code>
            </div>
            <div className="bg-card border border-card-border rounded-lg p-4">
              <p className="text-[12px] font-medium text-muted-foreground mb-1">Start command</p>
              <code className="text-[12.5px] text-[#0D3070]">npm start</code>
            </div>
          </div>
          <ol className="text-[13px] text-foreground/85 mt-4 space-y-1.5 list-decimal list-inside">
            <li>Create a Render Web Service from this repo / project.</li>
            <li>Set Build Command to <code className="text-[#1E5BA8]">npm install &amp;&amp; npm run build</code> and Start Command to <code className="text-[#1E5BA8]">npm start</code>.</li>
            <li>Add the environment variables above. Set a strong <code className="text-[#1E5BA8]">OPERATOR_TOKEN</code> — do not leave it blank.</li>
            <li>Point <code className="text-[#1E5BA8]">marketing-agent.lixenai.com</code> at the Render service.</li>
            <li>Verify <code className="text-[#1E5BA8]">GET /api/status</code> returns 200 with the operator token; confirm no required vars are blank to avoid 500/401 errors.</li>
          </ol>
        </div>
      </div>
    </>
  );
}
